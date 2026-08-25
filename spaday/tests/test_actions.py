import json

import pytest

from spaday import apply, diff, element
from spaday.actions import (
    CallEndpoint,
    Emit,
    If,
    NamedJs,
    SendPatch,
    Sequence,
    SetField,
    SetProp,
    Toggle,
    ToggleField,
    all_,
    any_,
    bind,
    by_id,
    concat,
    cond,
    event_value,
    field,
    item,
    lit,
    not_,
    obj,
    prop,
    scope,
    this,
)


def test_action_to_dict_wire_shapes():
    assert Toggle(this(), "hidden").to_dict() == {
        "kind": "toggle",
        "target": {"ref": "this"},
        "prop": "hidden",
    }
    assert SetProp(by_id("panel"), "hidden", not_(event_value())).to_dict() == {
        "kind": "set",
        "target": {"ref": "id", "id": "panel"},
        "prop": "hidden",
        "value": {"expr": "not", "of": {"expr": "event"}},
    }
    assert Emit("opened", lit(True)).to_dict() == {
        "kind": "emit",
        "event": "opened",
        "detail": {"expr": "lit", "value": True},
    }
    assert SendPatch("global", "type", event_value()).to_dict() == {
        "kind": "patch",
        "model": "global",
        "field": "type",
        "value": {"expr": "event"},
    }
    assert CallEndpoint("POST", "/api/order", event_value()).to_dict() == {
        "kind": "call",
        "method": "POST",
        "url": "/api/order",
        "body": {"expr": "event"},
        "result": None,
    }
    assert NamedJs("confetti").to_dict() == {"kind": "js", "handler": "confetti"}
    assert SetField("symbol", "").to_dict() == {
        "kind": "set-field",
        "field": "symbol",
        "value": {"expr": "lit", "value": ""},
    }
    assert ToggleField("dark").to_dict() == {"kind": "toggle-field", "field": "dark"}


def test_cond_wire_shape_coerces_branches_to_literals():
    # a ternary field-expression (for a computed binding); plain branch values become literals
    assert cond(field("dark"), "dark", "light").to_dict() == {
        "expr": "cond",
        "test": {"expr": "field", "name": "dark"},
        "then": {"expr": "lit", "value": "dark"},
        "else": {"expr": "lit", "value": "light"},
    }


def test_item_and_named_scope_wire_shapes():
    assert item("record.id").to_dict() == {"expr": "item", "path": "record.id"}
    assert item().to_dict() == {"expr": "item", "path": ""}
    assert scope("staging.channel").to_dict() == {
        "expr": "scope",
        "name": "staging",
        "path": "channel",
    }
    assert scope("staging").to_dict() == {"expr": "scope", "name": "staging", "path": ""}


def test_scope_requires_a_name():
    with pytest.raises(ValueError, match="start with a name"):
        scope("")


def test_composite_actions_reject_non_actions_at_authoring_time():
    with pytest.raises(TypeError, match="Sequence entries must be Actions"):
        Sequence(Emit("ready"), 3)
    with pytest.raises(TypeError, match="Sequence entries must be Actions"):
        Sequence(None)
    with pytest.raises(TypeError, match="then branch must be an Action"):
        If(True, 3)
    with pytest.raises(TypeError, match="else branch must be an Action"):
        If(True, Emit("ready"), 3)


def test_logical_combinators_coerce_values_to_expressions():
    assert all_(field("ready"), True).to_dict() == {
        "expr": "all",
        "of": [{"expr": "field", "name": "ready"}, {"expr": "lit", "value": True}],
    }
    assert any_(field("ready"), False).to_dict() == {
        "expr": "any",
        "of": [{"expr": "field", "name": "ready"}, {"expr": "lit", "value": False}],
    }


def test_obj_composes_an_object_body_for_call_endpoint():
    # an object-composing expr — POST a whole model declaratively (no NamedJs handler)
    action = CallEndpoint("POST", "/api/order", obj({"symbol": prop(by_id("sym"), "value"), "qty": lit(10)}))
    assert action.to_dict() == {
        "kind": "call",
        "method": "POST",
        "url": "/api/order",
        "body": {
            "expr": "obj",
            "fields": {
                "symbol": {"expr": "prop", "target": {"ref": "id", "id": "sym"}, "name": "value"},
                "qty": {"expr": "lit", "value": 10},
            },
        },
        "result": None,
    }
    # rides the core diff/apply on a node like any other action
    node = element("button").on("click", action).to_json()
    assert json.loads(apply(node, diff(node, node))) == json.loads(node)


def test_field_composes_an_action_body_from_store_state():
    # `field` now also works in an action expr (read the mounted signal store) — the csp-gateway pattern:
    # POST a form's two-way-bound state without a hand-written handler
    action = CallEndpoint("POST", "/api/order", obj({"symbol": field("symbol"), "qty": field("qty")}))
    assert action.to_dict()["body"]["fields"]["qty"] == {"expr": "field", "name": "qty"}
    node = element("button").on("click", action).to_json()
    assert json.loads(apply(node, diff(node, node))) == json.loads(node)  # the core accepts field in an action


def test_call_endpoint_url_can_be_composed_from_store_state():
    action = CallEndpoint("POST", concat("/send/basket/", field("key")), obj({"value": field("value")}))
    assert action.to_dict()["url"] == {
        "expr": "concat",
        "parts": [
            {"expr": "lit", "value": "/send/basket/"},
            {"expr": "field", "name": "key"},
        ],
    }
    node = element("button").on("click", action).to_json()
    assert json.loads(apply(node, diff(node, node))) == json.loads(node)


def test_call_endpoint_result_routes_the_outcome_to_a_store_field():
    # the "POST a form and show the outcome" case: the response {status, ok, body} lands in the store
    action = CallEndpoint("POST", "/api/order", obj({"symbol": field("symbol")}), result="order_result")
    assert action.to_dict()["result"] == "order_result"
    node = element("button").on("click", action).to_json()
    assert json.loads(apply(node, diff(node, node))) == json.loads(node)  # the core accepts the result field


def test_set_field_and_toggle_field_write_the_store():
    # store-writing actions: a plain button drives reactive state declaratively (no two-way control)
    clear = SetField("symbol", "")
    theme = ToggleField("dark")
    node = element("button").on("click", Sequence(clear, theme)).to_json()
    assert json.loads(apply(node, diff(node, node))) == json.loads(node)  # rides the core like any action
    assert SetField("qty", event_value()).to_dict()["value"] == {"expr": "event"}


def test_setprop_coerces_a_plain_value_to_a_literal():
    # a bare Python value is wrapped as a literal expression — no need to write lit(...) explicitly
    assert SetProp(this(), "label", "Go").to_dict()["value"] == {"expr": "lit", "value": "Go"}


def test_sequence_nests_actions():
    seq = Sequence(Toggle(this(), "hidden"), Emit("opened")).to_dict()
    assert seq["kind"] == "seq"
    assert [a["kind"] for a in seq["actions"]] == ["toggle", "emit"]
    assert seq["actions"][1]["detail"] is None  # Emit with no detail


def test_on_serializes_event_as_plain_action_on_the_node():
    node = element("button").on("click", Toggle(this(), "hidden")).to_node()
    # events carry the action DSL's own wire form (plain), owned by the Rust core — not a tagged Value
    assert node["events"]["click"] == {
        "kind": "toggle",
        "target": {"ref": "this"},
        "prop": "hidden",
    }


def test_if_and_prop_wire_shapes():
    action = If(prop(by_id("sw"), "checked"), Toggle(this(), "hidden"), SetProp(this(), "x", lit(1)))
    assert action.to_dict() == {
        "kind": "if",
        "cond": {"expr": "prop", "target": {"ref": "id", "id": "sw"}, "name": "checked"},
        "then": {"kind": "toggle", "target": {"ref": "this"}, "prop": "hidden"},
        "else": {"kind": "set", "target": {"ref": "this"}, "prop": "x", "value": {"expr": "lit", "value": 1}},
    }
    assert If(prop(by_id("sw"), "checked"), Toggle(this(), "hidden")).to_dict()["else"] is None


def test_bind_authors_a_setprop_on_the_source_change():
    sw = element("wa-switch")
    out = bind(sw, by_id("panel"), "hidden", transform=not_)
    assert out is sw  # composes in a tree
    assert sw.to_node()["events"]["change"] == {
        "kind": "set",
        "target": {"ref": "id", "id": "panel"},
        "prop": "hidden",
        "value": {"expr": "not", "of": {"expr": "event"}},
    }


def test_node_with_events_round_trips_through_core_diff_apply():
    tree = element("button").on("click", Toggle(this(), "hidden")).to_json()
    assert json.loads(apply(tree, diff(tree, tree))) == json.loads(tree)


def test_every_action_kind_round_trips_through_core():
    # one of each Action on a different event — proves the Rust core accepts/round-trips every variant
    node = (
        element("button")
        .on("a", SetProp(this(), "x", lit(1)))
        .on("b", Toggle(this(), "hidden"))
        .on("c", Sequence(Toggle(this(), "hidden"), Emit("e", lit(1))))
        .on("d", Emit("opened", lit(True)))
        .on("e", SendPatch("m", "f", event_value()))
        .on("f", If(prop(by_id("sw"), "checked"), Toggle(this(), "hidden"), SetProp(this(), "x", lit(0))))
        .on("g", CallEndpoint("POST", "/u", lit({"k": 1})))
        .on("h", NamedJs("fn"))
        .on("i", SetField("symbol", event_value()))
        .on("j", ToggleField("dark"))
        .on("k", CallEndpoint("POST", "/u", lit({"k": 1}), result="outcome"))
    )
    tree = node.to_json()
    assert json.loads(apply(tree, diff(tree, tree))) == json.loads(tree)


def test_event_value_path_reads_into_a_rich_detail():
    assert event_value().to_dict() == {"expr": "event"}
    assert event_value("label").to_dict() == {"expr": "event", "path": "label"}
    assert event_value("a.b").to_dict() == {"expr": "event", "path": "a.b"}


def test_popup_and_modal_helpers_compose_existing_actions():
    from spaday.actions import by_id, close_modal, close_popup, event_value, open_modal, open_popup

    # open_popup defaults: pointer coordinates off the event, then open
    opened = open_popup(by_id("menu")).to_dict()
    assert opened["kind"] == "seq"
    assert [a["prop"] for a in opened["actions"]] == ["x", "y", "open"]
    # raw-event coordinates: event_value walks the smart-default value (a CustomEvent's detail),
    # so pointer position must come off the raw event object
    assert opened["actions"][0]["value"] == {"expr": "event-prop", "path": "clientX"}
    assert opened["actions"][1]["value"] == {"expr": "event-prop", "path": "clientY"}
    assert opened["actions"][2]["value"] == {"expr": "lit", "value": True}

    # context capture writes the store field first, and coordinates are overridable expressions
    ctx = open_popup(
        by_id("menu"),
        x=event_value("detail.x"),
        y=event_value("detail.y"),
        context_field="menu_ctx",
        context=event_value("detail"),
    ).to_dict()
    assert ctx["actions"][0] == {"kind": "set-field", "field": "menu_ctx", "value": {"expr": "event", "path": "detail"}}
    assert ctx["actions"][1]["value"] == {"expr": "event", "path": "detail.x"}

    assert close_popup(by_id("menu")).to_dict() == {
        "kind": "set",
        "target": {"ref": "id", "id": "menu"},
        "prop": "open",
        "value": {"expr": "lit", "value": False},
    }

    # a modal is any element with an `open` prop; without context the helper is a bare set
    assert open_modal(by_id("dlg")).to_dict()["kind"] == "set"
    modal = open_modal(by_id("dlg"), context_field="modal_ctx").to_dict()
    assert modal["kind"] == "seq"
    assert modal["actions"][0]["field"] == "modal_ctx"
    assert close_modal(by_id("dlg")).to_dict()["prop"] == "open"


def test_popup_helper_output_round_trips_through_core():
    import json

    # the sugar produces only existing wire kinds, so a tree carrying it round-trips through core
    from spaday import apply, diff
    from spaday.actions import by_id, event_value, open_popup
    from spaday.component import element
    from spaday.components.shell import Popup

    menu = Popup(element("span", textContent="item"), id="menu")
    host = element("div", id="surface").on("contextmenu", open_popup(by_id("menu"), context_field="ctx", context=event_value("detail")))
    node = element("div", host, menu).to_json()
    assert json.loads(apply(node, diff(node, node))) == json.loads(node)
