# Add behavior and reactivity

This guide shows you how to make a tree interactive: running actions on events, binding controls to
state, and computing props from state. All of it is authored in Python as **data** and runs in the
browser — no per-interaction round-trip. For the underlying idea, see [How spaday works](concepts.md).

## Run an action when an event fires

Attach a declarative action to a DOM event with `.on(event, action)`:

```python
from spaday import by_id, Toggle
from spaday.components.webawesome import WaButton

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
from spaday.components.webawesome import WaSwitch

# set the panel's `hidden` to the *negation* of the switch's new value
WaSwitch().on("change", SetProp(by_id("panel"), "hidden", not_(event_value())))
```

- `event_value()` — the triggering control's value (its `checked`, else `value`, else the event detail).
- `prop(target, name)` — read a prop off a live element (handy as an `If` condition).
- `lit(value)` — a literal; a plain Python value is coerced to one automatically.

## Bind a control to state

For state that outlives a single event, use the reactive **signal store**. Bind a prop to a named state
field with `.bind(prop, field, mode=...)`:

```python
from spaday.components.webawesome import WaSwitch

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
from spaday.components.webawesome import WaButton

WaButton().text("🌙").on("click", ToggleField("dark"))
WaButton().text("Clear").on("click", Sequence(SetField("symbol", ""), SetField("qty", 0)))
```

## Compute a prop from state

To *derive* a prop rather than mirror a single field, use `.compute(prop, expr)` with a field
expression. It recomputes whenever any field it reads changes (one-way by nature):

```python
from spaday import all_, eq, field, not_
from spaday.components.webawesome import WaButton, WaCallout

# disabled = not(enabled)
WaButton().compute("disabled", not_(field("enabled")))

# hidden unless mode == "advanced"
WaCallout().compute("hidden", not_(eq(field("mode"), "advanced")))

# ready = a and b
WaButton().compute("disabled", not_(all_(field("a"), field("b"))))
```

The field-expression helpers: `field(name)`, `lit(value)`, `not_(e)`, `eq(a, b)`, `all_(*es)` (AND),
`any_(*es)` (OR), `cond(test, then, else)` (a ternary — `compute("theme", cond(field("dark"), "dark",
"light"))`), and `obj({name: expr})` (compose an object from sub-expressions). They compose.

## Send a model edit or call an endpoint

Two actions intentionally reach beyond the browser:

```python
from spaday import CallEndpoint, SendPatch, event_value
from spaday.components.webawesome import WaButton, WaSelect

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
