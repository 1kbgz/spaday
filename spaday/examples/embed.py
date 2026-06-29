"""Embed spaday in an EXISTING app — the "some HTML" tier, the *wired* case.

The host owns the Starlette app, its routes, its own pages (hand-written HTML), **and the app lifespan**.
spaday attaches at a sub-path with ``mount(app, page, prefix="/spaday", …)``, contributing its bootstrap +
tree + ``/js`` *and its websocket route* under that prefix. This is the seam for "I already have a
complicated app and want to add a live spaday panel to it."

Three things the simple case glosses over, shown here:

- **Route prefixing.** ``mount(prefix="/spaday")`` prefixes the supplied ``routes`` too, so the wire URL
  spaday generates (``/spaday/ws``) lines up with the ``WebSocketRoute`` — pass the *unprefixed* ``/ws``.
- **Lifespan composition.** ``mount`` only adds routes; the **host owns the lifespan**, so the host runs
  ``transports.autosync`` in its own lifespan (``mount`` has no ``background`` — that's ``serve``'s).
- **A real wire.** the panel two-way binds to a model hosted over transports, so an edit fans to every tab.

Run: ``python -m spaday.examples.embed`` then open http://127.0.0.1:8007/ (the host page links to /spaday/;
open it in two tabs to see edits fan).
"""

import asyncio
from contextlib import asynccontextmanager

import transports
import uvicorn
from pydantic import BaseModel
from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from starlette.routing import Route, WebSocketRoute

from spaday import element
from spaday.backends.starlette import mount
from spaday.components.shell import App, Body, Main, Nav, Row, Stack

HOST = "127.0.0.1"


class Shared(BaseModel):
    message: str = "edit me — it fans to every tab"


session = transports.Session()
shared = Shared()
session.host(shared)
server = transports.Server(session)


def panel() -> object:
    """A live spaday panel, two-way bound to the hosted ``Shared`` model over transports."""
    return (
        App()
        .child(Nav().child(element("strong").text("spaday panel — mounted at /spaday, wired over transports")))
        .child(
            Body().child(
                Main().child(
                    Stack()
                    .child(
                        element("p").text(
                            "Attached to an existing Starlette app with mount(prefix='/spaday'). The host owns / "
                            "and the app lifespan (it runs autosync); mount() prefixed the wire route to /spaday/ws."
                        )
                    )
                    .child(
                        Row()
                        .child(element("label").text("Shared message"))
                        .child(element("input", id="msg", type="text").bind("value", "message", mode="two-way"))
                    )
                    .child(Row().child(element("span").text("Echo: ")).child(element("strong").bind("textContent", "message")))
                )
            )
        )
    )


async def host_home(_request):
    """The host's OWN homepage — plain hand-written HTML, nothing to do with spaday."""
    return HTMLResponse(
        "<!doctype html><html lang=en><head><meta charset=utf-8><title>My app</title>"
        "<style>body{font-family:system-ui,sans-serif;margin:3rem;max-width:40rem}a{color:#6366f1}</style>"
        "</head><body><h1>My existing app</h1>"
        "<p>This page is the host's own HTML. A live spaday panel is embedded at "
        "<a href='/spaday/'>/spaday/</a> — open it in two tabs and watch edits fan over transports.</p></body></html>"
    )


@asynccontextmanager
async def lifespan(_app):
    # the HOST owns the lifespan — mount() only adds routes, so run the model's autosync here
    task = asyncio.create_task(transports.autosync(server))
    try:
        yield
    finally:
        task.cancel()


# The host app — its own routes + its own lifespan; spaday is mounted under a prefix, wire route and all.
app = Starlette(routes=[Route("/", host_home)], lifespan=lifespan)
mount(
    app,
    panel,
    prefix="/spaday",
    wire="transports",
    routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],  # mount prefixes this to /spaday/ws
    title="spaday panel",
)


if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=8007)
