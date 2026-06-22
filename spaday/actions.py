"""The declarative action DSL: behavior authored in Python, executed in the browser.

An :class:`Action` is *serializable data, not code* — it carries no Python callable. Attach one to a
component with :meth:`~spaday.component.Component.on` and the spaday runtime interprets it directly on
the DOM event, with **no round-trip to Python**::

    from spaday.actions import SetProp, Toggle, by_id, event_value, not_
    from spaday.components import WaButton, WaSwitch

    WaButton(variant="neutral").text("Toggle").on("click", Toggle(by_id("panel"), "hidden"))
    WaSwitch().text("Show").on("change", SetProp(by_id("panel"), "hidden", not_(event_value())))

This is the "configure in Python, run in JS" core: the server holds session state, but an `onClick`
toggle or a prop binding runs client-side. The interpreter dispatches on each action's ``kind`` — there
is no ``eval`` — so actions are safe to ship to untrusted, multi-tenant clients.

The set here (``SetProp`` / ``Toggle`` / ``Sequence`` / ``Emit`` with literal / event-value / ``not``
expressions and ``this`` / ``by_id`` targets) is the first slice; reactive ``Bind``, ``CallEndpoint``,
``SendPatch``, and conditionals follow.
"""

from typing import Any, Dict, List, Optional


class Expr:
    """A value computed in the browser at event time (a literal, the event's value, ...)."""

    def to_dict(self) -> Dict[str, Any]:
        raise NotImplementedError


class _Lit(Expr):
    def __init__(self, value: Any) -> None:
        self.value = value

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "lit", "value": self.value}


class _EventValue(Expr):
    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "event"}


class _Not(Expr):
    def __init__(self, of: Any) -> None:
        self.of = of

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "not", "of": _expr(self.of).to_dict()}


def lit(value: Any) -> Expr:
    """A literal value."""
    return _Lit(value)


def event_value() -> Expr:
    """The triggering event's value — a control's ``checked`` (booleans) else ``value`` else ``detail``."""
    return _EventValue()


def not_(of: Any) -> Expr:
    """Boolean negation of an expression (or a literal)."""
    return _Not(of)


def _expr(value: Any) -> Expr:
    """Coerce a plain Python value to a literal expression; pass an `Expr` through."""
    return value if isinstance(value, Expr) else _Lit(value)


class _Prop(Expr):
    def __init__(self, target: "Ref", name: str) -> None:
        self.target, self.name = target, name

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "prop", "target": self.target.to_dict(), "name": self.name}


def prop(target: "Ref", name: str) -> Expr:
    """The current value of a ``name`` prop on ``target`` — reads live element state, e.g.
    ``prop(by_id("sw"), "checked")`` for use as a condition."""
    return _Prop(target, name)


class Ref:
    """A reference to a DOM element an action targets."""

    def to_dict(self) -> Dict[str, Any]:
        raise NotImplementedError


class _This(Ref):
    def to_dict(self) -> Dict[str, Any]:
        return {"ref": "this"}


class _Id(Ref):
    def __init__(self, id: str) -> None:
        self.id = id

    def to_dict(self) -> Dict[str, Any]:
        return {"ref": "id", "id": self.id}


def this() -> Ref:
    """The element the event fired on (the listener's element)."""
    return _This()


def by_id(id: str) -> Ref:
    """The element with this ``id`` within the mounted tree."""
    return _Id(id)


class Action:
    """Declarative behavior, interpreted in the browser. Serializes to the component's ``events`` map."""

    def to_dict(self) -> Dict[str, Any]:
        raise NotImplementedError


class SetProp(Action):
    """Set ``prop`` on ``target`` to ``value`` (an :class:`Expr` or a plain literal)."""

    def __init__(self, target: Ref, prop: str, value: Any) -> None:
        self.target, self.prop, self.value = target, prop, value

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "set", "target": self.target.to_dict(), "prop": self.prop, "value": _expr(self.value).to_dict()}


class Toggle(Action):
    """Flip a boolean ``prop`` on ``target`` (e.g. ``hidden``, ``checked``, ``open``)."""

    def __init__(self, target: Ref, prop: str) -> None:
        self.target, self.prop = target, prop

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "toggle", "target": self.target.to_dict(), "prop": self.prop}


class Sequence(Action):
    """Run several actions in order."""

    def __init__(self, *actions: Action) -> None:
        self.actions: List[Action] = list(actions)

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "seq", "actions": [a.to_dict() for a in self.actions]}


class Emit(Action):
    """Dispatch a (bubbling) custom DOM event named ``event`` with an optional ``detail`` expression."""

    def __init__(self, event: str, detail: Any = None) -> None:
        self.event, self.detail = event, detail

    def to_dict(self) -> Dict[str, Any]:
        detail = _expr(self.detail).to_dict() if self.detail is not None else None
        return {"kind": "emit", "event": self.event, "detail": detail}


class SendPatch(Action):
    """Set ``field`` to ``value`` on a host-routed ``model`` (e.g. a transports model).

    The runtime surfaces this as a patch *intent* (a bubbling ``spaday:patch`` DOM event carrying
    ``{model, field, value}``); the app routes it to the actual wire. This is how a control edit is
    authored declaratively instead of with a hand-written transports listener.
    """

    def __init__(self, model: str, field: str, value: Any) -> None:
        self.model, self.field, self.value = model, field, value

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "patch", "model": self.model, "field": self.field, "value": _expr(self.value).to_dict()}


class If(Action):
    """Run ``then`` if ``cond`` is truthy, else ``els`` (if given) — branch on live state, e.g.
    ``If(prop(by_id("sw"), "checked"), SetProp(...), SetProp(...))``."""

    def __init__(self, cond: Any, then: Action, els: Optional[Action] = None) -> None:
        self.cond, self.then, self.els = cond, then, els

    def to_dict(self) -> Dict[str, Any]:
        return {
            "kind": "if",
            "cond": _expr(self.cond).to_dict(),
            "then": self.then.to_dict(),
            "else": self.els.to_dict() if self.els is not None else None,
        }


def bind(source: Any, target: Ref, target_prop: str, *, transform: Any = None) -> Any:
    """One-way reactive binding: when ``source`` (a control component) changes, set ``target_prop`` on
    ``target`` (a :class:`Ref`, e.g. ``by_id("panel")``) to the source's value — optionally passed
    through ``transform`` (e.g. :func:`not_`). Returns ``source`` so it composes in a tree::

        bind(WaSwitch().text("Show"), by_id("panel"), "hidden", transform=not_)

    Event-driven (sugar over ``SetProp`` on the source's ``change``); the signal-graph reactive engine
    and two-way binding are future work.
    """
    value = transform(event_value()) if transform else event_value()
    source.on("change", SetProp(target, target_prop, value))
    return source
