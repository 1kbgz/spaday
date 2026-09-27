import pytest

from spaday import action_schema, binding_schema, element, expr_schema, validate_action, validate_binding, validate_expr


def test_core_validates_and_canonicalizes_editor_wire_values():
    assert validate_action({"kind": "toggle-field", "field": "open"}) == {
        "kind": "toggle-field",
        "field": "open",
    }
    assert validate_expr({"expr": "event"}) == {"expr": "event"}
    assert validate_binding({"field": "query", "mode": "two-way"}) == {
        "field": "query",
        "mode": "two-way",
    }


@pytest.mark.parametrize(
    ("validator", "value"),
    [
        (validate_action, {"kind": "unknown"}),
        (validate_expr, {"expr": "unknown"}),
        (validate_binding, {"field": "query", "mode": "sideways"}),
        (validate_binding, {"mode": "one-way"}),
        (validate_binding, {"compute": {"expr": "unknown"}, "mode": "one-way"}),
    ],
)
def test_core_rejects_invalid_editor_wire_values(validator, value):
    with pytest.raises(ValueError):
        validator(value)


def test_editor_schemas_cover_all_wire_models():
    assert action_schema()["title"] == "Action"
    assert expr_schema()["title"] == "Expr"
    assert binding_schema()["title"] == "Binding"


def test_components_accept_validated_editor_wire_values():
    node = (
        element("input")
        .bind_wire("value", {"field": "query", "mode": "two-way"})
        .on_wire("change", {"kind": "set-field", "field": "dirty", "value": {"expr": "lit", "value": True}})
        .to_node()
    )

    assert node["bindings"]["value"] == {"field": "query", "mode": "two-way"}
    assert node["events"]["change"]["kind"] == "set-field"
