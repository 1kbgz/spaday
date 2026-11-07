# Use spaday in a Jupyter notebook

This guide shows you how to render a spaday UI in a notebook and round-trip its state with Python — no
server. It works in Jupyter (Lab / Notebook / Colab / VS Code) and the wider
[anywidget](https://anywidget.dev) ecosystem (Marimo, Shiny-for-Python, Solara, Panel) — and with no
install at all in [JupyterLite](pyodide.md), where the kernel itself is WebAssembly (hosted demo at
[/spaday/lite/](https://1kbgz.github.io/spaday/lite/)).

Install the host:

```bash
pip install "spaday[widget]"
```

## Render a tree

Wrap any component tree in `Widget` and return it from a cell:

```python
from spaday import Widget, element

Widget(element("button").text("Run"))
```

The widget bundles the spaday runtime and wasm core. It renders core `spa-*` components and native HTML
elements without additional packages.

## Load a component package

Install the peer in the notebook's kernel, then select it with `packages=`:

```python
%pip install spaday-webawesome
```

```python
from spaday import Widget, element, ui

w = Widget(
    element("section", ui.TextInput(label="Name").bind("value", "name", mode="two-way")),
    packages=["webawesome"],
    state={"name": "Ada"},
)
w
```

The selected package's design also applies to subsequent `w.update(...)` calls. Browser assets come
from the installed Python package over binary widget comms. Scripts and styles load before the tree
mounts and are shared across widgets in the same browser document. Displaying five widgets does not
register their custom elements five times or transfer five copies of the package.

After installing the packages and loading the notebook host, WebAwesome controls can render offline
in JupyterLab and JupyterLite. Features that fetch external data or optional remote icons still need
those resources. Package loading requires browser support for multiple import maps and permission
to load blob modules and styles. Reload the notebook document after upgrading a loaded package.
Conflicting library versions or custom elements registered outside this loader produce an error.

For package authors, the loader follows relative imports, declared bare import mappings, dynamic
imports, and stylesheet imports and URLs within `assets_dir`. Use `import.meta.resolve("./asset")`
for packaged images or WASM fetched at runtime. Arbitrary URLs constructed from `import.meta.url`
and worker module graphs are not supported by this loader. Test packages with such assets in a
notebook before advertising notebook support.

## Update the rendered tree

Keep a reference and call `update` to replace the tree; the browser applies a minimal diff (live
elements are preserved, not rebuilt):

```python
w = Widget(element("div").text("Lamp"))
w  # display it

w.update(element("div").child("Lamp").child(element("div").text("Fan")))
```

## Back reactive bindings with state

Pass a `state` dict to drive the tree's [reactive bindings](behavior.md). A two-way-bound control
updates the state from the browser, and assigning `w.state` updates the control:

```python
from spaday import Widget, element

w = Widget(element("input", type="checkbox").bind("checked", "lamp", mode="two-way"), state={"lamp": True})
w
```

```python
w.state                 # -> {'lamp': True}; flip the switch, then re-read -> {'lamp': False}
w.state = {"lamp": True}  # turns the switch back on
```

React to changes (including browser-driven ones) with `on_state`:

```python
w.on_state(lambda state: print("state:", state))
```

## Bind transports models

Use `session=` for validated models, binary fields, or client-owned state. A widget accepts a
`transports.Session` or an existing `transports.Server`; `state=` and `session=` are mutually exclusive.
Select models with `Wire`, omitting its WebSocket URL:

```python
from pydantic import BaseModel, Field
from transports import Session
from spaday import SetField, Widget, Wire, element

class Config(BaseModel):
    bpm: int = Field(120, ge=1)
    sample: bytes = b"pcm"

class Status(BaseModel):
    playing: bool = Field(False, json_schema_extra={"owner": "client"})

config, status = Config(), Status()
session = Session()
config_id = session.host(config)
status_id = session.host(status)

tree = element(
    "section",
    element("label", "Tempo", element("input", type="number").bind("value", "config.bpm", mode="two-way")),
    element("button").text("Play").on("click", SetField("status.playing", True)),
    element("output").bind("textContent", "status.playing"),
)
w = Widget(tree, session=session, wires=[
    Wire(model=config_id, namespace="config"),
    Wire(model=status_id, namespace="status"),
])
w
```

Changing tempo submits an edit validated by `Config`. Invalid values revert and publish an error
under `$errors.config.bpm`. The owning view's Play action updates locally before the kernel replies;
`update_interval` controls how often client-owned updates are sent (default 0.25 seconds).

Python assignments push automatically while the widget is open in an asynchronous kernel:

```python
config.bpm = 140
config.sample = b"new pcm"
```

Bytes travel as separate comm buffers and arrive as `Uint8Array` values in browser bindings. Keep
large binary configuration separate from client-owned status models: ownership resynchronizes the
status model with a full snapshot.

Display `w` in another cell to open another view. Each display has a separate client; exactly one
owns a given client-owned field, and other views observe it. Closing an owning view transfers
ownership. Transports heartbeats expire abandoned views after the reconnect window. Call `w.close()`
to close all views and release the widget's connections and sync task.

With several wires, each must select a model and use a distinct, non-overlapping namespace. Model
selection accepts numeric IDs or unique type names. `flatten` and `connected` work as on served pages;
namespaced wires default to `<namespace>.connected`. Codec, ownership participation, and
`update_interval` apply to the shared connection and must agree across the wires. Notebook codecs
are `json`, `msgpack`, and `cbor`. WebSocket URLs, session routing, batching, and reconnect/retry
settings are not notebook options.

One kernel timer drives `transports.sync()` per shared Server. Widgets given the same Session reuse
a Server. In a synchronous host, or when the application already drives comm syncing, use
`autosync=False` and call `transports.sync(w.server)` after mutations. Transports' socket-oriented
`autosync()` is not the comm driver.

## Handle client-owned state in a custom element

Bind `$owned.status.playing` to show whether this view owns the `playing` field in the `status` wire.
The flag updates on ownership transfer and becomes false on disconnect. Use ownership flags for
controls that should only be available in the owning view.

Commands issued with `session.command(model_id, field, value)` remain queued until an owning client
handles and acknowledges them. A custom element can request its wire in `connectedCallback`, before
initial snapshots or commands arrive:

```javascript
import { requestWire } from "@1kbgz/spaday";

class PlaybackControl extends HTMLElement {
  connectedCallback() {
    const wire = requestWire(this, "status");
    if (!wire) return;
    this.stop = wire.client.onCommand((command) => {
      if (command.id !== wire.link.modelId || command.field !== "playing") return;
      wire.store.set("status.playing", command.value.Bool);
      wire.client.ackCommand(command);
    });
  }

  disconnectedCallback() {
    this.stop?.();
  }
}
customElements.define("playback-control", PlaybackControl);
```

Put this JavaScript in the component package selected by the widget. Apply the requested operation
before acknowledging it; for asynchronous operations, acknowledge after successful completion.
Transports delivers commands to the owner and replays pending commands to newly registered handlers.
`wire.link.modelId` becomes available after the snapshot; use `wire.link.onModel(callback)` when a
component needs notification of model discovery. Unsubscribe when the element disconnects.

`requestWire` finds the nearest widget root, including across shadow roots. Omit its namespace only
when the widget has one wire. To avoid importing the runtime, dispatch a bubbling, composed
`spaday:wire-request` event with a mutable `detail = {namespace: "status"}` object and read
`detail.wire` synchronously afterward. The returned context contains `client`, `link`, `store`, and
`namespace`. The root also emits `spaday:wire-client` after mount for host-level listeners.

## Handle a SendPatch intent

A [`SendPatch`](behavior.md) action surfaces an *intent* the host forwards to Python. Register a handler
with `on_intent`:

```python
w.on_intent(lambda content: print("intent:", content))   # content is {"type": "spaday:patch", "detail": {...}}
```

In session mode, `SendPatch("config", "bpm", 120)` also edits the `config.bpm` binding through
transports, with the same validation as a two-way control. The model argument names the wire's
namespace; use an empty string for a wire without a namespace.

For most cases prefer a two-way binding over `SendPatch` + `on_intent` — the binding already carries the
control→state edit.

## Embed in Panel

Because the widget is an anywidget, Panel renders it directly:

```python
import panel as pn
pn.extension()
pn.panel(Widget(element("button").text("Run")))
```
