"""Starlette (and FastAPI, which is Starlette) backend: ``serve(page, …) -> Starlette``.

Wires :mod:`spaday.bootstrap` into a Starlette app — ``/`` (the page), ``/tree.json`` or ``/tree`` (the
tree), ``/js`` (the bundles), plus any ``routes`` you splice in (a transports websocket, REST) and a
lifespan for ``background`` coroutines. Starlette is the optional ``examples`` extra; it is imported
inside ``serve()`` so ``import spaday`` stays light.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Callable, Optional, Sequence, Union

from ..bootstrap import Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — the runtime starlette import lives inside serve() (optional extra)
    from starlette.applications import Starlette
    from starlette.routing import BaseRoute


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
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
    background: Sequence[Awaitable] = (),
    lifespan: Optional[Callable] = None,
) -> Starlette:
    """Build a Starlette app serving ``page`` (a Component or a callable returning one).

    Generation options (``bundles``/``wire``/``ws``/``tree``/``reconnect``/``scripts``/``head``/``title``)
    are passed through to :func:`spaday.bootstrap.bootstrap`. ``routes`` splices in extra endpoints (the
    transports websocket via ``transports.ws_endpoint``, REST); ``html`` serves a hand-authored bootstrap
    file instead of the generated one; ``js`` overrides the served bundle dir (defaults to
    :func:`~spaday.bootstrap.bundles_dir`). ``background`` coroutines run for the app's lifetime;
    ``lifespan`` overrides that with a custom Starlette lifespan (for startup that must order its own
    setup, e.g. a clustering relay) — ``background`` is then unused.
    """
    from starlette.applications import Starlette
    from starlette.responses import FileResponse, HTMLResponse, Response
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    js_dir = Path(js) if js is not None else bundles_dir()
    body = bootstrap(bundles=bundles, wire=wire, ws=ws, tree=tree, reconnect=reconnect, scripts=scripts, head=head, title=title)

    async def homepage(_request):
        return FileResponse(html) if html is not None else HTMLResponse(body)

    async def tree_route_json(_request):
        return Response(tree_json(page), media_type="application/json")

    async def tree_route_frame(_request):
        return Response(tree_frame(page), media_type="application/octet-stream")

    tree_route = Route("/tree", tree_route_frame) if tree == "frame" else Route("/tree.json", tree_route_json)

    @asynccontextmanager
    async def _background_lifespan(_app):
        tasks = [asyncio.ensure_future(c) for c in background]
        try:
            yield
        finally:
            for task in tasks:
                task.cancel()

    app_routes = [Route("/", homepage), tree_route, *routes, Mount("/js", StaticFiles(directory=js_dir))]
    return Starlette(routes=app_routes, lifespan=lifespan if lifespan is not None else _background_lifespan)
