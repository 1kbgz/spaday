import json

import pytest

from spaday import decode_frame
from spaday.bootstrap import bootstrap, bundles_dir, tree_frame, tree_json
from spaday.components.shell import Main

# The generic bootstrapping layer is framework-agnostic — these run with no webserver dependency.


def test_static_bootstrap_mounts_without_a_wire():
    html = bootstrap()
    assert "mount(document.body, node);" in html  # plain static mount
    assert "connectStore" not in html and "new Client()" not in html
    assert 'fetch("/tree.json")' in html


def test_transports_wire_bootstrap():
    html = bootstrap(wire="transports", ws="/sock")
    assert "connectStore(" in html and "transports_bg.wasm" in html
    assert "new WebSocket(`ws://${location.host}/sock`)" in html
    assert "mount(document.body, node, store)" in html


def test_bundles_are_pulled_into_head():
    html = bootstrap(bundles=["webawesome"])
    assert "@awesome.me/webawesome/dist/styles/webawesome.css" in html
    assert '<script type="module" src="/js/dist/cdn/examples/webawesome.js">' in html


def test_frame_tree_bootstrap_decodes_a_frame():
    html = bootstrap(wire="transports", tree="frame")
    assert "decodeFrame" in html and 'fetch("/tree")' in html and "/tree.json" not in html


def test_reconnect_bootstrap_reopens_the_socket():
    html = bootstrap(wire="transports", reconnect=True)
    assert "function connect()" in html and "setTimeout(connect, 1000)" in html


def test_scripts_are_injected():
    assert 'import "/static/handlers.js";' in bootstrap(scripts=["/static/handlers.js"])


def test_unknown_bundle_raises():
    with pytest.raises(ValueError):
        bootstrap(bundles=["nope"])


def test_tree_json_serializes_and_recomputes_per_call():
    page = Main("hi")
    assert json.loads(tree_json(page)) == page.to_node()
    calls = []

    def callable_page():
        calls.append(1)
        return Main(str(len(calls)))

    a = json.loads(tree_json(callable_page))["slots"]["default"][0]["props"]["textContent"]
    b = json.loads(tree_json(callable_page))["slots"]["default"][0]["props"]["textContent"]
    assert (a, b) == ({"Str": "1"}, {"Str": "2"})  # re-rendered each call


def test_tree_frame_round_trips_to_the_authored_tree():
    page = Main("hi")
    assert json.loads(decode_frame(tree_frame(page)))["payload"] == page.to_node()


def test_bundles_dir_points_at_the_js_bundles():
    assert bundles_dir().name == "js"


def test_base_prefixes_the_tree_js_and_ws_urls():
    html = bootstrap(base="/dash", wire="transports", bundles=["webawesome"])
    assert 'fetch("/dash/tree.json")' in html  # tree
    assert "/dash/js/dist/esm/index.js" in html  # runtime
    assert "/dash/js/node_modules/@awesome.me" in html  # bundle
    assert "${location.host}/dash/ws" in html  # websocket
    assert 'fetch("/tree.json")' in bootstrap()  # default base="" is unprefixed (served at root)


def test_fragment_emits_a_snippet_not_a_document():
    f = bootstrap(fragment=True, target="#widget", wire="transports", bundles=["webawesome"])
    assert "<!doctype html>" not in f and "<html" not in f  # a snippet to drop into a host template
    assert '<script type="module">' in f and "webawesome.css" in f  # bundle tags + the module script
    assert 'mount(document.querySelector("#widget"), node, store)' in f  # mounts into the target element


def test_target_selects_the_mount_point():
    assert 'mount(document.querySelector("#app"), node)' in bootstrap(target="#app")
    assert "mount(document.body, node)" in bootstrap()  # default mounts the body
