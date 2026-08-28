"""The authoring base for spaday components.

A :class:`Component` is a Python object that builds one node of the spaday component tree — a tag, an
optional reconciliation key, props, and child slots — and serializes to the JSON wire form the Rust
core's ``diff``/``apply`` understand. The typed component classes generated from a Custom Elements
Manifest (see :mod:`spaday.cem`) subclass this and expose each element's attributes as typed keyword
arguments.

Behavior is attached with :meth:`Component.on` — the declarative action DSL (see :mod:`spaday.actions`):
the runtime interprets the action in the browser on the DOM event, with no round-trip to Python.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from typing import Any, ClassVar, Union

from .actions import Action, Expr
from .catalog import ComponentSchema

#: The conventional name of a component's unnamed (default) slot (matches the Rust core).
DEFAULT_SLOT = "default"

#: A child is a Component, an already-built node dict, or a string (which becomes a text node).
Child = Union["Component", dict, str]


def _attr_name(name: str) -> str:
    """A Python kwarg → its attribute name: drop one trailing underscore so reserved words work
    (``class_`` → ``class``, ``for_`` → ``for``)."""
    return name.removesuffix("_")


def _snake_name(name: str) -> str:
    """A camelCase prop name → its snake_case spelling (``maxLabelWidth`` → ``max_label_width``)."""
    return re.sub(r"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])", "_", name).lower()


#: tag -> schema for every imported schema-carrying class (validate uses it for dict trees)
_SCHEMAS_BY_TAG: dict[str, ComponentSchema] = {}


@lru_cache(maxsize=None)
def _prop_aliases(schema: ComponentSchema) -> dict[str, str]:
    """snake_case spelling → canonical prop name, for schema props where the two spellings differ."""
    names = {prop.name for prop in schema.props}
    aliases: dict[str, str] = {}
    for prop in schema.props:
        snake = _snake_name(prop.name)
        if snake != prop.name and snake not in names:
            aliases.setdefault(snake, prop.name)
    return aliases


def _tag(value: Any) -> Any:
    """Encode a plain Python value as the core's externally-tagged ``Value``."""
    if value is None:
        return "Null"
    if isinstance(value, bool):
        return {"Bool": value}
    if isinstance(value, int):
        return {"Int": value}
    if isinstance(value, float):
        return {"Float": value}
    if isinstance(value, str):
        return {"Str": value}
    if isinstance(value, (list, tuple)):
        return {"List": [_tag(v) for v in value]}
    if isinstance(value, dict):
        return {"Map": {str(k): _tag(v) for k, v in value.items()}}
    raise TypeError(f"unsupported prop value type for spaday: {type(value)!r}")


def _as_node(child: Child) -> dict:
    return child.to_node() if isinstance(child, Component) else child


# The Python shape a catalog prop kind demands of a *literal* value. `json` is absent on purpose: the
# catalog maps every complex/unknown type (lists, objects, mixed unions, untyped props) to it, so no
# literal shape can be ruled out. Reactive bindings/computed values are dynamic and never checked.
_KIND_TYPES: dict[str, type | tuple[type, ...]] = {
    "string": str,
    "enum": str,
    "boolean": bool,
    "number": (int, float),
}


def _css_name(name: str) -> str:
    """A Python kwarg → its CSS name: drop one trailing ``_``, then ``_`` → ``-`` (``font_size`` → ``font-size``)."""
    name = name.removesuffix("_")
    return name.replace("_", "-")


class Component:
    """Base for a node in the spaday component tree.

    Author it two equivalent ways: nest children **positionally** in the constructor and set generic
    props as keywords — ``App(Nav("title"), Body(...), id="root")`` — or build it up fluently with
    ``.child()`` / ``.prop()``. A string child becomes a text node. Subclasses set the class attribute
    ``tag`` and forward their typed props via ``props=`` (only the ones the author set — ``None`` means
    "leave the element's own default"). CEM-generated subclasses also set the class-level ``schema``
    used by component catalogs; hand-authored catalog components may set it explicitly.
    """

    tag: str = ""
    schema: ClassVar[ComponentSchema | None] = None

    def __init_subclass__(cls, **kwargs: Any) -> None:
        super().__init_subclass__(**kwargs)
        # schema-carrying classes register by tag, so `validate` can check props on serialized
        # dict trees too (a node dict carries no schema of its own)
        if cls.schema is not None and cls.tag:
            _SCHEMAS_BY_TAG[cls.tag] = cls.schema

    def __init__(self, *children: Child, key: str | None = None, props: dict[str, Any] | None = None, **attrs: Any) -> None:
        self._key = key
        merged = dict(props or {})  # typed props (from a subclass) + generic keyword props (id, style, …)
        generic = {_attr_name(k): v for k, v in attrs.items()}
        if type(self).schema is not None and generic:
            # a schema-carrying class also accepts the snake_case spelling of each camelCase prop
            # (`max_label_width=` lands as prop `maxLabelWidth`); both spellings at once is ambiguous
            aliases = _prop_aliases(type(self).schema)
            for name in [n for n in generic if n in aliases and generic[n] is not None]:
                canonical = aliases[name]
                if generic.get(canonical) is not None or merged.get(canonical) is not None:
                    raise TypeError(f"<{self.tag}> prop {canonical!r} passed under both spellings ({name!r} and {canonical!r})")
                generic[canonical] = generic.pop(name)
        merged.update(generic)
        self._props: dict[str, Any] = {k: v for k, v in merged.items() if v is not None}
        if type(self).schema is not None:
            self._check_prop_kinds()
        self._slots: dict[str, list[Child]] = {}
        self._events: dict[str, dict] = {}
        self._bindings: dict[str, dict] = {}
        self._style: dict[str, str] = {}  # inline CSS declarations + custom properties (theming)
        self._classes: list[str] = []  # CSS classes (variants / states)
        self.child(*children)

    def _check_prop_kinds(self) -> None:
        """Reject a literal prop value that contradicts the class's catalog ``schema`` kind.

        The authoring-time half of prop validation (the browser doesn't ship the catalog): a plain
        value of the wrong shape — e.g. a ``str`` for a ``number`` prop — fails here with the
        component and prop named, instead of surfacing later as an opaque component error. Only
        kinds with an unambiguous Python shape are checked (see ``_KIND_TYPES``); ``json`` props and
        props outside the schema (``id``, ``style``, …) pass through.
        """
        kinds = {prop.name: prop.kind for prop in self.schema.props}
        for name, value in self._props.items():
            expected = _KIND_TYPES.get(kinds.get(name, ""))
            if expected is None:
                continue
            if not isinstance(value, expected) or (kinds[name] == "number" and isinstance(value, bool)):
                raise TypeError(f"<{self.tag}> prop {name!r} expects kind {kinds[name]!r}, got {value!r} ({type(value).__name__})")

    def key(self, key: str) -> "Component":
        """Set the reconciliation key (for keyed child diffing)."""
        self._key = key
        return self

    def child(self, *nodes: Child) -> "Component":
        """Append one or more children to the default slot (a string child becomes a text node)."""
        for node in nodes:
            self.child_in(DEFAULT_SLOT, node)
        return self

    def child_in(self, slot: str, node: Child) -> "Component":
        """Append a child to a named slot (a string becomes a ``<span>`` text node)."""
        if not isinstance(node, (Component, dict, str)):
            raise TypeError(f"child must be a Component, node dict, or string, got {type(node).__name__}")
        self._slots.setdefault(slot, []).append(element("span", textContent=node) if isinstance(node, str) else node)
        return self

    def text(self, value: str | Expr) -> "Component":
        """Set the element's literal or reactive text content (e.g. a button or option label).

        Text is set as the ``textContent`` DOM property by the runtime, so this is for leaf elements
        whose label *is* their text (don't combine it with child nodes). An expression such as
        ``item("name")`` becomes a computed binding.
        """
        if isinstance(value, Expr):
            return self.compute("textContent", value)
        self._props["textContent"] = value
        return self

    def prop(self, name: str, value: Any) -> "Component":
        """Set an arbitrary prop (escape hatch for attributes a typed class doesn't expose)."""
        if value is not None:
            self._props[name] = value
        return self

    def style(self, **decls: Any) -> "Component":
        """Set inline CSS declarations, e.g. ``.style(padding="1rem", font_size="2rem")``.

        Keys are kebab-cased (``font_size`` → ``font-size``; a trailing ``_`` is dropped so reserved
        words work, ``float_`` → ``float``). Composes with :meth:`css` and any literal ``style`` prop.
        """
        self._style.update({_css_name(k): str(v) for k, v in decls.items() if v is not None})
        return self

    def css(self, **variables: Any) -> "Component":
        """Set CSS **custom properties** — the theming knob, e.g. ``.css(background_color="navy")`` →
        ``--background-color: navy``. This is how a web component's documented `--*` theme tokens are
        set from Python (per component), and how the ``spa-*`` shell is re-themed at the app level
        (``App().css(spa_surface="#111", spa_border="#333")`` cascades to the whole shell). WebAwesome's
        own custom-property tokens are set the same way. See :mod:`spaday.theme`.
        """
        self._style.update({"--" + _css_name(k): str(v) for k, v in variables.items() if v is not None})
        return self

    def classes(self, *names: str) -> "Component":
        """Add CSS classes (component variants / theme states), e.g. ``.classes("wa-dark")``."""
        self._classes.extend(n for n in names if n)
        return self

    def on(self, event: str, action: Action) -> "Component":
        """Bind a declarative :class:`~spaday.actions.Action` to a DOM event (e.g. ``"click"``).

        The action is serialized as data and interpreted in the browser when the event fires — no
        round-trip to Python.
        """
        if not isinstance(action, Action):
            raise TypeError(f"event action must be an Action, got {type(action).__name__}")
        self._events[event] = action.to_dict()
        return self

    def bind(self, prop: str, field: str, *, mode: str = "one-way") -> "Component":
        """Reactively bind a ``prop`` to a state ``field`` in the runtime's signal store.

        ``mode="one-way"`` keeps the prop in sync with the field; ``"two-way"`` also writes the field
        back when the control changes (for value-like controls). The binding is data interpreted in the
        browser — the field's value flows to the prop with no round-trip to Python.
        """
        if mode not in ("one-way", "two-way"):
            raise ValueError(f"bind mode must be 'one-way' or 'two-way', not {mode!r}")
        self._bindings[prop] = {"field": field, "mode": mode}
        return self

    def compute(self, prop: str, expr: Expr) -> "Component":
        """Reactively set ``prop`` to a value *computed* from state fields (one-way).

        ``expr`` is a field expression (:func:`~spaday.actions.field` / ``eq`` / ``not_`` / ``all_`` /
        ``any_`` / ``lit`` / ``item`` / ``scope``) evaluated in the browser and recomputed whenever any
        global field or repeater scope it reads changes, e.g. ``compute("disabled", not_(field("enabled")))``.
        """
        if not isinstance(expr, Expr):
            raise TypeError(f"computed binding must use an Expr, got {type(expr).__name__}")
        self._bindings[prop] = {"compute": expr.to_dict(), "mode": "one-way"}
        return self

    def bind_root_class(self, name: str, field: str) -> "Component":
        """Toggle a CSS class on the document root (``<html>``) from a boolean reactive state ``field``.

        The escape hatch for *page-level* theming that lives outside the component tree — most notably
        WebAwesome's ``wa-dark``: ``App(...).bind_root_class("wa-dark", "dark")`` makes a switch bound to
        a ``dark`` field re-theme the whole page (the rest follows via CSS tokens; canvas widgets that
        can't read a class take a ``.compute("theme", cond(field("dark"), "dark", "light"))`` instead).
        One-way (the field drives the class); active only when mounted with a signal ``Store``.
        """
        self._bindings[f"root-class:{name}"] = {"field": field, "mode": "one-way"}
        return self

    def _final_props(self) -> dict[str, Any]:
        """Props with theming folded in: ``style``/``class`` merged from :meth:`style`/:meth:`css`/
        :meth:`classes` (after any literal ``style``/``class`` prop)."""
        props = dict(self._props)
        if self._style:
            decls = "; ".join(f"{k}: {v}" for k, v in self._style.items())
            props["style"] = f"{props['style']}; {decls}" if props.get("style") else decls
        if self._classes:
            names = " ".join(self._classes)
            props["class"] = f"{props['class']} {names}" if props.get("class") else names
        return props

    def to_node(self) -> dict:
        """The node as the core's JSON-ready dict (empty fields omitted, like the Rust core)."""
        node: dict = {"tag": self.tag}
        if self._key is not None:
            node["key"] = self._key
        props = self._final_props()
        if props:
            node["props"] = {name: _tag(v) for name, v in props.items()}
        if self._slots:
            node["slots"] = {slot: [_as_node(c) for c in children] for slot, children in self._slots.items()}
        if self._events:
            # actions are the core's own DSL wire form (see spaday.actions) — plain, not a tagged Value
            node["events"] = dict(self._events)
        if self._bindings:
            node["bindings"] = dict(self._bindings)
        return node

    def to_json(self) -> str:
        """The node serialized for the core's ``diff``/``apply``."""
        return json.dumps(self.to_node())


def element(tag: str, *children: Child, key: str | None = None, **props: Any) -> Component:
    """Build a plain element (e.g. a ``div`` container) for structure a typed component doesn't cover.

    Children nest positionally; a prop name with a trailing underscore is de-escaped so reserved words
    work (``class_`` → ``class``). e.g. ``element("div", Strong("hi"), id="root", class_="card")``.
    """
    node = Component(*children, key=key, props={_attr_name(k): v for k, v in props.items()})
    node.tag = tag
    return node


def Text(text: str | Expr, **props: Any) -> Component:
    """An inline text node — a ``<span>``. ``Row("Echo: ", echo)`` does the same via a bare string child."""
    return element("span", **props).text(text)


def Strong(text: str | Expr, **props: Any) -> Component:
    """Bold inline text — a ``<strong>``."""
    return element("strong", **props).text(text)


def Paragraph(text: str | Expr, **props: Any) -> Component:
    """A paragraph — a ``<p>``."""
    return element("p", **props).text(text)
