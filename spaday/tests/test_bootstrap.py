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


def test_store_seeds_a_local_signal_store_without_a_wire():
    html = bootstrap(store={"dark": True, "view": "blotter"})
    assert "import { mount, init, Store }" in html  # Store imported even with no transports wire
    assert 'new Store({"dark": true, "view": "blotter"})' in html  # seeded from the dict
    assert "mount(document.body, node, store)" in html  # mounted with the store
    assert "connectStore" not in html  # local reactive state only, no server wire


def test_store_and_fragment_compose():
    f = bootstrap(store={"n": 1}, fragment=True, target="#widget")
    assert "<!doctype html>" not in f  # still a snippet
    assert 'mount(document.querySelector("#widget"), node, store)' in f  # seeded store, into the target


# A wire LIST mirrors several transports models into ONE store, each namespaced (the multi-model page).


def test_wire_list_shares_one_store_with_namespaced_connectstores():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}, {"url": "/ws/b", "namespace": "b"}], store={"x": 1})
    assert html.count("const store = new Store(") == 1  # ONE shared store for every model
    assert 'new Store({"x": 1})' in html
    assert 'connectStore(store, client0, (frame) => ws0.send(frame), { fromValue, toValue }, "a")' in html
    assert 'connectStore(store, client1, (frame) => ws1.send(frame), { fromValue, toValue }, "b")' in html
    assert "new WebSocket(`ws://${location.host}/ws`)" in html and "new WebSocket(`ws://${location.host}/ws/b`)" in html
    assert "transports_bg.wasm" in html and "await wasm.default(" in html  # the transports prologue
    assert html.count("mount(document.body, node, store)") == 1  # one mount of the shared store


def test_wire_list_session_appends_a_uuid():
    html = bootstrap(wire=[{"url": "/ws/s", "namespace": "s", "session": True}])
    assert "new WebSocket(`ws://${location.host}/ws/s?session=${crypto.randomUUID()}`)" in html  # fresh tenant


def test_wire_list_namespaced_wire_sets_a_connected_flag_bare_wire_does_not():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}, {"url": "/ws/form"}])
    assert 'store.set("a.connected", true)' in html and 'store.set("a.connected", false)' in html
    # the bare (form) wire has no namespace: no connected flag, and a 4-arg connectStore (no namespace arg)
    assert "connectStore(store, client1, (frame) => ws1.send(frame), { fromValue, toValue });" in html
    assert "connected" not in html.split("client1")[1]  # nothing after the form client sets a connected flag


def test_wire_list_generates_the_patch_sink():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}])
    # a SendPatch (spaday:patch) routes into the namespaced store; connectStore then sends the edit
    assert 'document.addEventListener("spaday:patch"' in html
    assert 'event.detail.model ? event.detail.model + "." + event.detail.field : event.detail.field' in html


def test_wire_list_respects_base_prefix():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}], base="/dash")
    assert "new WebSocket(`ws://${location.host}/dash/ws`)" in html  # the base prefixes each wire url
    assert 'fetch("/dash/tree.json")' in html


def test_string_wire_still_generates_a_single_unnamespaced_model():
    html = bootstrap(wire="transports")  # the single-model string form is unchanged
    assert "connectStore(store, client, (frame) => ws.send(frame), { fromValue, toValue });" in html  # no namespace arg
    assert "client0" not in html and "spaday:patch" not in html  # not the multi-wire codegen


def test_wire_typed_helper_matches_the_raw_dict_form():
    from spaday.bootstrap import Wire

    typed = bootstrap(wire=[Wire("/ws", namespace="g", flatten=False), Wire("/ws/form")])
    raw = bootstrap(wire=[{"url": "/ws", "namespace": "g", "flatten": False}, {"url": "/ws/form"}])
    assert typed == raw  # Wire(...) serializes to exactly the dict form — same generated page
    assert 'connectStore(store, client0, (frame) => ws0.send(frame), { fromValue, toValue }, "g", false)' in typed


def test_wire_list_flatten_false_passes_the_flatten_arg():
    # an opaque-map model (a chart's `data`) mirrors whole: connectStore gets `, "g", false`
    html = bootstrap(wire=[{"url": "/ws", "namespace": "g", "flatten": False}])
    assert 'connectStore(store, client0, (frame) => ws0.send(frame), { fromValue, toValue }, "g", false)' in html
    # default (flatten omitted) recurses sub-models — no flatten arg
    assert '{ fromValue, toValue }, "a")' in bootstrap(wire=[{"url": "/ws", "namespace": "a"}])
    # flatten=False with no namespace still positions the arg (undefined, false)
    assert "{ fromValue, toValue }, undefined, false)" in bootstrap(wire=[{"url": "/ws", "flatten": False}])
