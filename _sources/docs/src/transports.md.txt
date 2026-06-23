# Sync a UI to a server over transports

This guide shows you how to serve a spaday UI from a webserver and keep it in sync with a server-side
state model using [transports](https://github.com/1kbgz/transports) — so a two-way control's change is
applied on the server and fanned to every connected browser. This is the multi-tenant, no-notebook path;
for the zero-setup version see the [notebook guide](notebook.md).

The split to keep in mind: **spaday** owns the UI (the tree and its reactive `Store`); **transports**
owns the wire (a `Client` that mirrors a model and sends edits); a single adapter, `connectStore`, is
the only place they meet.

Install both:

```bash
pip install spaday transports uvicorn
cd js && pnpm install && pnpm build   # builds the runtime + bundles served to the browser
```

## Host a model and author the UI (Python)

Host a model in a transports `Session`, author a tree whose controls are **two-way bound** to its
fields, and serve the page, the tree, and a WebSocket:

```python
import asyncio

import transports
from pydantic import BaseModel
from spaday import element
from spaday.components.webawesome import WaInput, WaSwitch
from starlette.applications import Starlette
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Route, WebSocketRoute

class Controls(BaseModel):
    label: str = "hello"
    on: bool = True

session = transports.Session()
session.host(Controls())
server = transports.Server(session)

def tree() -> dict:
    return (
        element("div")
        .child(WaInput().bind("value", "label", mode="two-way"))
        .child(WaSwitch().bind("checked", "on", mode="two-way"))
        .to_node()
    )

async def startup():
    asyncio.create_task(transports.autosync(server))  # broadcast host-side changes to all clients

app = Starlette(
    routes=[
        Route("/", lambda r: FileResponse("index.html")),
        Route("/tree.json", lambda r: JSONResponse(tree())),
        WebSocketRoute("/ws", transports.ws_endpoint(server)),
    ],
    on_startup=[startup],
)
```

There are **no event handlers** in the tree — the two-way bindings carry every control→model edit.

## Wire the store to the client (browser)

In the page, create a spaday `Store`, a transports `Client`, and link them with `connectStore`. Then
mount the tree with that store:

```ts
import { mount, init, Store, connectStore } from "spaday";
import { Client, fromValue, toValue, wasm } from "@1kbgz/transports";

await init();                 // spaday wasm (action interpreter)
await wasm.default();         // transports wasm

const store = new Store();
const client = new Client();
const ws = new WebSocket(`ws://${location.host}/ws`);
ws.binaryType = "arraybuffer";

// the seam: model fields <-> store fields; a two-way control's change becomes a server edit
const link = connectStore(store, client, (frame) => ws.send(frame), { fromValue, toValue });
ws.addEventListener("message", (e) =>
  link.receive(typeof e.data === "string" ? e.data : new Uint8Array(e.data)),
);

mount(document.body, await (await fetch("/tree.json")).json(), store);
```

Inbound model patches flow `model → store → bound props`; a two-way control's change becomes a
server-authoritative `client.edit`. Edits take effect when the server echoes them back, so **two browser
tabs stay in sync**.

A complete, runnable version of this is `spaday/examples/reactive.py` in the repository.

## Go multi-tenant

Swap the `Session` for a [`Hub`](https://github.com/1kbgz/transports), which routes each connection to
its own tenant session (and can share models across tenants). The UI code is unchanged — `connectStore`
and the bindings don't know or care whether the model is private or shared.
