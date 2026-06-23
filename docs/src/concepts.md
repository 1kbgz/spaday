# How spaday works

This page explains the ideas behind spaday and why it is built the way it is. It is background reading,
not a set of instructions — for those, see the [how-to guides](components.md).

## The core idea: configure in Python, execute in JavaScript

A spaday UI is a **tree of components** you build in Python, plus **behavior expressed as data**. Python
never renders anything and is never in the loop for an interaction. Instead, the tree and its behavior
are serialized and handed to spaday's JavaScript runtime, which instantiates real web components and
interprets the behavior **in the browser**.

This split is the whole point. The server holds lightweight per-session state; the UI and its logic are
client-resident; Python is touched only when an interaction genuinely needs it (saving to a database,
calling a REST API). That is what makes spaday suitable for **massively multi-tenant** apps — social
feeds, dashboards, device walls — where a per-interaction round-trip to the server would never scale.

## The component tree is a serializable model

Each node is a tag (`wa-switch`, or a shell tag like `spa-stack`), some props, named child slots, event
handlers, and reactive bindings. The tree is plain data, so two trees can be **diffed** into a minimal
patch, and a patch can be **applied** to a live DOM incrementally — a keyed reorder moves the same
elements rather than rebuilding them, so a `wa-switch`'s internal state survives an update. Authoring in
Python and mutating over time both reduce to producing patches the runtime applies.

The typed Python classes are **generated** from a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
— the standard description web-component libraries publish. WebAwesome is the default catalog, but the
same generator turns *any* manifest into typed classes, and the same parse drives the browser runtime's
registry. spaday is not tied to WebAwesome; it is a binding layer for CEM-described components.

spaday deliberately operates at a **higher altitude** than an HTML builder: it does not expose `div`/`p`.
You compose from curated shell pieces (App, Nav, gutters, Main, Stack, Row) and high-level components,
with raw HTML elements available only as an escape hatch for text. This is what separates "a Python
wrapper over WebAwesome" from a UI framework.

## Behavior is data, not code

An `onClick` in spaday is not a transpiled Python function and not arbitrary JavaScript — it is a
**declarative action**: `Toggle(this, "open")`, `SetProp(by_id("panel"), "hidden", true)`,
`SendPatch(model, field, value)`, `CallEndpoint("POST", url, body)`. Actions compose (`Sequence`, `If`)
and reference values through small **expressions** (`event_value`, `prop`, `lit`, `field`, …).

Because behavior is serializable data interpreted by a fixed dispatcher — never `eval`, never codegen —
it is **safe to ship to untrusted, multi-tenant clients**, fully diffable, and identical whether it
originated in Python or rode over the wire. The one escape hatch, `NamedJs`, invokes a *pre-registered*
handler by name; it still never evaluates arbitrary strings.

## The reactive engine

Beyond one-shot actions, spaday has a small **signal store**: named state fields with subscribers.
Component props *bind* to it:

- a **field binding** keeps a prop in sync with a state field; two-way, it also writes the field back
  when the control changes (a switch ↔ `lamp`);
- a **computed binding** derives a prop from a *field-expression* (`not_(field("enabled"))`,
  `eq(field("mode"), "advanced")`) and recomputes it whenever any field it reads changes.

The engine runs in the browser, so a derived value or a two-way control updates immediately, with no
round-trip. The store is the seam where UI state meets app state — see below.

## One core, two bindings

The component-tree model, the diff engine, the CEM parser, the action interpreter, and the reactive
engine all live in a single **Rust core**. It compiles to two thin bindings:

- **PyO3** — Python builds and validates the tree, and serializes it;
- **wasm** — the browser reconstructs the tree, renders it, and interprets actions.

Python and JavaScript therefore share *one* implementation of the diff, the wire format, and the action
semantics — they can't drift. The Python side adds only ergonomic typed component classes; the JavaScript
side adds only thin DOM glue. This mirrors the decision in [transports](https://github.com/1kbgz/transports),
which spaday is built on.

## The wire: transports

spaday does not invent its own networking. UI state is a **transports model**, so it inherits
transports' connection- and codec-agnostic sync: the same state moves over a WebSocket, SSE, or a Jupyter
comm, in JSON or MessagePack, with multi-tenant sessions, without spaday reimplementing any of it.

The boundary is strict and enforced in the types: spaday owns the UI (the tree, bindings, the signal
store) and knows nothing about the wire; transports owns the wire (a `Client` that mirrors a model and
sends edits) and knows nothing about UI. A single small adapter marries them — it sees transports only
through a four-method interface. So you can back the same reactive store with a transports session on a
webserver, or with the synced state of a Jupyter widget, and the UI code is identical.

## Two hosts, one UI

Because spaday is *a web-component runtime driven by a serialized model over a connection*, it slots into
two places with the same tree:

- a **web app** — your tree served over a WebSocket, state in a transports `Session` (or a multi-tenant
  `Hub`); see [the transports guide](transports.md);
- a **Jupyter notebook** (and the wider anywidget ecosystem — Marimo, Shiny, Solara, Panel) — the tree
  packaged as an [anywidget](https://anywidget.dev), state synced over the widget's comm; see
  [the notebook guide](notebook.md).

The notebook host is the same engine with a different wire — which is exactly why the [tutorial](tutorial.md)
can teach the whole model with no server at all.
