import json

import pytest

from spaday import CopyToClipboard, Invoke, SetField, ValidationError, apply, by_id, diff, element, field, validate
from spaday.ui import NATIVE, TextInput, resolve


def test_behaviors_diff_round_trip_and_removal():
    original = element("div").to_json()
    configured = (
        element("div")
        .effect("load", SetField("result", field("path")), watch=["path"], initial=True)
        .ready(field("loaded"), result="workspace", active=field("active"), elements=["test-view"])
        .to_json()
    )
    patch = diff(original, configured)
    assert {next(iter(op)) for op in json.loads(patch)["ops"]} == {"SetEffect", "SetReadiness"}
    assert json.loads(apply(original, patch)) == json.loads(configured)
    assert json.loads(apply(configured, diff(configured, original))) == json.loads(original)


@pytest.mark.parametrize("kwargs", [{"watch": []}, {"watch": "path"}, {"watch": [1]}, {"watch": [""]}, {"watch": ["path"], "initial": 1}])
def test_invalid_effect_options(kwargs):
    with pytest.raises((TypeError, ValueError)):
        element("div").effect("load", SetField("x", 1), **kwargs)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"timeout": 0},
        {"timeout": -1},
        {"timeout": True},
        {"timeout": 2147483648},
        {"result": ""},
        {"elements": ["div"]},
        {"when": field("status")},
        {"when": field("status.error")},
    ],
)
def test_invalid_readiness_options(kwargs):
    with pytest.raises((TypeError, ValueError)):
        element("div").ready(**{"when": field("ready"), "result": "status", **kwargs})  # ty: ignore[invalid-argument-type]


def test_generic_controls_keep_behaviors_and_validate_effect_targets():
    component = TextInput().effect("open", Invoke(by_id("missing"), "open"), watch=["panel"])
    component.ready(field("ready"), result="status")
    node = component.to_node()
    resolved = resolve(node, NATIVE)

    # Native input is wrapped by a label; behaviors target the actual control, as events do.
    assert resolved["tag"] == "label"
    control = resolved["slots"]["default"][0]
    assert control["tag"] == "input"
    assert control["effects"] == node["effects"]
    assert control["readiness"] == node["readiness"]
    with pytest.raises(ValidationError, match="missing"):
        validate(component)


@pytest.mark.parametrize("result", [None, "copied"])
def test_clipboard_action_validated_by_shared_core(result):
    node = element("button").on("click", CopyToClipboard(field("url"), result=result)).to_node()
    expected = {"kind": "clipboard", "value": {"expr": "field", "name": "url"}}
    if result is not None:
        expected["result"] = result
    assert node["events"]["click"] == expected


def test_ready_defaults_match_the_shared_wire_defaults():
    from spaday import validate_readiness

    minimal = {"when": {"expr": "lit", "value": True}}
    expected = {
        **minimal,
        "active": {"expr": "lit", "value": True},
        "error": {"expr": "lit", "value": None},
        "elements": [],
        "timeout": 10000,
    }
    assert element("section").ready(True).to_node()["readiness"] == expected
    assert validate_readiness(minimal) == expected
    assert validate_readiness({**minimal, "result": None}) == expected
    assert element("section").ready(True, result="view").to_node()["readiness"] == {**expected, "result": "view"}


def test_prop_expressions_use_existing_computed_bindings():
    from spaday import Button, not_

    expression = not_(field("enabled"))
    compact = Button().prop("disabled", expression)
    explicit = Button().compute("disabled", expression)
    assert compact.to_node() == explicit.to_node()
    assert resolve(compact.to_node(), NATIVE) == resolve(explicit.to_node(), NATIVE)
    literal = element("button").prop("disabled", False).prop("title", "enabled").prop("title", None)
    assert literal.to_node()["props"] == {"disabled": {"Bool": False}, "title": {"Str": "enabled"}}
    # A literal prop can still provide an initial value alongside a separately authored binding.
    assert literal.bind("disabled", "disabled").prop("disabled", True).to_node()["bindings"]["disabled"]["field"] == "disabled"


@pytest.mark.parametrize("name", ["", " ", None, 12])
def test_effect_rejects_empty_or_non_string_names(name):
    with pytest.raises(ValueError, match="effect name must be a nonempty string"):
        element("div").effect(name, SetField("result", True), watch=["path"])


def test_effect_accepts_and_validates_serialized_action_data():
    action = SetField("result", field("path"))
    typed = element("div").effect("load", action, watch=["path"])
    serialized = element("div").effect("load", action.to_dict(), watch=["path"])
    assert serialized.to_node() == typed.to_node()
    with pytest.raises(ValueError):
        element("div").effect("load", {"kind": "invalid"}, watch=["path"])
