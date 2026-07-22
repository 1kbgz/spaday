import json
from pathlib import Path

import pytest

pytest.importorskip("tornado")  # the Tornado backend — tornado is not a spaday dependency

from tornado.testing import AsyncHTTPTestCase  # noqa: E402

from spaday.backends.tornado import serve  # noqa: E402
from spaday.components.shell import Main  # noqa: E402
from spaday.packages import ComponentPackage  # noqa: E402


class TestTornadoBackend(AsyncHTTPTestCase):
    def get_app(self):
        # bundles_dir() (the real js/) backs the /js StaticFileHandler; the test only fetches / and /tree.json
        return serve(Main("hi"), bundles=["webawesome"], wire="transports")

    def test_serve_hosts_page_and_tree(self):
        home = self.fetch("/").body.decode()
        assert "connectStore" in home and "webawesome.css" in home  # the generated bootstrap + bundle
        assert json.loads(self.fetch("/tree.json").body) == Main("hi").to_node()  # tree served as JSON


class TestTornadoComponentPackage(AsyncHTTPTestCase):
    def get_app(self):
        assets = Path(__file__).parent / "fixtures" / "component_package"
        package = ComponentPackage("fixture", assets, (("js", "fixture.js"),))
        return serve(Main("hi"), packages=[package])

    def test_serves_package_asset(self):
        assert self.fetch("/components/fixture/fixture.js").code == 200
