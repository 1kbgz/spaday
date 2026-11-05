import json

import pytest

from spaday import CopyToClipboard, Invoke, SetField, ValidationError, apply, by_id, diff, element, field, validate
from spaday.ui import NATIVE, TextInput, resolve


def test_behaviors_diff_round_trip_and_removal():
    original = element("div").to_json()
    configured = (
        element("div")
        .effect("load", SetField("result", field("path")), watch=["path"], initial=True)
        .ready_when(field("loaded"), state="workspace", active=field("active"), elements=["test-view"])
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
        {"state": ""},
        {"elements": ["div"]},
        {"when": field("status")},
        {"when": field("status.error")},
    ],
)
def test_invalid_readiness_options(kwargs):
    with pytest.raises((TypeError, ValueError)):
        element("div").ready_when(**{"when": field("ready"), "state": "status", **kwargs})  # ty: ignore[invalid-argument-type]


def test_generic_controls_keep_behaviors_and_validate_effect_targets():
    component = TextInput().effect("open", Invoke(by_id("missing"), "open"), watch=["panel"])
    component.ready_when(field("ready"), state="status")
    node = component.to_node()
    resolved = resolve(node, NATIVE)

    # Native input is wrapped by a label; behaviors target the actual control, as events do.
    def find(node):
        if node["tag"] == "input":
            return node
        for children in node.get("slots", {}).values():
            for child in children:
                if found := find(child):
                    return found
        return None

    control = find(resolved)
    assert control is not None
    assert control["effects"] == node["effects"]
    assert control["readiness"] == node["readiness"]
    with pytest.raises(ValidationError, match="missing"):
        validate(component)


def test_clipboard_action_validated_by_shared_core():
    node = element("button").on("click", CopyToClipboard(field("url"), result="copied")).to_node()
    assert node["events"]["click"] == {"kind": "clipboard", "value": {"expr": "field", "name": "url"}, "result": "copied"}
