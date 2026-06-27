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
- ``scripts=[…]`` — extra ES-module URLs to load for app-specific behavior (e.g. ``NamedJs`` handlers).

``routes=`` splices in extra endpoints (the transports websocket, REST), ``background=`` runs coroutines
for the app's lifetime (``transports.autosync``). A page that needs wiring the templates don't cover
still passes ``html=`` to serve a hand-authored file.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Optional, Sequence, Union

from .component import Component

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


def _script(wire: Optional[str], scripts: Sequence[str], ws: str) -> str:
    """The page's module script: imports, wasm init(s), fetch the tree, then mount — statically, or wired
    to a transports model (Store + Client + connectStore) when ``wire="transports"``."""
    transports = wire == "transports"
    head = f'import {{ mount, init, Store, connectStore }} from "{_RUNTIME}";' if transports else f'import {{ mount, init }} from "{_RUNTIME}";'
    lines = [head]
    if transports:
        lines.append(f'import {{ Client, fromValue, toValue, wasm }} from "{_TRANSPORTS}";')
    lines.extend(f'import "{s}";' for s in scripts)
    lines.append(f'await init({{ module_or_path: "{_WASM}" }});')
    if transports:
        lines.append(f'await wasm.default({{ module_or_path: "{_TRANSPORTS_WASM}" }});')
    lines.append('const node = await (await fetch("/tree.json")).json();')
    if transports:
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
    scripts: Sequence[str] = (),
    head: str = "",
    background: Sequence[Awaitable] = (),
) -> Starlette:
    """Build a Starlette app that serves ``page`` (see the module docstring).

    ``page`` is a Component or a callable returning one. ``bundles`` pulls component libraries into the
    generated page's ``<head>``; ``wire="transports"`` generates the transports bootstrap (``ws`` sets the
    socket path, default ``/ws``); ``scripts`` adds module URLs to load. ``html`` instead serves a
    hand-authored bootstrap file (``bundles``/``wire``/``head``/``title`` are then unused). ``js``
    overrides the served bundle directory (defaults to the repo's ``js/``); ``background`` coroutines run
    as tasks for the app's lifetime and are cancelled on shutdown.
    """
    from starlette.applications import Starlette
    from starlette.responses import FileResponse, HTMLResponse, JSONResponse
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    js_dir = Path(js) if js is not None else _DEV_JS
    head_markup = "\n    ".join(p for p in (_bundle_head(bundles), head) if p)
    body = _page_html(title, head_markup, _script(wire, scripts, ws))

    async def homepage(_request):
        return FileResponse(html) if html is not None else HTMLResponse(body)

    async def tree_json(_request):
        node = page() if callable(page) else page
        return JSONResponse(node.to_node())

    @asynccontextmanager
    async def lifespan(_app):
        tasks = [asyncio.ensure_future(c) for c in background]
        try:
            yield
        finally:
            for task in tasks:
                task.cancel()

    app_routes = [Route("/", homepage), Route("/tree.json", tree_json), *routes, Mount("/js", StaticFiles(directory=js_dir))]
    return Starlette(routes=app_routes, lifespan=lifespan)
