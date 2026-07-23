import json

import pytest

import spaday
from spaday import cond, element, field, not_


def test_bind_emits_one_way_by_default():
    node = element("span").bind("textContent", "msg").to_node()
    assert node["bindings"] == {"textContent": {"field": "msg", "mode": "one-way"}}


def test_bind_two_way():
    node = element("input").bind("checked", "on", mode="two-way").to_node()
    assert node["bindings"]["checked"] == {"field": "on", "mode": "two-way"}


def test_bind_rejects_unknown_mode():
    with pytest.raises(ValueError):
        element("span").bind("x", "y", mode="sideways")


def test_bindings_diff_and_apply_round_trip_through_the_core():
    old = element("span").to_json()
    new = element("span").bind("textContent", "msg").to_json()
    patch = spaday.diff(old, new)
    assert "SetBinding" in patch  # the Rust core diffs bindings to a SetBinding op
    assert json.loads(spaday.apply(old, patch)) == json.loads(new)


def test_compute_authoring_and_diff_round_trip():
    node = element("button").compute("disabled", not_(field("enabled"))).to_node()
    assert node["bindings"]["disabled"] == {
        "compute": {"expr": "not", "of": {"expr": "field", "name": "enabled"}},
        "mode": "one-way",
    }
    old = element("button").to_json()
    new = element("button").compute("disabled", not_(field("enabled"))).to_json()
    patch = spaday.diff(old, new)
    assert "SetBinding" in patch  # a computed binding rides SetBinding like a field binding
    assert json.loads(spaday.apply(old, patch)) == json.loads(new)


def test_compute_with_cond_selects_a_value_by_a_field():
    # a boolean `dark` field driving a string theme prop — what a light/dark switch needs for canvas widgets
    node = element("canvas-widget").compute("theme", cond(field("dark"), "dark", "light")).to_node()
    assert node["bindings"]["theme"]["compute"] == {
        "expr": "cond",
        "test": {"expr": "field", "name": "dark"},
        "then": {"expr": "lit", "value": "dark"},
        "else": {"expr": "lit", "value": "light"},
    }
    j = element("canvas-widget").compute("theme", cond(field("dark"), "dark", "light")).to_json()
    assert json.loads(spaday.apply(j, spaday.diff(j, j))) == json.loads(j)  # rides the core diff/apply


def test_bind_root_class_targets_the_document_root():
    # page-level theming outside the tree: a field toggles a class on <html> (e.g. WebAwesome's wa-dark)
    node = element("spa-app").bind_root_class("wa-dark", "dark").to_node()
    assert node["bindings"]["root-class:wa-dark"] == {"field": "dark", "mode": "one-way"}
