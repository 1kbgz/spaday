import pytest

pytest.importorskip("anywidget")  # the optional `widget` extra

import spaday  # noqa: E402
from spaday import Toggle, by_id, element  # noqa: E402
from spaday.widget import Widget  # noqa: E402


def test_serializes_the_tree_and_ships_the_wasm_core():
    w = Widget(element("div").prop("id", "root").text("hi"))
    assert w._tree["tag"] == "div"
    assert "id" in w._tree["props"]
    assert len(w._wasm) > 0  # the action-interpreter wasm rides the model to the frontend


def test_accepts_a_prebuilt_node_dict():
    node = {"tag": "section", "props": {"id": {"Str": "x"}}}
    assert Widget(node)._tree == node


def test_update_reassigns_the_synced_tree():
    w = Widget(element("div").text("a"))
    before = w._tree
    w.update(element("section").text("b"))
    assert w._tree != before
    assert w._tree["tag"] == "section"


def test_on_intent_receives_frontend_messages():
    w = Widget(element("button").on("click", Toggle(by_id("x"), "hidden")))
    seen = []
    w.on_intent(seen.append)
    msg = {"type": "spaday:patch", "detail": {"model": "m", "field": "f", "value": True}}
    w._on_msg(w, msg, [])
    w._on_msg(w, {"type": "other", "x": 1}, [])  # non-intent messages are ignored
    w._on_msg(w, "not a dict", [])
    assert seen == [msg]


def test_extension_assets_are_present():
    from spaday import widget as widget_mod

    # installed wheels must ship spaday/extension/** (force-included in pyproject); otherwise the
    # _esm / _css / wasm the widget loads go missing and `import spaday.widget` breaks.
    assert widget_mod._ESM.exists()
    assert widget_mod._CSS.exists()
    assert (widget_mod._EXT / "pkg" / "spaday_bg.wasm").exists()


def test_widget_is_lazily_exported_from_the_package():
    assert spaday.Widget is Widget  # resolves via spaday.__getattr__, no eager anywidget import
