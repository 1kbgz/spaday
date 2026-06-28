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

from ..bootstrap import Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — starlette is imported inside the functions (optional extra)
    from starlette.applications import Starlette


def mount(
    app: Starlette,
    page: Page,
    *,
    prefix: str = "",
    routes: Sequence = (),
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
) -> Starlette:
    """Add spaday's routes (page, tree, ``/js``, plus ``routes``) to an existing Starlette ``app`` under
    ``prefix``. Generation options are passed to :func:`spaday.bootstrap.bootstrap`; ``html`` serves a
    hand-authored bootstrap instead; ``js`` overrides the bundle dir. Returns ``app`` for chaining."""
    from starlette.responses import FileResponse, HTMLResponse, Response
    from starlette.routing import Mount, Route
    from starlette.staticfiles import StaticFiles

    body = bootstrap(base=prefix, bundles=bundles, wire=wire, ws=ws, tree=tree, reconnect=reconnect, scripts=scripts, head=head, title=title)
    js_dir = Path(js) if js is not None else bundles_dir()

    async def homepage(_request):
        return FileResponse(html) if html is not None else HTMLResponse(body)

    async def tree_route_json(_request):
        return Response(tree_json(page), media_type="application/json")

    async def tree_route_frame(_request):
        return Response(tree_frame(page), media_type="application/octet-stream")

    tree_route = Route(f"{prefix}/tree", tree_route_frame) if tree == "frame" else Route(f"{prefix}/tree.json", tree_route_json)
    app.routes.extend([Route(f"{prefix}/", homepage), tree_route, *routes, Mount(f"{prefix}/js", StaticFiles(directory=js_dir))])
    return app


def serve(page: Page, *, background: Sequence[Awaitable] = (), lifespan: Optional[Callable] = None, **opts) -> Starlette:
    """Create a Starlette app and :func:`mount` ``page`` onto it. ``background`` coroutines run for the
    app's lifetime (or pass a custom ``lifespan`` for ordered startup, e.g. a clustering relay); all other
    keyword options are :func:`mount`'s (``prefix``/``routes``/``html``/``js``/``title``/``bundles``/
    ``wire``/``ws``/``tree``/``reconnect``/``scripts``/``head``)."""
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
