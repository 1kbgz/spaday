import pytest

pytest.importorskip("flask")  # the Flask (WSGI) backend — flask is not a spaday dependency

from spaday.backends.flask import serve  # noqa: E402
from spaday.components.shell import Main  # noqa: E402
from spaday.packages import ComponentPackage  # noqa: E402


def test_serve_hosts_page_and_tree(tmp_path):
    page = Main("hi")
    client = serve(page, js=tmp_path, bundles=["webawesome"], wire="transports").test_client()
    home = client.get("/").get_data(as_text=True)
    assert "connectStore" in home and "webawesome.css" in home  # the generated bootstrap + bundle
    assert client.get("/tree.json").get_json() == page.to_node()  # tree served as JSON


def test_serve_hosts_component_package_assets(tmp_path):
    (tmp_path / "index.js").write_text("export {};", encoding="utf-8")
    package = ComponentPackage("fixture", tmp_path, (("js", "index.js"),))
    client = serve(Main("hi"), packages=[package]).test_client()
    assert client.get("/components/fixture/index.js").status_code == 200
