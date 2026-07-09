"""Form-from-schema: generate a two-way-bound ``wa-*`` form from a validation schema — a pydantic model,
a ``TypeAdapter`` (any type pydantic can validate), or a raw JSON Schema ``dict``.

:func:`form` introspects the schema's fields and emits a labeled control per field, each **two-way bound**
to a signal-store field of the same name. Mount the result with a `Store` (seeded from the model) and
``connectStore`` to a hosted ``transports`` model and you have a server-authoritative form — the same
reactive pattern as ``examples/reactive.py``, generated from the schema instead of hand-authored. The
field → control mapping:

- ``bool`` → ``wa-switch`` (bound ``checked``)
- ``str`` / other → ``wa-input`` (text)
- ``int`` / ``float`` → ``wa-input`` (number)
- ``Enum`` / ``Literal[...]`` → ``wa-select`` with a ``wa-option`` per choice
- a nested **pydantic model** → an expand/collapse ``wa-details`` section whose controls bind to the
  dotted path ``parent.child`` (the reactive `Store` and ``connectStore`` address nested state by path)

Customize per field with `FormField` (drop, relabel, swap the control, or wrap a sub-model group) —
co-located via ``Annotated[T, FormField(...)]`` (pydantic-model source only) or at the call site via
``form(model, overrides={...})`` (which works for every source).

The returned `Stack` is an ordinary component — add a submit `WaButton` with a ``CallEndpoint`` action,
or wrap it in a card, as you like.

Validation is surfaced from the schema as native control constraints, so a bad value is caught in the
browser before it is sent (the runtime's two-way binding won't write/send a value its control reports
invalid): a non-``Optional`` number or select is ``required`` (it can't be cleared to an empty value the
model would reject), and ``ge``/``le`` → ``min``/``max``, ``min_length``/``max_length`` →
``minlength``/``maxlength``, and ``pattern`` become input constraints. Server-side validation (transports)
remains the authority; this just avoids the doomed round-trip and shows the error inline.
"""

from __future__ import annotations

import enum
import math
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from typing import Any, Literal, Union, get_args, get_origin

import annotated_types as at
from pydantic import BaseModel, TypeAdapter

from ..component import Component
from .shell import Stack
from .webawesome import WaDetails, WaInput, WaOption, WaSelect, WaSwitch


@dataclass(frozen=True)
class FormField:
    """Per-field overrides for :func:`form`.

    Attach one of two ways — co-located on the model with ``Annotated[T, FormField(...)]``, or at the
    call site with ``form(model, overrides={path: FormField(...)})`` (the call-site one wins; ``path``
    is the field name, or a dotted ``parent.child`` to reach a nested field). Use it to:

    - **drop** a field — ``exclude=True``
    - **relabel** it — ``label="…"``
    - **replace its control** — ``control=`` either a ready `Component` (two-way bound to the field on
      ``value`` for you — good for inputs/selects/radios), or a ``(field, annotation, required) ->
      Component`` factory you bind yourself (for anything else, e.g. a ``checked`` binding)
    - **wrap a sub-model group** — ``group=`` a ``(label, inner: Stack) -> Component`` factory; the
      default is an open ``wa-details`` (expand/collapse). Return a `WaCard`, a `WaDrawer`, or a
      collapsed ``WaDetails(summary=label)`` to present the nested section differently.
    """

    label: str | None = None
    exclude: bool = False
    control: Component | Callable[[str, Any, bool], Component] | None = None
    group: Callable[[str, Stack], Component] | None = None


@dataclass(frozen=True)
class _FieldSpec:
    """A source-agnostic description of one form field, produced from either a pydantic model
    (:func:`_pydantic_fields`) or a JSON Schema (:func:`_schema_fields`) and consumed by
    :func:`_control` / :func:`_controls_for`."""

    name: str  # leaf name (the default label)
    annotation: Any  # best-effort Python type handed to a control factory (bool/int/float/str) or None
    choices: list[tuple[Any, str]] | None  # (value, label) options for a select, else None
    is_bool: bool  # -> wa-switch
    is_number: bool  # int or float -> number input
    optional: bool  # None allowed -> the field may be left empty
    plain_required: bool  # the source declares it required (no default / listed in ``required``)
    constraints: dict  # native validation attributes (min/max/step/minlength/maxlength/pattern)
    annotated_hint: FormField | None  # a co-located ``Annotated[..., FormField(...)]`` override
    children: Callable[[], Iterator[tuple[str, "_FieldSpec"]]] | None  # sub-fields for a nested object


def _unwrap_optional(ann: Any) -> Any:
    """`Optional[X]` / `X | None` → `X` (so the control matches the underlying type)."""
    if get_origin(ann) is Union:
        non_none = [a for a in get_args(ann) if a is not type(None)]
        if len(non_none) == 1:
            return non_none[0]
    return ann


def _is_optional(ann: Any) -> bool:
    """True if ``None`` is allowed (``Optional[X]`` / ``X | None``) — the field may be left empty."""
    return get_origin(ann) is Union and type(None) in get_args(ann)


def _required(spec: _FieldSpec) -> bool:
    """Whether the control must not be left empty. A number or a select can't accept an empty value, so a
    non-``Optional`` one is required even when it has a default (the bug: clearing a defaulted ``int`` sent
    ``""``, which the model rejects). For other fields — notably ``str``, where ``""`` is a valid value —
    keep the source's own required-ness (a ``min_length`` still adds a `minlength` constraint below)."""
    if spec.is_number or spec.choices is not None:
        return not spec.optional
    return spec.plain_required


def _constraints(annotation: Any, metadata: Any) -> dict:
    """Native validation attributes from the field's type + pydantic constraints, so the browser/control
    validates before an edit is sent: ``ge``/``gt`` → ``min``, ``le``/``lt`` → ``max``,
    ``min_length``/``max_length`` → ``minlength``/``maxlength``, ``pattern`` → ``pattern``; ints get ``step=1``."""
    attrs: dict = {}
    for m in metadata:
        if isinstance(m, at.Ge):
            attrs["min"] = m.ge
        elif isinstance(m, at.Gt):
            attrs["min"] = m.gt
        elif isinstance(m, at.Le):
            attrs["max"] = m.le
        elif isinstance(m, at.Lt):
            attrs["max"] = m.lt
        elif isinstance(m, at.MinLen):
            attrs["minlength"] = m.min_length
        elif isinstance(m, at.MaxLen):
            attrs["maxlength"] = m.max_length
        elif getattr(m, "pattern", None):
            attrs["pattern"] = m.pattern
    if _unwrap_optional(annotation) is int:
        attrs["step"] = 1  # integers only — no decimals
    return attrs


def _choices(ann: Any):
    """The `(value, label)` choices for an Enum or `Literal[...]`, else `None`."""
    if isinstance(ann, type) and issubclass(ann, enum.Enum):
        return [(e.value, e.name) for e in ann]
    if get_origin(ann) is Literal:
        return [(a, str(a)) for a in get_args(ann)]
    return None


def _hint(spec: _FieldSpec, override: FormField | None) -> FormField | None:
    """The effective override for a field — a call-site one wins over an ``Annotated`` one."""
    if override is not None:
        return override
    return spec.annotated_hint


def _label(name: str, hint: FormField | None) -> str:
    return (hint.label if hint and hint.label else None) or name


def _control(field: str, label: str, spec: _FieldSpec, required: bool, hint: FormField | None) -> Component:
    if hint is not None and hint.control is not None:
        control = hint.control
        if isinstance(control, Component):
            return control.bind("value", field, mode="two-way")
        return control(field, spec.annotation, required)

    req = required or None  # pass the prop only when True, so it's omitted otherwise

    if spec.choices is not None:
        select = WaSelect(label=label, required=req).bind("value", field, mode="two-way")
        for value, opt_label in spec.choices:
            select = select.child(WaOption(value=str(value)).text(str(opt_label)))
        return select
    if spec.is_bool:
        return WaSwitch().text(label).bind("checked", field, mode="two-way")
    input_type = "number" if spec.is_number else "text"
    inp = WaInput(label=label, type=input_type, required=req)
    for name, value in spec.constraints.items():
        inp = inp.prop(name, value)  # min / max / step / minlength / maxlength / pattern
    return inp.bind("value", field, mode="two-way")


def _controls_for(fields: Iterator[tuple[str, _FieldSpec]], prefix: str, exclude, overrides) -> Iterator[Component]:
    """The controls for a sequence of field specs, binding each to ``prefix + name`` (recursing into a
    nested object's sub-fields). ``fields`` comes from either :func:`_pydantic_fields` or
    :func:`_schema_fields`, so this is source-agnostic."""
    for name, spec in fields:
        path = f"{prefix}{name}"
        if path in exclude:
            continue
        hint = _hint(spec, overrides.get(path))
        if hint is not None and hint.exclude:
            continue
        if spec.children is not None and (hint is None or hint.control is None):
            inner = Stack()
            for child in _controls_for(spec.children(), f"{path}.", exclude, overrides):
                inner = inner.child(child)
            label = _label(name, hint)
            if hint is not None and hint.group is not None:
                yield hint.group(label, inner)  # a custom sub-model wrapper (wa-card, wa-drawer, …)
            else:
                yield WaDetails(summary=label, open=True).child(inner)  # default expand/collapse group
        else:
            yield _control(path, _label(name, hint), spec, _required(spec), hint)


def _pydantic_fields(model_cls: type[BaseModel]) -> Iterator[tuple[str, _FieldSpec]]:
    """Field specs from a pydantic model — the native path, which keeps detail a JSON Schema loses (Enum
    member names as option labels, the exact Python annotation handed to a control factory)."""
    for name, info in model_cls.model_fields.items():
        ann = _unwrap_optional(info.annotation)
        is_sub = isinstance(ann, type) and issubclass(ann, BaseModel)
        yield (
            name,
            _FieldSpec(
                name=name,
                annotation=info.annotation,
                choices=_choices(ann),
                is_bool=ann is bool,
                is_number=ann in (int, float),
                optional=_is_optional(info.annotation),
                plain_required=info.is_required(),
                constraints=_constraints(info.annotation, info.metadata),
                annotated_hint=next((m for m in info.metadata if isinstance(m, FormField)), None),
                children=(lambda sub=ann: _pydantic_fields(sub)) if is_sub else None,
            ),
        )


_JSON_PY_TYPE = {"boolean": bool, "integer": int, "number": float, "string": str}


def _deref(node: dict, defs: dict) -> dict:
    """Follow a ``$ref`` into the schema's ``$defs`` (one hop, as pydantic emits)."""
    ref = node.get("$ref")
    if ref:
        return defs.get(ref.rsplit("/", 1)[-1], {})
    return node


def _resolve(prop: dict, defs: dict) -> tuple[dict, bool]:
    """A property schema reduced to its effective node + whether ``null`` is allowed. Unwraps a nullable
    ``anyOf``/``oneOf`` (``[{…}, {"type": "null"}]``) to its single real branch and follows a ``$ref``."""
    node = prop
    optional = False
    for key in ("anyOf", "oneOf"):
        variants = prop.get(key)
        if variants:
            non_null = [v for v in variants if v.get("type") != "null"]
            optional = len(non_null) != len(variants)
            if len(non_null) == 1:
                node = non_null[0]
            break
    return _deref(node, defs), optional


def _schema_constraints(node: dict, is_int: bool) -> dict:
    """Native validation attributes from a JSON Schema node: ``minimum`` → ``min``, ``maximum`` → ``max``,
    ``minLength``/``maxLength`` → ``minlength``/``maxlength``, ``pattern`` → ``pattern``; integers get
    ``step=1``. HTML ``min``/``max`` are *inclusive*, so an exclusive bound is only emitted for an integer
    field (as the nearest valid integer); on a real-number field it is dropped rather than reported as
    inclusive (server-side validation stays the authority)."""
    attrs: dict = {}
    if "minimum" in node:
        attrs["min"] = node["minimum"]
    elif is_int and "exclusiveMinimum" in node:
        attrs["min"] = math.floor(node["exclusiveMinimum"]) + 1
    if "maximum" in node:
        attrs["max"] = node["maximum"]
    elif is_int and "exclusiveMaximum" in node:
        attrs["max"] = math.ceil(node["exclusiveMaximum"]) - 1
    if "minLength" in node:
        attrs["minlength"] = node["minLength"]
    if "maxLength" in node:
        attrs["maxlength"] = node["maxLength"]
    if node.get("pattern"):
        attrs["pattern"] = node["pattern"]
    if is_int:
        attrs["step"] = 1  # integers only — no decimals
    return attrs


def _schema_fields(schema: dict, defs: dict) -> Iterator[tuple[str, _FieldSpec]]:
    """Field specs from a JSON Schema object (the ``TypeAdapter`` / raw-dict path). Enum labels are the
    raw values and a control factory's ``annotation`` is a best-effort Python type — a JSON Schema carries
    neither Enum member names nor the original Python type."""
    required = set(schema.get("required", ()))
    for name, prop in schema.get("properties", {}).items():
        node, optional = _resolve(prop, defs)
        jtype = node.get("type")
        if isinstance(jtype, list):  # JSON Schema 2020-12 nullable form, e.g. ["string", "null"]
            if "null" in jtype:
                optional = True
            non_null = [t for t in jtype if t != "null"]
            jtype = non_null[0] if non_null else None
        enum_vals = node.get("enum")
        if enum_vals is None and "const" in node:  # a single-value Literal → a one-option choice
            enum_vals = [node["const"]]
        is_object = jtype == "object" and "properties" in node
        yield (
            name,
            _FieldSpec(
                name=name,
                annotation=_JSON_PY_TYPE.get(jtype),
                choices=[(v, str(v)) for v in enum_vals] if enum_vals is not None else None,
                is_bool=jtype == "boolean",
                is_number=jtype in ("integer", "number"),
                optional=optional,
                plain_required=name in required,
                constraints=_schema_constraints(node, jtype == "integer"),
                annotated_hint=None,
                children=(lambda obj=node: _schema_fields(obj, defs)) if is_object else None,
            ),
        )


def _source_fields(model: Any) -> Iterator[tuple[str, _FieldSpec]]:
    """Field specs for any accepted source: a pydantic model (class or instance) uses the native path; a
    `TypeAdapter` or a raw JSON Schema ``dict`` is walked as JSON Schema."""
    if isinstance(model, TypeAdapter):
        schema = model.json_schema()
    elif isinstance(model, dict):
        schema = model
    elif isinstance(model, BaseModel):
        return _pydantic_fields(type(model))
    elif isinstance(model, type) and issubclass(model, BaseModel):
        return _pydantic_fields(model)
    else:
        raise TypeError(f"form() source must be a pydantic BaseModel, TypeAdapter, or JSON Schema dict, not {type(model).__name__}")
    defs = {**schema.get("$defs", {}), **schema.get("definitions", {})}
    return _schema_fields(_deref(schema, defs), defs)  # deref a root ``$ref`` so its properties are walked


def form(model: Any, *, exclude: tuple = (), overrides: dict[str, FormField] | None = None) -> Stack:
    """A two-way-bound form for a validation schema.

    ``model`` may be a pydantic model (class or instance), a `TypeAdapter` (so any type pydantic can
    validate — dataclasses, ``TypedDict``, etc.), or a raw JSON Schema ``dict``. Fields in ``exclude``
    are skipped (by name, or dotted ``parent.child`` for a nested one). Per-field tweaks come from
    `FormField` — either ``Annotated`` on a pydantic model, or supplied/overridden here via
    ``overrides={path: FormField(...)}`` (which wins). A nested object becomes an expand/collapse
    ``wa-details`` section whose controls bind to ``parent.child`` paths.

    The pydantic-model path keeps detail a JSON Schema can't carry — Enum **member names** as option
    labels, and the exact Python annotation passed to a control factory. Via a `TypeAdapter` or a raw
    ``dict`` those degrade gracefully (enum options are labeled by their raw value; a factory's
    ``annotation`` is a best-effort Python type — ``str``/``int``/``float``/``bool`` — or ``None``).
    """
    overrides = overrides or {}
    stack = Stack()
    for child in _controls_for(_source_fields(model), "", exclude, overrides):
        stack = stack.child(child)
    return stack
