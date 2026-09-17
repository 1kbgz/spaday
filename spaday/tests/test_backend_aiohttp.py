import asyncio

import pytest

pytest.importorskip("aiohttp")  # the aiohttp backend — aiohttp is not a spaday dependency

from aiohttp.test_utils import TestClient, TestServer

from spaday import Button, Design, decode_frame
from spaday.backends.aiohttp import serve
from spaday.components.shell import Main
from spaday.packages import ComponentPackage
from spaday.ui import ControlSpec


def test_serve_hosts_page_and_tree(tmp_path):
    page = Main("hi")

    async def check():
        app = serve(page, js=tmp_path, wire="transports")
        async with TestClient(TestServer(app)) as client:
            home = await (await client.get("/")).text()
            assert "connectStore" in home
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


def test_serve_inline_tree_needs_no_tree_route(tmp_path):
    async def check():
        design = Design(name="fixture", controls={"button": ControlSpec(tag="x-button")})
        async with TestClient(TestServer(serve(Button(label="hi"), js=tmp_path, tree="inline", design=design))) as client:
            home = await (await client.get("/")).text()
            assert 'const node = {"tag": "x-button"' in home and "fetch(" not in home
            assert (await client.get("/tree.json")).status == 404

    asyncio.run(check())


def test_serve_frame_tree(tmp_path):
    async def check():
        async with TestClient(TestServer(serve(Main("hi"), js=tmp_path, tree="frame"))) as client:
            assert (await client.get("/tree.json")).status == 404
            assert decode_frame(await (await client.get("/tree")).read())

    asyncio.run(check())
