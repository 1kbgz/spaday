"""Starlette (and FastAPI, which is Starlette) backend.

- ``mount(app, page, *, prefix="", …)`` — add spaday's routes to an **existing** app, at ``{prefix}/`` ·
  ``{prefix}/tree[.json]`` · ``{prefix}/js`` (so spaday drops into a bigger app, optionally under a
  sub-path). This is the primitive.
- ``build_routes(page, *, prefix="", …)`` — return those routes without changing an app, so a host can
  register them on its own routers.
- ``serve(page, …) -> Starlette`` — create an app (with a lifespan for ``background`` coroutines) and
  ``mount`` onto it.

Starlette is the optional ``examples`` extra; it is imported inside the functions so ``import spaday``
stays light.
"""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable, Sequence
from contextlib import asynccontextmanager
from inspect import signature
from pathlib import Path
from typing import TYPE_CHECKING

from ..bootstrap import AssetLayout, Page, TreeMode, Wire, bootstrap, bundles_dir, tree_frame, tree_json
from ..packages import PackageRef, package_url_prefix, resolve_component_packages
from ..ui.design import Design, select_design

if TYPE_CHECKING:  # annotations only — starlette is imported inside the functions (optional extra)
    from starlette.applications import Starlette
    from starlette.routing import BaseRoute


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
    from starlette.requests import Request
    from starlette.responses import FileResponse, HTMLResponse, Response
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    if tree == "inline" and html is not None:
        raise ValueError("tree='inline' cannot be combined with html= because the generated inline tree would not be served")

    asset_layout = layout or ("source" if js is not None else None)
    component_packages = resolve_component_packages(packages)
    page_design = select_design(design, component_packages)
    body = bootstrap(
        base=prefix,
        packages=component_packages,
        wire=wire,
        ws=ws,
        tree=tree,
        page=page,
        reconnect=reconnect,
        scripts=scripts,
        stylesheets=stylesheets,
        styles=styles,
        head=head,
        title=title,
        store=store,
        nonce=nonce,
        layout=asset_layout,
        persist=persist,
        url=url,
        design=page_design,
    )
    js_dir = Path(js) if js is not None else bundles_dir(asset_layout)

    async def homepage(_request: Request):
        return FileResponse(html) if html is not None else HTMLResponse(body)

    async def tree_route_json(_request: Request):
        return Response(tree_json(page, page_design), media_type="application/json")

    async def tree_route_frame(_request: Request):
        return Response(tree_frame(page, design=page_design), media_type="application/octet-stream")

    # FastAPI resolves endpoint annotations from module globals, while Request is imported lazily here
    # to keep Starlette optional. Store the class itself instead of the postponed "Request" string.
    for endpoint in (homepage, tree_route_json, tree_route_frame):
        endpoint.__annotations__["_request"] = Request

    tree_routes = (
        [] if tree == "inline" else [Route(f"{prefix}/tree", tree_route_frame) if tree == "frame" else Route(f"{prefix}/tree.json", tree_route_json)]
    )
    package_mounts = [Mount(package_url_prefix(package, prefix), StaticFiles(directory=package.assets_dir)) for package in component_packages]
    return [
        Route(f"{prefix}/", homepage),
        *tree_routes,
        *_prefixed(routes, prefix),
        *package_mounts,
        Mount(f"{prefix}/js", StaticFiles(directory=js_dir)),
    ]


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
