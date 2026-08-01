"""Framework-agnostic bootstrapping: generate a spaday page's HTML and serialize its tree, with **no
webserver dependency**. Nothing here imports starlette / aiohttp / flask / tornado, so any backend can
serve a spaday app — a backend (see :mod:`spaday.backends`) is just thin glue that wires these into routes.

What an app would otherwise hand-write in HTML is declared in Python:

- ``bundles=["webawesome", …]`` — pull a component library's styles + catalog bundle into ``<head>``
  (see :data:`BUNDLES`), instead of copy-pasting its ``<link>``/``<script>`` tags.
- ``packages=["trees", …]`` — do the same for external component packages selected by descriptor,
  ``module:attribute`` Python path, or installed entry-point name.
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
    GET {base}/components/{package}/* -> a selected component package's assets
    WS  {base}/ws          -> a transports endpoint # only when wire="transports" (the backend/transports owns it)
"""

from __future__ import annotations

import json
from collections.abc import Sequence
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal, Union

from .component import Component
from .packages import ComponentPackage, PackageRef, package_url_prefix, resolve_component_packages
from .spaday import encode_frame  # compiled core (always available); used by tree_frame

#: A page is a built :class:`~spaday.component.Component`, or a zero-arg callable returning one (called
#: per request, so the tree can reflect current state).
Page = Union[Component, "object"]


@dataclass(frozen=True)
class Wire:
    """One transports model wire for a multi-model page — a typed, discoverable alternative to a raw dict
    in ``serve``/``bootstrap`` ``wire=[…]`` (both forms are accepted, mix freely):

    - ``url`` — the websocket endpoint the model is mirrored over (matches a backend ``routes=`` entry).
    - ``namespace`` — mirror the model's fields under ``<namespace>.`` so several models share one signal
      store without colliding (two ``Chart`` models on ``global.*`` / ``session.*``); omit for bare fields.
    - ``session`` — append ``?session=<uuid>`` so the model is a fresh per-page-load tenant (a ``Hub``).
    - ``flatten`` — recurse nested sub-models to dotted ``parent.child`` fields (the default, what a form
      binds); set ``False`` for an opaque map/dict field (a chart's time-keyed ``data``, a Perspective
      ``layout``) so it's mirrored whole.

    ``Wire("/ws", namespace="global", flatten=False)`` reads better than ``{"url": "/ws", …}`` and gives
    editor help; it serializes to exactly that dict.
    """

    url: str
    namespace: str | None = None
    session: bool = False
    flatten: bool = True


AssetLayout = Literal["source", "installed"]

_SOURCE_DIR = Path(__file__).parent.parent / "js"
_EXTENSION_DIR = Path(__file__).parent / "extension"

# Paths under the served ``/js`` mount — prefixed with ``{base}/js`` at build time (see ``_js``).
_ASSETS = {
    "source": {
        "runtime": "/dist/esm/index.js",
        "wasm": "/dist/pkg/spaday_bg.wasm",
        "transports": "/node_modules/@1kbgz/transports/dist/cdn/index.js",
        "transports_wasm": "/node_modules/@1kbgz/transports/dist/pkg/transports_bg.wasm",
    },
    "installed": {
        "runtime": "/cdn/index.js",
        "wasm": "/pkg/spaday_bg.wasm",
        "transports": "/transports/cdn/index.js",
        "transports_wasm": "/transports/pkg/transports_bg.wasm",
    },
}

# A fresh per-page-load id for a ``session=True`` wire's tenant key. ``crypto.randomUUID()`` is
# secure-context-only (https / localhost), so it's undefined over plain http from another host — fall back
# to a non-crypto id so the page still loads. It's only a transports ``Hub`` key, not a secret.
_SESSION_ID = "globalThis.crypto?.randomUUID?.() ?? (Date.now().toString(36) + Math.random().toString(36).slice(2))"

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
}

_INSTALLED_BUNDLES = {
    "webawesome": [
        ("css", "/css/webawesome.css"),
        ("js", "/cdn/examples/webawesome.js"),
    ],
    "lightweight-charts": [("js", "/cdn/wrappers/lightweight-chart.js")],
}


def _layout(layout: AssetLayout | None = None) -> AssetLayout:
    if layout is not None and layout not in _ASSETS:
        raise ValueError("layout must be 'source' or 'installed'")
    return layout or ("source" if _SOURCE_DIR.is_dir() else "installed")


def bundles_dir(layout: AssetLayout | None = None) -> Path:
    """Directory a backend serves at ``{base}/js``.

    Uses the source checkout's ``js/`` directory when present and otherwise the wheel's packaged
    ``spaday/extension`` assets. ``layout`` can force either form, mainly when serving a custom asset
    directory with a backend's ``js=`` option.
    """
    return _SOURCE_DIR if _layout(layout) == "source" else _EXTENSION_DIR


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


def _bundle_head(bundles: Sequence[str], base: str, nonce: str | None = None, layout: AssetLayout | None = None) -> str:
    n = f' nonce="{nonce}"' if nonce else ""  # CSP nonce on the generated script/style tags
    tags = []
    available = BUNDLES if _layout(layout) == "source" else _INSTALLED_BUNDLES
    for name in bundles:
        if name not in available:
            raise ValueError(f"unknown bundle {name!r}; known: {', '.join(sorted(available))}")
        for kind, path in available[name]:
            url = f"{_js(base)}{path}"
            tags.append(f'<link rel="stylesheet"{n} href="{url}" />' if kind == "css" else f'<script type="module"{n} src="{url}"></script>')
    return "\n    ".join(tags)


def _package_head(packages: Sequence[ComponentPackage], base: str, nonce: str | None = None) -> str:
    n = f' nonce="{nonce}"' if nonce else ""
    tags = []
    for package in packages:
        prefix = package_url_prefix(package, base)
        for kind, path in package.assets:
            url = f"{prefix}/{path}"
            tags.append(f'<link rel="stylesheet"{n} href="{url}" />' if kind == "css" else f'<script type="module"{n} src="{url}"></script>')
    return "\n    ".join(tags)


def _wire_block(spec: dict, base: str, idx: int) -> list:
    """The generated JS for ONE wire spec in a multi-model page: a transports ``Client``, a namespaced
    ``connectStore`` into the shared ``store``, the ``WebSocket`` feeding it, and a ``<namespace>.connected``
    flag set on open/close (so a status element can ``compute`` from it). The shared ``const store`` must
    already be declared. A spec is ``{"url": …, "namespace"?: …, "session"?: bool}``: ``namespace`` keeps
    several models from colliding in the one store (omit it to mirror bare fields, e.g. a form); ``session``
    appends ``?session=<uuid>`` so the model is a fresh per-load tenant (a transports ``Hub``)."""
    url = spec["url"]
    ns = spec.get("namespace")
    client, sock, link = f"client{idx}", f"ws{idx}", f"link{idx}"
    # connectStore's optional (namespace, flatten) args — positional, so emit only what's needed. flatten
    # defaults true (recurse sub-models, e.g. a form's nested schedule); a model with an opaque map/dict
    # field (a chart's `data`, a Perspective layout) sets "flatten": False so it's mirrored whole.
    if spec.get("flatten", True):
        extra = f", {json.dumps(ns)}" if ns else ""
    else:
        extra = f", {json.dumps(ns) if ns else 'undefined'}, false"
    session = "?session=${" + _SESSION_ID + "}" if spec.get("session") else ""  # a fresh tenant per page load
    lines = [
        f"const {client} = new Client();",
        f"const {sock} = new WebSocket(`ws://${{location.host}}{base}{url}{session}`);",
        f'{sock}.binaryType = "arraybuffer";',
        f"const {link} = connectStore(store, {client}, (frame) => {sock}.send(frame), {{ fromValue, toValue }}{extra});",
        f'{sock}.addEventListener("message", (event) =>',
        f'  {link}.receive(typeof event.data === "string" ? event.data : new Uint8Array(event.data)),',
        ");",
    ]
    if ns:  # a status element can compute from `<ns>.connected`; a bare (form) wire has no status
        lines += [
            f'{sock}.addEventListener("open", () => store.set({json.dumps(ns + ".connected")}, true));',
            f'{sock}.addEventListener("close", () => store.set({json.dumps(ns + ".connected")}, false));',
        ]
    return lines


def _script(
    base: str,
    wire: str | Sequence[dict | Wire] | None,
    scripts: Sequence[str],
    ws: str,
    tree: str,
    reconnect: bool,
    store: dict | None = None,
    target: str | None = None,
    layout: AssetLayout | None = None,
) -> str:
    """The page's module script: imports, wasm init(s), fetch the tree, then mount — statically, or wired
    to transports. ``wire="transports"`` mirrors ONE model into the store (Store + Client + connectStore);
    a ``wire=[{…}, …]`` LIST mirrors SEVERAL models into one store, each under its own namespace (see
    :func:`_wire_block`), with one ``spaday:patch`` sink routing :class:`~spaday.actions.SendPatch` intents
    into the store. ``store`` seeds local signal state even without a wire. Mounts into ``target`` (a CSS
    selector) when given, else ``document.body``. (``ws``/``reconnect``/``tree="frame"`` apply to the
    single-model string form only; a wire list carries each spec's own url and uses a snapshot per socket.)"""
    js = _js(base)
    assets = _ASSETS[_layout(layout)]
    into = f'document.querySelector("{target}")' if target else "document.body"
    transports = wire == "transports"
    # a wire LIST may mix Wire instances and raw dicts — normalize each to the dict the codegen consumes
    wires = [asdict(w) if isinstance(w, Wire) else w for w in wire] if isinstance(wire, (list, tuple)) else None
    wired = transports or bool(wires)  # any transports wiring — a single string model or a list of specs
    frame = tree == "frame"
    store_init = f"new Store({json.dumps(store)})" if store else "new Store()"
    runtime_names = (
        ["mount", "init"] + (["Store"] if (wired or store) else []) + (["connectStore"] if wired else []) + (["decodeFrame"] if frame else [])
    )
    lines = [f'import {{ {", ".join(runtime_names)} }} from "{js}{assets["runtime"]}";']
    if wired:
        lines.append(f'import {{ Client, fromValue, toValue, wasm }} from "{js}{assets["transports"]}";')
    lines.extend(f'import "{s}";' for s in scripts)
    lines.append(f'await init({{ module_or_path: "{js}{assets["wasm"]}" }});')
    if wired:
        lines.append(f'await wasm.default({{ module_or_path: "{js}{assets["transports_wasm"]}" }});')
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
    elif wires:  # several models share ONE store, each mirrored under its own namespace (see _wire_block)
        lines.append(f"const store = {store_init};")
        for i, spec in enumerate(wires):
            lines.extend(_wire_block(spec, base, i))
        # a SendPatch fires `spaday:patch {model, field, value}`; route it into the namespaced store so the
        # matching connectStore subscriber sends the edit (an empty model writes the bare field).
        lines.append(
            'document.addEventListener("spaday:patch", (event) => store.set('
            'event.detail.model ? event.detail.model + "." + event.detail.field : event.detail.field, '
            "event.detail.value));"
        )
        lines.append(f"mount({into}, node, store);")
    elif store:  # local reactive state (bindings/actions read it), no server wire
        lines.extend([f"const store = {store_init};", f"mount({into}, node, store);"])
    else:
        lines.append(f"mount({into}, node);")
    return "\n      ".join(lines)


def bootstrap(
    *,
    base: str = "",
    bundles: Sequence[str] = (),
    packages: PackageRef | Sequence[PackageRef] = (),
    wire: str | Sequence[dict | Wire] | None = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
    title: str = "spaday",
    store: dict | None = None,
    fragment: bool = False,
    target: str | None = None,
    nonce: str | None = None,
    layout: AssetLayout | None = None,
) -> str:
    """The bootstrap markup (init the wasm core, fetch the tree, mount it). ``base`` prefixes the tree /
    ``/js`` / ws URLs so the page can be mounted under a sub-path. ``store`` seeds a local signal ``Store``
    (reactive UI state for two-way bindings + ``field`` actions) even without a ``wire``.

    ``wire="transports"`` mirrors one model into the store over a websocket; ``wire=[{"url": …,
    "namespace": …, "session": …}, …]`` mirrors **several** models into one store, each namespaced so their
    fields don't collide (a chart on ``global.*`` next to one on ``session.*``) — the multi-model page.

    By default returns a whole HTML document. With ``fragment=True`` it returns just the bundle tags + the
    module ``<script>`` — a snippet to **drop into a host page's template** (Jinja/Django/…), so spaday is
    one component among many rather than the whole page. Pass ``target`` (a CSS selector) to mount into a
    specific element (e.g. ``"#widget"``) instead of ``document.body``; the host provides that element.
    ``nonce`` stamps the generated ``<script>``/``<link>`` tags with a CSP nonce, so a host with a strict
    ``script-src``/``style-src`` policy can allow the snippet. See the module docstring for the rest of the
    options and the route contract. ``packages`` selects external :class:`~spaday.packages.ComponentPackage`
    descriptors directly, by ``module:attribute`` path, or by installed entry-point name. ``layout``
    selects source-checkout or installed-wheel asset URLs; by default it follows :func:`bundles_dir`."""
    n = f' nonce="{nonce}"' if nonce else ""
    component_packages = resolve_component_packages(packages)
    head_markup = "\n    ".join(p for p in (_bundle_head(bundles, base, nonce, layout), _package_head(component_packages, base, nonce), head) if p)
    script = _script(base, wire, scripts, ws, tree, reconnect, store, target, layout)
    if fragment:
        head_block = f"{head_markup}\n" if head_markup else ""
        return f'{head_block}<script type="module"{n}>\n  {script}\n</script>\n'
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {head_markup}
  </head>
  <body>
    <script type="module"{n}>
      {script}
    </script>
  </body>
</html>
"""
