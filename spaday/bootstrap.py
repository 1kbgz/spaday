"""Framework-agnostic bootstrapping: generate a spaday page's HTML and serialize its tree, with **no
webserver dependency**. Nothing here imports starlette / aiohttp / flask / tornado, so any backend can
serve a spaday app — a backend (see :mod:`spaday.backends`) is just thin glue that wires these into routes.

What an app would otherwise hand-write in HTML is declared in Python:

- ``bundles=["webawesome", …]`` — pull a component library's styles + catalog bundle into ``<head>``
  (see :data:`BUNDLES`), instead of copy-pasting its ``<link>``/``<script>`` tags.
- ``wire="transports"`` — generate the transports ``Client`` + ``connectStore`` + websocket bootstrap
  (what every transports example's HTML repeats); without it the page just mounts a static tree.
- ``tree="frame"`` — fetch the tree as a transports Snapshot frame at ``…/tree`` (UI tree + model data on
  one wire), decoded in the browser, instead of JSON at ``…/tree.json``.
- ``reconnect=True`` — re-open the websocket on drop, re-syncing from the server snapshot.
- ``scripts=[…]`` — extra ES-module URLs to load (e.g. ``NamedJs`` handlers).
- ``base="/dashboard"`` — mount the app under a path prefix, so it coexists with the host's other routes
  (the tree / ``/js`` / ws URLs are all prefixed). Default ``""`` = served at the root.
- ``fragment=True`` + ``target="#widget"`` — return just the bundle tags + the module ``<script>`` (not a
  whole document), mounting into ``target`` — a snippet to drop into a host page's template, so spaday is
  one component among many (several roots can share a page).

**The contract a backend must satisfy** — the generated HTML expects the host to serve, at these paths
(``{base}`` is the prefix, default empty)::

    GET {base}/            -> bootstrap(...)        # this HTML
    GET {base}/tree.json   -> tree_json(page)       # or GET {base}/tree -> tree_frame(page) when tree="frame"
    GET {base}/js/*        -> the files under bundles_dir()
    WS  {base}/ws          -> a transports endpoint # only when wire="transports" (the backend/transports owns it)
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

# Paths under the served ``/js`` mount — prefixed with ``{base}/js`` at build time (see ``_js``).
_RUNTIME = "/dist/esm/index.js"
_WASM = "/dist/pkg/spaday_bg.wasm"
_TRANSPORTS = "/node_modules/@1kbgz/transports/dist/cdn/index.js"
_TRANSPORTS_WASM = "/node_modules/@1kbgz/transports/dist/pkg/transports_bg.wasm"

#: Named component-library bundles a page can pull into ``<head>`` via ``bundles=[…]``. Each entry is a
#: ``(kind, path)`` pair — ``kind`` is ``"css"`` or ``"js"``, ``path`` is under the served ``/js`` mount —
#: the markup (styles + the catalog/wrapper script that registers the elements) an example would otherwise
#: paste into its HTML.
BUNDLES = {
    "webawesome": [
        ("css", "/node_modules/@awesome.me/webawesome/dist/styles/webawesome.css"),
        ("css", "/node_modules/@awesome.me/webawesome/dist/styles/themes/default.css"),
        ("js", "/dist/cdn/examples/webawesome.js"),
    ],
    "lightweight-charts": [("js", "/dist/cdn/wrappers/lightweight-chart.js")],
    "perspective": [("js", "/dist/cdn/wrappers/perspective-workspace.js")],
}


def bundles_dir() -> Path:
    """The directory of built JS bundles a backend serves at ``{base}/js`` — the repo's ``js/`` (dev
    checkout). The :data:`BUNDLES` and runtime URLs assume this layout. (A pip-installed app ships assets
    under ``spaday/extension`` in a different layout without ``node_modules``; serving an installed app is
    a separate concern — a backend can override the dir, but the URLs would also need re-pathing.)"""
    return Path(__file__).parent.parent / "js"


def _js(base: str) -> str:
    return f"{base}/js"


def _resolve(page: Page) -> Component:
    return page() if callable(page) else page


def tree_json(page: Page) -> str:
    """The authored tree as a JSON string (serve at ``GET {base}/tree.json``)."""
    return json.dumps(_resolve(page).to_node())


def tree_frame(page: Page, *, id: str = "spa-tree") -> bytes:
    """The authored tree as a transports Snapshot frame (serve at ``GET {base}/tree`` for ``tree="frame"``)
    — the same length-prefixed, codec-tagged envelope transports uses for model state, so the UI tree and
    the model data ride one wire."""
    return encode_frame(json.dumps(_resolve(page).to_node()), id, "snapshot", 0, "application/json")


def _bundle_head(bundles: Sequence[str], base: str) -> str:
    tags = []
    for name in bundles:
        if name not in BUNDLES:
            raise ValueError(f"unknown bundle {name!r}; known: {', '.join(sorted(BUNDLES))}")
        for kind, path in BUNDLES[name]:
            url = f"{_js(base)}{path}"
            tags.append(f'<link rel="stylesheet" href="{url}" />' if kind == "css" else f'<script type="module" src="{url}"></script>')
    return "\n    ".join(tags)


def _script(
    base: str,
    wire: Optional[str],
    scripts: Sequence[str],
    ws: str,
    tree: str,
    reconnect: bool,
    store: Optional[dict] = None,
    target: Optional[str] = None,
) -> str:
    """The page's module script: imports, wasm init(s), fetch the tree, then mount — statically, or wired
    to a transports model (Store + Client + connectStore) when ``wire="transports"``. ``store`` seeds a
    local signal ``Store`` (reactive UI state for bindings/actions) even without a wire. Mounts into
    ``target`` (a CSS selector) when given, else ``document.body``."""
    js = _js(base)
    into = f'document.querySelector("{target}")' if target else "document.body"
    transports = wire == "transports"
    frame = tree == "frame"
    store_init = f"new Store({json.dumps(store)})" if store else "new Store()"
    runtime_names = (
        ["mount", "init"]
        + (["Store"] if (transports or store) else [])
        + (["connectStore"] if transports else [])
        + (["decodeFrame"] if frame else [])
    )
    lines = [f'import {{ {", ".join(runtime_names)} }} from "{js}{_RUNTIME}";']
    if transports:
        lines.append(f'import {{ Client, fromValue, toValue, wasm }} from "{js}{_TRANSPORTS}";')
    lines.extend(f'import "{s}";' for s in scripts)
    lines.append(f'await init({{ module_or_path: "{js}{_WASM}" }});')
    if transports:
        lines.append(f'await wasm.default({{ module_or_path: "{js}{_TRANSPORTS_WASM}" }});')
    if frame:
        lines.append(f'const framed = new Uint8Array(await (await fetch("{base}/tree")).arrayBuffer());')
        lines.append("const node = JSON.parse(decodeFrame(framed)).payload;")
    else:
        lines.append(f'const node = await (await fetch("{base}/tree.json")).json();')
    if transports and reconnect:
        lines.extend(
            [
                f"const store = {store_init};",
                "const client = new Client();",
                "let socket = null;",
                "const link = connectStore(store, client, (frame) => socket && socket.send(frame), { fromValue, toValue });",
                "function connect() {",
                f"  socket = new WebSocket(`ws://${{location.host}}{base}{ws}`);",
                '  socket.binaryType = "arraybuffer";',
                '  socket.addEventListener("message", (event) =>',
                '    link.receive(typeof event.data === "string" ? event.data : new Uint8Array(event.data)),',
                "  );",
                "  socket.addEventListener('close', () => setTimeout(connect, 1000));",
                "}",
                "connect();",
                f"mount({into}, node, store);",
            ]
        )
    elif transports:
        lines.extend(
            [
                f"const store = {store_init};",
                "const client = new Client();",
                f"const ws = new WebSocket(`ws://${{location.host}}{base}{ws}`);",
                'ws.binaryType = "arraybuffer";',
                "const link = connectStore(store, client, (frame) => ws.send(frame), { fromValue, toValue });",
                'ws.addEventListener("message", (event) =>',
                '  link.receive(typeof event.data === "string" ? event.data : new Uint8Array(event.data)),',
                ");",
                f"mount({into}, node, store);",
            ]
        )
    elif store:  # local reactive state (bindings/actions read it), no server wire
        lines.extend([f"const store = {store_init};", f"mount({into}, node, store);"])
    else:
        lines.append(f"mount({into}, node);")
    return "\n      ".join(lines)


def bootstrap(
    *,
    base: str = "",
    bundles: Sequence[str] = (),
    wire: Optional[str] = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
    title: str = "spaday",
    store: Optional[dict] = None,
    fragment: bool = False,
    target: Optional[str] = None,
) -> str:
    """The bootstrap markup (init the wasm core, fetch the tree, mount it). ``base`` prefixes the tree /
    ``/js`` / ws URLs so the page can be mounted under a sub-path. ``store`` seeds a local signal ``Store``
    (reactive UI state for two-way bindings + ``field`` actions) even without a ``wire``.

    By default returns a whole HTML document. With ``fragment=True`` it returns just the bundle tags + the
    module ``<script>`` — a snippet to **drop into a host page's template** (Jinja/Django/…), so spaday is
    one component among many rather than the whole page. Pass ``target`` (a CSS selector) to mount into a
    specific element (e.g. ``"#widget"``) instead of ``document.body``; the host provides that element.
    See the module docstring for the rest of the options and the route contract."""
    head_markup = "\n    ".join(p for p in (_bundle_head(bundles, base), head) if p)
    script = _script(base, wire, scripts, ws, tree, reconnect, store, target)
    if fragment:
        head_block = f"{head_markup}\n" if head_markup else ""
        return f'{head_block}<script type="module">\n  {script}\n</script>\n'
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
