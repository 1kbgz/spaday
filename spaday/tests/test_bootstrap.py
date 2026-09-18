import json

import pytest

from spaday import decode_frame, element
from spaday.bootstrap import bootstrap, bundles_dir, tree_frame, tree_json
from spaday.components.shell import Main
from spaday.packages import ComponentPackage

# The generic bootstrapping layer is framework-agnostic — these run with no webserver dependency.


def test_static_bootstrap_mounts_without_a_wire():
    html = bootstrap()
    assert 'trackRoot(mount(document.body, node), node, "/tree.json");' in html  # plain static mount, refreshable
    assert "connectStore" not in html and "new Client()" not in html
    assert 'fetch("/tree.json")' in html


def test_transports_wire_bootstrap():
    html = bootstrap(wire="transports", ws="/sock")
    assert "connectStore(" in html and "transports_bg.wasm" in html
    assert "client.connect(`ws://${location.host}/sock`)" in html
    assert "mount(document.body, node, store)" in html


def test_component_package_assets_are_pulled_into_head(tmp_path):
    package = ComponentPackage("fixture", tmp_path, (("css", "theme.css"), ("js", "index.js")))
    html = bootstrap(packages=[package])
    assert 'href="/components/fixture/theme.css"' in html
    assert 'src="/components/fixture/index.js"' in html


def test_frame_tree_bootstrap_decodes_a_frame():
    html = bootstrap(wire="transports", tree="frame")
    assert "decodeFrame" in html and 'fetch("/tree")' in html and "/tree.json" not in html


def test_inline_tree_bootstrap_embeds_the_page_without_fetching_it():
    html = bootstrap(tree="inline", page=Main("hi"))
    assert 'const node = {"tag": "spa-main"' in html
    assert "fetch(" not in html
    assert 'trackRoot(mount(document.body, node), node, "");' in html


def test_inline_tree_escapes_script_closing_content():
    html = bootstrap(tree="inline", page=element("span").text("</script><script>alert(1)</script>"))
    assert '"Str": "\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"' in html
    assert "</script><script>alert(1)</script>" not in html


def test_inline_tree_requires_a_page_and_tree_modes_are_validated():
    with pytest.raises(ValueError, match="requires page"):
        bootstrap(tree="inline")
    with pytest.raises(ValueError, match="tree must be"):
        bootstrap(tree="other")


def test_reconnect_bootstrap_reopens_the_socket():
    html = bootstrap(wire="transports", reconnect=True)
    assert "client.run(`ws://${location.host}/ws`, { retry: 1000 })" in html
    assert "connectStore(store, client, undefined" in html


def test_scripts_are_injected():
    html = bootstrap(scripts=["/static/handlers.js"])
    assert '"/static/handlers.js"' in html and "import(u)" in html


def test_a_failing_extra_script_cannot_abort_the_page():
    """A third-party bundle that throws while loading (two copies of one custom element, say) must
    cost that script only — a static import would abort the module before `mount` and render
    nothing at all."""
    html = bootstrap(scripts=["/static/handlers.js"])
    assert 'import "/static/handlers.js";' not in html  # not a static import
    scripts = html[html.index("await Promise.all([") :]
    assert ".catch(" in scripts[: scripts.index("\n")]  # the rejection is caught
    assert html.index("await Promise.all([") < html.index("mount(")  # still awaited before mount


def test_stylesheets_and_styles_are_injected_with_the_nonce():
    html = bootstrap(stylesheets=["/static/a.css", "/static/b.css"], styles=["body{margin:0}"], nonce="abc123")
    assert '<link rel="stylesheet" nonce="abc123" href="/static/a.css" />' in html
    assert '<link rel="stylesheet" nonce="abc123" href="/static/b.css" />' in html
    assert '<style nonce="abc123">body{margin:0}</style>' in html
    # without a nonce the tags are plain
    plain = bootstrap(stylesheets=["/static/a.css"], styles=["body{margin:0}"])
    assert '<link rel="stylesheet" href="/static/a.css" />' in plain
    assert "<style>body{margin:0}</style>" in plain


def test_stylesheets_land_in_fragment_snippets_too():
    f = bootstrap(fragment=True, target="#widget", stylesheets=["/static/a.css"], nonce="abc123")
    assert '<link rel="stylesheet" nonce="abc123" href="/static/a.css" />' in f
    assert "<!doctype html>" not in f


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


def test_source_bundles_dir_points_at_the_js_bundles():
    assert bundles_dir("source").name == "js"


def test_installed_layout_uses_packaged_assets():
    assert bundles_dir("installed").name == "extension"
    html = bootstrap(layout="installed", wire="transports")
    assert 'from "/js/cdn/index.js"' in html
    assert 'module_or_path: "/js/pkg/spaday_bg.wasm"' in html
    assert 'from "/js/transports/cdn/index.js"' in html
    assert 'module_or_path: "/js/transports/pkg/transports_bg.wasm"' in html
    assert "node_modules" not in html and "/dist/" not in html


def test_invalid_asset_layout_raises():
    with pytest.raises(ValueError, match="layout"):
        bootstrap(layout="other")


def test_bare_js_dir_is_not_mistaken_for_a_source_checkout(tmp_path, monkeypatch):
    # plotly installs its labextension data at top-level site-packages/js — a `js` dir next to an
    # installed spaday must not flip layout detection to source (its URLs would 404)
    import spaday.bootstrap as bs

    monkeypatch.setattr(bs, "_SOURCE_DIR", tmp_path / "js")
    (tmp_path / "js").mkdir()
    (tmp_path / "js" / "install.json").write_text("{}", encoding="utf-8")
    assert bundles_dir().name == "extension"
    # a foreign package.json (other distributions ship one too) is not a checkout marker either
    (tmp_path / "js" / "package.json").write_text('{"name": "plotly.js"}', encoding="utf-8")
    assert bundles_dir().name == "extension"
    # nor is an unparseable one
    (tmp_path / "js" / "package.json").write_text("not json", encoding="utf-8")
    assert bundles_dir().name == "extension"
    # the real sentinels: spaday's own package.json name AND built bundles under js/dist
    (tmp_path / "js" / "package.json").write_text('{"name": "@1kbgz/spaday"}', encoding="utf-8")
    assert bundles_dir().name == "extension"  # dist/ still missing
    (tmp_path / "js" / "dist").mkdir()
    assert bundles_dir() == tmp_path / "js"


def test_base_prefixes_the_tree_js_and_ws_urls():
    html = bootstrap(base="/dash", wire="transports", layout="source")
    assert 'fetch("/dash/tree.json")' in html  # tree
    assert "/dash/js/dist/esm/index.js" in html  # runtime
    assert "${location.host}/dash/ws" in html  # websocket
    assert 'fetch("/tree.json")' in bootstrap()  # default base="" is unprefixed (served at root)


def test_tree_url_can_differ_from_the_asset_and_wire_base():
    html = bootstrap(base="/dash", tree_url="/dash/login/tree.json", wire="transports", layout="source")
    assert 'fetch("/dash/login/tree.json")' in html
    assert 'trackRoot(mount(document.body, node, store), node, "/dash/login/tree.json", store);' in html
    assert "/dash/js/dist/esm/index.js" in html
    assert "${location.host}/dash/ws" in html


def test_frame_tree_url_can_be_overridden_without_enabling_json_refresh():
    html = bootstrap(tree="frame", tree_url="/account/tree")
    assert 'fetch("/account/tree")' in html
    assert 'trackRoot(mount(document.body, node), node, "");' in html


def test_inline_tree_rejects_a_tree_url_and_empty_urls_are_invalid():
    with pytest.raises(ValueError, match="cannot be used"):
        bootstrap(tree="inline", page=Main("hi"), tree_url="/unused")
    with pytest.raises(ValueError, match="must not be empty"):
        bootstrap(tree_url="")


def test_tree_url_is_safe_inside_the_generated_module_script():
    breakout = "</script><script>alert(1)</script>"
    html = bootstrap(tree_url=breakout)
    assert breakout not in html
    assert "\\u003c/script>\\u003cscript>alert(1)\\u003c/script>" in html


def test_fragment_emits_a_snippet_not_a_document():
    f = bootstrap(fragment=True, target="#widget", wire="transports")
    assert "<!doctype html>" not in f and "<html" not in f  # a snippet to drop into a host template
    assert '<script type="module">' in f
    assert 'mount(document.querySelector("#widget"), node, store)' in f  # mounts into the target element


def test_target_selects_the_mount_point():
    assert 'mount(document.querySelector("#app"), node)' in bootstrap(target="#app")
    assert "mount(document.body, node)" in bootstrap()  # default mounts the body


def test_store_seeds_a_local_signal_store_without_a_wire():
    html = bootstrap(store={"dark": True, "view": "blotter"})
    assert "import { mount, init, trackRoot, Store }" in html  # Store imported even with no transports wire
    assert 'new Store({"dark": true, "view": "blotter"})' in html  # seeded from the dict
    assert "mount(document.body, node, store)" in html  # mounted with the store
    assert "connectStore" not in html  # local reactive state only, no server wire


def test_store_seed_js_expression_is_client_evaluated():
    from spaday.bootstrap import Js

    # A `Js` seed value is emitted verbatim (parenthesized) instead of a JSON literal, so state only
    # the browser knows (e.g. prefers-color-scheme) can seed the store at boot.
    html = bootstrap(store={"dark": Js('matchMedia("(prefers-color-scheme: dark)").matches'), "view": "blotter"})
    assert 'new Store({"dark": (matchMedia("(prefers-color-scheme: dark)").matches), "view": "blotter"})' in html
    assert "import { mount, init, trackRoot, Store }" in html  # still a plain seeded store, no wire


def test_store_seed_escapes_script_closing_content():
    html = bootstrap(store={"</script>": "</script><script>alert(1)</script>"})
    assert 'new Store({"\\u003c/script>": "\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"})' in html
    assert "</script><script>alert(1)</script>" not in html


def test_bootstrap_configuration_escapes_script_closing_content():
    breakout = "</script><script>alert(1)</script>"
    html = bootstrap(scripts=[breakout], persist={breakout: breakout}, url={breakout: breakout})
    assert breakout not in html
    assert html.count("\\u003c/script>\\u003cscript>alert(1)\\u003c/script>") == 7


def test_persist_round_trips_a_store_field_through_localstorage():
    # `persist` maps a store field to a localStorage key: the persisted value overrides the seed at
    # boot (before mount, so the tree renders with it), and later writes to the field are stored.
    html = bootstrap(store={"dark": False}, persist={"dark": "app:dark"})
    assert 'const v = localStorage.getItem("app:dark"); if (v !== null) store.set("dark", JSON.parse(v));' in html
    assert 'store.subscribe("dark", (v) => { try { localStorage.setItem("app:dark", JSON.stringify(v)); } catch {} });' in html
    assert html.index('localStorage.getItem("app:dark")') < html.index("mount(document.body, node, store)")


def test_persist_alone_creates_a_store():
    html = bootstrap(persist={"dark": "app:dark"})
    assert "import { mount, init, trackRoot, Store }" in html  # Store imported for the persist-only page
    assert "const store = new Store()" in html
    assert "mount(document.body, node, store)" in html


def test_url_binds_a_store_field_to_a_query_parameter():
    # `url` maps a store field to a query parameter: `bindUrl` seeds the field from the URL before the
    # mount (so the tree renders with the deep link's value) and pushes history entries on change.
    html = bootstrap(store={"selected": ""}, url={"selected": "model"})
    assert "import { mount, init, trackRoot, Store, bindUrl }" in html
    assert 'bindUrl(store, {"selected": "model"});' in html
    assert html.index("bindUrl(store") < html.index("mount(document.body, node, store)")


def test_url_seeds_after_persist():
    # a deep link beats a remembered preference: the URL seed lands after the localStorage override
    html = bootstrap(persist={"selected": "app:selected"}, url={"selected": "model"})
    assert "const store = new Store()" in html  # url/persist alone still create a store
    assert html.index('localStorage.getItem("app:selected")') < html.index("bindUrl(store")


def test_store_and_fragment_compose():
    f = bootstrap(store={"n": 1}, fragment=True, target="#widget")
    assert "<!doctype html>" not in f  # still a snippet
    assert 'mount(document.querySelector("#widget"), node, store)' in f  # seeded store, into the target


# A wire LIST mirrors several transports models into ONE store, each namespaced (the multi-model page).


def test_wire_list_shares_one_store_with_namespaced_connectstores():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}, {"url": "/ws/b", "namespace": "b"}], store={"x": 1})
    assert html.count("const store = new Store(") == 1  # ONE shared store for every model
    assert 'new Store({"x": 1})' in html
    assert "connectStore(store, client0, undefined" in html
    assert "connectStore(store, client1, undefined" in html
    assert '{ fromValue, toValue }, "a")' in html and '{ fromValue, toValue }, "b")' in html
    assert "client0.connect(`ws://${location.host}/ws`)" in html
    assert "client1.connect(`ws://${location.host}/ws/b`)" in html
    assert "transports_bg.wasm" in html and "await wasm.default(" in html  # the transports prologue
    assert html.count("mount(document.body, node, store)") == 1  # one mount of the shared store


def test_wire_list_session_appends_a_per_load_id():
    html = bootstrap(wire=[{"url": "/ws/s", "namespace": "s", "session": True}])
    # a fresh per-load tenant id appended to the ws url; crypto.randomUUID is secure-context-only, so it
    # must degrade gracefully (plain http from another host has no secure context)
    assert "/ws/s?session=${globalThis.crypto?.randomUUID?.() ?? " in html
    assert "Math.random()" in html  # the insecure-context (http) fallback


def test_wire_list_namespaced_wire_sets_a_connected_flag_bare_wire_does_not():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}, {"url": "/ws/form"}])
    assert 'store.set("a.connected", true)' in html and 'store.set("a.connected", false)' in html
    assert 'client0.onConnect(() => store.set("a.connected", true))' in html
    assert "client0.onChange(" not in html
    # the bare (form) wire has no namespace: no connected flag, and a 4-arg connectStore (no namespace arg)
    assert "connectStore(store, client1, undefined" in html
    assert "client1.onConnect(" not in html
    assert "client1.onChange(" not in html
    assert "client1.onDisconnect(" not in html


def test_wire_list_generates_the_patch_sink():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}])
    # a SendPatch (spaday:patch) routes into the namespaced store; connectStore then sends the edit
    assert 'document.addEventListener("spaday:patch"' in html
    assert 'event.detail.model ? event.detail.model + "." + event.detail.field : event.detail.field' in html


def test_wire_list_respects_base_prefix():
    html = bootstrap(wire=[{"url": "/ws", "namespace": "a"}], base="/dash")
    assert "client0.connect(`ws://${location.host}/dash/ws`)" in html  # the base prefixes each wire url
    assert 'fetch("/dash/tree.json")' in html


def test_string_wire_still_generates_a_single_unnamespaced_model():
    html = bootstrap(wire="transports")  # the single-model string form is unchanged
    assert "connectStore(store, client, undefined" in html
    assert "client0" not in html and "spaday:patch" not in html  # not the multi-wire codegen


def test_wire_typed_helper_matches_the_raw_dict_form():
    from spaday.bootstrap import Wire

    typed = bootstrap(wire=[Wire("/ws", namespace="g", flatten=False), Wire("/ws/form")])
    raw = bootstrap(wire=[{"url": "/ws", "namespace": "g", "flatten": False}, {"url": "/ws/form"}])
    assert typed == raw  # Wire(...) serializes to exactly the dict form — same generated page
    assert bootstrap(wire=Wire("/ws", reconnect=True)) == bootstrap(wire={"url": "/ws", "reconnect": True})
    assert '{ fromValue, toValue }, "g", false)' in typed


def test_wire_list_flatten_false_passes_the_flatten_arg():
    # an opaque-map model (a chart's `data`) mirrors whole: connectStore gets `, "g", false`
    html = bootstrap(wire=[{"url": "/ws", "namespace": "g", "flatten": False}])
    assert '{ fromValue, toValue }, "g", false)' in html
    # default (flatten omitted) recurses sub-models — no flatten arg
    assert '{ fromValue, toValue }, "a")' in bootstrap(wire=[{"url": "/ws", "namespace": "a"}])
    # flatten=False with no namespace still positions the arg (undefined, false)
    assert "{ fromValue, toValue }, undefined, false)" in bootstrap(wire=[{"url": "/ws", "flatten": False}])


def test_wire_exposes_managed_transport_options_and_direct_typed_form():
    from spaday.bootstrap import Wire

    html = bootstrap(
        wire=Wire(
            "/ws?tenant=shared",
            codec="msgpack",
            batch=True,
            reconnect=True,
            retry=250,
            authority="client",
            connected="wire_ready",
        )
    )
    assert 'const client0 = new Client("msgpack")' in html
    assert 'client0.run(`ws://${location.host}/ws?tenant=shared&batch=1`, {"authority": "client", "retry": 250})' in html
    assert 'client0.onConnect(() => store.set("wire_ready", true))' in html
    assert "client0.onChange(" not in html
    assert 'client0.onDisconnect(() => store.set("wire_ready", false))' in html


def test_wire_session_and_batch_share_one_query_string():
    from spaday.bootstrap import Wire

    html = bootstrap(wire=Wire("/ws", session=True, batch=True))
    assert "/ws?session=${" in html
    assert "}&batch=1`" in html


@pytest.mark.parametrize(
    ("kwargs", "message"),
    [
        ({"url": ""}, "url must not be empty"),
        ({"url": "/ws", "codec": ""}, "codec must not be empty"),
        ({"url": "/ws", "retry": 0}, "retry must be a positive integer"),
        ({"url": "/ws", "authority": "peer"}, "authority must be 'server' or 'client'"),
        ({"url": "/ws", "connected": ""}, "connected field must not be empty"),
    ],
)
def test_wire_rejects_invalid_transport_options(kwargs, message):
    from spaday.bootstrap import Wire

    with pytest.raises(ValueError, match=message):
        Wire(**kwargs)


def test_raw_wire_specs_use_wire_validation():
    with pytest.raises(ValueError, match="retry must be a positive integer"):
        bootstrap(wire={"url": "/ws", "retry": 0})
    with pytest.raises(TypeError, match="unexpected keyword argument 'reconect'"):
        bootstrap(wire=[{"url": "/ws", "reconect": True}])


def test_typed_wires_reject_ignored_page_level_connection_options():
    from spaday.bootstrap import Wire

    with pytest.raises(ValueError, match="set reconnect on each Wire"):
        bootstrap(wire=Wire("/socket"), reconnect=True)
    with pytest.raises(ValueError, match="set reconnect on each Wire"):
        bootstrap(wire={"url": "/socket"}, reconnect=True)
    with pytest.raises(ValueError, match="set the URL on each Wire"):
        bootstrap(wire=[Wire("/socket")], ws="/ignored")
    with pytest.raises(ValueError, match="set the URL on each Wire"):
        bootstrap(wire={"url": "/socket"}, ws="/ignored")
