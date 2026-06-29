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

## Host a model and wire the page

Host a model in a transports `Session`, author a tree whose controls **two-way bind** to its fields, and
serve it with `wire="transports"` — supply the websocket route and run `autosync` as a background task:

```python
import transports, uvicorn
from pydantic import BaseModel
from starlette.routing import WebSocketRoute
from spaday import element
from spaday.backends.starlette import serve
from spaday.components.webawesome import WaInput, WaSwitch

class Controls(BaseModel):
    label: str = "hello"
    on: bool = True

session = transports.Session()
session.host(Controls())
server = transports.Server(session)

def page():
    return (
        element("div")
        .child(WaInput().bind("value", "label", mode="two-way"))
        .child(WaSwitch().bind("checked", "on", mode="two-way"))
    )

app = serve(
    page,
    bundles=["webawesome"],
    wire="transports",
    routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],
    background=[transports.autosync(server)],   # fan host-side changes to every client
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

There are **no event handlers** in the tree — the two-way bindings carry every control→model edit.
Inbound model patches flow `model → store → bound props`; a two-way control's change becomes a
server-authoritative `client.edit`, which takes effect when the server echoes it back, so **two browser
tabs stay in sync**. A complete, runnable version is `spaday/examples/reactive.py`.

## Go multi-tenant

Swap the `Session` for a [`Hub`](https://github.com/1kbgz/transports), which routes each connection to its
own tenant session (and can share models across tenants). The UI code is unchanged — `connectStore` and
the bindings don't know whether the model is private or shared.

## Several models on one page

Pass a **list** of `Wire` specs to mirror several models into one store at once, each under its own
**namespace** so their fields don't collide (two `Chart` models would both have `data`/`type`):

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

- **`namespace`** — mirror the model's fields under `<namespace>.` (omit for bare fields, e.g. a form).
- **`session`** — append `?session=<uuid>`, making the model a fresh per-page-load tenant.
- **`flatten`** — recurse nested sub-models into dotted `parent.child` fields (the default, what a form
  binds); set `False` for an **opaque map/dict** field (a chart's time-keyed `data`, a Perspective
  layout) so it's mirrored whole instead of one store field per key.

A raw `{"url": …, "namespace": …}` dict works anywhere a `Wire` does. The omnibus
(`python -m spaday.examples`) wires four models this way.

## Perspective (Mode B)

A live Perspective table streams its **data** over Perspective's own websocket; spaday/transports sync
only a small **config** model (server, tables, layout). Mirror the config with `flatten=False` and feed it
to the panel with a computed `config` prop, so a server push re-restores the workspace for every tab:

```python
from spaday import field, obj
from spaday.components.perspective import PerspectivePanel

PerspectivePanel().compute("config", obj({
    "ws_url": field("cfg.ws_url"), "tables": field("cfg.tables"), "layout": field("cfg.layout"),
}))
```

See `spaday/examples/gateway.py` (no transports — REST + Perspective's own ws) and the omnibus for the
full pattern.
```
