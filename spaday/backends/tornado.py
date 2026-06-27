"""Tornado backend: ``serve(page, …) -> tornado.web.Application``.

Wires :mod:`spaday.bootstrap` into a Tornado application — ``GET /`` (the page), ``GET /tree.json`` or
``GET /tree`` (the tree), ``GET /js/(.*)`` (the bundles via ``StaticFileHandler``), plus any ``routes``
you splice in. ``background`` coroutines are scheduled on the IOLoop (they start when you run it). Run the
returned app the usual way::

    app = serve(page, ...)
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()

As with aiohttp, the transports ``/ws`` endpoint (when ``wire="transports"``) is yours to add via
``routes`` (Tornado has its own ``WebSocketHandler``); static pages need no websocket.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import TYPE_CHECKING, Awaitable, Optional, Sequence, Union

from ..bootstrap import Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — tornado is imported inside serve() (not a spaday dependency)
    from tornado.web import Application


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
) -> Application:
    """Build a Tornado application serving ``page`` (a Component or a callable returning one).

    Generation options (``bundles``/``wire``/``ws``/``tree``/``reconnect``/``scripts``/``head``/``title``)
    are passed through to :func:`spaday.bootstrap.bootstrap`. ``routes`` is a list of Tornado handler
    tuples (``(pattern, Handler[, kwargs])`` — including your ``/ws`` handler when wiring transports);
    ``js`` overrides the served bundle dir (defaults to :func:`~spaday.bootstrap.bundles_dir`);
    ``background`` coroutines are scheduled on the IOLoop and run once it starts.
    """
    from tornado.ioloop import IOLoop
    from tornado.web import Application, RequestHandler, StaticFileHandler

    body = bootstrap(bundles=bundles, wire=wire, ws=ws, tree=tree, reconnect=reconnect, scripts=scripts, head=head, title=title)
    js_dir = str(js) if js is not None else str(bundles_dir())

    class _Index(RequestHandler):
        def get(self):
            self.set_header("Content-Type", "text/html")
            self.write(body)

    if tree == "frame":

        class _Tree(RequestHandler):
            def get(self):
                self.set_header("Content-Type", "application/octet-stream")
                self.write(tree_frame(page))

        tree_rule = (r"/tree", _Tree)
    else:

        class _Tree(RequestHandler):
            def get(self):
                self.set_header("Content-Type", "application/json")
                self.write(tree_json(page))

        tree_rule = (r"/tree\.json", _Tree)

    handlers = [(r"/", _Index), tree_rule, *routes, (r"/js/(.*)", StaticFileHandler, {"path": js_dir})]
    app = Application(handlers)
    for coro in background:  # scheduled now, spawned when the IOLoop runs
        IOLoop.current().add_callback(asyncio.ensure_future, coro)
    return app
