"""Designs: how a design system renders the generic controls, as data.

A :class:`Design` maps each generic control (see :mod:`spaday.ui.controls`) to one
:class:`ControlSpec` — the element a design renders it as and how the control's generic surface lands
on it: which attribute takes the label (or which slot, or a wrapper element around the control), what
an ``intent`` of ``"primary"`` is called there, which property carries the value and which event
reports a change, whether a dialog opens by property or by method. Everything in it is plain data,
so a design round-trips through JSON: a design-system package publishes one on its
:class:`~spaday.packages.ComponentPackage`, an application can ship its own, and a runtime could
apply the same mapping without Python.

:func:`resolve` applies a design to a serialized tree, replacing every generic ``ui-*`` node with the
concrete elements the design describes, before the tree leaves Python. Controls a design does not
describe fall back to the native baseline (:data:`spaday.ui.native.NATIVE`) and are marked
``data-ui-fallback``.
"""

from __future__ import annotations

import json
import math
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from ..component import DEFAULT_SLOT, _check_text_binding_target, _tag

#: The generic node tags carry the control's kind: ``ui-button``, ``ui-input``, …
GENERIC_PREFIX = "ui-"
#: The prop a per-design override rides on (see ``Control.for_design``): design name → concrete props.
OVERRIDES_PROP = "ui:overrides"
#: The text parts every control may carry, resolved through a :class:`Part` each.
PARTS = ("label", "help", "error")


class _Data(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")


class Part(_Data):
    """Where a control's text part (its label, help text or error message) lands.

    ``attr`` sets an attribute named ``name``; ``slot`` adds an element (``tag``, with ``props``) to
    the control's slot ``name``; ``text`` sets the control's own text content; ``child`` adds the
    element inside the control, before its other children (``after`` puts it last); ``sibling`` adds
    it next to the control inside the design's :class:`Wrap`; ``none`` drops the part.
    """

    kind: Literal["attr", "slot", "text", "child", "sibling", "none"] = "attr"
    name: str = ""
    tag: str = "span"
    props: dict[str, Any] = Field(default_factory=dict)
    after: bool = False


class Wrap(_Data):
    """An element wrapped around the control, for designs that label controls from outside (a
    ``bp-field``, a ``fluent-field``, a plain ``<label>``). ``control`` props are set on the control
    inside it (a ``slot="input"``)."""

    tag: str
    props: dict[str, Any] = Field(default_factory=dict)
    control: dict[str, Any] = Field(default_factory=dict)


class Options(_Data):
    """How a select's ``options`` land: as child elements (``tag`` each, the value on attribute
    ``value``, the label as text, on attribute ``label``, or through a :class:`Part`, disabled state
    on ``disabled``, and the chosen state on ``selected``). ``fixed`` sets props on every child,
    ``label_attr`` repeats its label in an attribute, and ``item_wrap`` can wrap each child option;
    ``wrap`` can wrap the complete child list. Property options use the field names on ``value``,
    ``label``, and ``disabled``."""

    kind: Literal["children", "prop"] = "children"
    tag: str = "option"
    fixed: dict[str, Any] = Field(default_factory=dict)
    value: str = "value"
    label: str | Part = "text"
    label_attr: str | None = None
    disabled: str | None = "disabled"
    selected: str | None = "selected"
    name: str = "items"
    wrap: str = ""
    item_wrap: Wrap | None = None


class Value(_Data):
    """The property carrying a control's value (``checked`` for a toggle) and, for a two-way binding,
    the event it changes on when that is not the runtime's default ``change``/``input``. ``codec``
    handles controls whose DOM property exposes a number or typed choice as a string. ``defer`` waits
    until the next animation frame before writing, for controls whose setter requires connected
    children."""

    prop: str = "value"
    event: str | None = None
    codec: Literal["number", "json"] | None = None
    defer: bool = False


class Open(_Data):
    """How an overlay opens: property ``prop`` holds its state; ``methods`` — ``(open, close)`` — are
    called instead of setting it when the element opens by method; ``event`` reports a close the
    element did itself (Escape, a backdrop click), so a two-way binding follows. ``state`` names a
    different readable property, including a dotted path, for a method-driven wrapper element."""

    prop: str = "open"
    event: str | None = None
    methods: tuple[str, str] | None = None
    state: str | None = None


class ControlSpec(_Data):
    """One generic control as one design renders it."""

    #: the element rendered
    tag: str
    #: props always set on it (``type="button"``)
    fixed: dict[str, Any] = Field(default_factory=dict)
    #: generic prop → the attribute it becomes; ``None`` drops it as unsupported
    props: dict[str, str | None] = Field(default_factory=dict)
    #: generic prop → {generic value: the design's value}; an unlisted value passes through
    values: dict[str, dict[str, str]] = Field(default_factory=dict)
    label: Part = Field(default_factory=lambda: Part(kind="attr", name="label"))
    help: Part = Field(default_factory=lambda: Part(kind="none"))
    error: Part = Field(default_factory=lambda: Part(kind="none"))
    #: props set while ``error`` is non-empty (``invalid``, ``value-state="Negative"``)
    invalid: dict[str, Any] = Field(default_factory=dict)
    wrap: Wrap | None = None
    value: Value = Field(default_factory=Value)
    options: Options | None = None
    open: Open | None = None
    #: generic event → the design's event name (``change`` → ``model-value-changed``)
    events: dict[str, str] = Field(default_factory=dict)


class Design(_Data):
    """A design system's realizations, keyed by generic control kind."""

    name: str
    controls: dict[str, ControlSpec] = Field(default_factory=dict)


def _plain(value: Any) -> Any:
    """A core-tagged value back to Python (the inverse of ``component._tag``)."""
    if value == "Null":
        return None
    if isinstance(value, dict) and len(value) == 1:
        ((kind, inner),) = value.items()
        if kind == "List":
            return [_plain(v) for v in inner]
        if kind == "Map":
            return {k: _plain(v) for k, v in inner.items()}
        if kind in ("Bool", "Int", "Float", "Str"):
            return inner
    return value


def _element(tag: str, props: dict[str, Any], text: Any = None, binding: dict | None = None) -> dict:
    node: dict = {"tag": tag, "props": {k: _tag(v) for k, v in props.items() if v is not None}}
    if text is not None:
        node["props"]["textContent"] = _tag(str(text))
    if binding is not None:
        node["bindings"] = {"textContent": binding}
    return node


def _describe(node: dict) -> str:
    ident = _plain(node.get("props", {}).get("id", "Null"))
    return f"<{node['tag']}{f' id={ident!r}' if ident else ''}>"


def _option_items(options: Any) -> list[dict[str, Any]]:
    items = []
    for option in options or ():
        if isinstance(option, dict):
            if "value" not in option:
                raise ValueError("an option object needs a 'value'")
            value = option["value"]
            label = option.get("label")
            items.append({"value": value, "label": _option_label(value if label is None else label), "disabled": bool(option.get("disabled", False))})
        else:
            value = option
            items.append({"value": value, "label": _option_label(value), "disabled": False})
        if value is None or not isinstance(value, (str, int, float, bool)):
            raise ValueError(f"option values must be strings, numbers or booleans, not {value!r}")
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError(f"option values must be finite, not {value!r}")
        if isinstance(value, int) and not isinstance(value, bool) and abs(value) > 2**53 - 1:
            raise ValueError(f"integer option values must fit JavaScript's safe range, not {value!r}")
    return items


def _option_label(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, float):
        return _javascript_number(value)
    return str(value)


def _javascript_number(value: float) -> str:
    """Format a finite float like JavaScript's ``String`` / ``JSON.stringify`` for option tokens."""
    if value == 0:
        return "0"
    text = repr(value).lower()
    if "e" not in text:
        return text.removesuffix(".0")
    mantissa, exponent_text = text.split("e")
    exponent = int(exponent_text)
    if 1e-6 <= abs(value) < 1e21:
        return format(Decimal(text), "f")
    mantissa = mantissa.removesuffix(".0")
    return f"{mantissa}e{'+' if exponent >= 0 else ''}{exponent}"


def _generic_props() -> frozenset[str]:
    """The control vocabulary derived from every generic schema. A realization must map one of
    these props explicitly or it is dropped; element escape hatches outside the vocabulary pass."""
    from .controls import CONTROLS

    handled = {*PARTS, "open", "options", "value", OVERRIDES_PROP}
    return frozenset(prop.name for control in CONTROLS.values() for prop in control.schema.props if prop.name not in handled)


def _encode_value(value: Any, codec: str | None) -> Any:
    if codec != "json":
        return value
    if isinstance(value, float):
        return _javascript_number(value)
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"))


def _same_value(left: Any, right: Any) -> bool:
    if isinstance(left, bool) or isinstance(right, bool):
        return type(left) is type(right) and left == right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return left == right
    return type(left) is type(right) and left == right


class _Resolver:
    def __init__(self, design: Design, fallback: Design) -> None:
        self.design, self.fallback = design, fallback

    def node(self, node: dict) -> dict:
        if node.get("tag", "").startswith(GENERIC_PREFIX):
            return self.control(node)
        if node.get("slots"):
            node = {
                **node,
                "slots": {slot: [self.node(c) if isinstance(c, dict) else c for c in children] for slot, children in node["slots"].items()},
            }
        return node

    def control(self, node: dict) -> dict:
        kind = node["tag"][len(GENERIC_PREFIX) :]
        generic_props = _generic_props()
        spec = self.design.controls.get(kind)
        fallback = spec is None
        if fallback:
            spec = self.fallback.controls.get(kind)
            if spec is None:
                raise ValueError(f"{_describe(node)} is not a generic control that design {self.design.name!r} or the fallback describes")
        props = {name: _plain(v) for name, v in node.get("props", {}).items()}
        bindings = dict(node.get("bindings", {}))
        overrides = (props.pop(OVERRIDES_PROP, None) or {}).get(self.design.name, {})
        out: dict[str, Any] = dict(spec.fixed)
        before: list[dict] = []  # parts placed inside the control ahead of its content
        after: list[dict] = []
        siblings_before: list[dict] = []
        siblings_after: list[dict] = []
        slots: dict[str, list] = {}
        if fallback:
            out["data-ui-fallback"] = self.fallback.name

        for part in PARTS:
            literal = props.pop(part, None)
            binding = bindings.pop(part, None)
            if literal is None and binding is None:
                continue
            where: Part = getattr(spec, part)
            if where.kind == "attr":
                out[where.name] = literal
                if binding:
                    bindings[where.name] = binding
            elif where.kind == "text":
                out["textContent"] = literal
                if binding:
                    bindings["textContent"] = binding
            elif where.kind == "none":
                continue
            else:
                element = _element(where.tag, {**where.props, **({"slot": where.name} if where.kind == "slot" else {})}, literal, binding)
                if where.kind == "slot":
                    slots.setdefault(where.name, []).append(element)
                elif where.kind == "child":
                    (after if where.after else before).append(element)
                else:
                    if spec.wrap is None:
                        raise ValueError(f"design {self.design.name!r} places the {part} of {kind!r} beside the control but declares no wrap")
                    (siblings_after if where.after else siblings_before).append(element)
            if part == "error" and literal:
                out.update(spec.invalid)

        options = props.pop("options", None)
        options_binding = bindings.pop("options", None)
        value = props.pop("value", None)
        if spec.options is not None and (options is not None or options_binding is not None):
            if spec.options.kind == "prop":
                if not isinstance(spec.options.label, str):
                    raise ValueError(f"design {self.design.name!r} gives property options a label Part; use a field name")
                if spec.options.fixed or spec.options.label_attr is not None or spec.options.item_wrap is not None:
                    raise ValueError(f"design {self.design.name!r} gives property options child-only rendering settings")
                if options is not None:
                    out[spec.options.name] = []
                    for item in _option_items(options):
                        rendered = {
                            spec.options.value: _encode_value(item["value"], spec.value.codec),
                            spec.options.label: item["label"],
                        }
                        if item["disabled"] and spec.options.disabled is not None:
                            rendered[spec.options.disabled] = True
                        out[spec.options.name].append(rendered)
                if options_binding is not None:
                    bindings[spec.options.name] = {
                        **options_binding,
                        "options": {
                            "value": spec.options.value,
                            "label": spec.options.label,
                            **({"disabled": spec.options.disabled} if spec.options.disabled is not None else {}),
                            **({"codec": spec.value.codec} if spec.value.codec is not None else {}),
                        },
                    }
            else:
                if options_binding is not None:
                    raise ValueError(
                        f"{_describe(node)} binds its options, which design {self.design.name!r} renders as child elements; "
                        "pass a literal list, or a design that takes options as a property"
                    )
                children = []
                for item in _option_items(options):
                    encoded = _encode_value(item["value"], spec.value.codec)
                    option_props = {**spec.options.fixed, spec.options.value: encoded}
                    if spec.options.label_attr is not None:
                        option_props[spec.options.label_attr] = item["label"]
                    if item["disabled"] and spec.options.disabled is not None:
                        option_props[spec.options.disabled] = True
                    if value is not None and _same_value(item["value"], value) and spec.options.selected is not None:
                        option_props[spec.options.selected] = True  # a value set before its options exist selects nothing
                    label = spec.options.label
                    item_wrap = spec.options.item_wrap
                    if isinstance(label, str):
                        option = (
                            _element(spec.options.tag, option_props, item["label"])
                            if label == "text"
                            else _element(spec.options.tag, {**option_props, label: item["label"]})
                        )
                        item_siblings_before: list[dict] = []
                        item_siblings_after: list[dict] = []
                    else:
                        option = _element(spec.options.tag, option_props)
                        label_node = _element(
                            label.tag,
                            {**label.props, **({"slot": label.name} if label.kind == "slot" else {})},
                            item["label"],
                        )
                        item_siblings_before = []
                        item_siblings_after = []
                        if label.kind == "attr":
                            option["props"][label.name] = _tag(item["label"])
                        elif label.kind == "text":
                            option["props"]["textContent"] = _tag(item["label"])
                        elif label.kind == "slot":
                            option["slots"] = {label.name: [label_node]}
                        elif label.kind == "child":
                            option["slots"] = {DEFAULT_SLOT: [label_node]}
                        elif label.kind == "sibling":
                            if item_wrap is None:
                                raise ValueError(f"design {self.design.name!r} places an option label beside its control but declares no item_wrap")
                            (item_siblings_after if label.after else item_siblings_before).append(label_node)
                    if item_wrap is not None and item_wrap.control:
                        option.setdefault("props", {}).update({k: _tag(v) for k, v in item_wrap.control.items()})
                    if item_wrap is None:
                        children.append(option)
                    else:
                        children.append(
                            {
                                "tag": item_wrap.tag,
                                **({"props": {k: _tag(v) for k, v in item_wrap.props.items()}} if item_wrap.props else {}),
                                "slots": {DEFAULT_SLOT: [*item_siblings_before, option, *item_siblings_after]},
                            }
                        )
                if spec.options.wrap:
                    children = [{"tag": spec.options.wrap, "slots": {DEFAULT_SLOT: children}}]
                after.extend(children)
        if value is not None:
            if spec.value.defer and "value" not in bindings:
                bindings[spec.value.prop] = {
                    "compute": {"expr": "lit", "value": value},
                    "mode": "one-way",
                    "defer": True,
                    **({"codec": spec.value.codec} if spec.value.codec else {}),
                }
            elif not spec.value.defer:
                out[spec.value.prop] = _encode_value(value, spec.value.codec)
        if "value" in bindings:
            binding = bindings.pop("value")
            if binding.get("mode") == "two-way" and spec.value.event:
                binding = {**binding, "event": spec.value.event}
            if spec.value.codec:
                binding = {**binding, "codec": spec.value.codec}
            if spec.value.defer:
                binding = {**binding, "defer": True}
            bindings[spec.value.prop] = binding

        opened = props.pop("open", None)
        open_binding = bindings.pop("open", None)
        if spec.open is not None:
            method_only = spec.open.methods is not None and spec.open.state is not None
            if opened is not None and not method_only:
                out[spec.open.prop] = opened
            if open_binding is not None:
                binding = dict(open_binding)
                if spec.open.event and binding.get("mode") == "two-way":
                    binding["event"] = spec.open.event
                if spec.open.methods:
                    binding["methods"] = list(spec.open.methods)
                if spec.open.state:
                    binding["state"] = spec.open.state
                bindings[spec.open.prop] = binding
            elif opened is not None and method_only:
                bindings[spec.open.prop] = {
                    "compute": {"expr": "lit", "value": opened},
                    "mode": "one-way",
                    "methods": list(spec.open.methods),
                    "state": spec.open.state,
                }

        for name, v in props.items():
            if name in spec.props:
                target = spec.props[name]
                if target is None:
                    continue
                out[target] = spec.values.get(name, {}).get(v, v) if isinstance(v, str) else v
            elif name not in generic_props and name != "multiple":
                out[name] = v  # id, class, style, data-*, aria-* and other generic element props
        for name in list(bindings):
            if name in spec.props:
                target = spec.props[name]
                binding = bindings.pop(name)
                if target is not None:
                    bindings[target] = binding
            elif name in generic_props or name == "multiple":
                bindings.pop(name)
        out.update(overrides)

        if "text" in bindings:
            _check_text_binding_target(spec.tag, None, "text")

        control: dict[str, Any] = {"tag": spec.tag}
        control_props = {k: v for k, v in out.items() if v is not None}
        if spec.wrap is not None:
            control_props.update(spec.wrap.control)
        if control_props:
            control["props"] = {k: _tag(v) for k, v in control_props.items()}
        content = [self.node(c) if isinstance(c, dict) else c for c in node.get("slots", {}).get(DEFAULT_SLOT, [])]
        default = [*before, *content, *after]
        if default:
            slots[DEFAULT_SLOT] = default
        for slot, children in node.get("slots", {}).items():
            if slot != DEFAULT_SLOT:
                slots.setdefault(slot, []).extend(self.node(c) if isinstance(c, dict) else c for c in children)
        if slots:
            control["slots"] = slots
        if node.get("events"):
            control["events"] = {spec.events.get(event, event): action for event, action in node["events"].items()}
        if bindings:
            control["bindings"] = bindings

        if spec.wrap is None:
            outer = control
        else:
            outer = {
                "tag": spec.wrap.tag,
                "props": {k: _tag(v) for k, v in spec.wrap.props.items()},
                "slots": {DEFAULT_SLOT: [*siblings_before, control, *siblings_after]},
            }
            if not outer["props"]:
                del outer["props"]
        if "key" in node:
            outer["key"] = node["key"]
        return outer


def resolve(node: dict, design: Design, *, fallback: Design | None = None) -> dict:
    """The serialized tree ``node`` with every generic control replaced by what ``design`` renders it
    as. A control the design does not describe is rendered by ``fallback`` (the native baseline when
    not given) and marked ``data-ui-fallback``."""
    if fallback is None:
        from .native import NATIVE

        fallback = NATIVE
    return _Resolver(design, fallback).node(node)


def select_design(design: Design | str | None, packages: Any = ()) -> Design:
    """The design a page renders its generic controls with.

    A :class:`Design` is used as given. ``None`` takes the one design the selected ``packages``
    publish, or the native baseline when none does; several is an error naming them, since one page
    renders with one design. A name selects a package's design by the package's name, or
    ``"native"`` for the baseline.
    """
    from .native import NATIVE

    if isinstance(design, Design):
        return design
    published = [(package.name, package.design) for package in packages if getattr(package, "design", None) is not None]
    if design is None:
        if not published:
            return NATIVE
        if len(published) > 1:
            names = ", ".join(repr(name) for name, _ in published)
            raise ValueError(f"several selected packages publish a design ({names}); pass design= to choose one")
        return published[0][1]
    if design == NATIVE.name:
        return NATIVE
    for name, found in published:
        if name == design:
            return found
    available = ", ".join(repr(name) for name, _ in published) or "none selected"
    raise ValueError(
        f"no selected package publishes the design {design!r} (packages with a design: {available}); select its package, or pass a Design"
    )
