"""Tornado backend.

- ``mount(app, page, *, prefix="", …)`` — add spaday's handlers to an **existing** ``tornado.web.Application``.
- ``serve(page, …) -> tornado.web.Application`` — create an app, ``mount`` onto it, and schedule
  ``background`` coroutines on the IOLoop. Run it the usual way::

      app = serve(page, ...); app.listen(8000); tornado.ioloop.IOLoop.current().start()

tornado is imported inside the functions so importing spaday never requires it. The transports ``{prefix}/ws``
endpoint (with ``wire="transports"``) is yours to add via ``routes`` (Tornado has its own ``WebSocketHandler``).
"""

from __future__ import annotations

import asyncio
import re
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Optional, Sequence, Union

from ..bootstrap import AssetLayout, Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — tornado is imported inside the functions (not a spaday dependency)
    from tornado.web import Application


def mount(
    app: Application,
    page: Page,
    *,
    prefix: str = "",
    routes: Sequence = (),
    js: Optional[Union[str, Path]] = None,
    layout: Optional[AssetLayout] = None,
    title: str = "spaday",
    bundles: Sequence[str] = (),
    wire: Optional[str] = None,
    ws: str = "/ws",
    tree: str = "json",
    reconnect: bool = False,
    scripts: Sequence[str] = (),
    head: str = "",
) -> Application:
    """Add spaday's handlers to an existing Tornado ``app`` under ``prefix``. ``routes`` is a list of
    Tornado handler tuples (``(pattern, Handler[, kwargs])`` — including your ``{prefix}/ws`` handler when
    wiring transports). Returns ``app`` for chaining."""
    from tornado.web import RequestHandler, StaticFileHandler

    asset_layout = layout or ("source" if js is not None else None)
    body = bootstrap(
        base=prefix,
        bundles=bundles,
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
    pre = re.escape(prefix)

    class _Index(RequestHandler):
        def get(self):
            self.set_header("Content-Type", "text/html")
            self.write(body)

    if tree == "frame":

        class _Tree(RequestHandler):
            def get(self):
                self.set_header("Content-Type", "application/octet-stream")
                self.write(tree_frame(page))

        tree_rule = (rf"{pre}/tree", _Tree)
    else:

        class _Tree(RequestHandler):
            def get(self):
                self.set_header("Content-Type", "application/json")
                self.write(tree_json(page))

        tree_rule = (rf"{pre}/tree\.json", _Tree)

    handlers = [(rf"{pre}/", _Index), tree_rule, *routes, (rf"{pre}/js/(.*)", StaticFileHandler, {"path": js_dir})]
    app.add_handlers(r".*", handlers)
    return app


def serve(page: Page, *, background: Sequence[Awaitable] = (), **opts) -> Application:
    """Create a Tornado application and :func:`mount` ``page`` onto it. ``background`` coroutines are
    scheduled on the IOLoop and run once it starts; all other keyword options are :func:`mount`'s."""
    from tornado.ioloop import IOLoop
    from tornado.web import Application

    app = Application()
    mount(app, page, **opts)
    for coro in background:  # scheduled now, spawned when the IOLoop runs
        IOLoop.current().add_callback(asyncio.ensure_future, coro)
    return app
