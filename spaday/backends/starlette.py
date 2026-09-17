"""Starlette (and FastAPI, which is Starlette) backend.

- ``mount(app, page, *, prefix="", …)`` — add spaday's routes to an **existing** app, at ``{prefix}/`` ·
  ``{prefix}/tree[.json]`` · ``{prefix}/js`` (so spaday drops into a bigger app, optionally under a
  sub-path). This is the primitive.
- ``build_routes(page, *, prefix="", …)`` — return those routes without changing an app, so a host can
  register them on its own routers.
- ``build_site({"/": PageSpec(page), "/login": PageSpec(login)}, …)`` — build several pages that share
  one component/core asset surface, with page, supplied, and asset routes kept separate.
- ``mount_site(app, pages, …)`` — add a :func:`build_site` result to an existing app.
- ``serve(page, …) -> Starlette`` — create an app (with a lifespan for ``background`` coroutines) and
  ``mount`` onto it.

Starlette is the optional ``examples`` extra; it is imported inside the functions so ``import spaday``
stays light.
"""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable, Mapping, Sequence
from contextlib import asynccontextmanager
from dataclasses import dataclass
from inspect import signature
from pathlib import Path
from typing import TYPE_CHECKING

from ..bootstrap import AssetLayout, Page, TreeMode, Wire, bootstrap, bundles_dir, tree_frame, tree_json
from ..packages import ComponentPackage, PackageRef, package_url_prefix, resolve_component_packages
from ..ui.design import Design, select_design

if TYPE_CHECKING:  # annotations only — starlette is imported inside the functions (optional extra)
    from starlette.applications import Starlette
    from starlette.routing import BaseRoute, Mount, Route


@dataclass(frozen=True)
class PageSpec:
    """One page in :func:`build_site`.

    Fields match :func:`build_routes`' page-generation options. Routes, the core asset directory, and
    the mount prefix belong to the site and are passed to :func:`build_site` instead.
    """

    page: Page
    html: str | Path | None = None
    title: str = "spaday"
    packages: PackageRef | Sequence[PackageRef] = ()
    wire: str | Sequence[dict | Wire] | None = None
    ws: str = "/ws"
    tree: TreeMode = "json"
    reconnect: bool = False
    scripts: Sequence[str] = ()
    stylesheets: Sequence[str] = ()
    styles: Sequence[str] = ()
    head: str = ""
    store: dict | None = None
    nonce: str | None = None
    persist: dict[str, str] | None = None
    url: dict[str, str] | None = None
    design: Design | str | None = None


@dataclass(frozen=True)
class SiteRoutes:
    """Structured routes returned by :func:`build_site`.

    ``pages`` contains generated page and tree endpoints, ``supplied`` contains caller-provided routes,
    and ``assets`` contains public component and core static mounts. The split lets a FastAPI host apply
    dependencies to application routes without putting authentication in front of static assets.
    """

    pages: tuple[Route, ...]
    supplied: tuple[BaseRoute, ...]
    assets: tuple[Mount, ...]

    def all(self) -> list[BaseRoute]:
        """Return all routes in safe mounting order."""
        return [*self.pages, *self.supplied, *self.assets]


def _prefixed(routes: Sequence, prefix: str) -> list:
    """Prefix each supplied ``Route``/``WebSocketRoute`` path with ``prefix`` so it lines up with the wire
    URLs :func:`bootstrap` generates under the same prefix (a ``wire`` ws at ``{prefix}/ws`` must match its
    ``WebSocketRoute``). Other route types (``Mount``/``Host``) pass through — prefix those yourself."""
    from starlette.routing import Route, WebSocketRoute
    from starlette.websockets import WebSocket

    def typed_websocket(endpoint):
        async def typed_endpoint(websocket):
            return await endpoint(websocket)

        typed_endpoint.__annotations__["websocket"] = WebSocket
        typed_endpoint.__name__ = getattr(endpoint, "__name__", typed_endpoint.__name__)
        return typed_endpoint

    out = []
    for r in routes:
        if isinstance(r, WebSocketRoute):
            endpoint = r.endpoint
            if len(signature(endpoint).parameters) == 1:
                endpoint = typed_websocket(endpoint)
            route = WebSocketRoute(f"{prefix}{r.path}", endpoint, name=r.name)
            route.app = r.app  # retain middleware around the supplied route for normal Starlette mounting
            out.append(route)
        elif prefix and isinstance(r, Route):
            out.append(Route(f"{prefix}{r.path}", r.endpoint, methods=r.methods, name=r.name))
        else:
            out.append(r)
    return out


def _page_routes(
    spec: PageSpec,
    *,
    page_path: str,
    tree_path: str | None,
    base: str,
    layout: AssetLayout | None,
    packages: Sequence[ComponentPackage],
    name: str | None = None,
) -> list[Route]:
    from starlette.requests import Request
    from starlette.responses import FileResponse, HTMLResponse, Response
    from starlette.routing import Route

    if spec.tree == "inline" and spec.html is not None:
        raise ValueError("tree='inline' cannot be combined with html= because the generated inline tree would not be served")
    if spec.tree != "inline" and tree_path is None:
        raise ValueError("tree_path is required for JSON and frame trees")

    page_design = select_design(spec.design, packages)
    body = bootstrap(
        base=base,
        packages=packages,
        wire=spec.wire,
        ws=spec.ws,
        tree=spec.tree,
        page=spec.page,
        tree_url=tree_path,
        reconnect=spec.reconnect,
        scripts=spec.scripts,
        stylesheets=spec.stylesheets,
        styles=spec.styles,
        head=spec.head,
        title=spec.title,
        store=spec.store,
        nonce=spec.nonce,
        layout=layout,
        persist=spec.persist,
        url=spec.url,
        design=page_design,
    )

    async def homepage(_request: Request):
        return FileResponse(spec.html) if spec.html is not None else HTMLResponse(body)

    async def tree_route_json(_request: Request):
        return Response(tree_json(spec.page, page_design), media_type="application/json")

    async def tree_route_frame(_request: Request):
        return Response(tree_frame(spec.page, design=page_design), media_type="application/octet-stream")

    # FastAPI resolves endpoint annotations from module globals, while Request is imported lazily here
    # to keep Starlette optional. Store the class itself instead of the postponed "Request" string.
    for endpoint in (homepage, tree_route_json, tree_route_frame):
        endpoint.__annotations__["_request"] = Request

    routes = [Route(page_path, homepage, name=f"spaday:page:{name}" if name is not None else None)]
    if spec.tree == "frame":
        assert tree_path is not None
        routes.append(Route(tree_path, tree_route_frame, name=f"spaday:tree:{name}" if name is not None else None))
    elif spec.tree == "json":
        assert tree_path is not None
        routes.append(Route(tree_path, tree_route_json, name=f"spaday:tree:{name}" if name is not None else None))
    return routes


def build_routes(
    page: Page,
    *,
    prefix: str = "",
    routes: Sequence = (),
    html: str | Path | None = None,
    js: str | Path | None = None,
    layout: AssetLayout | None = None,
    title: str = "spaday",
    packages: PackageRef | Sequence[PackageRef] = (),
    wire: str | Sequence[dict | Wire] | None = None,
    ws: str = "/ws",
    tree: TreeMode = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    stylesheets: Sequence[str] = (),
    styles: Sequence[str] = (),
    head: str = "",
    store: dict | None = None,
    nonce: str | None = None,
    persist: dict[str, str] | None = None,
    url: dict[str, str] | None = None,
    design: Design | str | None = None,
) -> list[BaseRoute]:
    """Build spaday's Starlette routes (page, tree, ``/js``, plus ``routes``) under
    ``prefix``. The supplied ``routes`` are **prefixed too** (a ``Route``/``WebSocketRoute`` at ``/ws``
    becomes ``{prefix}/ws``), so a wired panel's generated ws URL and its endpoint line up — pass the
    *unprefixed* path (``WebSocketRoute("/ws", …)``) and let ``build_routes`` add the prefix. Generation options
    pass to :func:`spaday.bootstrap.bootstrap` (incl. ``store`` and ``nonce``, a CSP nonce for the
    generated scripts); ``html`` serves a hand-authored bootstrap instead; ``js`` overrides the bundle dir.
    The caller may register the returned routes itself, including translating page and websocket routes
    onto a FastAPI router with dependencies, or pass the same options to :func:`mount`."""
    from starlette.routing import Mount
    from starlette.staticfiles import StaticFiles

    asset_layout = layout or ("source" if js is not None else None)
    component_packages = resolve_component_packages(packages)
    js_dir = Path(js) if js is not None else bundles_dir(asset_layout)
    tree_path = None if tree == "inline" else f"{prefix}/tree{'' if tree == 'frame' else '.json'}"
    spec = PageSpec(
        page,
        html=html,
        title=title,
        packages=packages,
        wire=wire,
        ws=ws,
        tree=tree,
        reconnect=reconnect,
        scripts=scripts,
        stylesheets=stylesheets,
        styles=styles,
        head=head,
        store=store,
        nonce=nonce,
        persist=persist,
        url=url,
        design=design,
    )
    package_mounts = [Mount(package_url_prefix(package, prefix), StaticFiles(directory=package.assets_dir)) for package in component_packages]
    return [
        *_page_routes(
            spec,
            page_path=f"{prefix}/",
            tree_path=tree_path,
            base=prefix,
            layout=asset_layout,
            packages=component_packages,
        ),
        *_prefixed(routes, prefix),
        *package_mounts,
        Mount(f"{prefix}/js", StaticFiles(directory=js_dir)),
    ]


def _normalize_site_path(path: str, label: str) -> str:
    if not isinstance(path, str) or not path.startswith("/"):
        raise ValueError(f"{label} must start with '/'")
    if "%" in path or "?" in path or "#" in path or any(character.isspace() for character in path):
        raise ValueError(f"{label} cannot contain whitespace, '%', '?' or '#'")
    if "{" in path or "}" in path:
        raise ValueError(f"{label} cannot contain route parameters; build_site requires static page paths")
    parts = path.split("/")
    if any(part in (".", "..") for part in parts):
        raise ValueError(f"{label} cannot contain '.' or '..' segments")
    return "/" + "/".join(part for part in parts if part)


def build_site(
    pages: Mapping[str, Page | PageSpec],
    *,
    prefix: str = "",
    routes: Sequence = (),
    js: str | Path | None = None,
    layout: AssetLayout | None = None,
) -> SiteRoutes:
    """Build a multi-page Starlette site with one shared asset surface.

    ``pages`` maps URL paths to a :class:`PageSpec`; a bare page is shorthand for ``PageSpec(page)``.
    ``"/"`` remains the root route (including its trailing slash), while ``"/login"`` is served without
    one. Each JSON or frame page gets its own tree URL beneath its page path. Package and core assets are
    mounted once under ``prefix``.

    Page paths are static; put parameterized endpoints in ``routes``. Paths are normalized by collapsing
    repeated and trailing slashes. Duplicate normalized paths, generated tree collisions, overlapping
    supplied GET/HEAD routes, and pages under the reserved ``/js`` or ``/components`` asset paths are
    rejected. Supplied POST routes and websockets may share a page URL.
    """
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    if not pages:
        raise ValueError("pages must contain at least one page")
    normalized_prefix = "" if prefix == "" else _normalize_site_path(prefix, "prefix")
    if normalized_prefix == "/":
        normalized_prefix = ""
    asset_layout = layout or ("source" if js is not None else None)
    js_dir = Path(js) if js is not None else bundles_dir(asset_layout)

    normalized_pages: list[tuple[str, PageSpec]] = []
    sources: dict[str, str] = {}
    for source_path, value in pages.items():
        path = _normalize_site_path(source_path, "page path")
        if path in sources:
            raise ValueError(f"page paths {sources[path]!r} and {source_path!r} both normalize to {path!r}")
        if path == "/js" or path.startswith("/js/") or path == "/components" or path.startswith("/components/"):
            raise ValueError(f"page path {source_path!r} conflicts with the site's asset routes")
        sources[path] = source_path
        normalized_pages.append((path, value if isinstance(value, PageSpec) else PageSpec(value)))

    generated_paths: dict[str, str] = {}
    generated_methods: dict[str, set[str]] = {}
    page_tree_paths: list[tuple[str, str | None]] = []
    for path, spec in normalized_pages:
        page_path = f"{normalized_prefix}/" if path == "/" else f"{normalized_prefix}{path}"
        generated_paths[page_path] = f"page {path!r}"
        generated_methods[page_path] = {"GET", "HEAD"}
        tree_path = None
        if spec.tree != "inline":
            tree_path = f"{page_path.rstrip('/')}/tree{'' if spec.tree == 'frame' else '.json'}"
        page_tree_paths.append((page_path, tree_path))

    for (path, _spec), (_page_path, tree_path) in zip(normalized_pages, page_tree_paths):
        if tree_path is None:
            continue
        owner = f"tree for page {path!r}"
        if tree_path in generated_paths:
            raise ValueError(f"{owner} conflicts with {generated_paths[tree_path]}")
        generated_paths[tree_path] = owner
        generated_methods[tree_path] = {"GET", "HEAD"}

    page_routes: list[Route] = []
    packages_by_name: dict[str, ComponentPackage] = {}
    for (path, spec), (page_path, tree_path) in zip(normalized_pages, page_tree_paths):
        component_packages = resolve_component_packages(spec.packages)
        for package in component_packages:
            existing = packages_by_name.get(package.name)
            if existing is not None and existing != package:
                raise ValueError(f"pages select different component package descriptors named {package.name!r}")
            packages_by_name.setdefault(package.name, package)
        page_routes.extend(
            _page_routes(
                spec,
                page_path=page_path,
                tree_path=tree_path,
                base=normalized_prefix,
                layout=asset_layout,
                packages=component_packages,
                name=path,
            )
        )

    supplied = tuple(_prefixed(routes, normalized_prefix))
    asset_paths = [*(package_url_prefix(package, normalized_prefix) for package in packages_by_name.values()), f"{normalized_prefix}/js"]
    for route in supplied:
        if isinstance(route, Route):
            path, methods = route.path, route.methods
            if path in generated_methods and (methods is None or generated_methods[path].intersection(methods)):
                raise ValueError(f"supplied route {path!r} conflicts with {generated_paths[path]}")
            if (methods is None or {"GET", "HEAD"}.intersection(methods)) and any(
                path == asset or path.startswith(f"{asset}/") for asset in asset_paths
            ):
                raise ValueError(f"supplied route {path!r} shadows the site's asset route")
        elif isinstance(route, Mount):
            path = route.path
            if any(not path or asset == path or asset.startswith(f"{path}/") or path.startswith(f"{asset}/") for asset in asset_paths):
                raise ValueError(f"supplied mount {path or '/'} shadows the site's asset route")

    assets: list[Mount] = [
        *(Mount(package_url_prefix(package, normalized_prefix), StaticFiles(directory=package.assets_dir)) for package in packages_by_name.values()),
        Mount(f"{normalized_prefix}/js", StaticFiles(directory=js_dir)),
    ]
    return SiteRoutes(tuple(page_routes), supplied, tuple(assets))


def mount_site(
    app: Starlette,
    pages: Mapping[str, Page | PageSpec],
    *,
    prefix: str = "",
    routes: Sequence = (),
    js: str | Path | None = None,
    layout: AssetLayout | None = None,
) -> Starlette:
    """Add :func:`build_site` routes to an existing Starlette app and return the app."""
    app.routes.extend(build_site(pages, prefix=prefix, routes=routes, js=js, layout=layout).all())
    return app


def mount(
    app: Starlette,
    page: Page,
    *,
    prefix: str = "",
    routes: Sequence = (),
    html: str | Path | None = None,
    js: str | Path | None = None,
    layout: AssetLayout | None = None,
    title: str = "spaday",
    packages: PackageRef | Sequence[PackageRef] = (),
    wire: str | Sequence[dict | Wire] | None = None,
    ws: str = "/ws",
    tree: TreeMode = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    stylesheets: Sequence[str] = (),
    styles: Sequence[str] = (),
    head: str = "",
    store: dict | None = None,
    nonce: str | None = None,
    persist: dict[str, str] | None = None,
    url: dict[str, str] | None = None,
    design: Design | str | None = None,
) -> Starlette:
    """Add :func:`build_routes` to an existing Starlette ``app`` and return the app for chaining.

    The host owns the app's lifespan, so run any ``transports.autosync`` in your own lifespan (see
    ``examples/embed.py``).
    """
    app.routes.extend(
        build_routes(
            page,
            prefix=prefix,
            routes=routes,
            html=html,
            js=js,
            layout=layout,
            title=title,
            packages=packages,
            wire=wire,
            ws=ws,
            tree=tree,
            reconnect=reconnect,
            scripts=scripts,
            stylesheets=stylesheets,
            styles=styles,
            head=head,
            store=store,
            nonce=nonce,
            persist=persist,
            url=url,
            design=design,
        )
    )
    return app


def serve(page: Page, *, background: Sequence[Awaitable] = (), lifespan: Callable | None = None, **opts) -> Starlette:
    """Create a Starlette app and :func:`mount` ``page`` onto it. ``background`` coroutines run for the
    app's lifetime (or pass a custom ``lifespan`` for ordered startup, e.g. a clustering relay); all other
    keyword options are :func:`mount`'s (``prefix``/``routes``/``html``/``js``/``title``/``packages``/
    ``wire``/``ws``/``tree``/``reconnect``/``scripts``/``stylesheets``/``styles``/``head``/``store``/
    ``nonce``/``persist``/``url``)."""
    from starlette.applications import Starlette

    @asynccontextmanager
    async def _background_lifespan(_app):
        tasks = [asyncio.ensure_future(c) for c in background]
        try:
            yield
        finally:
            for task in tasks:
                task.cancel()

    app = Starlette(lifespan=lifespan if lifespan is not None else _background_lifespan)
    return mount(app, page, **opts)
