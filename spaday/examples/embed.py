"""Embed spaday in an EXISTING app — the "some HTML" tier.

The host owns the Starlette app, its routes, and its own pages (hand-written HTML); spaday attaches at a
sub-path with ``mount(app, page, prefix=…)``, contributing only its bootstrap + tree + ``/js`` under that
prefix. This is the seam for "I already have a complicated app and want to add a spaday component to it" —
spaday adds *nothing* at the root, just ``/spaday/``, ``/spaday/tree.json``, ``/spaday/js`` here.

``serve(page, …)`` is just ``mount()`` onto a fresh app; drop to ``mount()`` when the app is already yours.
The spaday panel is client-side reactive (a seeded signal ``store`` + a ``Show``), so it needs no wire — but
``mount`` takes the same ``wire=``/``routes=``/``background=`` options as ``serve`` when it does.

Run: ``python -m spaday.examples.embed`` then open http://127.0.0.1:8007/ (the host page links to /spaday/).
"""

import uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from starlette.routing import Route

from spaday import element
from spaday.backends.starlette import mount
from spaday.components.shell import App, Body, Main, Nav, Show, Stack
from spaday.components.webawesome import WaCallout, WaSwitch


def panel() -> object:
    """A small self-contained spaday UI to mount into the host app — reactive client-side, no server wire."""
    return (
        App()
        .child(Nav().child(element("strong").text("spaday panel — mounted at /spaday")))
        .child(
            Body().child(
                Main().child(
                    Stack()
                    .child(
                        element("p").text(
                            "This panel was attached to an existing Starlette app with mount(prefix='/spaday'). "
                            "The host owns / and its own routes; spaday only added this sub-path."
                        )
                    )
                    .child(WaSwitch().prop("id", "toggle").bind("checked", "show", mode="two-way").text("Show detail"))
                    .child(
                        Show(field="show").child(
                            WaCallout(variant="brand").text("Revealed client-side from a seeded signal store — no round-trip, no wire.")
                        )
                    )
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
        "<p>This page is the host's own HTML. spaday is embedded as one piece, mounted at "
        "<a href='/spaday/'>/spaday/</a> — it added nothing at the root.</p></body></html>"
    )


# The host app — its own routes; spaday is mounted under a prefix, coexisting with everything else.
app = Starlette(routes=[Route("/", host_home)])
mount(app, panel, prefix="/spaday", bundles=["webawesome"], store={"show": False}, title="spaday panel")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8007)
