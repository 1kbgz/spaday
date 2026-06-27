import asyncio
import json

import pytest

pytest.importorskip("starlette")  # serve() needs starlette — the optional `examples` extra

from starlette.responses import PlainTextResponse  # noqa: E402
from starlette.routing import Route  # noqa: E402
from starlette.testclient import TestClient  # noqa: E402

from spaday import decode_frame, serve  # noqa: E402
from spaday.components.shell import Main  # noqa: E402


def test_serve_hosts_the_tree_as_json(tmp_path):
    page = Main("hi")
    client = TestClient(serve(page, js=tmp_path))
    assert client.get("/tree.json").json() == page.to_node()
    # the default bootstrap fetches /tree.json and mounts it
    body = client.get("/").text
    assert "/tree.json" in body and "mount(" in body


def test_serve_calls_a_callable_page_per_request(tmp_path):
    calls = []

    def page():
        calls.append(1)
        return Main(str(len(calls)))

    client = TestClient(serve(page, js=tmp_path))
    first = client.get("/tree.json").json()["slots"]["default"][0]["props"]["textContent"]
    second = client.get("/tree.json").json()["slots"]["default"][0]["props"]["textContent"]
    assert (first, second) == ({"Str": "1"}, {"Str": "2"})  # re-rendered each request


def test_serve_serves_custom_html_and_splices_routes(tmp_path):
    html = tmp_path / "page.html"
    html.write_text("<!doctype html><title>custom</title>", encoding="utf-8")
    routes = [Route("/api/ping", lambda _r: PlainTextResponse("pong"))]
    client = TestClient(serve(Main(), html=html, routes=routes, js=tmp_path))
    assert client.get("/").text == "<!doctype html><title>custom</title>"  # custom bootstrap, not the default
    assert client.get("/api/ping").text == "pong"  # extra route spliced in


def test_serve_generates_a_bundle_and_transports_wire(tmp_path):
    html = TestClient(serve(Main(), js=tmp_path, bundles=["webawesome"], wire="transports", ws="/sock")).get("/").text
    # the named bundle's styles + catalog are pulled into <head> (no hand-written tags)
    assert "@awesome.me/webawesome/dist/styles/webawesome.css" in html
    assert '<script type="module" src="/js/dist/cdn/examples/webawesome.js">' in html
    # the transports bootstrap is generated: Client + connectStore + the socket at the given path
    assert "connectStore(" in html and "transports_bg.wasm" in html
    assert "new WebSocket(`ws://${location.host}/sock`)" in html
    assert "mount(document.body, node, store)" in html


def test_serve_frame_tree_ships_the_tree_as_a_transports_frame(tmp_path):
    page = Main("hi")
    client = TestClient(serve(page, js=tmp_path, wire="transports", tree="frame"))
    html = client.get("/").text
    # the bootstrap decodes a frame from /tree instead of fetching /tree.json
    assert "decodeFrame" in html and 'fetch("/tree")' in html and "/tree.json" not in html
    # the /tree route returns a Snapshot frame that decodes back to the authored tree
    frame = client.get("/tree").content
    assert json.loads(decode_frame(frame))["payload"] == page.to_node()
    assert client.get("/tree.json").status_code == 404  # json route not mounted in frame mode


def test_serve_static_page_has_no_transports_wire(tmp_path):
    html = TestClient(serve(Main(), js=tmp_path)).get("/").text
    assert "connectStore" not in html and "new Client()" not in html
    assert "mount(document.body, node);" in html  # a plain static mount


def test_serve_injects_extra_script_modules(tmp_path):
    html = TestClient(serve(Main(), js=tmp_path, scripts=["/static/handlers.js"])).get("/").text
    assert 'import "/static/handlers.js";' in html


def test_serve_rejects_an_unknown_bundle(tmp_path):
    with pytest.raises(ValueError):
        serve(Main(), js=tmp_path, bundles=["nope"])


def test_serve_runs_background_for_app_lifetime(tmp_path):
    async def forever():
        await asyncio.sleep(3600)

    # entering the context runs lifespan (starts the task); the request proves the app serves with it,
    # and exiting cancels the task — the test returning at all proves shutdown doesn't hang
    with TestClient(serve(Main(), js=tmp_path, background=[forever()])) as client:
        assert client.get("/tree.json").status_code == 200
