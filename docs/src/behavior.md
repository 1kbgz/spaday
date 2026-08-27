# Add behavior and reactivity

This guide shows you how to make a tree interactive: running actions on events, binding controls to
state, and computing props from state. All of it is authored in Python as **data** and runs in the
browser — no per-interaction round-trip. For the underlying idea, see [How spaday works](concepts.md).

## Run an action when an event fires

Attach a declarative action to a DOM event with `.on(event, action)`:

```python
from spaday import by_id, Toggle
from spaday_webawesome import WaButton

WaButton().text("Details").on("click", Toggle(by_id("info"), "hidden"))
```

`Toggle(target, prop)` flips a boolean prop. Target an element with `by_id("info")` (an element whose
`id` is `info`) or `this()` (the element the event fired on). The other actions:

- `SetProp(target, prop, value)` — set a prop to a value or expression.
- `SetField(field, value)` / `ToggleField(field)` — write / flip a reactive state field (see below).
- `Sequence(a, b, …)` — run several actions in order.
- `If(cond, then, els=None)` — branch on a live condition.
- `Emit(event, detail=None)` — dispatch a custom DOM event.
- `SendPatch`, `CallEndpoint`, `NamedJs` — see below.

## Reference live values in an action

Action values are **expressions** evaluated when the event fires:

```python
from spaday import by_id, event_value, not_, SetProp
from spaday_webawesome import WaSwitch

# set the panel's `hidden` to the *negation* of the switch's new value
WaSwitch().on("change", SetProp(by_id("panel"), "hidden", not_(event_value())))
```

- `event_value()` — the triggering control's value (its `checked`, else `value`, else the event detail).
- `event_prop(path)` — a path read off the raw DOM event object itself (`event_prop("clientX")` for
  the pointer position, `event_prop("shiftKey")` for modifiers).
- `event_closest(selector, path)` — a path read off the closest ancestor of the event target matching
  a CSS selector (`event.target.closest(selector)`) — `event_closest("[data-node-id]", "dataset.nodeId")`
  reads the id of the group a click landed in, however deeply nested the actual target. An empty
  path returns the matched element itself, which isn't a useful serializable value — pass a `path`
  to extract data.
- `prop(target, name)` — read a prop off a live element (handy as an `If` condition).
- `lit(value)` — a literal; a plain Python value is coerced to one automatically.

## Bind a control to state

For state that outlives a single event, use the reactive **signal store**. Bind a prop to a named state
field with `.bind(prop, field, mode=...)`:

```python
from spaday_webawesome import WaSwitch

WaSwitch().bind("checked", "lamp", mode="two-way")
```

- `mode="one-way"` (default) keeps the prop in sync with the field.
- `mode="two-way"` also writes the field back when the control changes.

Two controls bound to the same field stay in sync; a field changed anywhere updates every prop bound to
it. **Where the field lives** depends on the host: in a notebook it is the widget's state
([notebook guide](notebook.md)); on a server it is a transports model
([transports guide](transports.md)).

A two-way binding writes state from a control's own value. To write state from any event — e.g. a plain
icon button flipping a theme flag, or "Clear" resetting a form's fields — use the store-writing actions:

```python
from spaday import SetField, Sequence, ToggleField
from spaday_webawesome import WaButton

WaButton().text("🌙").on("click", ToggleField("dark"))
WaButton().text("Clear").on("click", Sequence(SetField("symbol", ""), SetField("qty", 0)))
```

## Compute a prop from state

To *derive* a prop rather than mirror a single field, use `.compute(prop, expr)` with a field
expression. It recomputes whenever any field it reads changes (one-way by nature):

```python
from spaday import all_, eq, field, not_
from spaday_webawesome import WaButton, WaCallout

# disabled = not(enabled)
WaButton().compute("disabled", not_(field("enabled")))

# hidden unless mode == "advanced"
WaCallout().compute("hidden", not_(eq(field("mode"), "advanced")))

# ready = a and b
WaButton().compute("disabled", not_(all_(field("a"), field("b"))))
```

The field-expression helpers: `field(name)`, `lit(value)`, `not_(e)`, `eq(a, b)`, `all_(*es)` (AND),
`any_(*es)` (OR), `cond(test, then, else)` (a ternary — `compute("theme", cond(field("dark"), "dark", "light"))`), `obj({name: expr})` (compose an object from sub-expressions), and `arr(*exprs)`
(compose a list — `arr(field("path"))` wraps a dynamic value in a list, e.g. for a tree's
`selected_paths`). They compose.

## Send a model edit or call an endpoint

Two actions intentionally reach beyond the browser:

```python
from spaday import CallEndpoint, SendPatch, event_value
from spaday_webawesome import WaButton, WaSelect

# mutate a transports model field — the app routes the edit to the wire (server-authoritative)
WaSelect().on("change", SendPatch("chart", "type", event_value()))

# the one explicit server round-trip: a REST call
WaButton().text("Save").on("click", CallEndpoint("POST", "/save", body=event_value()))
```

The body can be any expression — use `obj({name: field(name)})` to compose a whole request from state
fields, so a generated [`form`](components.md) POSTs declaratively with no handler:

```python
from spaday import CallEndpoint, field, obj

WaButton().text("Send").on("click", CallEndpoint("POST", "/api/order", obj({"symbol": field("symbol"), "qty": field("qty")})))
```

By default the call is fire-and-forget. To react to the response — show a success message, surface a
422 validation error — pass `result=` (a state field name): on completion the runtime writes
`{"status": <int>, "ok": <bool>, "body": <parsed JSON or text>}` to that field, so the outcome drives
reactive UI like any other state:

```python
from spaday import CallEndpoint, field, not_
from spaday.components.shell import Show

WaButton().text("Send").on("click", CallEndpoint("POST", "/api/order", obj({"symbol": field("symbol")}), result="sent"))
Show(WaCallout().compute("textContent", field("sent.body")), when=not_(field("sent.ok")))
```

`SendPatch` is usually unnecessary once you use a two-way binding (above) — the binding carries the
control→model edit declaratively. Reach for `SendPatch` for an imperative edit that
isn't a simple control value. When several models share a page, a `SendPatch("ns", field, value)` is
routed into the `ns`-namespaced store (see [transports](transports.md)).

## Context menus and modals

A context menu is a `Popup` — a floating shell surface that renders nothing while closed, places its
children at viewport coordinates while open, and light-dismisses on an outside pointerdown or Escape.
`open_popup` wires the whole gesture from existing actions: capture the event's context into a state
field, position at the pointer, open. Binding `contextmenu` suppresses the native browser menu on
exactly that element — nothing else on the page is affected:

```python
from spaday import by_id, close_popup, event_value, open_popup
from spaday.components.shell import Popup
from spaday_webawesome import WaDropdown, WaDropdownItem

menu = Popup(
    WaDropdown(
        WaDropdownItem("Inspect").on("click", close_popup(by_id("node-menu"))),
        open=True,
    ),
    id="node-menu",
)
graph.on("contextmenu", open_popup(by_id("node-menu"), context_field="menu_ctx"))
```

The menu's items read what was clicked from the captured field like any other state — e.g.
`compute("textContent", concat("Inspect ", field("menu_ctx.id")))`. The default coordinates read the
raw event's `clientX`/`clientY` via `event_prop`; for a component's re-dispatched event whose rich
`detail` carries the position, point them at it instead (paths in `event_value` walk the detail):
`open_popup(target, x=event_value("x"), y=event_value("y"), context=event_value())`. When the
triggering event carries no pointer coordinates at all (a `CustomEvent`), the popup falls back to the
last-known pointer position instead of landing at 0,0.

A modal is the same capture-then-open shape against any element with an `open` prop (`WaDialog`,
`WaDrawer`, …):

```python
from spaday import by_id, close_modal, open_modal
from spaday_webawesome import WaButton, WaDialog

dialog = WaDialog(..., id="confirm", label="Confirm")
row_button.on("click", open_modal(by_id("confirm"), context_field="modal_ctx"))
WaButton().text("Cancel").on("click", close_modal(by_id("confirm")))
```

Popup and modal contents mount with the page; wrap a heavy subtree in `Show` keyed to a state field
if it should only mount while open.

## Call component methods and browser side effects

Some interactions are a component *method*, not a prop — a layout's `openPanel(name)`, a viewer's
`resetView()`. `Invoke` calls a declared method with evaluated arguments, fire-and-forget (an async
method's rejection is logged, not thrown); the `call` expression is its synchronous, value-returning
sibling for methods you read from — and both stay data on the wire, with no `eval`:

```python
from spaday import Download, Invoke, SetStorage, by_id, call, event_prop

# open the tab named by the clicked button's data-tab attribute
opener.on("click", Invoke(by_id("layout"), "openPanel", event_prop("currentTarget.dataset.tab")))

# persist a layout locally (strings store verbatim, other values JSON-encode)
save.on("click", SetStorage("my_layout", call(by_id("layout"), "save")))

# or hand it to the user as a file — no server round-trip
export.on("click", Download("layout.json", call(by_id("layout"), "save")))
```

An async method composes with `Sequence`: `Invoke` awaits a returned promise (and with `result=`,
writes the resolved value to a state field first), so "save, then persist what was saved" is plain
data — while purely synchronous action chains still apply in the same tick:

```python
save.on("click", Sequence(
    Invoke(by_id("workspace"), "saveClean", result="custom_layout"),
    SetStorage("my_layout", field("custom_layout")),
))
```

Prefer methods a component's manifest declares — they are part of its public surface. Method names
are not yet checked against the catalog at authoring time (a mistyped name logs a console error at
event time); catalog-backed validation is planned alongside CEM method parsing.

## The escape hatch

For the rare irreducible case, `NamedJs("handler")` invokes a JavaScript handler you pre-registered in
the browser with `registerHandler("handler", fn)`. It calls by name — never `eval` — so the safety
property holds.

## Validate references before shipping

A `by_id("typo")` that points at no element does nothing at runtime, silently. Catch it at authoring
time:

```python
import spaday

spaday.validate(tree)   # raises ValidationError listing any unresolved by_id reference
```

Prop values are checked at authoring time too: a CEM-generated component given a literal that
contradicts its declared catalog kind — a `str` for a `number` prop, a number for an `enum` — raises
a `TypeError` naming the component tag, the prop, and the offending value, instead of surfacing later
as an opaque component error in the browser. Two limits: reactive bindings and computed values are
dynamic and stay unvalidated, and `json`-kind props (lists, objects, mixed unions, untyped props all
map to that kind) are type-opaque, so no literal shape can be ruled out for them.
