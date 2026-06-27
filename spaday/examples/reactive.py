"""A reactive page over transports: spaday bindings ↔ a transports model, with no hand-wired glue.

The functional split *is* the point of this example:

- **transports owns the wire.** A `Controls` model lives in a `transports.Session`; the browser mirrors
  it with a transports `Client` and sends edits. spaday never touches the wire.
- **spaday owns the UI.** The tree's controls are *bound* to model fields (`.bind(..., mode="two-way")`)
  and read/written through a signal `Store`. There are no `onChange` handlers and no `client.edit`
  calls authored in the page.
- **`connectStore` is the seam.** It marries the two without either knowing about the other: inbound
  patches flow model → store → bound props, and a two-way control's change becomes a
  server-authoritative edit. Open two tabs — they stay in sync through the server.

No hand-authored HTML: `spaday.serve` generates the bootstrap, with `tree="frame"` shipping the tree as
a transports Snapshot frame so the UI tree and the model data ride one wire.

Run: ``python -m spaday.examples.reactive`` then open http://127.0.0.1:8001/.
"""

import transports
import uvicorn
from pydantic import BaseModel
from starlette.routing import WebSocketRoute

from spaday import Strong, element
from spaday.backends.starlette import serve
from spaday.components.shell import Column, Main, Row


class Controls(BaseModel):
    label: str = "hello"
    on: bool = True


session = transports.Session()
controls = Controls()
session.host(controls)
server = transports.Server(session)


def page():
    """The UI: controls two-way-bound to model fields, plus a one-way echo — no event wiring."""
    return Main(
        Strong("Reactive controls over transports — bindings, no glue"),
        Column(
            Row(element("label", "Label"), element("input", type="text").bind("value", "label", mode="two-way")),
            Row(element("label", "On"), element("input", type="checkbox").bind("checked", "on", mode="two-way")),
            Row("Echo: ", element("span").bind("textContent", "label")),
        ),
    )


app = serve(
    page,
    wire="transports",  # generate the Client + connectStore + websocket bootstrap
    tree="frame",  # the tree rides a transports Snapshot frame — UI tree + model data on one wire
    routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],
    background=[transports.autosync(server)],
    title="spaday × transports — reactive bindings",
    head="<style>body { font-family: system-ui, sans-serif; margin: 2rem; } label { font-weight: 600; margin-right: 0.5rem; }</style>",
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
