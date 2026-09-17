import pytest

pytest.importorskip("flask")  # the Flask (WSGI) backend — flask is not a spaday dependency

from spaday import Button, Design, decode_frame
from spaday.backends.flask import serve
from spaday.components.shell import Main
from spaday.packages import ComponentPackage
from spaday.ui import ControlSpec


def test_serve_hosts_page_and_tree(tmp_path):
    page = Main("hi")
    client = serve(page, js=tmp_path, wire="transports").test_client()
    home = client.get("/").get_data(as_text=True)
    assert "connectStore" in home
    assert client.get("/tree.json").get_json() == page.to_node()  # tree served as JSON


def test_serve_hosts_component_package_assets(tmp_path):
    (tmp_path / "index.js").write_text("export {};", encoding="utf-8")
    package = ComponentPackage("fixture", tmp_path, (("js", "index.js"),))
    client = serve(Main("hi"), packages=[package]).test_client()
    assert client.get("/components/fixture/index.js").status_code == 200


def test_serve_inline_tree_needs_no_tree_route(tmp_path):
    design = Design(name="fixture", controls={"button": ControlSpec(tag="x-button")})
    client = serve(Button(label="hi"), js=tmp_path, tree="inline", design=design).test_client()
    home = client.get("/").get_data(as_text=True)
    assert 'const node = {"tag": "x-button"' in home and "fetch(" not in home
    assert client.get("/tree.json").status_code == 404


def test_serve_frame_tree(tmp_path):
    client = serve(Main("hi"), js=tmp_path, tree="frame").test_client()
    assert client.get("/tree.json").status_code == 404
    assert decode_frame(client.get("/tree").data)
