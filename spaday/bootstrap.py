"""Framework-agnostic bootstrapping: generate a spaday page's HTML and serialize its tree, with **no
webserver dependency**. Nothing here imports starlette / aiohttp / flask / tornado, so any backend can
serve a spaday app — a backend (see :mod:`spaday.backends`) is just thin glue that wires these into routes.

What an app would otherwise hand-write in HTML is declared in Python:

- ``packages=["trees", …]`` — pull a component package's styles and registration bundle into ``<head>``, selected by descriptor,
  ``module:attribute`` Python path, or installed entry-point name.
- ``wire="transports"`` — generate the default transports ``Client`` + ``connectStore`` + WebSocket
  bootstrap; pass a :class:`Wire` (or a list) for connection options.
- ``tree="frame"`` — fetch the tree as a transports Snapshot frame at ``…/tree`` (UI tree + model data on
  one wire), decoded in the browser, instead of JSON at ``…/tree.json``.
- ``tree="inline"`` — embed a static tree in the bootstrap markup, with no tree route or request.
- ``reconnect=True`` — re-open the websocket on drop, re-syncing from the server snapshot.
- ``scripts=[…]`` — extra ES-module URLs to load (e.g. ``NamedJs`` handlers).
- ``stylesheets=[…]`` / ``styles=[…]`` — extra ``<link rel="stylesheet">`` URLs / inline ``<style>``
  blocks in ``<head>``, stamped with ``nonce`` like every generated tag (unlike raw ``head`` markup).
- ``base="/dashboard"`` — mount the app under a path prefix, so it coexists with the host's other routes
  (the tree / ``/js`` / ws URLs are all prefixed). Default ``""`` = served at the root.
- ``fragment=True`` + ``target="#widget"`` — return just the package tags + the module ``<script>`` (not a
  whole document), mounting into ``target`` — a snippet to drop into a host page's template, so spaday is
  one component among many (several roots can share a page).

**The contract a backend must satisfy** — the generated HTML expects the host to serve, at these paths
(``{base}`` is the prefix, default empty)::

    GET {base}/            -> bootstrap(...)        # this HTML
    GET {base}/tree.json   -> tree_json(page)       # or GET {base}/tree -> tree_frame(page) when tree="frame";
                                                    # neither route is needed when tree="inline"
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
from .packages import ComponentPackage, PackageRef, npm_package, package_url_prefix, resolve_component_packages
from .spaday import encode_frame  # compiled core (always available); used by tree_frame
from .ui.design import Design, _select_page_design, resolve, select_design

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
    - ``codec`` — the transports connection codec (``"json"``, ``"msgpack"``, ``"cbor"``, or a
      registered custom codec).
    - ``batch`` — ask the server to batch outbound messages for this connection.
    - ``reconnect`` — keep reconnecting with transports' managed ``Client.run``. This is opt-in for
      each wire; ``retry`` is the delay in milliseconds and ``authority`` selects server- or
      client-authoritative recovery.
    - ``connected`` — publish a connection-ready boolean to this exact store field. Namespaced wires
      default to ``<namespace>.connected``; bare wires publish no status unless this is set. The field
      becomes true when the managed WebSocket opens, including a reconnect that replays no model frame.

    ``Wire("/ws", namespace="global", flatten=False)`` reads better than ``{"url": "/ws", …}`` and gives
    editor help; it serializes to exactly that dict.
    """

    url: str
    namespace: str | None = None
    session: bool = False
    flatten: bool = True
    codec: str = "json"
    batch: bool = False
    reconnect: bool = False
    retry: int = 1000
    authority: Literal["server", "client"] = "server"
    connected: str | None = None

    def __post_init__(self) -> None:
        if not self.url:
            raise ValueError("Wire url must not be empty")
        if not self.codec:
            raise ValueError("Wire codec must not be empty")
        if not isinstance(self.retry, int) or isinstance(self.retry, bool) or self.retry <= 0:
            raise ValueError("Wire retry must be a positive integer number of milliseconds")
        if self.authority not in ("server", "client"):
            raise ValueError("Wire authority must be 'server' or 'client'")
        if self.connected == "":
            raise ValueError("Wire connected field must not be empty")


@dataclass(frozen=True)
class Js:
    """A client-evaluated JavaScript expression, usable as a ``store`` seed value.

    A plain ``store`` seed is a JSON literal fixed at page build, so it cannot express state only the
    browser knows. A ``Js`` value is emitted verbatim (parenthesized) into the generated module script
    and evaluated once at boot, before the tree mounts::

        store={"dark": Js('matchMedia("(prefers-color-scheme: dark)").matches')}

    The expression is app-authored code, trusted exactly like ``head``/``scripts``, and runs under the
    page's CSP nonce with the rest of the module script.
    """

    code: str


def _script_json(value, **kwargs) -> str:
    """A JSON value safe inside an inline ``<script>`` element."""
    return json.dumps(value, **kwargs).replace("<", "\\u003c")


def _store_literal(value) -> str:
    """Serialize a ``store`` seed to a JS object literal, inlining :class:`Js` expressions.

    Matches ``json.dumps`` output exactly for plain data, so a seed with no ``Js`` values renders
    byte-identically to the previous JSON encoding.
    """
    if isinstance(value, Js):
        return f"({value.code})"
    if isinstance(value, dict):
        return "{" + ", ".join(f"{_script_json(str(k))}: {_store_literal(v)}" for k, v in value.items()) + "}"
    if isinstance(value, (list, tuple)):
        return "[" + ", ".join(_store_literal(v) for v in value) + "]"
    return _script_json(value)


AssetLayout = Literal["source", "installed"]
TreeMode = Literal["json", "frame", "inline"]

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


def _layout(layout: AssetLayout | None = None) -> AssetLayout:
    if layout is not None and layout not in _ASSETS:
        raise ValueError("layout must be 'source' or 'installed'")
    return layout or ("source" if _is_source_checkout() else "installed")


def _is_source_checkout() -> bool:
    # Distinguish spaday's own js/ checkout from an unrelated sibling `js` dir — notably plotly's
    # labextension data, which lands at top-level site-packages/js next to an installed spaday and
    # would otherwise force source-layout URLs that 404. Other distributions can ship a
    # js/package.json too, so require spaday's own sentinels: built bundles under js/dist and a
    # package.json naming the spaday package.
    if not (_SOURCE_DIR / "dist").is_dir():
        return False
    try:
        return json.loads((_SOURCE_DIR / "package.json").read_text(encoding="utf-8")).get("name") == "@1kbgz/spaday"
    except (OSError, ValueError):
        return False


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


def tree_node(page: Page, design: Design | str | None = None) -> dict:
    """The authored tree as a node dict, its generic controls (:mod:`spaday.ui`) rendered by
    ``design`` — a :class:`~spaday.ui.design.Design`, ``"native"``, or ``None`` for the native
    baseline. A backend passes the design it chose from the page's packages."""
    return resolve(_resolve(page).to_node(), select_design(design))


def tree_json(page: Page, design: Design | str | None = None) -> str:
    """The authored tree as a JSON string (serve at ``GET {base}/tree.json``)."""
    return json.dumps(tree_node(page, design))


def tree_frame(page: Page, *, id: str = "spa-tree", design: Design | str | None = None) -> bytes:
    """The authored tree as a transports Snapshot frame (serve at ``GET {base}/tree`` for ``tree="frame"``)
    — the same length-prefixed, codec-tagged envelope transports uses for model state, so the UI tree and
    the model data ride one wire."""
    return encode_frame(json.dumps(tree_node(page, design)), id, "snapshot", 0, "application/json")


def _package_head(packages: Sequence[ComponentPackage], base: str, nonce: str | None = None) -> str:
    n = f' nonce="{nonce}"' if nonce else ""
    tags = []
    for package in packages:
        prefix = package_url_prefix(package, base)
        for kind, path in package.assets:
            url = f"{prefix}/{path}"
            tags.append(f'<link rel="stylesheet"{n} href="{url}" />' if kind == "css" else f'<script type="module"{n} src="{url}"></script>')
    return "\n    ".join(tags)


def _importmap(packages: Sequence[ComponentPackage], base: str, nonce: str | None = None) -> str:
    """The page's import map: every specifier a selected package publishes, resolved to the URL that
    package is served from.

    Must precede every module script on the page, which is why it is emitted first -- a map that
    arrives after the first module load is ignored by the browser, silently. Two packages publishing
    the same specifier at different URLs is an error naming both, since picking one silently is the
    ambiguity ``imports`` exists to remove -- unless both declare they serve the same version of the
    library it belongs to, in which case the two copies are interchangeable and the first is used.
    Publishing the same specifier at the same URL is fine.
    """
    resolved: dict[str, str] = {}
    owners: dict[str, ComponentPackage] = {}
    for package in packages:
        prefix = package_url_prefix(package, base)
        for specifier, path in package.imports:
            url = f"{prefix}/{path}"
            if specifier in resolved and resolved[specifier] != url:
                version = dict(package.provides).get(npm_package(specifier))
                if version is not None and version == dict(owners[specifier].provides).get(npm_package(specifier)):
                    continue  # the same version of the library: serve the first copy
                raise ValueError(
                    f"component packages {owners[specifier].name!r} and {package.name!r} both publish the import "
                    f"{specifier!r} at different URLs ({resolved[specifier]} and {url}); select only one of them, "
                    f"or override the packages so a single copy is published"
                )
            resolved[specifier] = url
            owners[specifier] = package
    if not resolved:
        return ""
    n = f' nonce="{nonce}"' if nonce else ""
    body = _script_json({"imports": resolved}, indent=2, sort_keys=True)
    return f'<script type="importmap"{n}>\n{body}\n</script>'


def _wire_block(spec: dict, base: str, idx: int) -> list:
    """Generate one managed transports client and connect it to the shared store."""
    url = spec["url"]
    ns = spec.get("namespace")
    client = f"client{idx}"
    # connectStore's optional (namespace, flatten) args — positional, so emit only what's needed. flatten
    # defaults true (recurse sub-models, e.g. a form's nested schedule); a model with an opaque map/dict
    # field (a chart's `data`, a Perspective layout) sets "flatten": False so it's mirrored whole.
    if spec.get("flatten", True):
        extra = f", {_script_json(ns)}" if ns else ""
    else:
        extra = f", {_script_json(ns) if ns else 'undefined'}, false"
    params = []
    if spec.get("session"):
        params.append("session=${" + _SESSION_ID + "}")  # a fresh tenant per page load
    if spec.get("batch"):
        params.append("batch=1")
    query = ("&" if "?" in url else "?") + "&".join(params) if params else ""
    target = f"`ws://${{location.host}}{base}{url}{query}`"
    codec = _script_json(spec.get("codec", "json"))
    lines = [
        f"const {client} = new Client({codec});",
        f"connectStore(store, {client}, undefined, {{ fromValue, toValue }}{extra});",
        f'document.dispatchEvent(new CustomEvent("spaday:wire-client", {{ detail: {{ client: {client}, store, namespace: {_script_json(ns)}, url: {_script_json(url)} }} }}));',
    ]
    connected = spec.get("connected") or (f"{ns}.connected" if ns else None)
    if connected:
        lines += [
            f"store.set({_script_json(connected)}, false);",
            f"{client}.onConnect(() => store.set({_script_json(connected)}, true));",
            f"{client}.onDisconnect(() => store.set({_script_json(connected)}, false));",
        ]
    if spec.get("reconnect"):
        options = _script_json({"authority": spec.get("authority", "server"), "retry": spec.get("retry", 1000)})
        lines.append(f"{client}.run({target}, {options});")
    else:
        lines.append(f"{client}.connect({target});")
    return lines


def _script(
    base: str,
    wire: str | dict | Wire | Sequence[dict | Wire] | None,
    scripts: Sequence[str],
    ws: str,
    tree: TreeMode,
    tree_url: str,
    inline_tree: dict | None,
    reconnect: bool,
    store: dict | None = None,
    target: str | None = None,
    layout: AssetLayout | None = None,
    persist: dict[str, str] | None = None,
    url: dict[str, str] | None = None,
) -> str:
    """The page's module script: imports, wasm init(s), fetch the tree, then mount — statically, or wired
    to transports. ``wire="transports"`` mirrors one model with default settings; a :class:`Wire` or list
    configures one or more managed clients (see :func:`_wire_block`). All configured clients share one
    ``spaday:patch`` sink that routes :class:`~spaday.actions.SendPatch` intents into the store. ``store``
    seeds local signal state even without a wire; ``persist`` (field ->
    localStorage key) overrides a field's seed with its persisted value at boot and stores later writes;
    ``url`` (field -> query parameter) does the same against the page URL, with history entries.
    Mounts into ``target`` (a CSS selector) when given, else ``document.body``. (``ws``/``reconnect``/
    ``tree="frame"`` apply to the single-model string form only; a typed wire carries its own URL and
    uses a snapshot on that connection.)"""
    js = _js(base)
    assets = _ASSETS[_layout(layout)]
    into = f'document.querySelector("{target}")' if target else "document.body"
    transports = wire == "transports"
    # Raw dicts follow the same validation as Wire rather than silently ignoring bad options.
    if isinstance(wire, (Wire, dict)):
        wires = [asdict(wire if isinstance(wire, Wire) else Wire(**wire))]
    elif isinstance(wire, (list, tuple)):
        wires = [asdict(w if isinstance(w, Wire) else Wire(**w)) for w in wire]
    else:
        wires = None
    wired = transports or bool(wires)  # any transports wiring — a single string model or a list of specs
    frame = tree == "frame"
    inline = tree == "inline"
    store_init = f"new Store({_store_literal(store)})" if store else "new Store()"
    # `persist` wiring sits right after the store's creation: the localStorage override lands before
    # the mount (and before any transports sync), so the tree renders with the persisted value; the
    # subscribe stores every later write. Both sides are guarded — storage may be unavailable.
    store_lines = [f"const store = {store_init};"]
    for field_name, storage_key in (persist or {}).items():
        f_js, k_js = _script_json(str(field_name)), _script_json(str(storage_key))
        store_lines.append(f"try {{ const v = localStorage.getItem({k_js}); if (v !== null) store.set({f_js}, JSON.parse(v)); }} catch {{}}")
        store_lines.append(f"store.subscribe({f_js}, (v) => {{ try {{ localStorage.setItem({k_js}, JSON.stringify(v)); }} catch {{}} }});")
    # `url` seeds after `persist`: a deep link beats a remembered preference
    if url:
        store_lines.append(f"bindUrl(store, {_script_json({str(k): str(v) for k, v in url.items()})});")
    # the refresh action's re-fetch source: frame and inline pages have no JSON tree URL, so
    # `RefreshTree` there requires an explicit url
    refresh_url = '""' if frame or inline else _script_json(tree_url)
    runtime_names = (
        ["mount", "init", "trackRoot"]
        + (["Store"] if (wired or store or persist or url) else [])
        + (["bindUrl"] if url else [])
        + (["connectStore"] if wired else [])
        + (["decodeFrame"] if frame else [])
    )
    lines = [f'import {{ {", ".join(runtime_names)} }} from "{js}{assets["runtime"]}";']
    if wired:
        lines.append(f'import {{ Client, fromValue, toValue, wasm }} from "{js}{assets["transports"]}";')
    if scripts:
        # dynamic + caught, not `import "…"`: a static import of a third-party bundle that throws
        # while registering (two copies of one custom element, say) aborts this module before
        # `mount`, and the page renders nothing at all. Awaited here, so handlers are still
        # registered before the tree mounts; a failure costs that one script, not the page.
        urls = ", ".join(_script_json(script) for script in scripts)
        lines.append(
            f"await Promise.all([{urls}].map((u) => import(u).catch((e) => console.error(`spaday: extra script ${{u}} failed to load`, e))));"
        )
    lines.append(f'await init({{ module_or_path: "{js}{assets["wasm"]}" }});')
    if wired:
        lines.append(f'await wasm.default({{ module_or_path: "{js}{assets["transports_wasm"]}" }});')
    if frame:
        lines.append(f"const framed = new Uint8Array(await (await fetch({_script_json(tree_url)})).arrayBuffer());")
        lines.append("const node = JSON.parse(decodeFrame(framed)).payload;")
    elif inline:
        lines.append(f"const node = {_script_json(inline_tree)};")
    else:
        lines.append(f"const node = await (await fetch({_script_json(tree_url)})).json();")
    if transports and reconnect:
        lines.extend(
            [
                *store_lines,
                "const client = new Client();",
                "connectStore(store, client, undefined, { fromValue, toValue });",
                f'document.dispatchEvent(new CustomEvent("spaday:wire-client", {{ detail: {{ client, store, namespace: null, url: {_script_json(ws)} }} }}));',
                f"client.run(`ws://${{location.host}}{base}{ws}`, {{ retry: 1000 }});",
                f"trackRoot(mount({into}, node, store), node, {refresh_url}, store);",
            ]
        )
    elif transports:
        lines.extend(
            [
                *store_lines,
                "const client = new Client();",
                "connectStore(store, client, undefined, { fromValue, toValue });",
                f'document.dispatchEvent(new CustomEvent("spaday:wire-client", {{ detail: {{ client, store, namespace: null, url: {_script_json(ws)} }} }}));',
                f"client.connect(`ws://${{location.host}}{base}{ws}`);",
                f"trackRoot(mount({into}, node, store), node, {refresh_url}, store);",
            ]
        )
    elif wires:  # several models share ONE store, each mirrored under its own namespace (see _wire_block)
        lines.extend(store_lines)
        for i, spec in enumerate(wires):
            lines.extend(_wire_block(spec, base, i))
        # a SendPatch fires `spaday:patch {model, field, value}`; route it into the namespaced store so the
        # matching connectStore subscriber sends the edit (an empty model writes the bare field).
        lines.append(
            'document.addEventListener("spaday:patch", (event) => store.set('
            'event.detail.model ? event.detail.model + "." + event.detail.field : event.detail.field, '
            "event.detail.value));"
        )
        lines.append(f"trackRoot(mount({into}, node, store), node, {refresh_url}, store);")
    elif store or persist or url:  # local reactive state (bindings/actions read it), no server wire
        lines.extend([*store_lines, f"trackRoot(mount({into}, node, store), node, {refresh_url}, store);"])
    else:
        lines.append(f"trackRoot(mount({into}, node), node, {refresh_url});")
    return "\n      ".join(lines)


def bootstrap(
    *,
    base: str = "",
    packages: PackageRef | Sequence[PackageRef] = (),
    wire: str | dict | Wire | Sequence[dict | Wire] | None = None,
    ws: str = "/ws",
    tree: TreeMode = "json",
    page: Page | None = None,
    tree_url: str | None = None,
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    stylesheets: Sequence[str] = (),
    styles: Sequence[str] = (),
    head: str = "",
    title: str = "spaday",
    store: dict | None = None,
    fragment: bool = False,
    target: str | None = None,
    nonce: str | None = None,
    layout: AssetLayout | None = None,
    persist: dict[str, str] | None = None,
    url: dict[str, str] | None = None,
    design: Design | str | None = None,
) -> str:
    """The bootstrap markup (init the wasm core, fetch the tree, mount it). ``base`` prefixes the tree /
    ``/js`` / ws URLs so the page can be mounted under a sub-path. ``store`` seeds a local signal ``Store``
    (reactive UI state for two-way bindings + ``field`` actions) even without a ``wire``. ``persist`` maps
    store fields to localStorage keys: a persisted value overrides the field's seed at boot (before the
    tree mounts) and every later write to the field is stored, so per-browser preferences (a theme toggle,
    a chosen view) survive reloads. ``url`` maps store fields to query parameters the same way, against
    the page URL: a parameter seeds its field at boot (after ``persist`` — a deep link beats a remembered
    preference), every later change pushes a history entry, and back/forward write the field back — so
    what the user is looking at is linkable, bookmarkable, and survives a reload, and a ``Switch`` on a
    bound field is a router. Strings ride the URL verbatim; a field seeded with another type JSON-encodes
    and reads back as JSON; ``None``/``""`` clears the parameter.

    ``wire="transports"`` mirrors one model with the default connection settings. A :class:`Wire`
    configures one connection; a list mirrors **several** models into one store, each namespaced so their
    fields don't collide (a chart on ``global.*`` next to one on ``session.*``).

    By default returns a whole HTML document. With ``fragment=True`` it returns just the package tags + the
    module ``<script>`` — a snippet to **drop into a host page's template** (Jinja/Django/…), so spaday is
    one component among many rather than the whole page. Pass ``target`` (a CSS selector) to mount into a
    specific element (e.g. ``"#widget"``) instead of ``document.body``; the host provides that element.
    ``nonce`` stamps the generated ``<script>``/``<link>``/``<style>`` tags with a CSP nonce, so a host
    with a strict ``script-src``/``style-src`` policy can allow the snippet. ``stylesheets`` adds
    ``<link rel="stylesheet">`` URLs and ``styles`` inline ``<style>`` blocks to ``<head>`` — both
    nonce-stamped, unlike raw ``head`` markup, which is concatenated verbatim. See the module docstring
    for the rest of the options and the route contract. ``packages`` selects external :class:`~spaday.packages.ComponentPackage`
    descriptors directly, by ``module:attribute`` path, or by installed entry-point name. ``tree="inline"``
    requires ``page`` and embeds its current tree directly in the module script; callable pages are
    evaluated once when this markup is built. ``design`` selects how that inline page resolves generic
    controls; JSON and frame modes apply their design when the separate tree route serializes the page.
    ``tree_url`` overrides the JSON or frame fetch URL without changing the asset and websocket ``base``;
    inline trees reject it because they perform no initial tree fetch.
    ``layout`` selects source-checkout or installed-wheel asset URLs; by default it follows
    :func:`bundles_dir`."""
    if tree not in ("json", "frame", "inline"):
        raise ValueError(f"tree must be 'json', 'frame', or 'inline', not {tree!r}")
    n = f' nonce="{nonce}"' if nonce else ""
    component_packages = resolve_component_packages(packages)
    if tree == "inline" and page is None:
        raise ValueError("tree='inline' requires page")
    if tree == "inline" and tree_url is not None:
        raise ValueError("tree_url cannot be used with tree='inline'")
    if tree_url == "":
        raise ValueError("tree_url must not be empty")
    typed_wires = isinstance(wire, (dict, Wire, list, tuple))
    if typed_wires and reconnect:
        raise ValueError("reconnect= applies only to wire='transports'; set reconnect on each Wire instead")
    if typed_wires and ws != "/ws":
        raise ValueError("ws= applies only to wire='transports'; set the URL on each Wire instead")
    resolved_tree_url = tree_url or f"{base}/tree{'' if tree == 'frame' else '.json'}"
    inline_tree = tree_node(page, _select_page_design(design, component_packages, page)) if tree == "inline" else None
    style_tags = [f'<link rel="stylesheet"{n} href="{url}" />' for url in stylesheets]
    style_tags += [f"<style{n}>{css}</style>" for css in styles]
    # the import map must come before any module script, including the packages' own
    head_markup = "\n    ".join(
        p for p in (_importmap(component_packages, base, nonce), _package_head(component_packages, base, nonce), *style_tags, head) if p
    )
    script = _script(base, wire, scripts, ws, tree, resolved_tree_url, inline_tree, reconnect, store, target, layout, persist, url)
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
