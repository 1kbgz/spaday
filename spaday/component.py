"""The authoring base for spaday components.

A :class:`Component` is a Python object that builds one node of the spaday component tree — a tag, an
optional reconciliation key, props, and child slots — and serializes to the JSON wire form the Rust
core's ``diff``/``apply`` understand. The typed component classes generated from a Custom Elements
Manifest (see :mod:`spaday.cem`) subclass this and expose each element's attributes as typed keyword
arguments.

Behavior is attached with :meth:`Component.on` — the declarative action DSL (see :mod:`spaday.actions`):
the runtime interprets the action in the browser on the DOM event, with no round-trip to Python.
"""

import json
from typing import Any, Dict, List, Optional, Union

#: The conventional name of a component's unnamed (default) slot (matches the Rust core).
DEFAULT_SLOT = "default"

#: A child is either another Component or an already-built node dict.
Child = Union["Component", dict]


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


def _css_name(name: str) -> str:
    """A Python kwarg → its CSS name: drop one trailing ``_``, then ``_`` → ``-`` (``font_size`` → ``font-size``)."""
    if name.endswith("_"):
        name = name[:-1]
    return name.replace("_", "-")


class Component:
    """Base for a node in the spaday component tree.

    Subclasses set the class attribute ``tag`` and pass props (only the ones the author set —
    ``None`` means "leave the element's own default") to ``super().__init__``. Compose children with
    ``child`` / ``child_in`` and set a reconciliation key with ``key``.
    """

    tag: str = ""

    def __init__(self, *, key: Optional[str] = None, props: Optional[Dict[str, Any]] = None) -> None:
        self._key = key
        self._props: Dict[str, Any] = {k: v for k, v in (props or {}).items() if v is not None}
        self._slots: Dict[str, List[Child]] = {}
        self._events: Dict[str, dict] = {}
        self._bindings: Dict[str, dict] = {}
        self._style: Dict[str, str] = {}  # inline CSS declarations + custom properties (theming)
        self._classes: List[str] = []  # CSS classes (variants / states)

    def key(self, key: str) -> "Component":
        """Set the reconciliation key (for keyed child diffing)."""
        self._key = key
        return self

    def child(self, node: Child) -> "Component":
        """Append a child to the default slot."""
        return self.child_in(DEFAULT_SLOT, node)

    def child_in(self, slot: str, node: Child) -> "Component":
        """Append a child to a named slot."""
        self._slots.setdefault(slot, []).append(node)
        return self

    def text(self, value: str) -> "Component":
        """Set the element's text content (e.g. a button or option label).

        Text is set as the ``textContent`` DOM property by the runtime, so this is for leaf elements
        whose label *is* their text (don't combine it with child nodes).
        """
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
        own tokens (``--wa-color-*``) are set the same way. See :mod:`spaday.theme`.
        """
        self._style.update({"--" + _css_name(k): str(v) for k, v in variables.items() if v is not None})
        return self

    def classes(self, *names: str) -> "Component":
        """Add CSS classes (component variants / theme states), e.g. ``.classes("wa-dark")``."""
        self._classes.extend(n for n in names if n)
        return self

    def on(self, event: str, action: Any) -> "Component":
        """Bind a declarative :class:`~spaday.actions.Action` to a DOM event (e.g. ``"click"``).

        The action is serialized as data and interpreted in the browser when the event fires — no
        round-trip to Python.
        """
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

    def compute(self, prop: str, expr: Any) -> "Component":
        """Reactively set ``prop`` to a value *computed* from state fields (one-way).

        ``expr`` is a field expression (:func:`~spaday.actions.field` / ``eq`` / ``not_`` / ``all_`` /
        ``any_`` / ``lit``) evaluated in the browser against the signal store and recomputed whenever any
        field it reads changes, e.g. ``compute("disabled", not_(field("enabled")))``.
        """
        self._bindings[prop] = {"compute": expr.to_dict(), "mode": "one-way"}
        return self

    def _final_props(self) -> Dict[str, Any]:
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


def element(tag: str, *, key: Optional[str] = None, **props: Any) -> Component:
    """Build a plain element (e.g. a ``div`` container) for structure a typed component doesn't cover.

    A prop name with a trailing underscore is de-escaped, so reserved words work: ``class_`` → ``class``.
    """
    clean = {(k[:-1] if k.endswith("_") else k): v for k, v in props.items()}
    node = Component(key=key, props=clean)
    node.tag = tag
    return node
