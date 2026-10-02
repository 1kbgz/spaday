# API reference

The Python surface of spaday. Peer-package component classes are not listed here; see
[Author a component tree](components.md) and
[Generate typed classes](cem.md).

## Authoring

```{eval-rst}
.. autoclass:: spaday.Component
   :members:
   :member-order: bysource

.. autofunction:: spaday.element

.. autoclass:: spaday.components.shell.Each
```

## Generic controls

Controls any design renders; see [Use generic controls](generic-controls).

```{eval-rst}
.. automodule:: spaday.ui.controls
   :members: Button, TextInput, TextArea, NumberInput, DateInput, Checkbox, Switch, Select, RadioGroup, Slider, Dialog, Alert, Progress, Control

.. automodule:: spaday.ui.design
   :members: Design, ControlSpec, Part, Wrap, Options, Value, Open, resolve, select_design

.. autodata:: spaday.ui.native.NATIVE
```

## Action DSL

Behavior attached to a component with `Component.on`; see [Add behavior and reactivity](behavior.md).

### Actions

`Component.on(event, action, *, capture=None, once=None, passive=None)` and `on_wire`
accept DOM listener options. Omitted options preserve browser defaults; explicit `False`
is retained. `capture=True` receives descendant native `invalid` and `focus` events.
Capture does not cross a shadow boundary for non-composed events.

Actions remain in the node's `events` map; optional listener metadata is stored in
`event_options`, keyed by the same event name. Existing trees without metadata are
unchanged. Changing options produces `SetEventOptions`; removal restores defaults.
Replacing an action or its options rearms a once-only listener. Generic designs map
event names and their options together. `passive=True` also disables Spaday's automatic
`contextmenu` prevention for that listener.

```{eval-rst}
.. autoclass:: spaday.SetProp
.. autoclass:: spaday.Toggle
.. autoclass:: spaday.Sequence
.. autoclass:: spaday.ActionSequence
.. autoclass:: spaday.Emit
.. autoclass:: spaday.SendPatch
.. autoclass:: spaday.If
.. autoclass:: spaday.CallEndpoint
.. autoclass:: spaday.Request
.. autoclass:: spaday.NamedJs
```

### Managed requests

`CallEndpoint(..., request=Request(key, pending=None, watch=()))` opts into managed
requests. A newer call with the same Store and request key cancels the earlier call.
Without a Store, the invoking element owns the key. Removing the invoking element
through Spaday, or changing a watched Store field, cancels the call. `pending` names
a boolean Store field; it becomes false on completion, failure, or cancellation.
Each group should use its own pending field, separate from its result and watched fields.
Keys are Store-wide strings: different rows using the same key cancel one another.
`watch` accepts a sequence of field names, not a single string.

Canceled requests do not publish results or continue subsequent actions in their
`Sequence`, including through nested `If` actions. HTTP and network failures keep
the existing `{status, ok, body}` result contract. Managed body-serialization failures
also settle pending state and report `{status: 0, ok: false, body: errorText}`.
Cancellation does not undo work
already accepted by the server. Calls without `request=` retain their behavior and wire format.

### Store notifications

Browser `Store.set()` updates values and notifies subscribers synchronously.
A subscriber can write again. When that write changes a path whose notifications
are still running, it supersedes the older notifications for that path. Later
subscribers receive the newer value; unaffected paths still receive their updates.
An unsubscribe takes effect before the next callback, including during notification.
Subscriptions added during notification start with the next write; they do not
receive ranges or deltas for a value they can already read from the Store.

Subscribers may not have received the interrupted value. A superseding write omits
range metadata and sends collection subscribers a full reset. Uninterrupted writes
retain their ranges and collection deltas. A callback exception does not prevent
delivery to remaining subscribers; the first exception is rethrown after delivery
and notification cleanup.

### Expressions and references

```{eval-rst}
.. autofunction:: spaday.lit
.. autofunction:: spaday.event_value
.. autofunction:: spaday.not_
.. autofunction:: spaday.prop
.. autofunction:: spaday.field
.. autofunction:: spaday.item
.. autofunction:: spaday.scope
.. autofunction:: spaday.eq
.. autofunction:: spaday.all_
.. autofunction:: spaday.any_
.. autofunction:: spaday.cond
.. autofunction:: spaday.obj
.. autofunction:: spaday.this
.. autofunction:: spaday.by_id
```

### Binding helper

`spaday.bind` is a one-way event-driven convenience (control change → set a target prop). For reactive
state bindings prefer `Component.bind` / `Component.compute` (above).

```{eval-rst}
.. autofunction:: spaday.bind
```

## Validation

```{eval-rst}
.. autofunction:: spaday.validate
.. autoexception:: spaday.ValidationError
```

## CEM binding generator

```{eval-rst}
.. autofunction:: spaday.parse_cem
.. autofunction:: spaday.generate
.. autofunction:: spaday.classes
```

### Component catalog schemas

```{eval-rst}
.. autoclass:: spaday.ComponentSchema
   :members:

.. autoclass:: spaday.PropertySchema
   :members:
```

## Serving

Generate a page and deliver it on any backend; see [Serve and embed](serving.md) and
[Sync over transports](transports.md). The generator is framework-agnostic (`spaday.bootstrap`); a backend
(`spaday.backends.<name>` — `starlette`, `aiohttp`, `flask`, `tornado`) wires it into routes.

```{eval-rst}
.. autofunction:: spaday.backends.starlette.serve
.. autofunction:: spaday.backends.starlette.mount
.. autofunction:: spaday.backends.starlette.build_routes
.. autofunction:: spaday.backends.starlette.mount_site
.. autofunction:: spaday.backends.starlette.build_site
.. autoclass:: spaday.backends.starlette.PageSpec
.. autoclass:: spaday.backends.starlette.SiteRoutes
   :members:
.. autofunction:: spaday.bootstrap.bootstrap
.. autoclass:: spaday.Wire
.. autoclass:: spaday.Lifecycle
.. autofunction:: spaday.bootstrap.tree_json
.. autofunction:: spaday.bootstrap.tree_frame
.. autofunction:: spaday.bootstrap.bundles_dir
```

### Bootstrap lifecycle

`bootstrap(..., lifecycle=Lifecycle(elements=("wa-tab-group",), timeout=10000))`
enables document-level `spaday:mounted`, `spaday:ready`, and `spaday:error` events.
Backend `mount` helpers and Starlette `PageSpec` accept the same option. Without it,
bootstrap keeps its existing loading behavior.

`mounted` means the tree exists. Its root is inert until `ready`: selected package
modules, extra `scripts`, and stylesheets have loaded, WASM has initialized, and
the declared custom elements are defined. Matching mounted elements' `updateComplete`
promises are awaited when present. Optional undeclared tags do not block readiness;
application data, fonts, images, and final layout are outside this contract.
All supplied modules and stylesheets are required in this opt-in mode. Package
modules retain declaration order, and stylesheets retain their position before
inline application styles. Extra `scripts` are loaded concurrently after package modules.

Event `detail` contains `target`, `root`, `store`, and `dispose()`. Initialization
errors include `error`; failures before mounting have no root or disposer. The
timeout bounds the entire startup, in milliseconds. Failure removes any mounted
root and releases its resources. `dispose()` is idempotent and removes the root.
`detail.root` follows root replacement; `dispose()` always removes the current root.
Replacement preserves the mount's styles, connections, persistence, and URL bindings.
It emits a new mounted/ready pair and gates the replacement's declared components
with the same timeout. Element controllers on the old root are disposed; a ready
listener can attach controllers to the new root. Explicit disposal, including from
`mounted`, does not emit an initialization error.
Register lifecycle listeners before the bootstrap script runs, or from a module
passed through `scripts=`.

For host-owned loading and fallback content, use `fragment=True, target="#app"`;
the host supplies that container and owns fallback visibility. Bootstrap does not
rewrite host markup or inject inline event handlers. `nonce=` also covers styles
created by Spaday's runtime, using the script's nonce property without copying it
into a CSS-readable attribute. Peer components must independently support the host's
CSP. If CSP blocks the bootstrap script itself, it cannot dispatch an error:
keep fallback content usable without JavaScript.

### Browser controllers and forms

The browser package exports `attachController(root, key, setup)`,
`whenReady(root, elements, timeout)`, and `unmount(root)`. `setup` returns cleanup;
repeating the same root/key returns the existing disposer without running setup
again. Spaday subtree removal or replacement runs cleanup, including for descendant
controllers. A replacement is a new root: attach its controllers separately.
Use `unmount` to remove a tracked root and stop future tree refreshes. Raw DOM
removal does not invoke Spaday cleanup; call the disposer explicitly if a host
owns removal. `whenReady` only waits for declared elements, rejects on timeout
or disposal, and does not itself make the root inert.

`trackRoot(root, tree, source, store?, lifecycle?)` returns a handle with a current
`root` and an idempotent `dispose()`. Optional `onReplace(root)` and `onDispose()`
callbacks describe the mount lifetime, distinct from element controllers. Root
replacement invokes `onReplace`; only removal invokes `onDispose`. Worker and
widget disposal also run element cleanup.

`createFormController(form, {read, write, revealInvalid, guard})` returns one
controller per form. `read()` supplies JSON-compatible draft values; `write(value)`
restores every control, even when backing Store values are unchanged. A native
reset changes control properties without notifying the Store, so setting the
Store alone is insufficient; the tabbed-form example writes both. Read raw
controls when invalid edits must count as dirty: validated
two-way Store bindings can retain the last valid value. Exclude UI-only metadata.

- `dirty` compares current values with the saved baseline.
- `status` is `idle`, `submitting`, `saved`, or `failed`.
- `begin()` returns a submission handle with `value`, `commit(saved?)`, and `fail()`.
  Its `commit()` defaults to the captured snapshot, so newer edits stay dirty. Its
  settlement methods return false after a newer submission, settlement, or disposal.
  `fail()` retains the baseline and draft.
- Controller `commit(saved)` sets an explicit baseline and invalidates pending
  submission handles. It requires saved values; it never guesses from live controls.
- `reset()` restores saved values without canceling an in-flight submission or
  discarding its snapshot. An uncanceled native reset invokes `write` after the
  browser resets controls. Canceling that event leaves the draft unchanged.
- `dispose()` removes listeners and the navigation guard.

The default `beforeunload` guard protects dirty drafts, subject to browser policy;
`guard: false` disables it. Submission is not intercepted, and canceled submits
never imply a save. Native `requestSubmit()` runs validation; native `submit()`
bypasses it. Optional `revealInvalid(control)` reveals the first invalid control;
the controller waits for its promise before focusing it. This suppresses the
native validation bubble; the callback supplies accessible error feedback, as the
example does through its status element. Shadow-root validation
requires the component's own public form API. SPA navigation prompts, polling,
authorization, and save policy remain application responsibilities.

`python -m spaday.examples.tabbed_form` runs a WebAwesome tabbed-form example with
server save/preview endpoints, canceled stale previews, saved-value reset, and
invalid-field tab activation. Its server-status section uses `CallEndpoint` and a
root-owned polling interval: checks start immediately, repeat every five seconds
while the document is visible, and skip an in-flight check. Hiding the document
pauses scheduling without canceling an existing check. Showing it resumes checks;
removing the root clears the interval, removes the visibility listener, and aborts
its managed request. Status text, busy state, and buttons use Store bindings.
Polling frequency and visibility policy are example code, not a new runtime API.
The example requires `spaday-webawesome`, Starlette, and Uvicorn.
Its runtime import assumes the standalone app is mounted at `/`.

### External component packages

```{eval-rst}
.. autoclass:: spaday.ComponentPackage
.. autofunction:: spaday.resolve_component_packages
.. autofunction:: spaday.discover_component_packages
.. autofunction:: spaday.discover_component_package_names
```

## Server-side rendering

```{eval-rst}
.. autofunction:: spaday.render_html
```

## Notebook host

```{eval-rst}
.. autoclass:: spaday.Widget
   :members: update, state, on_state, on_intent
```

## Web Worker host

```{eval-rst}
.. autoclass:: spaday.WorkerApp
   :members: start, dispatch, start_json, dispatch_json
```

## Core diff / apply

The low-level component-tree engine (JSON wire form), shared byte-for-byte with the browser runtime.
`encode_frame` / `decode_frame` wrap a tree (or patch) in a transports `Frame` so the UI rides the same
envelope as model state (used by `tree="frame"`).

```{eval-rst}
.. autofunction:: spaday.diff
.. autofunction:: spaday.apply
.. autofunction:: spaday.encode_frame
.. autofunction:: spaday.decode_frame
```

## Theming

The `spa-*` shell components are re-themed by setting their `--spa-*` CSS custom properties via
`Component.css` (e.g. `App().css(spa_surface="#111", spa_border="#333")`, which cascades to the whole
shell). `spaday.SHELL_TOKENS` maps each `css()` keyword to the CSS custom property it drives and what it
controls — `spa_surface`, `spa_surface_2`, `spa_border`, `spa_text`, `spa_muted`, `spa_gap`, `spa_align`,
`spa_justify`, `spa_gutter_width`. The shell ships neutral light and dark defaults — the dark palette is
keyed off WebAwesome's `wa-dark` class (`wa-light` flips a nested island back), so
`App(...).bind_root_class("wa-dark", "dark")` alone re-themes the whole page. Both palettes are emitted
at zero specificity, so an application or component package overrides them by mapping its own theme
tokens onto those variables.

`wa-dark`/`wa-light` on the root is spaday's page-mode convention, and component packages join it
through whichever channel themes them:

- a package themed by **CSS tokens** ships mode-keyed rules in its own package stylesheet (its `css`
  assets land in `<head>` via `packages=`, and custom properties cascade into its shadow roots) — key
  them off the same classes, at low specificity (`:where(.wa-dark) { --my-token: … }`), exactly as the
  shell does;
- a package themed by a **prop or constructor options** (Perspective's `theme`, Lightweight Charts)
  binds that prop to the same field that drives the root class:
  `component.compute("theme", cond(field("dark"), "dark", "light"))`.

Component packages expose their theme metadata through `TOKENS`. A `spaday.Token` contains the CSS
property, description, and optional shell fallback, so tooling can check theme coverage without
parsing prose. It remains a two-item tuple for existing consumers.

```{eval-rst}
.. autoclass:: spaday.Token
```

A class states a boolean. For page-level state that carries a *value* — a design system whose tokens
hang off `:root[data-density='comfortable']`, or a family of root flags in one control group —
`Component.bind_root_attr(name, field)` writes an attribute on `<html>` instead:

```python
App(...).bind_root_attr("data-density", "density")  # "comfortable" | None
App(...).bind_root_attr("data-vivid", "vivid")      # True | False
```

The field's value is written as the runtime writes any attribute: `None`/`False` remove it, `True` and
`""` give the bare form (`data-vivid`), anything else is stringified — so an enumerated field replaces
the attribute's value rather than accumulating names, and clearing the field removes it. Both root
bindings are one-way and seeded from the store at mount, so a field restored by `persist=` or `url=`
themes the page before the tree renders.
