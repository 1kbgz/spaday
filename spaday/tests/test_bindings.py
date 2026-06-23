import json

import pytest

import spaday
from spaday import element, field, not_


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
