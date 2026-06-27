"""aiohttp backend: ``serve(page, …) -> aiohttp.web.Application``.

Wires :mod:`spaday.bootstrap` into an aiohttp app — ``GET /`` (the page), ``GET /tree.json`` or
``GET /tree`` (the tree), a ``/js`` static route (the bundles), plus any ``routes`` you splice in and
``background`` coroutines run for the app's lifetime. aiohttp is imported inside ``serve()`` so importing
spaday never requires it.

The transports websocket is **not** generated here: aiohttp has its own websocket API, so the ``/ws``
endpoint (when ``wire="transports"``) is yours to add via ``routes`` (e.g. a transports aiohttp adapter).
Static pages (``wire=None``) need no websocket and run as-is.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Optional, Sequence, Union

from ..bootstrap import Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — aiohttp is imported inside serve() (it is not a spaday dependency)
    from aiohttp import web


def serve(
    page: Page,
    *,
    routes: Sequence = (),
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
) -> web.Application:
    """Build an aiohttp application serving ``page`` (a Component or a callable returning one).

    Generation options (``bundles``/``wire``/``ws``/``tree``/``reconnect``/``scripts``/``head``/``title``)
    are passed through to :func:`spaday.bootstrap.bootstrap`. ``routes`` is a list of ``aiohttp.web``
    route defs (``web.get(...)`` / ``web.post(...)`` — including your ``/ws`` handler when wiring
    transports); ``js`` overrides the served bundle dir (defaults to
    :func:`~spaday.bootstrap.bundles_dir`); ``background`` coroutines run as tasks for the app's lifetime
    and are cancelled on cleanup.
    """
    from aiohttp import web

    body = bootstrap(bundles=bundles, wire=wire, ws=ws, tree=tree, reconnect=reconnect, scripts=scripts, head=head, title=title)

    async def homepage(_request):
        return web.Response(text=body, content_type="text/html")

    if tree == "frame":

        async def tree_handler(_request):
            return web.Response(body=tree_frame(page), content_type="application/octet-stream")

        tree_route = web.get("/tree", tree_handler)
    else:

        async def tree_handler(_request):
            return web.Response(text=tree_json(page), content_type="application/json")

        tree_route = web.get("/tree.json", tree_handler)

    tasks = []  # closed over by the startup/cleanup hooks (avoids an aiohttp app-key)

    async def _start_bg(_app):
        tasks.extend(asyncio.ensure_future(c) for c in background)

    async def _stop_bg(_app):
        for task in tasks:
            task.cancel()

    app = web.Application()
    app.add_routes([web.get("/", homepage), tree_route, *routes])
    app.router.add_static("/js", str(js) if js is not None else str(bundles_dir()))
    app.on_startup.append(_start_bg)
    app.on_cleanup.append(_stop_bg)
    return app
