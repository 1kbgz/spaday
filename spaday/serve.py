"""``serve(page)`` — the one-call Starlette host for a spaday page.

Turns a page into a runnable app so an example needn't re-hand-roll the serving glue: it serves the
bootstrap HTML at ``/``, the authored component tree as JSON at ``/tree.json`` (so the page is a
:class:`~spaday.component.Component`, not a hand-built ``.to_node()`` dict), and the spaday ``js/``
bundles at ``/js``. Extra ``routes`` (a transports websocket, REST endpoints) splice in, and
``background`` coroutines run for the app's lifetime (e.g. ``transports.autosync``).

Two bootstrap modes. The default page mounts a *static* tree (runtime only) and takes ``head`` markup
to pull in a component library's bundle/styles — enough for a self-contained page. A page that needs
its own wiring (a transports ``Client``, ``connectStore``) passes ``html=`` to serve a hand-authored
file instead.
"""

import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Awaitable, Callable, Optional, Sequence, Union

from starlette.applications import Starlette
from starlette.responses import FileResponse, HTMLResponse, JSONResponse
from starlette.routing import BaseRoute, Mount, Route
from starlette.staticfiles import StaticFiles

from .component import Component

#: A page is a built :class:`~spaday.component.Component`, or a zero-arg callable returning one (called
#: per ``/tree.json`` request, so the tree can reflect current state).
Page = Union[Component, Callable[[], Component]]

_DEV_JS = Path(__file__).parent.parent / "js"  # repo checkout: the built bundles live in ../js/dist


def _default_html(title: str, head: str) -> str:
    """A minimal bootstrap: init the wasm core, fetch the authored tree, mount it (no store/wire)."""
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {head}
  </head>
  <body>
    <script type="module">
      import {{ mount, init }} from "/js/dist/esm/index.js";
      await init({{ module_or_path: "/js/dist/pkg/spaday_bg.wasm" }});
      const node = await (await fetch("/tree.json")).json();
      mount(document.body, node);
    </script>
  </body>
</html>
"""


def serve(
    page: Page,
    *,
    routes: Sequence[BaseRoute] = (),
    html: Optional[Union[str, Path]] = None,
    js: Optional[Union[str, Path]] = None,
    title: str = "spaday",
    head: str = "",
    background: Sequence[Awaitable] = (),
) -> Starlette:
    """Build a Starlette app that serves ``page`` (see the module docstring).

    ``page`` is a Component or a callable returning one. ``html`` serves a hand-authored bootstrap file
    instead of the default (``head``/``title`` are then unused). ``js`` overrides the served bundle
    directory (defaults to the repo's ``js/``). ``background`` coroutines are run as tasks for the app's
    lifetime and cancelled on shutdown.
    """
    js_dir = Path(js) if js is not None else _DEV_JS

    async def homepage(_request):
        return FileResponse(html) if html is not None else HTMLResponse(_default_html(title, head))

    async def tree_json(_request):
        node = page() if callable(page) else page
        return JSONResponse(node.to_node())

    @asynccontextmanager
    async def lifespan(_app):
        tasks = [asyncio.ensure_future(c) for c in background]
        try:
            yield
        finally:
            for task in tasks:
                task.cancel()

    app_routes = [Route("/", homepage), Route("/tree.json", tree_json), *routes, Mount("/js", StaticFiles(directory=js_dir))]
    return Starlette(routes=app_routes, lifespan=lifespan)
