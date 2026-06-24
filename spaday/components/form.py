"""Form-from-schema: generate a two-way-bound ``wa-*`` form from a pydantic model.

:func:`form` introspects a model's fields and emits a labeled control per field, each **two-way bound**
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
co-located via ``Annotated[T, FormField(...)]`` or at the call site via ``form(model, overrides={...})``.

The returned `Stack` is an ordinary component — add a submit `WaButton` with a ``CallEndpoint`` action,
or wrap it in a card, as you like. Richer schema constraints (min/max/pattern from field metadata) are a
later refinement; required-ness is surfaced today.
"""

from __future__ import annotations

import enum
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from typing import Any, Literal, Union, get_args, get_origin

from pydantic import BaseModel

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


def _unwrap_optional(ann: Any) -> Any:
    """`Optional[X]` / `X | None` → `X` (so the control matches the underlying type)."""
    if get_origin(ann) is Union:
        non_none = [a for a in get_args(ann) if a is not type(None)]
        if len(non_none) == 1:
            return non_none[0]
    return ann


def _choices(ann: Any):
    """The `(value, label)` choices for an Enum or `Literal[...]`, else `None`."""
    if isinstance(ann, type) and issubclass(ann, enum.Enum):
        return [(e.value, e.name) for e in ann]
    if get_origin(ann) is Literal:
        return [(a, str(a)) for a in get_args(ann)]
    return None


def _hint(info: Any, override: FormField | None) -> FormField | None:
    """The effective override for a field — a call-site one wins over an ``Annotated`` one."""
    if override is not None:
        return override
    return next((m for m in info.metadata if isinstance(m, FormField)), None)


def _label(name: str, hint: FormField | None) -> str:
    return (hint.label if hint and hint.label else None) or name


def _control(field: str, label: str, annotation: Any, required: bool, hint: FormField | None) -> Component:
    if hint is not None and hint.control is not None:
        control = hint.control
        if isinstance(control, Component):
            return control.bind("value", field, mode="two-way")
        return control(field, annotation, required)

    ann = _unwrap_optional(annotation)
    req = required or None  # pass the prop only when True, so it's omitted otherwise

    choices = _choices(ann)
    if choices is not None:
        select = WaSelect(label=label, required=req).bind("value", field, mode="two-way")
        for value, opt_label in choices:
            select = select.child(WaOption(value=str(value)).text(str(opt_label)))
        return select
    if ann is bool:
        return WaSwitch().text(label).bind("checked", field, mode="two-way")
    input_type = "number" if ann in (int, float) else "text"
    return WaInput(label=label, type=input_type, required=req).bind("value", field, mode="two-way")


def _group(label: str, prefix: str, submodel: type[BaseModel], exclude, overrides, hint: FormField | None) -> Component:
    """A nested sub-model → an expand/collapse `wa-details` (or a `FormField.group` wrapper) holding its
    controls, each bound to the dotted path ``prefix.child``."""
    inner = Stack()
    for child in _controls_for(submodel, prefix, exclude, overrides):
        inner = inner.child(child)
    if hint is not None and hint.group is not None:
        return hint.group(label, inner)
    return WaDetails(summary=label, open=True).child(inner)


def _controls_for(model_cls: type[BaseModel], prefix: str, exclude, overrides) -> Iterator[Component]:
    """The controls for a model's fields, binding each to ``prefix + name`` (recursing sub-models)."""
    for name, info in model_cls.model_fields.items():
        path = f"{prefix}{name}"
        if path in exclude:
            continue
        hint = _hint(info, overrides.get(path))
        if hint is not None and hint.exclude:
            continue
        ann = _unwrap_optional(info.annotation)
        if (hint is None or hint.control is None) and isinstance(ann, type) and issubclass(ann, BaseModel):
            yield _group(_label(name, hint), f"{path}.", ann, exclude, overrides, hint)
        else:
            yield _control(path, _label(name, hint), info.annotation, info.is_required(), hint)


def form(model: Any, *, exclude: tuple = (), overrides: dict[str, FormField] | None = None) -> Stack:
    """A two-way-bound form for a pydantic model (class or instance).

    Fields in ``exclude`` are skipped (by name, or dotted ``parent.child`` for a nested one). Per-field
    tweaks come from `FormField` — either ``Annotated`` on the model, or supplied/overridden here via
    ``overrides={path: FormField(...)}`` (which wins). A nested model field becomes an expand/collapse
    ``wa-details`` section whose controls bind to ``parent.child`` paths.
    """
    overrides = overrides or {}
    model_cls = model if isinstance(model, type) else type(model)
    stack = Stack()
    for child in _controls_for(model_cls, "", exclude, overrides):
        stack = stack.child(child)
    return stack
