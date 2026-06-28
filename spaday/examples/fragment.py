"""Drop spaday into a host-owned HTML page — the "full custom HTML" tier.

The host writes the WHOLE page (its own doctype, head, layout, assets) and embeds spaday as a *fragment*:
``bootstrap(fragment=True, target="#spaday-root")`` returns just the bundle tags + the mounting
``<script>`` (not a document), which the host splices into a node it provides. spaday touches only that
node; the host owns everything else — markup, CSS, CSP, its own bundler. The host serves spaday's tree and
``/js`` itself (host-managed assets), so spaday isn't running the app at all — it just emits a component
tree and the code to mount it.

This is the bottom of the ladder: ``serve`` (whole app) → ``mount`` (existing app) → ``fragment`` (existing
page). Each step hands more control to the host.

Run: ``python -m spaday.examples.fragment`` then open http://127.0.0.1:8008/.
"""

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
    # just the bundle tags + the module <script> that fetches the tree and mounts into the host's node
    fragment = bootstrap(fragment=True, target="#spaday-root", bundles=["webawesome"])
    return HTMLResponse(HOST_PAGE.format(fragment=fragment))


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
