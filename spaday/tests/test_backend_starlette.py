import asyncio
import json

import pytest

pytest.importorskip("starlette")  # the Starlette backend — the optional `examples` extra

from starlette.responses import PlainTextResponse  # noqa: E402
from starlette.routing import Route  # noqa: E402
from starlette.testclient import TestClient  # noqa: E402

from spaday import decode_frame  # noqa: E402
from spaday.backends.starlette import mount, serve  # noqa: E402
from spaday.components.shell import Main  # noqa: E402


def test_serve_hosts_page_tree_bundle_and_routes(tmp_path):
    page = Main("hi")
    routes = [Route("/api/ping", lambda _r: PlainTextResponse("pong"))]
    client = TestClient(serve(page, js=tmp_path, bundles=["webawesome"], wire="transports", routes=routes))
    assert "connectStore(" in client.get("/").text  # the generated bootstrap
    assert client.get("/tree.json").json() == page.to_node()  # tree served as JSON
    assert client.get("/js/dist/esm/index.js") is not None  # /js mount present (dir is tmp here)
    assert client.get("/api/ping").text == "pong"  # spliced route


def test_serve_frame_route_returns_a_decodable_frame(tmp_path):
    page = Main("hi")
    client = TestClient(serve(page, js=tmp_path, wire="transports", tree="frame"))
    assert json.loads(decode_frame(client.get("/tree").content))["payload"] == page.to_node()
    assert client.get("/tree.json").status_code == 404  # json route not mounted in frame mode


def test_mount_adds_routes_to_an_existing_app_under_a_prefix(tmp_path):
    from starlette.applications import Starlette

    app = Starlette(routes=[Route("/health", lambda _r: PlainTextResponse("ok"))])
    mount(app, Main("hi"), prefix="/dash", js=tmp_path)
    client = TestClient(app)
    assert client.get("/health").text == "ok"  # the host app's own route still works
    assert "/dash/js/dist/esm/index.js" in client.get("/dash/").text  # spaday page under the prefix
    assert client.get("/dash/tree.json").json() == Main("hi").to_node()


def test_mount_prefixes_supplied_routes_to_match_the_generated_wire(tmp_path):
    from starlette.applications import Starlette
    from starlette.routing import WebSocketRoute

    async def ws_ep(websocket):  # a stand-in wire endpoint
        await websocket.accept()
        await websocket.close()

    app = Starlette()
    mount(app, Main("hi"), prefix="/dash", wire="transports", routes=[WebSocketRoute("/ws", ws_ep)], js=tmp_path)
    # the supplied /ws is prefixed to /dash/ws, so it lines up with the wire URL bootstrap generated
    assert any(getattr(r, "path", None) == "/dash/ws" for r in app.routes)
    assert "ws://${location.host}/dash/ws" in TestClient(app).get("/dash/").text


def test_mount_stamps_a_csp_nonce_on_generated_tags(tmp_path):
    from starlette.applications import Starlette

    app = Starlette()
    mount(app, Main("hi"), prefix="/dash", bundles=["webawesome"], js=tmp_path, nonce="abc123")
    page = TestClient(app).get("/dash/").text
    assert '<script type="module" nonce="abc123">' in page  # the inline mount script
    assert 'nonce="abc123"' in page and "webawesome.css" in page  # ...and the bundle tags


def test_serve_custom_html_and_background(tmp_path):
    html_file = tmp_path / "page.html"
    html_file.write_text("<!doctype html><title>custom</title>", encoding="utf-8")

    async def forever():
        await asyncio.sleep(3600)

    with TestClient(serve(Main(), js=tmp_path, html=html_file, background=[forever()])) as client:
        assert client.get("/").text == "<!doctype html><title>custom</title>"  # hand-authored bootstrap
        assert client.get("/tree.json").status_code == 200  # served while the background task runs
