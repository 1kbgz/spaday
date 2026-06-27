"""Per-webserver ``serve()`` helpers — the thin, explicit boundary between spaday and a backend.

The framework-agnostic generation (the page HTML, the tree JSON/frame, the bundle dir) lives in
:mod:`spaday.bootstrap`; each module here wires it into one webserver's routing/static/lifecycle and
adds the few backend-specific conveniences that make sense. Pick your backend explicitly::

    from spaday.backends.starlette import serve   # Starlette / FastAPI
    from spaday.backends.aiohttp import serve      # aiohttp

There is deliberately no opaque top-level ``spaday.serve`` catch-all: the backend is part of the app's
choice, and a clear seam (a little more code) beats hidden framework coupling. A backend not covered here
is a handful of routes over :func:`spaday.bootstrap.bootstrap` / :func:`~spaday.bootstrap.tree_json` /
:func:`~spaday.bootstrap.tree_frame` / :func:`~spaday.bootstrap.bundles_dir`.
"""
