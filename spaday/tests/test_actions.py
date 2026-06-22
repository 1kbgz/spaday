import json

from spaday import apply, diff, element
from spaday.actions import (
    Emit,
    If,
    SendPatch,
    Sequence,
    SetProp,
    Toggle,
    bind,
    by_id,
    event_value,
    lit,
    not_,
    prop,
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
