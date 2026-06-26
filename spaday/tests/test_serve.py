import asyncio

from starlette.responses import PlainTextResponse
from starlette.routing import Route
from starlette.testclient import TestClient

from spaday import serve
from spaday.components.shell import Main


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


def test_serve_runs_background_for_app_lifetime(tmp_path):
    async def forever():
        await asyncio.sleep(3600)

    # entering the context runs lifespan (starts the task); the request proves the app serves with it,
    # and exiting cancels the task — the test returning at all proves shutdown doesn't hang
    with TestClient(serve(Main(), js=tmp_path, background=[forever()])) as client:
        assert client.get("/tree.json").status_code == 200
