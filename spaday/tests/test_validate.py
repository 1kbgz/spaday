import pytest

import spaday
from spaday import (
    CallEndpoint,
    Component,
    ComponentSchema,
    Emit,
    If,
    Sequence,
    SetProp,
    Toggle,
    ValidationError,
    by_id,
    concat,
    element,
    prop,
    this,
    validate,
)


class Dagre(Component):
    """A stand-in for a CEM-generated component: carries a catalog schema."""

    tag = "spa-dagre"
    schema = ComponentSchema.from_cem(
        {
            "tag_name": "spa-dagre",
            "class_name": "Dagre",
            "props": [{"name": "maxLabelWidth", "ty": "Number"}, {"name": "layout", "ty": "Str"}],
        }
    )


def test_resolved_by_id_passes():
    tree = element("div").child(element("button").on("click", Toggle(by_id("panel"), "hidden"))).child(element("p").prop("id", "panel").text("hi"))
    validate(tree)  # no raise


def test_unresolved_by_id_raises_with_details():
    tree = element("button").on("click", Toggle(by_id("missing"), "hidden"))
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    assert "'missing'" in str(exc.value)


def test_this_target_needs_no_resolution():
    validate(element("button").on("click", Toggle(this(), "hidden")))


def test_refs_inside_sequence_if_and_expr_are_all_checked():
    tree = element("button").on(
        "click",
        Sequence(
            SetProp(by_id("a"), "hidden", False),
            If(prop(by_id("b"), "checked"), Emit("x"), SetProp(by_id("c"), "hidden", True)),
        ),
    )
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    msg = str(exc.value)
    assert "'a'" in msg and "'b'" in msg and "'c'" in msg  # nested action + expr refs all caught


def test_refs_inside_computed_endpoint_urls_are_checked():
    tree = element("button").on("click", CallEndpoint("POST", concat("/send/", prop(by_id("key"), "value"))))
    with pytest.raises(ValidationError, match="'key'"):
        validate(tree)


def test_only_unresolved_refs_are_reported():
    tree = (
        element("div")
        .child(element("button").on("click", Sequence(Toggle(by_id("ok"), "hidden"), Toggle(by_id("bad"), "hidden"))))
        .child(element("span").prop("id", "ok"))
    )
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    unresolved = str(exc.value).split("known ids")[0]
    assert "'bad'" in unresolved and "'ok'" not in unresolved


def test_validate_accepts_a_serialized_node_dict():
    node = element("button").on("click", Toggle(by_id("x"), "hidden")).to_node()
    with pytest.raises(ValidationError):
        validate(node)


def test_unknown_prop_on_a_schema_component_raises_with_a_snake_case_hint():
    tree = element("div").child(Dagre().prop("max_label_width", 180))
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    assert "<spa-dagre> unknown prop 'max_label_width' (did you mean 'maxLabelWidth'?)" in str(exc.value)


def test_unknown_binding_without_a_snake_case_match_gets_no_hint():
    with pytest.raises(ValidationError) as exc:
        validate(Dagre().bind("maxLabelWdith", "width"))
    msg = str(exc.value)
    assert "<spa-dagre> unknown prop 'maxLabelWdith'" in msg
    assert "did you mean" not in msg


def test_schema_props_globals_and_schema_free_nodes_pass_the_prop_check():
    validate(Dagre(maxLabelWidth=180, id="graph", class_="card").prop("data-x", "1").prop("aria-label", "graph"))
    validate(Dagre().bind("layout", "layout_field").compute("textContent", spaday.field("title")))
    validate(element("div", max_label_width=1))  # element() carries no schema — stays unvalidated
    # two-way bindings target live form-control properties a manifest routinely omits — unchecked
    validate(Dagre().bind("value", "selection", mode="two-way"))
    # root bindings name a class/attribute on <html>, not a prop of the element they are authored on
    validate(Dagre().bind_root_class("wa-dark", "dark").bind_root_attr("data-density", "density"))


def test_serialized_dict_trees_resolve_schemas_by_tag():
    # a plain node dict carries no schema, but every imported schema-carrying class registered its
    # tag — so the dict form checks the same props as the Component form
    with pytest.raises(ValidationError) as excinfo:
        validate(Dagre().prop("mystery", 1).to_node())
    assert "<spa-dagre> unknown prop 'mystery'" in str(excinfo.value)


def test_dict_trees_get_the_snake_case_hint_and_two_way_exemption():
    with pytest.raises(ValidationError) as excinfo:
        validate({"tag": "div", "slots": {"default": [{"tag": "spa-dagre", "props": {"max_label_width": {"Int": 1}}}]}})
    assert "did you mean 'maxLabelWidth'?" in str(excinfo.value)
    # two-way bindings and unknown tags stay unchecked, as in the Component form
    validate({"tag": "spa-dagre", "bindings": {"value": {"field": "selection", "mode": "two-way"}}})
    validate({"tag": "spa-dagre", "bindings": {"root-attr:data-density": {"field": "density", "mode": "one-way"}}})
    validate({"tag": "not-a-registered-tag", "props": {"mystery": {"Int": 1}}})
    # globals and data-*/aria-* pass in the dict form too
    validate({"tag": "spa-dagre", "props": {"id": {"Str": "g"}, "data-x": {"Str": "1"}}})


def test_a_dict_child_nested_in_a_component_is_checked():
    with pytest.raises(ValidationError) as excinfo:
        validate(element("div").child(Dagre().to_node() | {"props": {"mystery": {"Int": 1}}}))
    assert "<spa-dagre> unknown prop 'mystery'" in str(excinfo.value)


def test_exported_from_package():
    assert spaday.validate is validate
    assert issubclass(spaday.ValidationError, ValueError)
