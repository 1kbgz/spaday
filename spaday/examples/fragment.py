"""Drop spaday into a host-owned HTML page — the "full custom HTML" tier.

The host writes the WHOLE page (its own doctype, head, layout, markup, CSS) and embeds spaday as a
*fragment*: ``bootstrap(fragment=True, target="#spaday-root")`` returns the bundle tags + an **inline**
module ``<script>`` (not a document) that imports the spaday runtime/wasm from the served ``/js`` tree and
mounts into a node the host provides. spaday touches only that node; the host owns the rest of the page and
serves spaday's tree + ``/js`` itself (host-managed assets) — spaday isn't running the app, just emitting a
tree and the code to mount it. (The script is inline, so a host with a strict ``script-src`` CSP passes
``bootstrap(…, nonce=<per-request-nonce>)`` to stamp the generated tags — demonstrated below.)

This is the bottom of the ladder: ``serve`` (whole app) → ``mount`` (existing app) → ``fragment`` (existing
page). Each step hands more control to the host.

Run: ``python -m spaday.examples.fragment`` then open http://127.0.0.1:8008/.
"""

import secrets

import uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, Response
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles

from spaday import element
from spaday.actions import Toggle, by_id
from spaday.bootstrap import bootstrap, bundles_dir, tree_json
from spaday.components.shell import Stack
from spaday.components.webawesome import WaButton, WaCallout


def panel() -> object:
    """The spaday subtree dropped into the host page — a button carrying a client-side action."""
    return (
        Stack()
        .child(element("strong").text("A spaday fragment, mounted into a host page"))
        .child(WaButton(variant="brand").text("Toggle note").on("click", Toggle(by_id("note"), "hidden")))
        .child(
            WaCallout(variant="neutral")
            .prop("id", "note")
            .text("This subtree is spaday's (its action runs in the browser); the surrounding page is the host's own HTML.")
        )
    )


# The host's OWN full page — its doctype, head, layout, styles. spaday is only the `{fragment}` spliced into
# the node the host provides (#spaday-root). Everything else here is hand-written by the host.
HOST_PAGE = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Host page — with a spaday fragment</title>
    <style>
      body {{ font-family: system-ui, sans-serif; margin: 3rem; max-width: 44rem; }}
      header h1 {{ color: #6366f1; }}
      #spaday-root {{ border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-top: 1rem; }}
    </style>
  </head>
  <body>
    <header><h1>The host owns this page</h1></header>
    <p>All of this markup is the host's. The framed box below is a spaday fragment, mounted into a node the
      host provides — spaday emitted only the tags + script, not the page.</p>
    <div id="spaday-root"></div>
    {fragment}
  </body>
</html>"""


async def home(_request):
    # A strict-CSP host: a fresh per-request nonce stamps the generated tags (bootstrap(nonce=…)) and goes
    # in the host's CSP header, so the inline module script is allowed without 'unsafe-inline'. ('self'
    # covers the imported /js modules; 'wasm-unsafe-eval' lets spaday compile its wasm core.)
    nonce = secrets.token_urlsafe(16)
    fragment = bootstrap(fragment=True, target="#spaday-root", bundles=["webawesome"], nonce=nonce)
    csp = f"script-src 'self' 'nonce-{nonce}' 'wasm-unsafe-eval'"
    return HTMLResponse(HOST_PAGE.format(fragment=fragment), headers={"Content-Security-Policy": csp})


async def tree(_request):
    return Response(tree_json(panel), media_type="application/json")


# The host serves spaday's tree + the /js assets itself — spaday runs no server here.
app = Starlette(
    routes=[
        Route("/", home),
        Route("/tree.json", tree),
        Mount("/js", StaticFiles(directory=bundles_dir())),
    ]
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8008)
