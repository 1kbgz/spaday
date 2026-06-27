"""Flask (WSGI) backend.

- ``mount(app, page, *, prefix="", …)`` — add spaday's routes to an **existing** Flask app.
- ``serve(page, …) -> flask.Flask`` — create an app and ``mount`` onto it.

Flask is **WSGI (synchronous)**, so there is no async lifecycle here: background coroutines and the
transports websocket are out of scope — with ``wire="transports"`` the generated client still expects a
``{prefix}/ws`` endpoint + ``autosync``, which you supply with an async extension (flask-sock + a loop)
or, more simply, an async backend (aiohttp / Starlette). Static pages (``wire=None``) run as-is.
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Optional, Sequence, Union

from ..bootstrap import Page, bootstrap, bundles_dir, tree_frame, tree_json

if TYPE_CHECKING:  # annotations only — flask is imported inside the functions (not a spaday dependency)
    from flask import Flask


def mount(
    app: Flask,
    page: Page,
    *,
    prefix: str = "",
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
    """Add spaday's routes to an existing Flask ``app`` under ``prefix``. ``routes`` is a list of
    ``(rule, endpoint, view_func)`` tuples. Endpoints are keyed by ``prefix`` so several spaday pages can
    share one app. Returns ``app`` for chaining."""
    from flask import Response, send_from_directory

    body = bootstrap(base=prefix, bundles=bundles, wire=wire, ws=ws, tree=tree, reconnect=reconnect, scripts=scripts, head=head, title=title)
    js_dir = str(js) if js is not None else str(bundles_dir())
    key = prefix.strip("/").replace("/", "_") or "root"  # unique endpoint names per mount

    app.add_url_rule(f"{prefix}/", f"spaday_index_{key}", lambda: Response(body, mimetype="text/html"))
    if tree == "frame":
        app.add_url_rule(f"{prefix}/tree", f"spaday_tree_{key}", lambda: Response(tree_frame(page), mimetype="application/octet-stream"))
    else:
        app.add_url_rule(f"{prefix}/tree.json", f"spaday_tree_{key}", lambda: Response(tree_json(page), mimetype="application/json"))
    app.add_url_rule(f"{prefix}/js/<path:path>", f"spaday_js_{key}", lambda path: send_from_directory(js_dir, path))
    for rule in routes:
        app.add_url_rule(*rule)
    return app


def serve(page: Page, *, import_name: str = "spaday", **opts) -> Flask:
    """Create a Flask app and :func:`mount` ``page`` onto it. ``import_name`` is Flask's (for resource
    resolution); all other keyword options are :func:`mount`'s."""
    from flask import Flask

    app = Flask(import_name)
    return mount(app, page, **opts)
