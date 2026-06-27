"""Flask (WSGI) backend: ``serve(page, …) -> flask.Flask``.

Wires :mod:`spaday.bootstrap` into a Flask app — ``GET /`` (the page), ``GET /tree.json`` or ``GET /tree``
(the tree), ``GET /js/<path>`` (the bundles), plus any ``routes`` you splice in. Flask is **WSGI
(synchronous)**, so there is no async lifecycle here: background coroutines and the transports websocket
are out of scope — with ``wire="transports"`` the generated client still expects a ``/ws`` endpoint +
``autosync``, which you supply with an async extension (flask-sock + a loop) or, more simply, an async
backend (aiohttp / Starlette). Static pages (``wire=None``) run as-is.
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Optional, Sequence, Union

from ..bootstrap import Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — flask is imported inside serve() (not a spaday dependency)
    from flask import Flask


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
) -> Flask:
    """Build a Flask app serving ``page`` (a Component or a callable returning one).

    Generation options (``bundles``/``wire``/``ws``/``tree``/``reconnect``/``scripts``/``head``/``title``)
    are passed through to :func:`spaday.bootstrap.bootstrap`. ``routes`` is a list of
    ``(rule, endpoint, view_func)`` tuples added via ``app.add_url_rule``; ``js`` overrides the served
    bundle dir (defaults to :func:`~spaday.bootstrap.bundles_dir`).
    """
    from flask import Flask, Response, send_from_directory

    body = bootstrap(bundles=bundles, wire=wire, ws=ws, tree=tree, reconnect=reconnect, scripts=scripts, head=head, title=title)
    js_dir = str(js) if js is not None else str(bundles_dir())

    app = Flask(__name__)
    app.add_url_rule("/", "spaday_index", lambda: Response(body, mimetype="text/html"))
    if tree == "frame":
        app.add_url_rule("/tree", "spaday_tree", lambda: Response(tree_frame(page), mimetype="application/octet-stream"))
    else:
        app.add_url_rule("/tree.json", "spaday_tree", lambda: Response(tree_json(page), mimetype="application/json"))
    app.add_url_rule("/js/<path:path>", "spaday_js", lambda path: send_from_directory(js_dir, path))
    for rule in routes:
        app.add_url_rule(*rule)
    return app
