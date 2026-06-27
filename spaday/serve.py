"""``serve(page)`` — the one-call Starlette host for a spaday page, HTML and all.

Turns a page into a runnable app so an example needn't hand-roll the serving glue *or* a bootstrap
``.html``: it generates the page (init the wasm core, fetch the authored tree, mount it), serves that
tree as JSON at ``/tree.json`` (so the page is a :class:`~spaday.component.Component`, not a hand-built
``.to_node()`` dict), and serves the ``js/`` bundles at ``/js``. What an app would have hand-written in
HTML is declared in Python instead:

- ``bundles=["webawesome", …]`` — pull a component library's styles + catalog bundle into ``<head>``
  (see :data:`BUNDLES`), instead of copy-pasting its ``<link>``/``<script>`` tags.
- ``wire="transports"`` — generate the transports ``Client`` + ``connectStore`` + websocket bootstrap
  (what every transports example's HTML repeats); without it the page just mounts a static tree.
- ``tree="frame"`` — ship the tree as a transports Snapshot frame at ``/tree`` (UI tree + model data on
  one wire), decoded in the browser, instead of JSON at ``/tree.json``.
- ``scripts=[…]`` — extra ES-module URLs to load for app-specific behavior (e.g. ``NamedJs`` handlers).

``routes=`` splices in extra endpoints (the transports websocket, REST), ``background=`` runs coroutines
for the app's lifetime (``transports.autosync``). A page that needs wiring the templates don't cover
still passes ``html=`` to serve a hand-authored file.
"""

from __future__ import annotations

import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Callable, Optional, Sequence, Union

from .component import Component
from .spaday import encode_frame  # compiled core (always available); used by the tree="frame" wire

if TYPE_CHECKING:  # annotations only — the runtime starlette imports live inside serve(), since starlette
    from starlette.applications import Starlette  # is the optional `examples` extra (import spaday stays light)
    from starlette.routing import BaseRoute

#: A page is a built :class:`~spaday.component.Component`, or a zero-arg callable returning one (called
#: per ``/tree.json`` request, so the tree can reflect current state).
Page = Union[Component, "object"]

_DEV_JS = Path(__file__).parent.parent / "js"  # repo checkout: the built bundles live in ../js/dist
_RUNTIME = "/js/dist/esm/index.js"
_WASM = "/js/dist/pkg/spaday_bg.wasm"
_TRANSPORTS = "/js/node_modules/@1kbgz/transports/dist/cdn/index.js"
_TRANSPORTS_WASM = "/js/node_modules/@1kbgz/transports/dist/pkg/transports_bg.wasm"

#: Named component-library bundles a page can pull into ``<head>`` via ``serve(..., bundles=[…])`` —
#: each value is the markup (styles + the catalog/wrapper script that registers the elements) that an
#: example would otherwise paste into its HTML. The URLs resolve under the served ``/js`` mount.
BUNDLES = {
    "webawesome": [
        '<link rel="stylesheet" href="/js/node_modules/@awesome.me/webawesome/dist/styles/webawesome.css" />',
        '<link rel="stylesheet" href="/js/node_modules/@awesome.me/webawesome/dist/styles/themes/default.css" />',
        '<script type="module" src="/js/dist/cdn/examples/webawesome.js"></script>',
    ],
    "lightweight-charts": ['<script type="module" src="/js/dist/cdn/wrappers/lightweight-chart.js"></script>'],
    "perspective": ['<script type="module" src="/js/dist/cdn/wrappers/perspective-workspace.js"></script>'],
}


def _bundle_head(bundles: Sequence[str]) -> str:
    tags = []
    for name in bundles:
        if name not in BUNDLES:
            raise ValueError(f"unknown bundle {name!r}; known: {', '.join(sorted(BUNDLES))}")
        tags.extend(BUNDLES[name])
    return "\n    ".join(tags)


def _script(wire: Optional[str], scripts: Sequence[str], ws: str, tree: str, reconnect: bool) -> str:
    """The page's module script: imports, wasm init(s), fetch the tree, then mount — statically, or wired
    to a transports model (Store + Client + connectStore) when ``wire="transports"``. ``tree="frame"``
    fetches the tree as a transports Snapshot frame (``/tree``) and decodes it, instead of JSON.
    ``reconnect`` re-opens the websocket on drop (each reconnect re-syncs from the server's snapshot)."""
    transports = wire == "transports"
    frame = tree == "frame"
    runtime_names = ["mount", "init"] + (["Store", "connectStore"] if transports else []) + (["decodeFrame"] if frame else [])
    lines = [f'import {{ {", ".join(runtime_names)} }} from "{_RUNTIME}";']
    if transports:
        lines.append(f'import {{ Client, fromValue, toValue, wasm }} from "{_TRANSPORTS}";')
    lines.extend(f'import "{s}";' for s in scripts)
    lines.append(f'await init({{ module_or_path: "{_WASM}" }});')
    if transports:
        lines.append(f'await wasm.default({{ module_or_path: "{_TRANSPORTS_WASM}" }});')
    if frame:
        lines.append('const framed = new Uint8Array(await (await fetch("/tree")).arrayBuffer());')
        lines.append("const node = JSON.parse(decodeFrame(framed)).payload;")
    else:
        lines.append('const node = await (await fetch("/tree.json")).json();')
    if transports and reconnect:
        lines.extend(
            [
                "const store = new Store();",
                "const client = new Client();",
                "let socket = null;",
                "const link = connectStore(store, client, (frame) => socket && socket.send(frame), { fromValue, toValue });",
                "function connect() {",
                f"  socket = new WebSocket(`ws://${{location.host}}{ws}`);",
                '  socket.binaryType = "arraybuffer";',
                '  socket.addEventListener("message", (event) =>',
                '    link.receive(typeof event.data === "string" ? event.data : new Uint8Array(event.data)),',
                "  );",
                "  socket.addEventListener('close', () => setTimeout(connect, 1000));",
                "}",
                "connect();",
                "mount(document.body, node, store);",
            ]
        )
    elif transports:
        lines.extend(
            [
                "const store = new Store();",
                "const client = new Client();",
                f"const ws = new WebSocket(`ws://${{location.host}}{ws}`);",
                'ws.binaryType = "arraybuffer";',
                "const link = connectStore(store, client, (frame) => ws.send(frame), { fromValue, toValue });",
                'ws.addEventListener("message", (event) =>',
                '  link.receive(typeof event.data === "string" ? event.data : new Uint8Array(event.data)),',
                ");",
                "mount(document.body, node, store);",
            ]
        )
    else:
        lines.append("mount(document.body, node);")
    return "\n      ".join(lines)


def _page_html(title: str, head: str, script: str) -> str:
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {head}
  </head>
  <body>
    <script type="module">
      {script}
    </script>
  </body>
</html>
"""


def serve(
    page: Page,
    *,
    routes: Sequence[BaseRoute] = (),
    html: Optional[Union[str, Path]] = None,
    js: Optional[Union[str, Path]] = None,
    title: str = "spaday",
    bundles: Sequence[str] = (),
    wire: Optional[str] = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
    background: Sequence[Awaitable] = (),
    lifespan: Optional[Callable] = None,
) -> Starlette:
    """Build a Starlette app that serves ``page`` (see the module docstring).

    ``page`` is a Component or a callable returning one. ``bundles`` pulls component libraries into the
    generated page's ``<head>``; ``wire="transports"`` generates the transports bootstrap (``ws`` sets the
    socket path, default ``/ws``); ``tree="frame"`` ships the tree as a transports Snapshot frame at
    ``/tree`` (so the UI tree and the model data ride one wire) instead of JSON at ``/tree.json``;
    ``reconnect=True`` re-opens the websocket on drop and re-syncs from the server snapshot (multi-worker /
    restart-durable apps); ``scripts`` adds module URLs to load. ``html`` instead serves a hand-authored bootstrap file
    (``bundles``/``wire``/``head``/``title`` are then unused). ``js`` overrides the served bundle directory
    (defaults to the repo's ``js/``); ``background`` coroutines run as tasks for the app's lifetime and are
    cancelled on shutdown. ``lifespan`` overrides that with a custom Starlette lifespan (for startup that
    must order/await its own setup, e.g. a clustering relay) — ``background`` is then unused.
    """
    from starlette.applications import Starlette
    from starlette.responses import FileResponse, HTMLResponse, JSONResponse, Response
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    js_dir = Path(js) if js is not None else _DEV_JS
    head_markup = "\n    ".join(p for p in (_bundle_head(bundles), head) if p)
    body = _page_html(title, head_markup, _script(wire, scripts, ws, tree, reconnect))

    async def homepage(_request):
        return FileResponse(html) if html is not None else HTMLResponse(body)

    async def tree_json(_request):
        node = page() if callable(page) else page
        return JSONResponse(node.to_node())

    async def tree_frame(_request):
        # the tree rides the same length-prefixed, codec-tagged transports envelope the model data uses
        node = page() if callable(page) else page
        frame = encode_frame(json.dumps(node.to_node()), "spa-tree", "snapshot", 0, "application/json")
        return Response(frame, media_type="application/octet-stream")

    tree_route = Route("/tree", tree_frame) if tree == "frame" else Route("/tree.json", tree_json)

    @asynccontextmanager
    async def _background_lifespan(_app):
        tasks = [asyncio.ensure_future(c) for c in background]
        try:
            yield
        finally:
            for task in tasks:
                task.cancel()

    app_routes = [Route("/", homepage), tree_route, *routes, Mount("/js", StaticFiles(directory=js_dir))]
    return Starlette(routes=app_routes, lifespan=lifespan if lifespan is not None else _background_lifespan)
