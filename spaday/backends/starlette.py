"""Starlette (and FastAPI, which is Starlette) backend.

- ``mount(app, page, *, prefix="", …)`` — add spaday's routes to an **existing** app, at ``{prefix}/`` ·
  ``{prefix}/tree[.json]`` · ``{prefix}/js`` (so spaday drops into a bigger app, optionally under a
  sub-path). This is the primitive.
- ``serve(page, …) -> Starlette`` — create an app (with a lifespan for ``background`` coroutines) and
  ``mount`` onto it.

Starlette is the optional ``examples`` extra; it is imported inside the functions so ``import spaday``
stays light.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Callable, Optional, Sequence, Union

from ..bootstrap import AssetLayout, Page, Wire, bootstrap, bundles_dir, tree_frame, tree_json
from ..packages import PackageRef, package_url_prefix, resolve_component_packages

if TYPE_CHECKING:  # annotations only — starlette is imported inside the functions (optional extra)
    from starlette.applications import Starlette


def _prefixed(routes: Sequence, prefix: str) -> list:
    """Prefix each supplied ``Route``/``WebSocketRoute`` path with ``prefix`` so it lines up with the wire
    URLs :func:`bootstrap` generates under the same prefix (a ``wire`` ws at ``{prefix}/ws`` must match its
    ``WebSocketRoute``). Other route types (``Mount``/``Host``) pass through — prefix those yourself."""
    if not prefix:
        return list(routes)
    from starlette.routing import Route, WebSocketRoute

    out = []
    for r in routes:
        if isinstance(r, WebSocketRoute):
            out.append(WebSocketRoute(f"{prefix}{r.path}", r.endpoint, name=r.name))
        elif isinstance(r, Route):
            out.append(Route(f"{prefix}{r.path}", r.endpoint, methods=r.methods, name=r.name))
        else:
            out.append(r)
    return out


def mount(
    app: Starlette,
    page: Page,
    *,
    prefix: str = "",
    routes: Sequence = (),
    html: Optional[Union[str, Path]] = None,
    js: Optional[Union[str, Path]] = None,
    layout: Optional[AssetLayout] = None,
    title: str = "spaday",
    bundles: Sequence[str] = (),
    packages: Union[PackageRef, Sequence[PackageRef]] = (),
    wire: Optional[Union[str, Sequence[Union[dict, Wire]]]] = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
    store: Optional[dict] = None,
    nonce: Optional[str] = None,
) -> Starlette:
    """Add spaday's routes (page, tree, ``/js``, plus ``routes``) to an existing Starlette ``app`` under
    ``prefix``. The supplied ``routes`` are **prefixed too** (a ``Route``/``WebSocketRoute`` at ``/ws``
    becomes ``{prefix}/ws``), so a wired panel's generated ws URL and its endpoint line up — pass the
    *unprefixed* path (``WebSocketRoute("/ws", …)``) and let ``mount`` add the prefix. Generation options
    pass to :func:`spaday.bootstrap.bootstrap` (incl. ``store`` and ``nonce``, a CSP nonce for the
    generated scripts); ``html`` serves a hand-authored bootstrap instead; ``js`` overrides the bundle dir.
    ``mount`` only adds routes — **the host owns the app's lifespan**, so run any ``transports.autosync``
    in your own lifespan (see ``examples/embed.py``). Returns ``app`` for chaining."""
    from starlette.responses import FileResponse, HTMLResponse, Response
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    asset_layout = layout or ("source" if js is not None else None)
    component_packages = resolve_component_packages(packages)
    body = bootstrap(
        base=prefix,
        bundles=bundles,
        packages=component_packages,
        wire=wire,
        ws=ws,
        tree=tree,
        reconnect=reconnect,
        scripts=scripts,
        head=head,
        title=title,
        store=store,
        nonce=nonce,
        layout=asset_layout,
    )
    js_dir = Path(js) if js is not None else bundles_dir(asset_layout)

    async def homepage(_request):
        return FileResponse(html) if html is not None else HTMLResponse(body)

    async def tree_route_json(_request):
        return Response(tree_json(page), media_type="application/json")

    async def tree_route_frame(_request):
        return Response(tree_frame(page), media_type="application/octet-stream")

    tree_route = Route(f"{prefix}/tree", tree_route_frame) if tree == "frame" else Route(f"{prefix}/tree.json", tree_route_json)
    package_mounts = [Mount(package_url_prefix(package, prefix), StaticFiles(directory=package.assets_dir)) for package in component_packages]
    app.routes.extend(
        [
            Route(f"{prefix}/", homepage),
            tree_route,
            *_prefixed(routes, prefix),
            *package_mounts,
            Mount(f"{prefix}/js", StaticFiles(directory=js_dir)),
        ]
    )
    return app


def serve(page: Page, *, background: Sequence[Awaitable] = (), lifespan: Optional[Callable] = None, **opts) -> Starlette:
    """Create a Starlette app and :func:`mount` ``page`` onto it. ``background`` coroutines run for the
    app's lifetime (or pass a custom ``lifespan`` for ordered startup, e.g. a clustering relay); all other
    keyword options are :func:`mount`'s (``prefix``/``routes``/``html``/``js``/``title``/``bundles``/``packages``/
    ``wire``/``ws``/``tree``/``reconnect``/``scripts``/``head``/``store``/``nonce``)."""
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
