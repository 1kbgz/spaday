import asyncio

import pytest

pytest.importorskip("aiohttp")  # the aiohttp backend — aiohttp is not a spaday dependency

from aiohttp.test_utils import TestClient, TestServer

from spaday.backends.aiohttp import serve
from spaday.components.shell import Main
from spaday.packages import ComponentPackage


def test_serve_hosts_page_and_tree(tmp_path):
    page = Main("hi")

    async def check():
        app = serve(page, js=tmp_path, bundles=["webawesome"], wire="transports")
        async with TestClient(TestServer(app)) as client:
            home = await (await client.get("/")).text()
            assert "connectStore" in home and "webawesome.css" in home  # the generated bootstrap + bundle
            tree = await (await client.get("/tree.json")).json()
            assert tree == page.to_node()  # tree served as JSON

    asyncio.run(check())


def test_serve_hosts_component_package_assets(tmp_path):
    (tmp_path / "index.js").write_text("export {};", encoding="utf-8")

    async def check():
        package = ComponentPackage("fixture", tmp_path, (("js", "index.js"),))
        async with TestClient(TestServer(serve(Main("hi"), packages=[package]))) as client:
            assert (await client.get("/components/fixture/index.js")).status == 200

    asyncio.run(check())
