import json
from pathlib import Path

import pytest

pytest.importorskip("tornado")  # the Tornado backend — tornado is not a spaday dependency

from tornado.testing import AsyncHTTPTestCase

from spaday import Button, Design, decode_frame
from spaday.backends.tornado import serve
from spaday.components.shell import Main
from spaday.packages import ComponentPackage
from spaday.ui import ControlSpec


class TestTornadoBackend(AsyncHTTPTestCase):
    def get_app(self):
        # bundles_dir() (the real js/) backs the /js StaticFileHandler; the test only fetches / and /tree.json
        return serve(Main("hi"), wire="transports")

    def test_serve_hosts_page_and_tree(self):
        home = self.fetch("/").body.decode()
        assert "connectStore" in home
        assert json.loads(self.fetch("/tree.json").body) == Main("hi").to_node()  # tree served as JSON


class TestTornadoComponentPackage(AsyncHTTPTestCase):
    def get_app(self):
        assets = Path(__file__).parent / "fixtures" / "component_package"
        package = ComponentPackage("fixture", assets, (("js", "fixture.js"),))
        return serve(Main("hi"), packages=[package])

    def test_serves_package_asset(self):
        assert self.fetch("/components/fixture/fixture.js").code == 200


class TestTornadoInlineTree(AsyncHTTPTestCase):
    def get_app(self):
        design = Design(name="fixture", controls={"button": ControlSpec(tag="x-button")})
        return serve(Button(label="hi"), tree="inline", design=design)

    def test_needs_no_tree_route(self):
        home = self.fetch("/").body.decode()
        assert 'const node = {"tag": "x-button"' in home and "fetch(" not in home
        assert self.fetch("/tree.json").code == 404


class TestTornadoFrameTree(AsyncHTTPTestCase):
    def get_app(self):
        return serve(Main("hi"), tree="frame")

    def test_serves_frame_without_json_route(self):
        assert self.fetch("/tree.json").code == 404
        assert decode_frame(self.fetch("/tree").body)
