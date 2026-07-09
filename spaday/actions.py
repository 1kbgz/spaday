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

Actions: ``SetProp`` / ``Toggle`` / ``Sequence`` / ``Emit`` (client-side); ``SetField`` / ``ToggleField``
(write the mounted signal store, so a plain button can drive reactive state); ``SendPatch`` (a model-edit
intent the app routes to its wire, e.g. transports); ``If`` (conditionals); ``CallEndpoint`` (a REST
round-trip); and ``NamedJs`` (a no-``eval`` escape hatch to a pre-registered handler). Expressions:
``lit`` / ``event_value`` / ``not_`` / ``prop`` (read live element state); targets ``this`` / ``by_id``.
``bind`` here is a one-way event-driven helper; reactive prop↔state bindings (one- or two-way) are
authored with ``Component.bind`` and interpreted by the runtime's signal store.
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


class _Field(Expr):
    def __init__(self, name: str) -> None:
        self.name = name

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "field", "name": self.name}


def field(name: str) -> Expr:
    """The current value of a reactive state field — for a *computed* binding (``Component.compute``),
    evaluated against the signal store in the browser, e.g. ``not_(field("enabled"))``."""
    return _Field(name)


class _Eq(Expr):
    def __init__(self, a: Any, b: Any) -> None:
        self.a, self.b = a, b

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "eq", "a": _expr(self.a).to_dict(), "b": _expr(self.b).to_dict()}


def eq(a: Any, b: Any) -> Expr:
    """True when two expressions are equal, e.g. ``eq(field("mode"), "advanced")``."""
    return _Eq(a, b)


class _All(Expr):
    def __init__(self, *exprs: Any) -> None:
        self.exprs = exprs

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "all", "of": [_expr(e).to_dict() for e in self.exprs]}


def all_(*exprs: Any) -> Expr:
    """True when every expression is truthy (logical AND)."""
    return _All(*exprs)


class _Any(Expr):
    def __init__(self, *exprs: Any) -> None:
        self.exprs = exprs

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "any", "of": [_expr(e).to_dict() for e in self.exprs]}


def any_(*exprs: Any) -> Expr:
    """True when any expression is truthy (logical OR)."""
    return _Any(*exprs)


class _Cond(Expr):
    def __init__(self, test: Any, then: Any, otherwise: Any) -> None:
        self.test, self.then, self.otherwise = test, then, otherwise

    def to_dict(self) -> Dict[str, Any]:
        return {
            "expr": "cond",
            "test": _expr(self.test).to_dict(),
            "then": _expr(self.then).to_dict(),
            "else": _expr(self.otherwise).to_dict(),
        }


def cond(test: Any, then: Any, otherwise: Any) -> Expr:
    """A ternary for a *computed* binding (:meth:`~spaday.component.Component.compute`): ``then`` when
    ``test`` is truthy, else ``otherwise`` (each a plain value or an :class:`Expr`). Evaluated against the
    signal store in the browser — e.g. a boolean ``dark`` field driving a string theme prop::

        chart.compute("theme", cond(field("dark"), "dark", "light"))
    """
    return _Cond(test, then, otherwise)


class _Obj(Expr):
    def __init__(self, fields: Dict[str, Any]) -> None:
        self.fields = fields

    def to_dict(self) -> Dict[str, Any]:
        return {"expr": "obj", "fields": {k: _expr(v).to_dict() for k, v in self.fields.items()}}


def obj(fields: Dict[str, Any]) -> Expr:
    """Compose a JSON object from named sub-expressions (each value a plain value or an :class:`Expr`).
    Lets a whole model be POSTed declaratively as a :class:`CallEndpoint` body — composing live control
    values without a hand-written handler::

        CallEndpoint("POST", "/api/order", obj({
            "symbol": prop(by_id("symbol"), "value"),
            "qty": prop(by_id("qty"), "value"),
        }))
    """
    return _Obj(fields)


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


class SetField(Action):
    """Write ``value`` (an :class:`Expr` or a plain literal) to reactive state ``field`` in the signal
    store the tree was mounted with — the store-writing counterpart of :func:`field`. Lets a plain
    control drive reactive state declaratively::

        WaButton().text("Clear").on("click", SetField("symbol", ""))
    """

    def __init__(self, field: str, value: Any) -> None:
        self.field, self.value = field, value

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "set-field", "field": self.field, "value": _expr(self.value).to_dict()}


class ToggleField(Action):
    """Flip a boolean reactive state ``field`` in the signal store — e.g. an icon button toggling a
    ``dark`` theme flag::

        WaButton(appearance="plain").text("🌙").on("click", ToggleField("dark"))
    """

    def __init__(self, field: str) -> None:
        self.field = field

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "toggle-field", "field": self.field}


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


class CallEndpoint(Action):
    """A REST round-trip: ``method`` ``url`` with an optional JSON ``body`` (an :class:`Expr` or a plain
    value). The one intentional server call — the runtime performs it with ``fetch``.

    Pass ``result`` (a signal-store field name) to capture the outcome: on completion the runtime writes
    ``{"status": <int>, "ok": <bool>, "body": <parsed JSON or text>}`` to that field, so success/error
    feedback stays declarative (bind or :class:`~spaday.components.shell.Show` on it)::

        CallEndpoint("POST", "/api/order", obj({"symbol": field("symbol")}), result="order_result")

    Without ``result`` the call is fire-and-forget.
    """

    def __init__(self, method: str, url: str, body: Any = None, result: Optional[str] = None) -> None:
        self.method, self.url, self.body, self.result = method, url, body, result

    def to_dict(self) -> Dict[str, Any]:
        body = _expr(self.body).to_dict() if self.body is not None else None
        return {"kind": "call", "method": self.method, "url": self.url, "body": body, "result": self.result}


class NamedJs(Action):
    """The escape hatch: invoke a pre-registered named JS handler (no arbitrary ``eval``). Register it
    on the JS side with ``registerHandler(name, fn)``; use only for the rare irreducible case."""

    def __init__(self, handler: str) -> None:
        self.handler = handler

    def to_dict(self) -> Dict[str, Any]:
        return {"kind": "js", "handler": self.handler}


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
