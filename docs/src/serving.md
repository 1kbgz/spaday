# Serve and embed a spaday app

This guide shows you how to deliver a spaday UI to a browser — from "spaday runs the whole app" down to
"spaday is one node on a page you already own." Each rung hands more control to the host, and every rung
takes the same generation options. (For keeping the UI in sync with a server-side model, see
[Sync over transports](transports.md); for a notebook, see [Use in a notebook](notebook.md).)

There is **no hand-written HTML**: spaday generates the bootstrap page from your Python description.

| Rung | spaday owns | Seam |
| ---- | ----------- | ---- |
| No HTML | the whole app | `serve(page, …)` |
| Some HTML | a sub-path of your app | `mount(app, page, prefix=…)` |
| Full custom HTML | one node in your page | `bootstrap(fragment=True, target=…)` + `tree_json(page)` |
| Notebook | a cell's widget | `Widget(component)` |

`page` is a built component **or a zero-arg callable returning one** — a callable is re-rendered per
request, so the tree can reflect current state.

## Serve a whole app

`serve` creates a Starlette app and mounts your page on it: it generates the bootstrap HTML, hosts the
tree at `/tree.json`, and serves the JS bundles at `/js`. Pull a component library into `<head>` with
`bundles=`, add your own routes with `routes=`, and run lifetime coroutines with `background=`:

```python
import uvicorn
from spaday.backends.starlette import serve
from spaday.components.webawesome import WaButton

app = serve(
    lambda: WaButton(variant="brand").text("Hi"),
    bundles=["webawesome"],          # pull WebAwesome's styles + catalog into <head>
    head="<style>body{margin:2rem}</style>",
    title="my app",
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

The built-in bundles are `"webawesome"`, `"lightweight-charts"`, and `"perspective"`. `serve` is the
one-line happy path — it is just `mount` onto a fresh app, so drop to `mount` when the app is yours.
In a source checkout it serves built assets from `js/`; from a wheel it automatically serves packaged
`spaday/extension` assets. Use `layout="source"` or `layout="installed"` only to override detection, such
as when supplying a matching custom `js=` directory.

## Embed in an existing app

`mount` adds spaday's routes to an app **you** already have, under a `prefix` — it touches nothing else.
The page, tree, `/js`, **and your supplied `routes`** are all prefixed, so a wired panel's generated
websocket URL lines up with its endpoint (pass the *unprefixed* path; `mount` adds the prefix). `mount`
only adds routes — **the host owns the app's lifespan**, so run any background work in your own lifespan:

```python
from starlette.applications import Starlette
from starlette.routing import Route
from spaday.backends.starlette import mount

app = Starlette(routes=[Route("/", my_own_homepage)])   # your app, your routes
mount(app, page, prefix="/panel", bundles=["webawesome"])   # spaday lives only under /panel
```

Backends ship for **Starlette/FastAPI**, **aiohttp**, **Flask**, and **Tornado** — import `serve`/`mount`
from `spaday.backends.<name>`. They are thin glue over the framework-agnostic generator.

## Drop into a host page

When the host owns the entire HTML page (its own markup, CSS, bundler), emit spaday as a *fragment* —
just the bundle tags + the mounting `<script>`, with no document — and splice it into a node the host
provides. The host serves the tree and `/js` itself:

```python
from starlette.responses import HTMLResponse, Response
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles
from spaday.bootstrap import bootstrap, bundles_dir, tree_json

async def home(_request):
    fragment = bootstrap(fragment=True, target="#spaday-root", bundles=["webawesome"])
    return HTMLResponse(f"<!doctype html>… <div id='spaday-root'></div> {fragment} …")

routes = [
    Route("/", home),
    Route("/tree.json", lambda _r: Response(tree_json(page), media_type="application/json")),
    Mount("/js", StaticFiles(directory=bundles_dir())),
]
```

The mounting script is inline, so a host with a strict `script-src` Content-Security-Policy passes a
per-request **`nonce`** — it stamps the generated `<script>`/`<link>` tags so the policy can allow them:

```python
fragment = bootstrap(fragment=True, target="#spaday-root", bundles=["webawesome"], nonce=request_nonce)
# ...and set `Content-Security-Policy: script-src 'self' 'nonce-<request_nonce>' 'wasm-unsafe-eval'`
```

## Seed reactive state without a server

For client-side reactive UI (two-way bindings, `field` actions) that needs no server model, seed a local
signal store with `store=` — the page mounts with that state, no wire required:

```python
app = serve(page, store={"dark": False, "view": "list"})   # the tree's bindings read/write these fields
```

## Connect a live model

To keep the UI in sync with a server-side model, add a wire: `wire="transports"` for one model, or a list
of [`Wire`](transports.md) specs for several. The generated page opens the websocket(s) and binds them to
the store; you supply the websocket route and run `autosync`. See [Sync over transports](transports.md).

```python
import transports
from starlette.routing import WebSocketRoute

app = serve(
    page,
    wire="transports",
    routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],
    background=[transports.autosync(server)],
)
```

## The route contract

Whatever rung you pick, the generated page expects the host to serve these paths (`{base}` is the
`prefix`, empty by default) — `serve`/`mount` wire them for you:

| Path | Serves |
| ---- | ------ |
| `GET {base}/` | the bootstrap HTML (`bootstrap(...)`) |
| `GET {base}/tree.json` | the authored tree (`tree_json(page)`) |
| `GET {base}/js/*` | the bundles under `bundles_dir()` |
| `WS {base}/ws` | a transports endpoint (only when wired) |
```
