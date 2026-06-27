"""Framework-agnostic bootstrapping: generate a spaday page's HTML and serialize its tree, with **no
webserver dependency**. Nothing here imports starlette / aiohttp / flask, so any backend can serve a
spaday app — a backend (see :mod:`spaday.backends`) is just thin glue that wires these into routes.

What an app would otherwise hand-write in HTML is declared in Python:

- ``bundles=["webawesome", …]`` — pull a component library's styles + catalog bundle into ``<head>``
  (see :data:`BUNDLES`), instead of copy-pasting its ``<link>``/``<script>`` tags.
- ``wire="transports"`` — generate the transports ``Client`` + ``connectStore`` + websocket bootstrap
  (what every transports example's HTML repeats); without it the page just mounts a static tree.
- ``tree="frame"`` — fetch the tree as a transports Snapshot frame at ``/tree`` (UI tree + model data on
  one wire), decoded in the browser, instead of JSON at ``/tree.json``.
- ``reconnect=True`` — re-open the websocket on drop, re-syncing from the server snapshot.
- ``scripts=[…]`` — extra ES-module URLs to load (e.g. ``NamedJs`` handlers).

**The contract a backend must satisfy** — the generated HTML expects the host to serve, at these paths::

    GET /            -> bootstrap(...)        # this HTML
    GET /tree.json   -> tree_json(page)       # or GET /tree -> tree_frame(page) when tree="frame"
    GET /js/*        -> the files under bundles_dir()
    WS  /ws          -> a transports endpoint # only when wire="transports" (the backend/transports owns it)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, Sequence, Union

from .component import Component
from .spaday import encode_frame  # compiled core (always available); used by tree_frame

#: A page is a built :class:`~spaday.component.Component`, or a zero-arg callable returning one (called
#: per request, so the tree can reflect current state).
Page = Union[Component, "object"]

_RUNTIME = "/js/dist/esm/index.js"
_WASM = "/js/dist/pkg/spaday_bg.wasm"
_TRANSPORTS = "/js/node_modules/@1kbgz/transports/dist/cdn/index.js"
_TRANSPORTS_WASM = "/js/node_modules/@1kbgz/transports/dist/pkg/transports_bg.wasm"

#: Named component-library bundles a page can pull into ``<head>`` via ``bundles=[…]`` — each value is the
#: markup (styles + the catalog/wrapper script that registers the elements) that an example would otherwise
#: paste into its HTML. The URLs resolve under the served ``/js`` mount (see :func:`bundles_dir`).
BUNDLES = {
    "webawesome": [
        '<link rel="stylesheet" href="/js/node_modules/@awesome.me/webawesome/dist/styles/webawesome.css" />',
        '<link rel="stylesheet" href="/js/node_modules/@awesome.me/webawesome/dist/styles/themes/default.css" />',
        '<script type="module" src="/js/dist/cdn/examples/webawesome.js"></script>',
    ],
    "lightweight-charts": ['<script type="module" src="/js/dist/cdn/wrappers/lightweight-chart.js"></script>'],
    "perspective": ['<script type="module" src="/js/dist/cdn/wrappers/perspective-workspace.js"></script>'],
}


def bundles_dir() -> Path:
    """The directory of built JS bundles a backend serves at ``/js`` — the repo's ``js/`` (dev checkout).

    The :data:`BUNDLES` and runtime URLs assume this layout mounted at ``/js``. (A pip-installed app ships
    assets under ``spaday/extension`` in a different layout without ``node_modules``; serving an installed
    app is a separate concern — a backend can override the dir, but the URLs would also need re-pathing.)
    """
    return Path(__file__).parent.parent / "js"


def _resolve(page: Page) -> Component:
    return page() if callable(page) else page


def tree_json(page: Page) -> str:
    """The authored tree as a JSON string (serve at ``GET /tree.json``)."""
    return json.dumps(_resolve(page).to_node())


def tree_frame(page: Page, *, id: str = "spa-tree") -> bytes:
    """The authored tree as a transports Snapshot frame (serve at ``GET /tree`` for ``tree="frame"``) —
    the same length-prefixed, codec-tagged envelope transports uses for model state, so the UI tree and
    the model data ride one wire."""
    return encode_frame(json.dumps(_resolve(page).to_node()), id, "snapshot", 0, "application/json")


def _bundle_head(bundles: Sequence[str]) -> str:
    tags = []
    for name in bundles:
        if name not in BUNDLES:
            raise ValueError(f"unknown bundle {name!r}; known: {', '.join(sorted(BUNDLES))}")
        tags.extend(BUNDLES[name])
    return "\n    ".join(tags)


def _script(wire: Optional[str], scripts: Sequence[str], ws: str, tree: str, reconnect: bool) -> str:
    """The page's module script: imports, wasm init(s), fetch the tree, then mount — statically, or wired
    to a transports model (Store + Client + connectStore) when ``wire="transports"``."""
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


def bootstrap(
    *,
    bundles: Sequence[str] = (),
    wire: Optional[str] = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
    title: str = "spaday",
) -> str:
    """The bootstrap page HTML (init the wasm core, fetch the tree, mount it). See the module docstring for
    the options and the route contract a backend must satisfy to serve it."""
    head_markup = "\n    ".join(p for p in (_bundle_head(bundles), head) if p)
    script = _script(wire, scripts, ws, tree, reconnect)
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {head_markup}
  </head>
  <body>
    <script type="module">
      {script}
    </script>
  </body>
</html>
"""
