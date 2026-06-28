"""Every example, smoke-tested across the integration ladder — no-HTML ``serve()``, some-HTML ``mount()``
into an existing app, full-custom-HTML ``bootstrap(fragment=…)`` / SSR, and the notebook widgets. Each
test skips if its optional extra is missing (``starlette`` / ``transports`` / ``perspective`` /
``anywidget``). ``cluster`` and ``gateway`` have their own dedicated tests (test_cluster / test_gateway)."""

import json

import pytest

pytest.importorskip("starlette", reason="examples need the [examples] extra (starlette)")


def _client(app):
    from starlette.testclient import TestClient

    return TestClient(app)  # no context manager → the background lifespan stays inert (we only GET)


# ── No HTML: serve() owns the whole app ──────────────────────────────────────────────────────────


def test_serve_form_generates_a_bootstrap_page():
    form = pytest.importorskip("spaday.examples.form", reason="needs transports + starlette")
    page = _client(form.app).get("/")
    assert page.status_code == 200
    assert "connectStore(" in page.text and "mount(document.body, node, store)" in page.text  # serve() generated it
    assert _client(form.app).get("/tree.json").status_code == 200  # the tree is hosted, not hand-built


def test_serve_reactive_generates_a_bootstrap_page():
    reactive = pytest.importorskip("spaday.examples.reactive", reason="needs transports + starlette")
    page = _client(reactive.app).get("/")
    assert page.status_code == 200 and "mount(document.body, node, store)" in page.text


# ── Some HTML: mount() into an existing app ───────────────────────────────────────────────────────


def test_mount_embeds_into_an_existing_app_at_a_prefix():
    embed = pytest.importorskip("spaday.examples.embed", reason="needs starlette")
    client = _client(embed.app)
    home = client.get("/")
    assert home.status_code == 200 and "My existing app" in home.text  # the host's OWN homepage HTML
    assert "/spaday/" in home.text  # which links to the mounted spaday panel
    spa = client.get("/spaday/")  # spaday lives only under the prefix
    assert spa.status_code == 200 and "mount(document.body, node, store)" in spa.text
    assert client.get("/spaday/tree.json").status_code == 200


# ── Full custom HTML: the host owns the page; spaday is a fragment / SSR island ────────────────────


def test_fragment_drops_into_a_host_owned_page():
    fragment = pytest.importorskip("spaday.examples.fragment", reason="needs starlette")
    client = _client(fragment.app)
    home = client.get("/")
    assert home.status_code == 200
    assert "The host owns this page" in home.text  # the host's own full HTML
    assert '<div id="spaday-root"></div>' in home.text  # the host-provided mount node
    assert 'mount(document.querySelector("#spaday-root"), node)' in home.text  # the fragment mounts into it
    assert home.text.count("<!doctype html>") == 1  # ONE document — the host's, not a spaday-generated one
    assert client.get("/tree.json").status_code == 200  # the host serves spaday's tree itself


def test_ssr_ships_server_rendered_markup_to_hydrate():
    ssr = pytest.importorskip("spaday.examples.ssr", reason="needs starlette")
    home = _client(ssr.app).get("/")
    assert home.status_code == 200
    assert "spaday SSR" in home.text  # the server-rendered content is in the body (view-source paints it)
    assert "hydrate(" in home.text and 'id="tree"' in home.text  # + the tree the browser hydrates onto


# ── Notebook / anywidget: a reusable component builder + a demo wrapper ────────────────────────────


def test_widget_builds_a_component_tree_and_a_widget():
    widget = pytest.importorskip("spaday.examples.widget", reason="needs the [widget] extra (anywidget)")
    assert "wa-card" in json.dumps(widget.build().to_node())  # a real component tree
    assert widget.demo() is not None  # a ready-to-display Widget


def test_devices_builds_a_widget():
    devices = pytest.importorskip("spaday.examples.devices", reason="needs the [widget] extra (anywidget)")
    assert devices.demo() is not None


# ── The omnibus: serve(wire=[…]) — the multi-model page ───────────────────────────────────────────


def test_omnibus_serves_the_namespaced_multi_wire_page():
    main = pytest.importorskip("spaday.examples.__main__", reason="needs the [perspective] extra")
    from spaday.bootstrap import tree_json

    tree = tree_json(main.page)
    assert '"root-class:wa-dark"' in tree and "global.data" in tree  # namespaced declarative tree
    page = _client(main.app).get("/")
    assert page.status_code == 200
    assert "connectStore(store, client0" in page.text and '"global"' in page.text  # several namespaced wires
    assert _client(main.app).get("/tree.json").status_code == 200
