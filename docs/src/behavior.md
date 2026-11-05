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
- `Sequence(a, b, …)` — run several actions in order. Import it as `ActionSequence` when another
  `Sequence` is already in scope.
- `If(cond, then, els=None)` — branch on a live condition.
- `Emit(event, detail=None, composed=False)` — dispatch a bubbling custom DOM event. Set
  `composed=True` when listeners outside the emitting shadow root must receive it.
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
Show(not_(field("sent.ok")), WaCallout().compute("textContent", field("sent.body")))
```

For transient notices, the shell's `Toast` (`spa-toast`) is the canonical error-reporting surface: a
fixed corner stack of notifications with `info` / `success` / `danger` tones that auto-dismiss
(`timeout` ms, default 5000; `0` keeps a toast until its close × is clicked). `Invoke` its `notify`
method from any action chain — `Invoke(by_id("toasts"), "notify", obj({"message": lit("Saved"), "tone": lit("success")}))` — or drive its bindable `message` prop from state: every non-empty write
enqueues a toast, with the `tone` prop read at enqueue time, so a `result=` failure surfaces with no
handler:

```python
from spaday import cond, field, lit
from spaday.components.shell import Toast

toasts = Toast(tone="danger", id="toasts")
toasts.compute("message", cond(field("sent.ok"), lit(""), field("sent.body")))
```

`SendPatch` is usually unnecessary once you use a two-way binding (above) — the binding carries the
control→model edit declaratively. Reach for `SendPatch` for an imperative edit that
isn't a simple control value. When several models share a page, a `SendPatch("ns", field, value)` is
routed into the `ns`-namespaced store (see [transports](transports.md)).

## Route, defer, and refresh subtrees

`Show` mounts one branch on one condition. When a page is really *routing* — one selected value, many
branches — use `Switch`: it keys a store field to named cases, and the runtime indexes straight to
the matching branch instead of evaluating a predicate per candidate:

Pass the condition first: `Show(field("ready"), content)`. Existing code can keep using
`Show(content, when=field("ready"))` or the plain-field shortcut `Show(content, field="ready")`.

```python
from spaday.components.shell import Switch

Switch("selected", {"a/b": card_ab, "c/d": card_cd}, default=placeholder)
```

Cases mount and unmount like `Show` branches (real elements, not hidden ones); an unmatched value
falls back to `default=`, or renders nothing without one. Bind the field to the URL —
`serve(page, url={"selected": "model"})`, see [Serving](serving.md) — and the `Switch` is a router:
`/?model=a%2Fb` opens that case, selecting pushes a history entry, and back/forward work.

A big page doesn't have to ship every branch up front. `Lazy` serializes a placeholder and a `src`
URL; the real subtree (a component-tree JSON document, e.g. from `to_node()`) is fetched the first
time the branch activates — on mount, or when its `when=` condition first turns truthy — and cached
by `src` from then on:

```python
from spaday import element, eq, field
from spaday.components.shell import Lazy, Switch

Switch("selected", {
    path: Lazy(element("em", "loading…"), src=f"/card/{path}", when=eq(field("selected"), path))
    for path in paths
}, default=placeholder)
```

The initial `tree.json` then carries one placeholder per branch instead of the branch itself — for a
catalog of hundreds of server-rendered detail cards, that is the difference between kilobytes and
megabytes on first paint.

Finally, `RefreshTree` covers "server state changed, re-render" for apps that don't need a live wire:
it re-fetches the page's `tree.json` (or an explicit `url=`) and diffs it into the mounted tree with
the core's patch machinery, so unchanged nodes keep their identity and client state. Frame and inline
tree modes have no JSON tree URL, so pass `url=` when using `RefreshTree` with either one. The diff
descends into structural bindings: a changed branch inside a `Show`/`Switch` re-renders (including
the stored bodies of a `Switch`'s non-mounted cases), and every loaded `Lazy` body is re-fetched
from its `src` — swapped only if the payload actually changed. Actions in a
`Sequence` are awaited in order — `CallEndpoint` resolves before the next action runs — so mutate-
then-refresh is one chain:

```python
from spaday import CallEndpoint, RefreshTree, Sequence

WaButton().text("Materialize").on("click", Sequence(
    CallEndpoint("POST", "/materialize", result="mat"),
    RefreshTree(),
))
```

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
map to that kind) are type-opaque, so no literal shape can be ruled out for them by kind alone — see
`set_strict_props` below for the check that reads their declared type instead.

Prop *names* are checked too. A schema-carrying component's constructor accepts the snake_case
spelling of each camelCase CEM prop and normalizes it to the canonical name —
`Dagre(max_label_width=180)` sets `maxLabelWidth`; passing both spellings at once raises. And
`spaday.validate` checks every node that still knows its catalog schema for unknown prop and binding
names: a typo raises a `ValidationError` naming the tag and prop, with a "did you mean" hint when the
unknown name is the snake_case spelling of a real prop. A component's known names are its attributes
*and* its property-only fields (`schema.fields` — see the [manifest guide](cem.md)), so a data
component's payload keyword passes. Generic globals (`id`, `class`, `style`, `slot`, `data-*` /
`aria-*`, …) always pass, and so do the `root-class:` / `root-attr:` bindings, which name a class or
attribute on `<html>` rather than a prop of the element they are authored on. On a serialized dict tree, schemas resolve by tag
instead — every schema-carrying class that has been imported registers its tag — so
`validate(component.to_node())` checks the same props as `validate(component)`. Nodes with no
schema either way (`element(...)` escape hatches) stay unvalidated, as do two-way binding names,
which target live form-control properties a manifest routinely omits.

Name checking is a `validate` call by default, not a constructor error, because a manifest describes an
element's inputs approximately — `schema.fields` is filtered from a class surface that mixes real inputs
with plumbing, so a name spaday does not recognize is not proof of a mistake. Where the earlier error is
worth that risk, turn it on with `set_strict_props`:

```python
from spaday import Component
from spaday_webawesome import WaSelect

Component.set_strict_props()      # every schema-carrying class, catalogs you don't own included
WaSelect.set_strict_props(False)  # ...except one the manifest describes badly
```

An unknown keyword then raises `TypeError` at construction, naming every unknown name at once in the
same words `validate` uses. Strict components also check the *shape* of a `json` prop against the type
its manifest declares — `schema.type_text`, carried for exactly the kind that says nothing else about
shape:

```python
Heatmap(data=[[1, 2], [3, 4]])
# TypeError: <spa-heatmap> prop 'data' expects { rows: string[]; cols: string[]; values: number[][] },
#            got [[1, 2], [3, 4]] (list)
```

That is the mistake worth catching early: the name is right, the shape is wrong, and the browser reports
it as a setter throwing far from the call that caused it. Only the spellings that can mean nothing else
are read — an array (`T[]`, `Array<T>`) and an object (`{…}`, `Record<…>`). A named type like
`HeatmapData` is deliberately not read, because an alias can name either shape; the declared text is on
the schema, so an author who knows their own types can assert on it. A class that sets it explicitly keeps that setting when a base class is
toggled later, so the opt-out above survives. Only constructor keywords are checked — `.prop(name, value)` stays the explicit way to set an attribute the manifest does not describe.

## Explicit HTML attributes

Use `.attr(name, value)` when a value belongs to an HTML attribute rather than a DOM property:

```python
control = element("input").attr("list", "my-options")
reactive_control = element("input").bind_attr("list", "suggestion_list_id")
```

The store field contains the datalist ID, not its suggestions. Attribute writes bypass property
setters, so this works even though `input.list` is a readonly reference to a datalist element.
`True` adds an empty attribute; `False` and `None` remove it. Other scalar values become strings.
Use strings such as `"false"` for enumerated attributes that require literal text. Attribute bindings
are one-way. Existing `.prop()` and `.bind()` behavior is unchanged.

The serialized tree represents these targets as `attr:list` in `props` or `bindings`; Rust's
`Node.attr()` and `Node.bind_attr()` use the same form. Diffing, server rendering, hydration, and
reactive updates preserve the explicit target.

`event_value()` reads the value of native text inputs, selects, and textareas. For native checkboxes
and radios it reads `checked`; custom controls retain their checked/value/detail fallback.

## Run an action when store fields change

Attach a named effect to the component that owns the work. For example, load the selected log
whenever its URL-bound store field changes:

```python
from spaday import CallEndpoint, Request, element, field

logs = element("section").effect(
    "load-log",
    CallEndpoint(
        "POST", "/api/logs/read", body=field("log_path"), result="log_response",
        request=Request(key="logs", pending="log_loading"),
    ),
    watch=["log_path"],
    initial=True,
)
```

Mount with a store containing `log_path`. An effect observes the store regardless of whether the
change came from a control, a URL binding, or a server update. `initial=True` also runs it after
insertion. Without that option, it waits for a change. Multiple changes in one synchronous turn
produce one invocation using the latest values.

An invocation cancels the previous invocation of the same named effect on that component.
`CallEndpoint` and `RefreshTree` requests abort, stale responses and `Invoke` results cannot overwrite the store,
and the remaining actions in a cancelled sequence stop. `Request` is optional here; use it for
pending feedback or to share a request group with other actions. Avoid writing to an effect's
own watched fields unless another invocation is intended.

Removing the component releases its subscriptions and cancels its work. Keyed moves preserve it.
Changing an effect through a tree patch replaces its subscription. An effect needs a mounted
store. Actions run in the component's item scope, but only the explicit store fields in `watch`
trigger another invocation.

Cancellation cannot undo server work or side effects inside an already-called component method
or `NamedJs` handler. Keep those operations idempotent where necessary.

## Show readiness for one view

Use `ready_when` for application data that arrives after the component tree mounts. Attach it to
a view and give it a store field for status:

```python
from spaday import element, eq, field
from spaday.components.shell import Show

workspace = element(
    "section",
    Show(eq(field("workspace_status.status"), "loading"), "Loading workspace"),
    Show(
        eq(field("workspace_status.status"), "error"),
        element("p").text(field("workspace_status.error")),
    ),
).ready_when(
    field("workspace_loaded"),
    state="workspace_status",
    active=eq(field("main_tab"), "workspace"),
    error=field("workspace_error"),
    elements=["perspective-viewer"],
    timeout=10000,
)
```

Set `workspace_loaded` after the application's data-loading operation succeeds. Supply the actual
workspace children and load their peer package as usual. `elements` waits for the listed custom
elements to register and for their `updateComplete` promises, when present. Omit it if the view
has no component dependencies.

Bind a loader or message to `workspace_status.status` and `workspace_status.error`. Status starts as
`loading`, becomes `ready` when both conditions hold, or becomes `error` on failure or timeout.
A truthy `error` expression supplies the message. The timeout is in milliseconds and covers both
component and data readiness. It leaves subscriptions active: later success clears the timeout
error without remounting the view. Data becoming unready again starts a new timeout.

When `active` is false, status is `idle` and the timer stops. Returning to the view starts a new
readiness check. The logs panel can remain usable while the workspace loads. This API does not set
`inert`, hide content, or dispose the application. Existing bootstrap `Lifecycle` continues to
handle initial component startup independently. Avoid making readiness conditions depend on their
own output field.

Each status change also dispatches `spaday:readiness` on the view, with `{status, error}` as its
detail. Use the store field for declarative bindings.

## Copy a saved link in the same action sequence

Place `CopyToClipboard` after the save request and check the request's outcome:

```python
from spaday import Button, CallEndpoint, CopyToClipboard, If, Sequence, field

share = Button(label="Share").on(
    "click",
    Sequence(
        CallEndpoint("POST", "/api/layout/share", result="saved"),
        If(
            field("saved.ok"),
            CopyToClipboard(field("saved.body.url"), result="copy_result"),
        ),
    ),
)
```

Show feedback from `copy_result.ok` and `copy_result.error`. The action awaits the clipboard write
before continuing the sequence. Strings are copied verbatim; other values are JSON-encoded.
A failed write sets `{ok: false, error: "…"}` and lets the sequence continue. A successful write
sets `{ok: true, error: null}`. Omit `result` when feedback is unnecessary.

Clipboard access still requires browser permission and a secure context. Some browsers reject a
write after an asynchronous save because the original user activation has expired. In that case,
show a separate copy button using the saved URL; the action does not bypass browser restrictions.
