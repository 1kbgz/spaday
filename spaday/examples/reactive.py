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

Run: ``python -m spaday.examples.reactive`` then open http://127.0.0.1:8001/.
"""

import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path

import transports
import uvicorn
from pydantic import BaseModel
from starlette.applications import Starlette
from starlette.responses import FileResponse, Response
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles

import spaday
from spaday import Strong, element
from spaday.components.shell import Column, Main, Row

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"


class Controls(BaseModel):
    label: str = "hello"
    on: bool = True


session = transports.Session()
controls = Controls()
session.host(controls)
server = transports.Server(session)


def tree() -> dict:
    """The UI: controls two-way-bound to model fields, plus a one-way echo — no event wiring."""
    return Main(
        Strong("Reactive controls over transports — bindings, no glue"),
        Column(
            Row(element("label", "Label"), element("input", type="text").bind("value", "label", mode="two-way")),
            Row(element("label", "On"), element("input", type="checkbox").bind("checked", "on", mode="two-way")),
            Row("Echo: ", element("span").bind("textContent", "label")),
        ),
    ).to_node()


async def homepage(_request):
    return FileResponse(HERE / "reactive.html")


async def tree_frame(_request):
    # The tree ships as a transports Snapshot frame — the same length-prefixed, codec-tagged envelope
    # transports uses for model state, so the UI tree and the data ride one wire.
    frame = spaday.encode_frame(json.dumps(tree()), "spa-main", "snapshot", 0, "application/json")
    return Response(frame, media_type="application/octet-stream")


@asynccontextmanager
async def lifespan(_app):
    task = asyncio.create_task(transports.autosync(server))
    try:
        yield
    finally:
        task.cancel()


app = Starlette(
    routes=[
        Route("/", homepage),
        Route("/tree", tree_frame),
        WebSocketRoute("/ws", transports.ws_endpoint(server)),
        Mount("/js", StaticFiles(directory=JS)),
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
