# Sync a UI to a server over transports

This guide shows you how to keep a served spaday UI in sync with a server-side state model using
[transports](https://github.com/1kbgz/transports) — so a two-way control's change is applied on the
server and fanned to every connected browser. For delivering the page itself (the integration ladder),
see [Serve and embed](serving.md); for the zero-server version, the [notebook guide](notebook.md).

The split to keep in mind: **spaday** owns the UI (the tree and its reactive `Store`); **transports**
owns the wire (a `Client` that mirrors a model and sends edits); a single adapter, `connectStore`, is the
only place they meet — and `serve(wire="transports", …)` **generates that adapter for you**, so there is
no hand-written browser glue.

```bash
pip install "spaday[examples]"   # spaday + transports + starlette + uvicorn
```

## Keep browser-owned state and binary data in sync

Use transports 0.12. Declare browser-owned fields in the Python model and
bind controls normally:

```python
from pydantic import BaseModel, Field
from spaday import Wire

class Playback(BaseModel):
    playing: bool = Field(False, json_schema_extra={"owner": "client"})
    bpm: int = Field(120, ge=30, le=240)
    sample: bytes = b""

wire = Wire("/ws", codec="msgpack", reconnect=True, update_interval=0.25)
```

Owner edits update the browser immediately and coalesce before reaching Python. Server-owned edits
still validate and echo through the server. Use `Wire(..., ownership=False)` for a passive view that
must never become the owner. The first eligible view owns the model's client fields; another eligible
view takes over after disconnect.

Send Python instructions with `session.command(model_id, "playing", True)`. In an application script,
use the client exposed by `spaday:wire-client` to handle `onCommand`, apply the result through the
Spaday store, and call `ackCommand`. A component inside the tree asks for the same client with
`requestWire(element, namespace)` from the runtime: a served page provides its wires to the mounted
root the way the notebook widget does, so a component package's command bridge works in both. Use `onOwnership` and `onDisconnect` to start and stop any local
clock or other ongoing work. Command payloads are application-defined; Spaday does not interpret them.

Use Python `bytes` for sample data. A browser binding receives a `Uint8Array`, including with default
model flattening. Set a new array to replace the sample; mutating an existing array in place does not
notify the store. MessagePack and CBOR carry native bytes; JSON uses the transports base64 form.
Static binary component props are also supported and are applied as DOM properties during mount or
hydration, rather than emitted as HTML attributes. Use a component with a binary property setter.

Run the complete example:

```bash
python -m spaday.examples.playback
```

Open `http://127.0.0.1:8001` in two tabs. Toggle playback locally, send commands through Python, invert
the sample in the browser, and replace it from Python. Reload or close the owner tab to exercise
reconnection and handover. This example displays a waveform and playhead; it does not produce sound.
Its Python model, WebSocket, and browser store use the normal transports and Spaday APIs.

## Host a model and wire the page

Host a model in a transports `Session`, author a tree whose controls **two-way bind** to its fields, and
serve it with a reconnecting `Wire`. Supply the websocket route and run `autosync` as a background task:

```python
import transports, uvicorn
from pydantic import BaseModel
from starlette.routing import WebSocketRoute
from spaday import Wire, cond, element, field
from spaday.backends.starlette import serve
from spaday_webawesome import WaInput, WaSwitch

class Controls(BaseModel):
    label: str = "hello"
    on: bool = True

session = transports.Session()
session.host(Controls())
server = transports.Server(session)

def page():
    return (
        element("div")
        .child(element("p", role="status").compute(
            "textContent", cond(field("connected"), "Connected", "Disconnected — retrying")
        ))
        .child(WaInput().bind("value", "label", mode="two-way"))
        .child(WaSwitch().bind("checked", "on", mode="two-way"))
    )

app = serve(
    page,
    packages=["webawesome"],
    wire=Wire("/ws", reconnect=True, connected="connected"),
    routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],
    background=[transports.autosync(server)],   # fan host-side changes to every client
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

There are **no event handlers** in the tree — the two-way bindings carry every control→model edit.
Inbound model patches flow `model → store → bound props`; a two-way control's change becomes a
server-authoritative proposal. The control keeps its latest local value while proposals are pending, so
an older server echo cannot replace newer input. An accepted proposal applies the server's canonical
value, and a rejection restores the last authoritative value. Other server patches continue to update
the store while an edit is pending. Generated `Wire` connections use the managed transports client for
sending and disconnect abandonment. The single-model `reconnect=True` form also retries the connection.
The example opts into reconnect and displays socket status through the explicit `connected` store
field. After a dropped connection it retries and resyncs with the server. `connected` reports socket
state, not model readiness. A complete, runnable version is `spaday/examples/reactive.py`.

Generic controls with a two-way value binding also bind their error presentation to
`$errors.<field>`. A rejected proposal writes the server's validation message there; a new edit or an
accepted proposal clears it. The runtime also dispatches `spaday:reject` on `document`. Its detail has
the model namespace, bound store field, model id, revision, proposal id, and error string.

`connectStore` can also send through a callback for a socket owned by application code. Return `false`
when that socket is not open; `WebSocket.send()` can silently discard data while closing:

```ts
const link = connectStore(store, client, (frame) => {
  if (ws.readyState !== WebSocket.OPEN) return false;
  ws.send(frame);
  return true;
}, codec);
ws.addEventListener("close", () => link.disconnect());
```

`disconnect()` abandons proposals the server may not have received and restores later local edits from
the authoritative mirror until another frame arrives. Generated `Wire` connections do this through the
managed transports client.

## Bind collaborative CRDT fields

`connectStore` also accepts transports CRDT snapshots. It reads the model's `CrdtSpec` and maps a
two-way field update to its declared policy:

- register fields use `register_set`;
- map fields use per-key additions, removals, and nested edits;
- keyed sets use member additions and removals, with nested edits for retained identities;
- string and list sequence fields use positional `sequence_splice` mutations, which transports turns
  into stable-ID operations before sending them.

The update is optimistic because the transports client applies and queues CRDT operations locally.
Its managed connection resends queued operations after a reconnect and clears them when the server
echoes their causal IDs.

Editors can include granular ranges in their change event:

```js
new CustomEvent("editor-change", {
  detail: { changes: [{ from: 4, to: 7, insert: "new" }] },
});
```

Bind that event with `bind("doc", "doc", mode="two-way", event="editor-change")`. Spaday preserves
the ranges instead of diffing the whole string. String offsets follow browser UTF-16 indexing;
transports converts them to Unicode-scalar sequence positions. Controls that report only their final
value still work through a minimal prefix/suffix splice.

Bind a whole map or keyed set when a control reports its complete desired value. The transports
client's `crdtDiff` plans the changes in the shared Rust core. Set ordering follows canonical identity;
reordering the array alone has no effect. Duplicate member identities fail locally and restore the
control's value, with the error at `$errors.<field>`. Remote updates preserve keyed `Each` instances.

Use current values when making replacements. A stale copy can overwrite fields or remove members
that arrived since it was captured. For individual record fields, use
`bind("value", item("label"), mode="two-way")` inside a keyed `Each`. Spaday resolves the current
record by key and changes only that field before calling the Rust planner. A keyed-set field edit
produces a member-addressed mutation; it does not replace the set on the wire. Rejected edits restore
the control. CRDT validation errors use the top-level model field (`$errors.board.rows` or
`$errors.board.settings`, for example); editing that field clears its error. The same bindings work
with a local Store and standard design-system controls.

Keep explicit CRDT mutations for precise sequence changes and intentional remove-and-readd
operations. Item bindings receive final control values; unlike direct global editor bindings, they
do not forward editor change ranges. Peer-specific table/tree actions remain separate adapters.

Run the Python-authored map and record example:

```bash
python -m spaday.examples.collaborative_data
```

Open `http://127.0.0.1:8003` in two tabs. Edit different title/owner fields or different fields of
one record using the WebAwesome inputs and checkboxes; the changes merge. Add or remove records
through the JSON editor. Open `http://127.0.0.1:8003/viewer` to exercise rejected writes.
The Alice, Bob, and Viewer routes select demonstration roles; authenticate tenants in a deployed app.

Custom clients without `crdtDiff` retain register and sequence support. Structural bindings require
the new transports planner; they fail rather than silently replacing an entire CRDT document.

## Go multi-tenant

Swap the `Session` for a [`Hub`](https://github.com/1kbgz/transports), which routes each connection to its
own tenant session (and can share models across tenants). The UI code is unchanged — `connectStore` and
the bindings don't know whether the model is private or shared.

## Several models on one page

Pass one `Wire`, or a list of them, to configure transports connections. Several models share one
store, so give each one a **namespace** when their fields could collide:

```python
from spaday import Wire, field
from spaday.backends.starlette import serve

app = serve(
    page,
    wire=[
        Wire("/ws", namespace="global"),                      # a shared model
        Wire("/ws/session", namespace="session", session=True),  # a fresh per-tab tenant (a Hub)
        Wire("/ws/cfg", namespace="cfg", flatten=False),      # an opaque map/dict field, mirrored whole
    ],
    routes=[...],        # one WebSocketRoute per wire
    background=[...],    # one autosync per Server/Hub
)
```

The tree then binds against namespaced fields — `bind("value", "global.type")`,
`compute("data", field("global.data"))`. A `Wire`:

- **`model`** — select a numeric model ID or a unique snapshot type name. Omit to mirror the first
  model received. A namespace changes store field names; it does not select a model.
- **`namespace`** — mirror the model's fields under `<namespace>.` (omit for bare fields, e.g. a form).
- **`session`** — append `?session=<uuid>`, making the model a fresh per-page-load tenant.
- **`flatten`** — recurse nested sub-models into dotted `parent.child` fields (the default, what a form
  binds); set `False` for an **opaque map/dict** field (a chart's time-keyed `data`, a Perspective
  layout) so it's mirrored whole instead of one store field per key.
- **`codec`** — select JSON, MessagePack, CBOR, or a registered transports codec.
- **`batch`** — request batched server messages for this connection.
- **`ownership`** — allow this connection to own client-owned fields (default `True`). Set `False`
  for an observer that must never take ownership.
- **`update_interval`** — coalesce client-owned updates over this many seconds (default `0.25`).
  Local bindings update immediately; `0` sends every update.
- **`reconnect`** — use the managed reconnect loop. It is off by default for each `Wire`.
- **`retry`** and **`authority`** — set the reconnect delay in milliseconds and choose `"server"` or
  `"client"` state as authoritative after reconnect.
- **`connected`** — publish a connection-ready boolean to an exact store field. A namespaced wire
  already publishes `<namespace>.connected`; set this option for a bare wire or to choose another field.
  It becomes true when the WebSocket opens, including a reconnect where the client is already current
  and the server sends no model frame.

To mirror two models from one endpoint, select each model explicitly:

```python
wire = [
    Wire("/ws", model=orders_id, namespace="orders", reconnect=True),
    Wire("/ws", model="Settings", namespace="settings", reconnect=True),
]
```

Selected wires share one client and WebSocket within a bootstrap mount when `url`, `codec`, `session`,
`batch`, `reconnect`, `retry`, and `authority` match. Each wire retains its own namespace, flattening,
connection-status field, and model link. Disposing a managed mount closes its shared connection.
Unselected wires retain independent clients and first-model discovery.

A numeric selector is the ID returned by `Session.host` or `Hub.share`. Type-name selection requires a
transports client exposing `typeName(id)`. It waits for a matching snapshot; a missing model stays
unbound. If a second matching type arrives, that link stops edits, clears its mirrored fields, sets
`link.error`, and dispatches `spaday:wire-error` with `{namespace, model, error}` on `document`. Select by
ID when a session contains multiple instances of the same type. A selected model changing type also
disables its type-selected link. `connected` describes socket state,
not successful model selection. Selectors do not change server permissions or filter network traffic.

Generated connections use `wss:` on HTTPS pages and `ws:` on HTTP pages. Reconnect remains opt-in;
set `reconnect=True` for dashboards that must recover after a dropped connection.

For example, this single connection uses MessagePack, requests server batching, retries after 250 ms,
and exposes its state as `editor_connected`:

```python
Wire(
    "/ws/editor",
    codec="msgpack",
    batch=True,
    reconnect=True,
    retry=250,
    connected="editor_connected",
)
```

A raw `{"url": …, "namespace": …}` dict works anywhere a `Wire` does. The omnibus
(`python -m spaday.examples`) wires four models this way.

For shared Hub models, bind named ephemeral scopes to local store fields:

```python
from spaday import Awareness, Wire

Wire(
    "/ws/document",
    namespace="document",
    reconnect=True,
    awareness={
        "editor": Awareness(local="cursor", peers="cursors"),
        "table": Awareness(local="selected_row", peers="selected_rows"),
    },
)
```

`local` publishes that store field's current value; `None` withdraws the scope. `peers` receives a
list of `{"peer": connection_id, "state": value}` records, excluding the local connection. Either
field may be omitted for a one-way binding. These are exact local store field names, outside the
mirrored model namespace. Names, colors, user grouping, and rendering remain application choices.
Peer metadata is display data, not authorization.

Bindings use the existing connection and selected model. They withdraw on page navigation or managed
mount disposal, republish on cached-page restoration, and retain latest values across reconnects.
Disposing one scope preserves others. Use one publishing binding per scope on a model/connection;
multiple publishers targeting the same scope overwrite each other. The browser `connectAwareness`
function exposes the same binding and returns an idempotent disposer.

Run `python -m spaday.examples.awareness` after installing `spaday-codemirror` and
`spaday-regular-table` for an editor/table example using two scopes on one socket. It displays remote
selection state without prescribing cursor overlays. Scoped awareness requires compatible browser
and server transports builds; it remains local to one Hub process. Notebook Session/Server wires
do not support awareness and reject this option.

Component adapters that need a transports API outside model bindings can listen for
`spaday:wire-client`. Spaday dispatches it after `connectStore` is configured and before the client
connects:

```js
document.addEventListener("spaday:wire-client", ({ detail }) => {
  const { client, link, store, namespace, url } = detail;
  link.onModel((modelId) => {
    // Use client APIs scoped to this wire's model.
  });
});
```

The event exposes the existing managed client and its `StoreLink`. Use them for transport-owned
features such as ephemeral awareness instead of opening a second WebSocket. `link.modelId` is
`undefined` until the initial snapshot; `link.onModel()` runs after that snapshot has synchronized the
store and calls late subscribers immediately. Match `namespace` or `url` when a page has several wires.
The client, link, and store are live objects for browser adapters, not serializable page state.

## Perspective (Mode B)

A live Perspective table streams its **data** over Perspective's own websocket; spaday/transports sync
only a small **config** model (server, tables, layout). Mirror the config with `flatten=False` and feed it
to the panel with a computed `config` prop, so a server push re-restores the workspace for every tab:

```python
from spaday import field, obj
from spaday_perspective import PerspectivePanel

PerspectivePanel().compute("config", obj({
    "ws_url": field("cfg.ws_url"), "tables": field("cfg.tables"), "layout": field("cfg.layout"),
}))
```

Install `spaday-perspective` and select its assets with `packages=["perspective"]` when serving the page.

See `spaday/examples/gateway.py` (no transports — REST + Perspective's own ws) and the omnibus for the
full pattern.
