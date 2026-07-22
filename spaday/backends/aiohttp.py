"""aiohttp backend.

- ``mount(app, page, *, prefix="", …)`` — add spaday's routes to an **existing** ``aiohttp.web.Application``
  (call before the app runs; the router freezes on startup).
- ``serve(page, …) -> aiohttp.web.Application`` — create an app, ``mount`` onto it, and run ``background``
  coroutines for its lifetime.

aiohttp is imported inside the functions so importing spaday never requires it. The transports websocket
is **not** generated here (aiohttp owns its websocket API): add the ``{prefix}/ws`` handler via ``routes``
when ``wire="transports"``. Static pages (``wire=None``) run as-is.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Optional, Sequence, Union

from ..bootstrap import AssetLayout, Page, bootstrap, bundles_dir, tree_frame, tree_json
from ..packages import PackageRef, package_url_prefix, resolve_component_packages

if TYPE_CHECKING:  # annotations only — aiohttp is imported inside the functions (not a spaday dependency)
    from aiohttp import web


def mount(
    app: web.Application,
    page: Page,
    *,
    prefix: str = "",
    routes: Sequence = (),
    js: Optional[Union[str, Path]] = None,
    layout: Optional[AssetLayout] = None,
    title: str = "spaday",
    bundles: Sequence[str] = (),
    packages: Union[PackageRef, Sequence[PackageRef]] = (),
    wire: Optional[str] = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
) -> web.Application:
    """Add spaday's routes to an existing aiohttp ``app`` under ``prefix``. ``routes`` is a list of
    ``aiohttp.web`` route defs (``web.get(...)`` — including your ``{prefix}/ws`` handler when wiring
    transports). Returns ``app`` for chaining."""
    from aiohttp import web

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
        layout=asset_layout,
    )
    js_dir = str(js) if js is not None else str(bundles_dir(asset_layout))

    async def homepage(_request):
        return web.Response(text=body, content_type="text/html")

    if tree == "frame":

        async def tree_handler(_request):
            return web.Response(body=tree_frame(page), content_type="application/octet-stream")

        tree_route = web.get(f"{prefix}/tree", tree_handler)
    else:

        async def tree_handler(_request):
            return web.Response(text=tree_json(page), content_type="application/json")

        tree_route = web.get(f"{prefix}/tree.json", tree_handler)

    app.add_routes([web.get(f"{prefix}/", homepage), tree_route, *routes])
    for package in component_packages:
        app.router.add_static(package_url_prefix(package, prefix), str(package.assets_dir))
    app.router.add_static(f"{prefix}/js", js_dir)
    return app


def serve(page: Page, *, background: Sequence[Awaitable] = (), **opts) -> web.Application:
    """Create an aiohttp app and :func:`mount` ``page`` onto it. ``background`` coroutines run for the
    app's lifetime; all other keyword options are :func:`mount`'s."""
    from aiohttp import web

    app = web.Application()
    mount(app, page, **opts)

    tasks = []  # closed over by the startup/cleanup hooks (avoids an aiohttp app-key)

    async def _start_bg(_app):
        tasks.extend(asyncio.ensure_future(c) for c in background)

    async def _stop_bg(_app):
        for task in tasks:
            task.cancel()

    app.on_startup.append(_start_bg)
    app.on_cleanup.append(_stop_bg)
    return app
