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
elements; component-package browser assets are loaded by web backends through `packages=`.

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

Commands issued with `session.command(model_id, field, value)` remain queued until an owning client
handles and acknowledges them. The widget root emits `spaday:wire-client` after mount, with
`client`, `link`, `store`, and `namespace` in its detail. A root listener can register `client.onCommand`
and call `client.ackCommand` after applying a command. This event stays on the widget root; it does
not broadcast to other widgets or propagate down to descendants.

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
