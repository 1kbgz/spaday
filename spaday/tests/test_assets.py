import asyncio
import gzip
import re
from urllib.parse import urljoin

import pytest

from spaday import AssetPolicy, ComponentPackage, element
from spaday.assets import AssetBundle


@pytest.fixture
def asset_dirs(tmp_path):
    core = tmp_path / "core"
    peer = tmp_path / "peer"
    (core / "dist/esm").mkdir(parents=True)
    (peer / "cdn").mkdir(parents=True)
    (peer / "pkg").mkdir()
    (core / "dist/esm/index.js").write_text("export {};\n" * 300)
    (peer / "cdn/index.js").write_text('import "../pkg/helper.js";\n' * 100)
    (peer / "pkg/helper.js").write_text("export {};\n" * 300)
    (peer / "pkg/engine.wasm").write_bytes(b"\0asm\1\0\0\0")
    package = ComponentPackage("fixture", peer, (("js", "cdn/index.js"),), imports=(("fixture", "cdn/index.js"),))
    return core, peer, package


def test_content_hashes_and_immutable_snapshot(asset_dirs):
    _, peer, _ = asset_dirs
    policy = AssetPolicy(cache="immutable", compression="gzip")
    first = AssetBundle(peer, "/peer", policy)
    assert first.digest is not None
    original = first.response("_v/" + first.digest + "/pkg/helper.js", {}).body
    (peer / "pkg/helper.js").write_text("changed")
    second = AssetBundle(peer, "/peer", policy)
    assert first.url != second.url
    assert first.response("_v/" + first.digest + "/pkg/helper.js", {}).body == original
    assert second.response("_v/" + first.digest + "/pkg/helper.js", {}).status == 404
    assert second.response("pkg/helper.js", {}).headers["Cache-Control"] == "no-cache"
    assert second.url == AssetBundle(peer, "/different-prefix", policy).url.replace("/different-prefix", "/peer")


def test_revalidate_updates_content_and_reuses_compression(asset_dirs):
    _, peer, _ = asset_dirs
    bundle = AssetBundle(peer, "/peer", AssetPolicy(compression="gzip"))
    headers = {"accept-encoding": "gzip"}
    first = bundle.response("pkg/helper.js", headers)
    assert first.body is bundle.response("pkg/helper.js", headers).body
    (peer / "pkg/helper.js").write_text("replacement" * 300)
    second = bundle.response("pkg/helper.js", headers)
    assert first.headers["ETag"] != second.headers["ETag"]
    assert gzip.decompress(second.body) == b"replacement" * 300


@pytest.mark.parametrize(
    "header,encoding,status",
    [
        ("", None, 200),
        ("gzip", "gzip", 200),
        ("gzip;q=0", None, 200),
        ("gzip;q=0, *;q=1", None, 200),
        ("br, gzip;q=0.5, identity;q=0", "gzip", 200),
        ("gzip;q=0, identity;q=0", None, 406),
        ("*;q=0", None, 406),
        ("*;q=0, gzip;q=1", "gzip", 200),
        ("gzip;q=invalid", None, 200),
    ],
)
def test_encoding_negotiation(asset_dirs, header, encoding, status):
    _, peer, _ = asset_dirs
    bundle = AssetBundle(peer, "/peer", AssetPolicy(compression="gzip"))
    result = bundle.response("pkg/helper.js", {"accept-encoding": header})
    assert result.status == status
    assert result.headers.get("Content-Encoding") == encoding


def test_paths_and_representation_validators(asset_dirs, tmp_path):
    _, peer, _ = asset_dirs
    secret = tmp_path / "secret.txt"
    secret.write_text("private")
    (peer / "escape.txt").symlink_to(secret)
    for policy in (AssetPolicy(), AssetPolicy(cache="immutable")):
        bundle = AssetBundle(peer, "/peer", policy)
        for path in ("../secret.txt", "escape.txt", "/secret.txt", "..\\secret.txt", "_v/wrong/pkg/helper.js"):
            assert bundle.response(path, {}).status == 404
    bundle = AssetBundle(peer, "/peer", AssetPolicy(compression="gzip"))
    plain = bundle.response("pkg/helper.js", {})
    zipped = bundle.response("pkg/helper.js", {"accept-encoding": "gzip"})
    assert plain.headers["ETag"] != zipped.headers["ETag"]
    assert bundle.response("pkg/helper.js", {"if-none-match": "W/" + plain.headers["ETag"]}).status == 304
    assert bundle.response("pkg/helper.js", {"if-none-match": plain.headers["ETag"], "accept-encoding": "gzip"}).status == 200
    assert bundle.response("pkg/helper.js", {}, "HEAD").body == b""
    assert bundle.response("pkg/helper.js", {}, "POST").status == 405


@pytest.mark.parametrize("backend", ["starlette", "flask", "aiohttp", "tornado"])
def test_backend_asset_contract(asset_dirs, backend):
    pytest.importorskip(backend)
    from importlib import import_module

    core, peer, package = asset_dirs
    app = import_module(f"spaday.backends.{backend}").serve(
        element("div"),
        prefix="/app",
        js=core,
        packages=[package],
        assets=AssetPolicy(cache="immutable", compression="gzip"),
    )

    async def exercise(fetch):
        status, headers, home = await fetch("/app/")
        assert status == 200 and "immutable" not in headers.get("cache-control", "")
        html = home.decode()
        match = re.search(r"/app/components/fixture/_v/[0-9a-f]{64}", html)
        assert match is not None
        prefix = match.group()
        assert re.search(r"/app/js/_v/[0-9a-f]{64}/dist/esm/index.js", html)
        assert f'"fixture": "{prefix}/cdn/index.js"' in html
        relative = urljoin(prefix + "/cdn/index.js", "../pkg/helper.js")
        status, headers, body = await fetch(relative, {"Accept-Encoding": "gzip"})
        assert status == 200
        assert headers["content-encoding"] == "gzip"
        assert headers["vary"] == "Accept-Encoding"
        assert "immutable" in headers["cache-control"]
        assert gzip.decompress(body) == (peer / "pkg/helper.js").read_bytes()
        assert int(headers["content-length"]) == len(body)
        status, cached_headers, empty = await fetch(relative, {"Accept-Encoding": "gzip", "If-None-Match": headers["etag"]})
        assert status == 304 and not empty and cached_headers["etag"] == headers["etag"]
        status, head_headers, body = await fetch(relative, {"Accept-Encoding": "gzip"}, "HEAD")
        assert status == 200 and not body and head_headers["content-length"] == headers["content-length"]
        assert (await fetch(relative, {"Accept-Encoding": "gzip;q=0"}))[1].get("content-encoding") is None
        assert (await fetch(prefix + "/pkg/engine.wasm"))[1]["content-type"] == "application/wasm"
        assert (await fetch("/app/components/fixture/pkg/helper.js"))[1]["cache-control"] == "no-cache"
        assert (await fetch(prefix.replace("/_v/", "/_v/wrong") + "/pkg/helper.js"))[0] == 404
        assert "cache-control" not in (await fetch("/app/tree.json"))[1]

    async def run():
        if backend == "starlette":
            from starlette.testclient import TestClient

            with TestClient(app) as client:

                async def fetch(path, headers=None, method="GET"):
                    with client.stream(method, path, headers=headers or {"Accept-Encoding": "identity"}) as r:
                        return r.status_code, dict(r.headers), b"".join(r.iter_raw())

                await exercise(fetch)
        elif backend == "flask":
            client = app.test_client()

            async def fetch(path, headers=None, method="GET"):
                r = client.open(path, method=method, headers=headers or {})
                return r.status_code, {k.lower(): v for k, v in r.headers.items()}, r.data

            await exercise(fetch)
        elif backend == "aiohttp":
            from aiohttp.test_utils import TestClient, TestServer

            async with TestClient(TestServer(app), auto_decompress=False) as client:

                async def fetch(path, headers=None, method="GET"):
                    r = await client.request(method, path, headers=headers or {"Accept-Encoding": "identity"})
                    return r.status, {k.lower(): v for k, v in r.headers.items()}, await r.read()

                await exercise(fetch)
        else:
            from tornado.httpclient import AsyncHTTPClient
            from tornado.httpserver import HTTPServer
            from tornado.netutil import bind_sockets

            sockets = bind_sockets(0, "127.0.0.1")
            port = sockets[0].getsockname()[1]
            server = HTTPServer(app)
            server.add_sockets(sockets)
            try:

                async def fetch(path, headers=None, method="GET"):
                    r = await AsyncHTTPClient().fetch(
                        f"http://127.0.0.1:{port}{path}", headers=headers or {}, method=method, decompress_response=False, raise_error=False
                    )
                    return r.code, {k.lower(): v for k, v in r.headers.items()}, r.body

                await exercise(fetch)
            finally:
                server.stop()
                await server.close_all_connections()

    asyncio.run(run())


def test_site_shares_hashed_bundles_across_pages(asset_dirs):
    from starlette.applications import Starlette
    from starlette.testclient import TestClient

    from spaday.backends.starlette import PageSpec, build_site
    from spaday.bootstrap import Lifecycle

    core, _, package = asset_dirs
    site = build_site(
        {
            "/": PageSpec(element("div"), packages=[package]),
            "/second": PageSpec(element("div"), packages=[package], lifecycle=Lifecycle()),
        },
        prefix="/site",
        js=core,
        assets=AssetPolicy(cache="immutable"),
    )
    assert len(site.assets) == 2
    with TestClient(Starlette(routes=site.all())) as client:
        first = client.get("/site/").text
        second = client.get("/site/second").text
        hashes = re.findall(r"/site/(?:js|components/fixture)/_v/[0-9a-f]{64}", first)
        assert len(set(hashes)) == 2
        for prefix in hashes:
            assert prefix in second
        peer_prefix = next(prefix for prefix in hashes if "components" in prefix)
        assert client.get(peer_prefix + "/cdn/index.js").status_code == 200
        assert client.get("/site/second/tree.json").status_code == 200


def test_source_snapshot_includes_runtime_dependencies_only(tmp_path):
    from spaday.assets import asset_bundles

    for name in ("dist/runtime.js", "node_modules/@1kbgz/transports/dist/runtime.js", "src/private.ts"):
        path = tmp_path / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("export {};")
    bundle = asset_bundles(tmp_path, (), "", AssetPolicy(cache="immutable"), source=True)[0]
    for name in ("dist/runtime.js", "node_modules/@1kbgz/transports/dist/runtime.js"):
        assert bundle.response(f"_v/{bundle.digest}/{name}", {}).status == 200
    assert bundle.response(f"_v/{bundle.digest}/src/private.ts", {}).status == 404


@pytest.mark.parametrize("options", [{"cache": "forever"}, {"compression": "brotli"}])
def test_invalid_policy(options):
    with pytest.raises(ValueError):
        AssetPolicy(**options)
