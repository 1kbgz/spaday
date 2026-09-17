import asyncio
import json
from typing import Any

import pytest

pytest.importorskip("starlette")  # the Starlette backend — the optional `examples` extra

from starlette.responses import PlainTextResponse
from starlette.routing import Route, WebSocketRoute
from starlette.testclient import TestClient

import spaday.packages as package_registry
from spaday import Button, Design, decode_frame
from spaday.backends.starlette import PageSpec, build_routes, build_site, mount, mount_site, serve
from spaday.components.shell import Main
from spaday.packages import ComponentPackage
from spaday.ui import ControlSpec


class _EntryPoint:
    name = "fixture"

    def __init__(self, package):
        self.package = package

    def load(self):
        return self.package


def test_serve_hosts_page_tree_bundle_and_routes(tmp_path):
    page = Main("hi")
    routes = [Route("/api/ping", lambda _r: PlainTextResponse("pong"))]
    client = TestClient(serve(page, js=tmp_path, wire="transports", routes=routes))
    assert "connectStore(" in client.get("/").text  # the generated bootstrap
    assert client.get("/tree.json").json() == page.to_node()  # tree served as JSON
    assert client.get("/js/dist/esm/index.js") is not None  # /js mount present (dir is tmp here)
    assert client.get("/api/ping").text == "pong"  # spliced route


def test_entry_point_package_adds_tags_and_serves_assets(monkeypatch, tmp_path):
    (tmp_path / "index.js").write_text("export const loaded = true;", encoding="utf-8")
    package = ComponentPackage("fixture", tmp_path, (("js", "index.js"),))
    monkeypatch.setattr(package_registry, "entry_points", lambda **_kwargs: [_EntryPoint(package)])

    client = TestClient(serve(Main("hi"), packages=["fixture"], prefix="/dash"))
    assert 'src="/dash/components/fixture/index.js"' in client.get("/dash/").text
    asset = client.get("/dash/components/fixture/index.js")
    assert asset.status_code == 200
    assert asset.text == "export const loaded = true;"


def test_serve_frame_route_returns_a_decodable_frame(tmp_path):
    page = Main("hi")
    client = TestClient(serve(page, js=tmp_path, wire="transports", tree="frame"))
    assert json.loads(decode_frame(client.get("/tree").content))["payload"] == page.to_node()
    assert client.get("/tree.json").status_code == 404  # json route not mounted in frame mode


def test_serve_inline_tree_needs_no_tree_route(tmp_path):
    design = Design(name="fixture", controls={"button": ControlSpec(tag="x-button")})
    client = TestClient(serve(Button(label="hi"), js=tmp_path, tree="inline", design=design))
    home = client.get("/").text
    assert 'const node = {"tag": "x-button"' in home and "fetch(" not in home
    assert client.get("/tree.json").status_code == 404
    assert client.get("/tree").status_code == 404


def test_build_routes_does_not_mutate_an_app(tmp_path):
    from starlette.applications import Starlette

    app = Starlette()
    routes = build_routes(Main("hi"), prefix="/dash", js=tmp_path, tree="inline")
    assert app.routes == []
    assert [route.path for route in routes] == ["/dash/", "/dash/js"]
    app.routes.extend(routes)
    assert "const node" in TestClient(app).get("/dash/").text


def test_build_routes_returns_the_complete_prefixed_route_set(tmp_path):
    package = ComponentPackage("fixture", tmp_path, ())
    supplied = Route("/ping", lambda _request: PlainTextResponse("pong"))
    routes = build_routes(Main("hi"), prefix="/dash", routes=[supplied], packages=[package], js=tmp_path)
    assert [route.path for route in routes] == [
        "/dash/",
        "/dash/tree.json",
        "/dash/ping",
        "/dash/components/fixture",
        "/dash/js",
    ]


def test_build_site_hosts_pages_with_independent_tree_modes_and_shared_assets(tmp_path):
    from starlette.applications import Starlette

    package = ComponentPackage("fixture", tmp_path, ())
    site = build_site(
        {
            "/": PageSpec(Main("home"), packages=[package], title="Home"),
            "/login": PageSpec(Main("login"), packages=[package], tree="frame", title="Login"),
            "/help/": PageSpec(Main("help"), tree="inline", title="Help"),
        },
        prefix="/dash",
        routes=[Route("/ping", lambda _request: PlainTextResponse("pong"))],
        js=tmp_path,
    )
    assert [route.path for route in site.pages] == [
        "/dash/",
        "/dash/tree.json",
        "/dash/login",
        "/dash/login/tree",
        "/dash/help",
    ]
    assert [route.path for route in site.supplied] == ["/dash/ping"]
    assert [route.path for route in site.assets] == ["/dash/components/fixture", "/dash/js"]
    assert [route.name for route in site.pages] == [
        "spaday:page:/",
        "spaday:tree:/",
        "spaday:page:/login",
        "spaday:tree:/login",
        "spaday:page:/help",
    ]

    client = TestClient(Starlette(routes=site.all()))
    home = client.get("/dash/").text
    login = client.get("/dash/login").text
    help_page = client.get("/dash/help").text
    assert "<title>Home</title>" in home and 'fetch("/dash/tree.json")' in home
    assert "<title>Login</title>" in login and 'fetch("/dash/login/tree")' in login
    assert json.loads(decode_frame(client.get("/dash/login/tree").content))["payload"] == Main("login").to_node()
    assert "<title>Help</title>" in help_page and "fetch(" not in help_page
    assert client.get("/dash/ping").text == "pong"


def test_build_site_keeps_each_pages_packages_in_its_own_head(tmp_path):
    from starlette.applications import Starlette

    first = ComponentPackage("first", tmp_path, (("js", "first.js"),))
    second = ComponentPackage("second", tmp_path, (("js", "second.js"),))
    site = build_site(
        {
            "/": PageSpec(Main("first"), packages=[first]),
            "/second": PageSpec(Main("second"), packages=[second]),
        },
        js=tmp_path,
    )
    client = TestClient(Starlette(routes=site.all()))
    root = client.get("/").text
    second_page = client.get("/second").text
    assert "/components/first/first.js" in root and "/components/second/second.js" not in root
    assert "/components/second/second.js" in second_page and "/components/first/first.js" not in second_page
    assert [route.path for route in site.assets] == ["/components/first", "/components/second", "/js"]


def test_build_site_rejects_path_and_package_collisions(tmp_path):
    page = Main("hi")
    with pytest.raises(ValueError, match="both normalize"):
        build_site({"/login": page, "//login/": page}, js=tmp_path)
    with pytest.raises(ValueError, match="tree for page"):
        build_site({"/": page, "/tree.json": page}, js=tmp_path)
    with pytest.raises(ValueError, match="asset routes"):
        build_site({"/js/settings": page}, js=tmp_path)

    first = ComponentPackage("fixture", tmp_path / "one", ())
    second = ComponentPackage("fixture", tmp_path / "two", ())
    with pytest.raises(ValueError, match="different component package descriptors"):
        build_site({"/": PageSpec(page, packages=[first]), "/other": PageSpec(page, packages=[second])}, js=tmp_path)


@pytest.mark.parametrize(
    ("pages", "prefix", "message"),
    [
        ({}, "", "at least one"),
        ({"relative": Main("hi")}, "", "must start"),
        ({"/with?query": Main("hi")}, "", "cannot contain"),
        ({"/with%20escape": Main("hi")}, "", "cannot contain"),
        ({"/a/../b": Main("hi")}, "", "cannot contain"),
        ({"/users/{user_id}": Main("hi")}, "", "requires static"),
        ({"/": Main("hi")}, "relative", "must start"),
    ],
)
def test_build_site_rejects_invalid_paths(pages, prefix, message, tmp_path):
    with pytest.raises(ValueError, match=message):
        build_site(pages, prefix=prefix, js=tmp_path)


def test_build_site_accepts_a_root_slash_prefix(tmp_path):
    site = build_site({"/": Main("hi")}, prefix="/", js=tmp_path)
    assert [route.path for route in site.pages] == ["/", "/tree.json"]


def test_build_site_rejects_supplied_get_collisions_but_allows_other_scopes(tmp_path):
    from starlette.applications import Starlette

    with pytest.raises(ValueError, match="supplied route.*conflicts with page"):
        build_site({"/": Main("hi")}, routes=[Route("/", lambda _request: PlainTextResponse("other"))], js=tmp_path)

    async def websocket_endpoint(websocket):
        await websocket.accept()
        await websocket.close()

    post = Route("/", lambda _request: PlainTextResponse("posted"), methods=["POST"])
    websocket = WebSocketRoute("/", websocket_endpoint)
    site = build_site({"/": Main("hi")}, routes=[post, websocket], js=tmp_path)
    client = TestClient(Starlette(routes=site.all()))
    assert client.post("/").text == "posted"
    with client.websocket_connect("/"):
        pass


@pytest.mark.parametrize(
    ("mount_path", "prefix"),
    [("", ""), ("/js", ""), ("/js/vendor", ""), ("/components", ""), ("/dash", "/dash")],
)
def test_build_site_rejects_supplied_mounts_that_shadow_assets(mount_path, prefix, tmp_path):
    from starlette.applications import Starlette
    from starlette.routing import Mount

    package = ComponentPackage("fixture", tmp_path, ())
    route = Mount(mount_path, app=Starlette())
    with pytest.raises(ValueError, match="shadows the site's asset route"):
        build_site({"/": PageSpec(Main("hi"), packages=[package])}, prefix=prefix, routes=[route], js=tmp_path)


def test_build_site_allows_an_unrelated_supplied_mount(tmp_path):
    from starlette.applications import Starlette
    from starlette.routing import Mount

    route = Mount("/static", app=Starlette())
    site = build_site({"/": Main("hi")}, routes=[route], js=tmp_path)
    assert site.supplied == (route,)


def test_build_site_rejects_supplied_gets_under_assets_but_allows_posts(tmp_path):
    from starlette.applications import Starlette

    get = Route("/js/custom.js", lambda _request: PlainTextResponse("other"))
    with pytest.raises(ValueError, match="shadows the site's asset route"):
        build_site({"/": Main("hi")}, routes=[get], js=tmp_path)

    post = Route("/js/custom.js", lambda _request: PlainTextResponse("posted"), methods=["POST"])
    site = build_site({"/": Main("hi")}, routes=[post], js=tmp_path)
    assert TestClient(Starlette(routes=site.all())).post("/js/custom.js").text == "posted"


def test_mount_site_adds_all_route_groups(tmp_path):
    from starlette.applications import Starlette

    app = Starlette()
    returned = mount_site(app, {"/": Main("home"), "/about": Main("about")}, js=tmp_path)
    assert returned is app
    assert [route.path for route in app.routes] == ["/", "/tree.json", "/about", "/about/tree.json", "/js"]
    assert TestClient(app).get("/about/tree.json").json() == Main("about").to_node()


def test_build_site_route_groups_support_fastapi_dependencies(tmp_path):
    fastapi = pytest.importorskip("fastapi")

    authenticated = []

    async def require_auth():
        authenticated.append(True)

    (tmp_path / "public.js").write_text("export {};", encoding="utf-8")
    site = build_site({"/": Main("home")}, js=tmp_path)
    app = fastapi.FastAPI()
    router = fastapi.APIRouter(dependencies=[fastapi.Depends(require_auth)])
    for route in site.pages:
        router.add_api_route(route.path, route.endpoint, methods=route.methods, include_in_schema=False)
    app.include_router(router)
    app.routes.extend(site.assets)

    client = TestClient(app)
    assert client.get("/").status_code == 200
    assert client.get("/tree.json").status_code == 200
    assert authenticated == [True, True]
    assert client.get("/js/public.js").status_code == 200
    assert authenticated == [True, True]


def test_build_routes_endpoints_work_on_a_fastapi_router(tmp_path):
    fastapi = pytest.importorskip("fastapi")
    from starlette.routing import Mount

    authenticated = []

    async def require_auth():
        authenticated.append(True)

    app = fastapi.FastAPI()
    router = fastapi.APIRouter(dependencies=[fastapi.Depends(require_auth)])
    for route in build_routes(Main("hi"), js=tmp_path, tree="inline"):
        if isinstance(route, Mount):
            app.routes.append(route)
        else:
            router.add_api_route(route.path, route.endpoint, methods=route.methods, include_in_schema=False)
    app.include_router(router)

    response = TestClient(app).get("/")
    assert response.status_code == 200
    assert authenticated == [True]


def test_build_routes_adapts_a_transports_style_websocket_for_fastapi(tmp_path):
    fastapi = pytest.importorskip("fastapi")
    from starlette.routing import Mount

    authenticated = []

    async def require_auth():
        authenticated.append(True)

    async def websocket_endpoint(websocket: Any):
        await websocket.accept()
        await websocket.send_text("connected")
        await websocket.close()

    app = fastapi.FastAPI()
    router = fastapi.APIRouter(dependencies=[fastapi.Depends(require_auth)])
    routes = build_routes(
        Main("hi"),
        prefix="/dash",
        routes=[WebSocketRoute("/ws", websocket_endpoint)],
        js=tmp_path,
        tree="inline",
    )
    for route in routes:
        if isinstance(route, Mount):
            app.routes.append(route)
        elif isinstance(route, WebSocketRoute):
            router.add_api_websocket_route(route.path, route.endpoint)
        else:
            router.add_api_route(route.path, route.endpoint, methods=route.methods, include_in_schema=False)
    app.include_router(router)

    with TestClient(app).websocket_connect("/dash/ws") as websocket:
        assert websocket.receive_text() == "connected"
    assert authenticated == [True]


@pytest.mark.parametrize("prefix", ["", "/dash"])
def test_mount_preserves_supplied_websocket_middleware(tmp_path, prefix):
    from starlette.applications import Starlette
    from starlette.middleware import Middleware

    calls = []

    class ProbeMiddleware:
        def __init__(self, app):
            self.app = app

        async def __call__(self, scope, receive, send):
            calls.append(scope["path"])
            await self.app(scope, receive, send)

    async def websocket_endpoint(websocket):
        await websocket.accept()
        await websocket.close()

    route = WebSocketRoute("/ws", websocket_endpoint, middleware=[Middleware(ProbeMiddleware)])
    app = Starlette()
    mount(app, Main("hi"), prefix=prefix, routes=[route], js=tmp_path, tree="inline")

    with TestClient(app).websocket_connect(f"{prefix}/ws"):
        pass
    assert calls == [f"{prefix}/ws"]


def test_inline_tree_rejects_custom_html(tmp_path):
    html = tmp_path / "page.html"
    html.write_text("<!doctype html><title>custom</title>", encoding="utf-8")
    with pytest.raises(ValueError, match="cannot be combined with html"):
        build_routes(Main("hi"), html=html, js=tmp_path, tree="inline")


def test_serve_installed_layout_hosts_packaged_assets():
    client = TestClient(serve(Main("hi"), layout="installed"))
    home = client.get("/").text
    assert "/js/cdn/index.js" in home and "/js/pkg/spaday_bg.wasm" in home
    assert client.get("/js/cdn/index.js").status_code == 200
    assert client.get("/js/pkg/spaday_bg.wasm").status_code == 200


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
    from starlette.routing import Mount, WebSocketRoute
    from starlette.staticfiles import StaticFiles

    async def ws_ep(websocket):  # a stand-in wire endpoint
        await websocket.accept()
        await websocket.close()

    app = Starlette()
    supplied = [
        WebSocketRoute("/ws", ws_ep),  # the wire — prefixed to match the generated URL
        Route("/api/ping", lambda _r: PlainTextResponse("pong")),  # a REST route — prefixed too
        Mount("/static", StaticFiles(directory=tmp_path)),  # a Mount — passes through (prefix it yourself)
    ]
    mount(app, Main("hi"), prefix="/dash", wire="transports", routes=supplied, js=tmp_path)
    paths = [getattr(r, "path", None) for r in app.routes]
    assert "/dash/ws" in paths  # WebSocketRoute prefixed → lines up with the generated wire URL
    assert "/dash/api/ping" in paths  # Route prefixed
    assert "/static" in paths  # Mount passes through unchanged
    assert "ws://${location.host}/dash/ws" in TestClient(app).get("/dash/").text


def test_mount_stamps_a_csp_nonce_on_generated_tags(tmp_path):
    from starlette.applications import Starlette

    app = Starlette()
    (tmp_path / "fixture.js").write_text("export {};", encoding="utf-8")
    package = ComponentPackage("fixture", tmp_path, (("js", "fixture.js"),))
    mount(app, Main("hi"), prefix="/dash", packages=[package], js=tmp_path, nonce="abc123")
    page = TestClient(app).get("/dash/").text
    assert '<script type="module" nonce="abc123">' in page  # the inline mount script
    assert 'nonce="abc123"' in page and "/components/fixture/fixture.js" in page


def test_mount_threads_stylesheets_and_styles(tmp_path):
    from starlette.applications import Starlette

    app = Starlette()
    mount(app, Main("hi"), prefix="/dash", js=tmp_path, stylesheets=["/static/theme.css"], styles=["body{margin:0}"], nonce="abc123")
    page = TestClient(app).get("/dash/").text
    assert '<link rel="stylesheet" nonce="abc123" href="/static/theme.css" />' in page
    assert '<style nonce="abc123">body{margin:0}</style>' in page


def test_serve_custom_html_and_background(tmp_path):
    html_file = tmp_path / "page.html"
    html_file.write_text("<!doctype html><title>custom</title>", encoding="utf-8")

    async def forever():
        await asyncio.sleep(3600)

    with TestClient(serve(Main(), js=tmp_path, html=html_file, background=[forever()])) as client:
        assert client.get("/").text == "<!doctype html><title>custom</title>"  # hand-authored bootstrap
        assert client.get("/tree.json").status_code == 200  # served while the background task runs
