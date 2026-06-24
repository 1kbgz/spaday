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

Customize per field with `FormField` (drop, relabel, or swap the control) — co-located via
``Annotated[T, FormField(...)]`` or at the call site via ``form(model, overrides={...})``.

The returned `Stack` is an ordinary component — add a submit `WaButton` with a ``CallEndpoint`` action,
or wrap it in a card, as you like. Richer schema constraints (min/max/pattern from field metadata) are a
later refinement; required-ness is surfaced today.
"""

from __future__ import annotations

import enum
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Literal, Union, get_args, get_origin

from ..component import Component
from .shell import Stack
from .webawesome import WaInput, WaOption, WaSelect, WaSwitch


@dataclass(frozen=True)
class FormField:
    """Per-field overrides for :func:`form`.

    Attach one of two ways — co-located on the model with ``Annotated[T, FormField(...)]``, or at the
    call site with ``form(model, overrides={name: FormField(...)})`` (the call-site one wins). Use it to:

    - **drop** a field — ``exclude=True``
    - **relabel** it — ``label="…"``
    - **replace its control** — ``control=`` either a ready `Component` (two-way bound to the field on
      ``value`` for you — good for inputs/selects/radios), or a ``(name, annotation, required) ->
      Component`` factory you bind yourself (for anything else, e.g. a ``checked`` binding).
    """

    label: str | None = None
    exclude: bool = False
    control: Component | Callable[[str, Any, bool], Component] | None = None


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


def _control(name: str, annotation: Any, required: bool, hint: FormField | None) -> Component:
    if hint is not None and hint.control is not None:
        control = hint.control
        if isinstance(control, Component):
            return control.bind("value", name, mode="two-way")
        return control(name, annotation, required)

    label = (hint.label if hint else None) or name
    ann = _unwrap_optional(annotation)
    req = required or None  # pass the prop only when True, so it's omitted otherwise

    choices = _choices(ann)
    if choices is not None:
        select = WaSelect(label=label, required=req).bind("value", name, mode="two-way")
        for value, opt_label in choices:
            select = select.child(WaOption(value=str(value)).text(str(opt_label)))
        return select
    if ann is bool:
        return WaSwitch().text(label).bind("checked", name, mode="two-way")
    input_type = "number" if ann in (int, float) else "text"
    return WaInput(label=label, type=input_type, required=req).bind("value", name, mode="two-way")


def form(model: Any, *, exclude: tuple = (), overrides: dict[str, FormField] | None = None) -> Stack:
    """A two-way-bound form for a pydantic model (class or instance).

    Fields in ``exclude`` are skipped. Per-field tweaks come from `FormField` — either ``Annotated`` on
    the model, or supplied/overridden here via ``overrides={name: FormField(...)}`` (which wins).
    """
    overrides = overrides or {}
    fields = (model if isinstance(model, type) else type(model)).model_fields
    stack = Stack()
    for name, info in fields.items():
        if name in exclude:
            continue
        hint = _hint(info, overrides.get(name))
        if hint is not None and hint.exclude:
            continue
        stack = stack.child(_control(name, info.annotation, info.is_required(), hint))
    return stack
