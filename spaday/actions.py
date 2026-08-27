"""The declarative action DSL: behavior authored in Python, executed in the browser.

An :class:`Action` is *serializable data, not code* — it carries no Python callable. Attach one to a
component with :meth:`~spaday.component.Component.on` and the spaday runtime interprets it directly on
the DOM event, with **no round-trip to Python**::

    from spaday.actions import SetProp, Toggle, by_id, event_value, not_
    from spaday_webawesome import WaButton, WaSwitch

    WaButton(variant="neutral").text("Toggle").on("click", Toggle(by_id("panel"), "hidden"))
    WaSwitch().text("Show").on("change", SetProp(by_id("panel"), "hidden", not_(event_value())))

This is the "configure in Python, run in JS" core: the server holds session state, but an `onClick`
toggle or a prop binding runs client-side. The interpreter dispatches on each action's ``kind`` — there
is no ``eval`` — so actions are safe to ship to untrusted, multi-tenant clients.

Actions: ``SetProp`` / ``Toggle`` / ``Sequence`` / ``Emit`` (client-side); ``SetField`` / ``ToggleField``
(write the mounted signal store, so a plain button can drive reactive state); ``SendPatch`` (a model-edit
intent the app routes to its wire, e.g. transports); ``If`` (conditionals); ``CallEndpoint`` (a REST
round-trip); and ``NamedJs`` (a no-``eval`` escape hatch to a pre-registered handler). Expressions:
``lit`` / ``event_value`` / ``field`` / ``item`` / ``scope`` / ``not_`` / ``prop`` / ``obj`` /
``concat``; targets ``this`` / ``by_id``.
``bind`` here is a one-way event-driven helper; reactive prop↔state bindings (one- or two-way) are
authored with ``Component.bind`` and interpreted by the runtime's signal store.
"""

from typing import Any


class Expr:
    """A value computed in the browser at event time (a literal, the event's value, ...)."""

    def to_dict(self) -> dict[str, Any]:
        raise NotImplementedError


class _Lit(Expr):
    def __init__(self, value: Any) -> None:
        self.value = value

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "lit", "value": self.value}


class _EventValue(Expr):
    def __init__(self, path: str = "") -> None:
        self.path = path

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "event", "path": self.path} if self.path else {"expr": "event"}


class _Not(Expr):
    def __init__(self, of: Any) -> None:
        self.of = of

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "not", "of": _expr(self.of).to_dict()}


def lit(value: Any) -> Expr:
    """A literal value."""
    return _Lit(value)


def event_value(path: str = "") -> Expr:
    """The triggering event's value — a control's ``checked`` (booleans) else ``value`` else ``detail``.
    A dot ``path`` walks into the value: ``event_value("label")`` reads ``detail.label`` from a rich
    CustomEvent, so one field of a structured detail can land in the store or an endpoint body."""
    return _EventValue(path)


class _EventProp(Expr):
    def __init__(self, path: str) -> None:
        self.path = path

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "event-prop", "path": self.path}


def event_prop(path: str) -> Expr:
    """A dot ``path`` read from the raw DOM event object itself — e.g. ``event_prop("clientX")`` for
    the pointer position, or ``event_prop("shiftKey")`` for modifiers. :func:`event_value` walks the
    event's smart-default *value* (``checked`` / ``value`` / ``detail``) instead."""
    return _EventProp(path)


class _EventClosest(Expr):
    def __init__(self, selector: str, path: str) -> None:
        self.selector, self.path = selector, path

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "event-closest", "selector": self.selector, "path": self.path}


def event_closest(selector: str, path: str = "") -> Expr:
    """A dot ``path`` read from the closest ancestor of the event target matching a CSS ``selector``
    (``event.target.closest(selector)``) — e.g. ``event_closest("[data-node-id]", "dataset.nodeId")``
    reads the id off the group a click landed in, however deeply nested the actual target. Evaluates
    to ``undefined`` when nothing matches. An empty ``path`` returns the matched element itself, which
    isn't a useful serializable value — pass a ``path`` to extract data."""
    return _EventClosest(selector, path)


class _Call(Expr):
    def __init__(self, target: "Ref", method: str, *args: Any) -> None:
        self.target, self.method, self.args = target, method, args

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"expr": "call", "target": self.target.to_dict(), "method": self.method}
        if self.args:
            out["args"] = [_expr(a).to_dict() for a in self.args]
        return out


def call(target: "Ref", method: str, *args: Any) -> Expr:
    """The value returned by calling a **synchronous** ``method`` on ``target`` with evaluated
    ``args`` — e.g. ``call(by_id("layout"), "save")`` reads a layout for persistence, or
    ``call(by_id("layout"), "calculatePath", "tab")`` as a condition. No ``eval``: the method must
    exist on the element (component methods are part of its declared surface). Async methods belong
    in the :class:`Invoke` *action*; an expression must produce a value now."""
    return _Call(target, method, *args)


def not_(of: Any) -> Expr:
    """Boolean negation of an expression (or a literal)."""
    return _Not(of)


def _expr(value: Any) -> Expr:
    """Coerce a plain Python value to a literal expression; pass an `Expr` through."""
    return value if isinstance(value, Expr) else _Lit(value)


class _Prop(Expr):
    def __init__(self, target: "Ref", name: str) -> None:
        self.target, self.name = target, name

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "prop", "target": self.target.to_dict(), "name": self.name}


def prop(target: "Ref", name: str) -> Expr:
    """The current value of a ``name`` prop on ``target`` — reads live element state, e.g.
    ``prop(by_id("sw"), "checked")`` for use as a condition."""
    return _Prop(target, name)


class _Field(Expr):
    def __init__(self, name: str) -> None:
        self.name = name

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "field", "name": self.name}


def field(name: str) -> Expr:
    """The current value of a reactive state field — for a *computed* binding (``Component.compute``),
    evaluated against the signal store in the browser, e.g. ``not_(field("enabled"))``."""
    return _Field(name)


class _Item(Expr):
    def __init__(self, path: str) -> None:
        self.path = path

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "item", "path": self.path}


def item(path: str = "") -> Expr:
    """Read ``path`` from the innermost ``Each`` item.

    An empty path returns the complete item. Missing paths evaluate to ``undefined`` in the browser.
    """
    return _Item(path)


class _Scope(Expr):
    def __init__(self, name: str, path: str) -> None:
        self.name, self.path = name, path

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "scope", "name": self.name, "path": self.path}


def scope(reference: str) -> Expr:
    """Read a named current or ancestor item scope.

    ``scope("staging.channel")`` reads ``channel`` from the nearest scope named ``staging``;
    ``scope("staging")`` returns that scope's complete item.
    """
    name, _, path = reference.partition(".")
    if not name:
        raise ValueError("scope reference must start with a name")
    return _Scope(name, path)


class _Eq(Expr):
    def __init__(self, a: Any, b: Any) -> None:
        self.a, self.b = a, b

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "eq", "a": _expr(self.a).to_dict(), "b": _expr(self.b).to_dict()}


def eq(a: Any, b: Any) -> Expr:
    """True when two expressions are equal, e.g. ``eq(field("mode"), "advanced")``."""
    return _Eq(a, b)


class _All(Expr):
    def __init__(self, *exprs: Any) -> None:
        self.exprs = exprs

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "all", "of": [_expr(e).to_dict() for e in self.exprs]}


def all_(*exprs: Any) -> Expr:
    """True when every expression is truthy (logical AND)."""
    return _All(*exprs)


class _Any(Expr):
    def __init__(self, *exprs: Any) -> None:
        self.exprs = exprs

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "any", "of": [_expr(e).to_dict() for e in self.exprs]}


def any_(*exprs: Any) -> Expr:
    """True when any expression is truthy (logical OR)."""
    return _Any(*exprs)


class _Cond(Expr):
    def __init__(self, test: Any, then: Any, otherwise: Any) -> None:
        self.test, self.then, self.otherwise = test, then, otherwise

    def to_dict(self) -> dict[str, Any]:
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
    def __init__(self, fields: dict[str, Any]) -> None:
        self.fields = fields

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "obj", "fields": {k: _expr(v).to_dict() for k, v in self.fields.items()}}


def obj(fields: dict[str, Any]) -> Expr:
    """Compose a JSON object from named sub-expressions (each value a plain value or an :class:`Expr`).
    Lets a whole model be POSTed declaratively as a :class:`CallEndpoint` body — composing live control
    values without a hand-written handler::

        CallEndpoint("POST", "/api/order", obj({
            "symbol": prop(by_id("symbol"), "value"),
            "qty": prop(by_id("qty"), "value"),
        }))
    """
    return _Obj(fields)


class _Concat(Expr):
    def __init__(self, *parts: Any) -> None:
        self.parts = parts

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "concat", "parts": [_expr(part).to_dict() for part in self.parts]}


def concat(*parts: Any) -> Expr:
    """Concatenate expressions as strings, e.g. a state-derived endpoint URL::

    CallEndpoint("POST", concat("/send/basket/", field("key")), body)
    """
    return _Concat(*parts)


class _Arr(Expr):
    def __init__(self, *exprs: Any) -> None:
        self.exprs = exprs

    def to_dict(self) -> dict[str, Any]:
        return {"expr": "arr", "of": [_expr(e).to_dict() for e in self.exprs]}


def arr(*exprs: Any) -> Expr:
    """Compose a JSON array from sub-expressions (each a plain value or an :class:`Expr`) — the
    list-building counterpart of :func:`obj`. E.g. wrap a dynamic value in a one-element list for a
    list-typed prop or body field, like a tree's ``selected_paths``::

        tree.on("click", SetProp(by_id("tree"), "selected_paths", arr(field("path"))))
    """
    return _Arr(*exprs)


class Ref:
    """A reference to a DOM element an action targets."""

    def to_dict(self) -> dict[str, Any]:
        raise NotImplementedError


class _This(Ref):
    def to_dict(self) -> dict[str, Any]:
        return {"ref": "this"}


class _Id(Ref):
    def __init__(self, id: str) -> None:
        self.id = id

    def to_dict(self) -> dict[str, Any]:
        return {"ref": "id", "id": self.id}


def this() -> Ref:
    """The element the event fired on (the listener's element)."""
    return _This()


def by_id(id: str) -> Ref:
    """The element with this ``id`` within the mounted tree."""
    return _Id(id)


class Action:
    """Declarative behavior, interpreted in the browser. Serializes to the component's ``events`` map."""

    def to_dict(self) -> dict[str, Any]:
        raise NotImplementedError


class SetProp(Action):
    """Set ``prop`` on ``target`` to ``value`` (an :class:`Expr` or a plain literal)."""

    def __init__(self, target: Ref, prop: str, value: Any) -> None:
        self.target, self.prop, self.value = target, prop, value

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "set", "target": self.target.to_dict(), "prop": self.prop, "value": _expr(self.value).to_dict()}


class Toggle(Action):
    """Flip a boolean ``prop`` on ``target`` (e.g. ``hidden``, ``checked``, ``open``)."""

    def __init__(self, target: Ref, prop: str) -> None:
        self.target, self.prop = target, prop

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "toggle", "target": self.target.to_dict(), "prop": self.prop}


class SetField(Action):
    """Write ``value`` (an :class:`Expr` or a plain literal) to reactive state ``field`` in the signal
    store the tree was mounted with — the store-writing counterpart of :func:`field`. Lets a plain
    control drive reactive state declaratively::

        WaButton().text("Clear").on("click", SetField("symbol", ""))
    """

    def __init__(self, field: str, value: Any) -> None:
        self.field, self.value = field, value

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "set-field", "field": self.field, "value": _expr(self.value).to_dict()}


class ToggleField(Action):
    """Flip a boolean reactive state ``field`` in the signal store — e.g. an icon button toggling a
    ``dark`` theme flag::

        WaButton(appearance="plain").text("🌙").on("click", ToggleField("dark"))
    """

    def __init__(self, field: str) -> None:
        self.field = field

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "toggle-field", "field": self.field}


class Sequence(Action):
    """Run several actions in order."""

    def __init__(self, *actions: Action) -> None:
        for action in actions:
            if not isinstance(action, Action):
                raise TypeError(f"Sequence entries must be Actions, got {type(action).__name__}")
        self.actions: list[Action] = list(actions)

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "seq", "actions": [a.to_dict() for a in self.actions]}


class Emit(Action):
    """Dispatch a (bubbling) custom DOM event named ``event`` with an optional ``detail`` expression."""

    def __init__(self, event: str, detail: Any = None) -> None:
        self.event, self.detail = event, detail

    def to_dict(self) -> dict[str, Any]:
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

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "patch", "model": self.model, "field": self.field, "value": _expr(self.value).to_dict()}


class If(Action):
    """Run ``then`` if ``cond`` is truthy, else ``els`` (if given) — branch on live state, e.g.
    ``If(prop(by_id("sw"), "checked"), SetProp(...), SetProp(...))``."""

    def __init__(self, cond: Any, then: Action, els: Action | None = None) -> None:
        if not isinstance(then, Action):
            raise TypeError(f"If then branch must be an Action, got {type(then).__name__}")
        if els is not None and not isinstance(els, Action):
            raise TypeError(f"If else branch must be an Action or None, got {type(els).__name__}")
        self.cond, self.then, self.els = cond, then, els

    def to_dict(self) -> dict[str, Any]:
        return {
            "kind": "if",
            "cond": _expr(self.cond).to_dict(),
            "then": self.then.to_dict(),
            "else": self.els.to_dict() if self.els is not None else None,
        }


class CallEndpoint(Action):
    """A REST round-trip: ``method`` ``url`` with an optional JSON ``body``. ``url`` may be a static
    string or an :class:`Expr`; ``body`` may be an expression or a plain value. The runtime performs the
    call with ``fetch``.

    Pass ``result`` (a signal-store field name) to capture the outcome: on completion the runtime writes
    ``{"status": <int>, "ok": <bool>, "body": <parsed JSON or text>}`` to that field, so success/error
    feedback stays declarative (bind or :class:`~spaday.components.shell.Show` on it)::

        CallEndpoint("POST", "/api/order", obj({"symbol": field("symbol")}), result="order_result")

    Without ``result`` the call is fire-and-forget.
    """

    def __init__(self, method: str, url: str | Expr, body: Any = None, result: str | None = None) -> None:
        self.method, self.url, self.body, self.result = method, url, body, result

    def to_dict(self) -> dict[str, Any]:
        url = self.url.to_dict() if isinstance(self.url, Expr) else self.url
        body = _expr(self.body).to_dict() if self.body is not None else None
        return {"kind": "call", "method": self.method, "url": url, "body": body, "result": self.result}


class Invoke(Action):
    """Call ``method`` on ``target`` with evaluated ``args``, discarding the result — the
    declarative spelling of "press this component's button". An async method's promise is
    fire-and-forget (a rejection is logged, not thrown)::

        button.on("click", Invoke(by_id("layout"), "openPanel", event_prop("currentTarget.dataset.tab")))

    Prefer a component's declared methods (its CEM documents them); for a synchronous method whose
    *result* you need inline, use the :func:`call` expression instead. With ``result=`` the
    interpreter awaits an async method and writes the resolved value to that signal-store field —
    and a :class:`Sequence` waits before its next step, so "save, then persist what was saved" is
    expressible as data::

        Sequence(
            Invoke(by_id("workspace"), "saveClean", result="custom_layout"),
            SetStorage("my_layout", field("custom_layout")),
        )
    """

    def __init__(self, target: Ref, method: str, *args: Any, result: str | None = None) -> None:
        self.target, self.method, self.args, self.result = target, method, args, result

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {"kind": "invoke", "target": self.target.to_dict(), "method": self.method}
        if self.args:
            out["args"] = [_expr(a).to_dict() for a in self.args]
        if self.result is not None:
            out["result"] = self.result
        return out


class SetStorage(Action):
    """Persist an evaluated value under ``key`` in the browser's localStorage — strings verbatim,
    other values JSON-encoded — e.g. saving a layout so a reload restores it::

        WaButton().text("Save").on("click", SetStorage("my_layout", call(by_id("layout"), "save")))
    """

    def __init__(self, key: str, value: Any) -> None:
        self.key, self.value = key, value

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "set-storage", "key": self.key, "value": _expr(self.value).to_dict()}


class Download(Action):
    """Offer an evaluated value to the user as a file download named ``filename`` (a plain string
    or an expression) — no server round-trip. A string value downloads verbatim; anything else is
    JSON-encoded. ``content_type`` defaults to application/json::

        WaButton().text("Export").on("click", Download("layout.json", call(by_id("layout"), "save")))
    """

    def __init__(self, filename: Any, value: Any, content_type: str | None = None) -> None:
        self.filename, self.value, self.content_type = filename, value, content_type

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {
            "kind": "download",
            "filename": _expr(self.filename).to_dict(),
            "value": _expr(self.value).to_dict(),
        }
        if self.content_type is not None:
            out["contentType"] = self.content_type
        return out


class NamedJs(Action):
    """The escape hatch: invoke a pre-registered named JS handler (no arbitrary ``eval``). Register it
    on the JS side with ``registerHandler(name, fn)``; use only for the rare irreducible case."""

    def __init__(self, handler: str) -> None:
        self.handler = handler

    def to_dict(self) -> dict[str, Any]:
        return {"kind": "js", "handler": self.handler}


def open_popup(target: Ref, *, x: Any = None, y: Any = None, context_field: str | None = None, context: Any = None) -> Action:
    """Open a :class:`~spaday.components.shell.Popup` at the pointer, optionally capturing event
    context into reactive state first — the context-menu opener::

        graph.on(
            "dagre-node-contextmenu",
            open_popup(by_id("node-menu"), context_field="menu_ctx", context=event_value("detail")),
        )

    ``x``/``y`` default to the raw event's ``clientX``/``clientY`` (via :func:`event_prop`); pass
    expressions (e.g. ``event_value("x")`` against a component's rich ``detail``) when the
    coordinates live elsewhere. When the triggering event carries no pointer coordinates (a
    ``CustomEvent``), the popup falls back to the last-known pointer position instead of 0,0. When
    ``context_field`` is given, ``context`` (default: the whole event value) is written to that store
    field before the popup opens, so menu items can bind to what was clicked. Sugar over
    ``Sequence``/``SetField``/``SetProp`` — no new wire semantics.
    """
    actions: list[Action] = []
    if context_field is not None:
        actions.append(SetField(context_field, context if context is not None else event_value()))
    actions.append(SetProp(target, "x", x if x is not None else event_prop("clientX")))
    actions.append(SetProp(target, "y", y if y is not None else event_prop("clientY")))
    actions.append(SetProp(target, "open", True))
    return Sequence(*actions)


def close_popup(target: Ref) -> Action:
    """Close a :class:`~spaday.components.shell.Popup` — e.g. from a menu item, after its own action::

    item.on("click", Sequence(do_thing, close_popup(by_id("node-menu"))))
    """
    return SetProp(target, "open", False)


def open_modal(target: Ref, *, context_field: str | None = None, context: Any = None) -> Action:
    """Open a modal — any element with an ``open`` prop (``WaDialog``, ``WaDrawer``, …) — optionally
    capturing event context into reactive state first, so the dialog's contents can bind to what
    triggered it::

        row_button.on("click", open_modal(by_id("confirm"), context_field="modal_ctx", context=item()))

    Sugar over ``Sequence``/``SetField``/``SetProp`` — no new wire semantics.
    """
    actions: list[Action] = []
    if context_field is not None:
        actions.append(SetField(context_field, context if context is not None else event_value()))
    actions.append(SetProp(target, "open", True))
    return actions[0] if len(actions) == 1 else Sequence(*actions)


def close_modal(target: Ref) -> Action:
    """Close a modal opened with :func:`open_modal`."""
    return SetProp(target, "open", False)


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
