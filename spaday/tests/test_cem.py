import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from spaday import Component, ComponentSchema, PropertySchema, apply, classes, diff, generate, parse_cem

FIXTURES = Path(__file__).parent / "fixtures"
FIXTURE = str(FIXTURES / "webawesome.cem.json")


def _module():
    """Generate the fixture's components and exec them into a fresh namespace."""
    ns: dict = {}
    exec(generate(FIXTURE), ns)  # noqa: S102
    return ns


def test_parse_cem_filters_to_custom_elements():
    schemas = json.loads(parse_cem(Path(FIXTURE).read_text(encoding="utf-8")))
    tags = {s["tag_name"] for s in schemas}
    assert tags == {"wa-switch", "wa-button", "wa-card"}  # the non-customElement CardHelper is excluded
    switch = next(s for s in schemas if s["tag_name"] == "wa-switch")
    assert switch["class_name"] == "WaSwitch"
    assert switch["events"] == ["change", "input"]
    assert switch["slots"] == ["", "hint"]


def test_generated_class_builds_a_node():
    ns = _module()
    node = ns["WaSwitch"](checked=True, size="large").to_node()
    assert node["tag"] == "wa-switch"
    assert node["props"]["checked"] == {"Bool": True}
    assert node["props"]["size"] == {"Str": "large"}
    # unset props are omitted so the element keeps its own defaults
    assert "name" not in node["props"]


def test_generated_class_exposes_catalog_schema():
    schema = _module()["WaSwitch"].schema
    assert isinstance(schema, ComponentSchema)
    assert schema.tag == "wa-switch"
    assert schema.class_name == "WaSwitch"
    assert schema.summary == "Switches allow the user to toggle an option on or off."
    assert schema.events == ("change", "input")
    assert schema.slots == ("", "hint")

    props = {prop.name: prop for prop in schema.props}
    assert props["checked"].kind == "boolean"
    assert props["checked"].default == "false"
    assert props["checked"].description == "Draws the switch in a checked state."
    assert props["size"].kind == "enum"
    assert props["size"].choices == ("small", "medium", "large")
    assert props["name"].kind == "string"
    assert schema.to_dict()["props"][2]["choices"] == ["small", "medium", "large"]


def test_catalog_schema_maps_all_normalized_property_kinds():
    schema = ComponentSchema.from_cem(
        {
            "tag_name": "demo-values",
            "class_name": "DemoValues",
            "props": [
                {"name": "count", "ty": "Number"},
                {"name": "config", "ty": "Any"},
                {"name": "optional", "ty": {"Optional": "Bool"}},
            ],
        }
    )

    assert [(prop.name, prop.kind) for prop in schema.props] == [
        ("count", "number"),
        ("config", "json"),
        ("optional", "boolean"),
    ]


def test_catalog_schema_validates_and_serializes_with_pydantic():
    schema = ComponentSchema.model_validate(
        {
            "tag": "demo-card",
            "class_name": "DemoCard",
            "props": [{"name": "appearance", "kind": "enum", "choices": ["filled", "outlined"]}],
            "events": ["change"],
            "slots": [""],
        }
    )

    assert schema.props[0].choices == ("filled", "outlined")
    assert schema.model_dump(mode="json")["props"][0]["choices"] == ["filled", "outlined"]
    assert ComponentSchema.model_json_schema()["properties"]["props"]["type"] == "array"

    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        PropertySchema.model_validate({"name": "value", "kind": "number", "unknown": True})
    with pytest.raises(ValidationError, match="Instance is frozen"):
        schema.tag = "changed"  # type: ignore[misc]


def test_generated_class_rejects_prop_kind_mismatches_at_authoring_time():
    # the authoring-time half of prop validation: a literal of the wrong shape fails here, with the
    # component and prop named, instead of surfacing later as an opaque component error in the browser
    ns = _module()
    with pytest.raises(TypeError, match=r"<wa-switch> prop 'checked' expects kind 'boolean'.*'yes'"):
        ns["WaSwitch"](checked="yes")
    with pytest.raises(TypeError, match=r"<wa-switch> prop 'size' expects kind 'enum'"):
        ns["WaSwitch"](size=3)
    with pytest.raises(TypeError, match=r"<wa-switch> prop 'name' expects kind 'string'"):
        ns["WaSwitch"](name=7)
    # correct literals and schema-free generic props pass untouched
    node = ns["WaSwitch"](checked=True, size="large", name="wifi", id="sw").to_node()
    assert node["props"]["checked"] == {"Bool": True}
    assert node["props"]["id"] == {"Str": "sw"}


def test_prop_kind_validation_covers_number_and_leaves_json_dynamic():
    class Demo(Component):
        tag = "demo-values"
        schema = ComponentSchema.from_cem(
            {
                "tag_name": "demo-values",
                "class_name": "DemoValues",
                "props": [{"name": "count", "ty": "Number"}, {"name": "config", "ty": "Any"}],
            }
        )

    with pytest.raises(TypeError, match=r"<demo-values> prop 'count' expects kind 'number'.*'3'"):
        Demo(count="3")
    with pytest.raises(TypeError, match=r"expects kind 'number'"):
        Demo(count=True)  # bools are not numbers
    assert Demo(count=3).to_node()["props"]["count"] == {"Int": 3}
    assert Demo(count=2.5).to_node()["props"]["count"] == {"Float": 2.5}
    # the `json` kind is type-opaque (lists, objects, mixed unions, untyped props all map to it),
    # so it stays unvalidated — as do reactive bindings/computed values, which are dynamic
    assert Demo(config="anything").to_node()["props"]["config"] == {"Str": "anything"}
    # plain element() nodes carry no schema and stay fully permissive
    from spaday import element

    assert element("div", count="3").to_node()["props"]["count"] == {"Str": "3"}


def _camel_demo() -> type[Component]:
    class Demo(Component):
        tag = "demo-graph"
        schema = ComponentSchema.from_cem(
            {
                "tag_name": "demo-graph",
                "class_name": "DemoGraph",
                "props": [{"name": "maxLabelWidth", "ty": "Number"}, {"name": "size", "ty": "Str"}],
            }
        )

    return Demo


def test_schema_component_accepts_snake_case_prop_aliases():
    Demo = _camel_demo()
    # the snake_case spelling normalizes to the canonical CEM name instead of inventing a new prop
    assert Demo(max_label_width=180).to_node()["props"] == {"maxLabelWidth": {"Int": 180}}
    # the canonical spelling still works; names whose spellings coincide need no alias
    assert Demo(maxLabelWidth=180).to_node()["props"] == {"maxLabelWidth": {"Int": 180}}
    assert Demo(size="s").to_node()["props"] == {"size": {"Str": "s"}}
    # an aliased value is kind-checked under the canonical name
    with pytest.raises(TypeError, match=r"<demo-graph> prop 'maxLabelWidth' expects kind 'number'"):
        Demo(max_label_width="wide")


def test_schema_component_rejects_both_prop_spellings_at_once():
    Demo = _camel_demo()
    with pytest.raises(TypeError, match=r"<demo-graph> prop 'maxLabelWidth' passed under both spellings"):
        Demo(maxLabelWidth=100, max_label_width=180)
    # an explicit None means "unset", so it doesn't count as the other spelling
    assert Demo(maxLabelWidth=None, max_label_width=180).to_node()["props"] == {"maxLabelWidth": {"Int": 180}}


def test_generated_module_aliases_snake_case_kwargs():
    # the aliasing lives in the shared Component base, so generated module text is unchanged —
    # a class exec'd from rendered code picks it up with no regeneration
    from spaday.cem import render

    ns: dict = {}
    exec(render([{"tag_name": "x-graph", "class_name": "XGraph", "props": [{"name": "maxLabelWidth", "ty": "Number"}]}]), ns)  # noqa: S102
    assert ns["XGraph"](max_label_width=180).to_node()["props"]["maxLabelWidth"] == {"Int": 180}
    with pytest.raises(TypeError, match="both spellings"):
        ns["XGraph"](maxLabelWidth=100, max_label_width=180)


def test_schema_free_components_keep_snake_case_props_verbatim():
    from spaday import element

    # element() carries no schema: arbitrary attribute names pass through untouched
    assert element("div", max_label_width=1).to_node()["props"] == {"max_label_width": {"Int": 1}}


def test_typed_signatures_rendered():
    code = generate(FIXTURE)
    assert 'size: Literal["small", "medium", "large"] | None = None' in code
    assert "name: str | None = None" in code
    assert "checked: bool | None = None" in code


def test_python_keyword_attribute_is_escaped():
    # wa-button has a `for` attribute; the param is `for_`, mapped back to the `for` prop.
    code = generate(FIXTURE)
    assert "for_: str | None = None" in code
    node = _module()["WaButton"](for_="field").to_node()
    assert node["props"]["for"] == {"Str": "field"}


def test_node_round_trips_through_core_diff_apply():
    ns = _module()
    off = ns["WaSwitch"](checked=False).to_json()
    on = ns["WaSwitch"](checked=True).to_json()
    patch = diff(off, on)
    assert json.loads(apply(off, patch)) == json.loads(on)


def test_slots_compose_typed_components():
    ns = _module()
    card = ns["WaCard"](appearance="filled").child_in("header", ns["WaButton"](variant="brand")).child(ns["WaSwitch"]())
    node = card.to_node()
    assert node["tag"] == "wa-card"
    assert node["slots"]["header"][0]["tag"] == "wa-button"
    assert node["slots"]["default"][0]["tag"] == "wa-switch"


def test_classes_builds_components_at_runtime():
    klasses = classes(FIXTURE)
    assert set(klasses) == {"WaSwitch", "WaButton", "WaCard"}
    assert issubclass(klasses["WaSwitch"], Component)
    schema = klasses["WaSwitch"].schema
    assert schema is not None and schema.tag == "wa-switch"

    node = klasses["WaSwitch"](checked=True, size="large").to_node()
    assert node["tag"] == "wa-switch"
    assert node["props"]["checked"] == {"Bool": True}
    # keyword-named attribute is reachable as `for_` and maps back to the `for` prop
    assert klasses["WaButton"](for_="field").to_node()["props"]["for"] == {"Str": "field"}
    # a non-typed keyword passes through as a generic prop, so id=/slot=/style= work on typed components
    generic = klasses["WaSwitch"]("Wi-Fi", id="wifi", slot="footer").to_node()
    assert generic["props"]["id"] == {"Str": "wifi"}
    assert generic["props"]["slot"] == {"Str": "footer"}
    # a string child becomes a text node in the default slot
    assert generic["slots"]["default"][0]["props"]["textContent"] == {"Str": "Wi-Fi"}


def test_classes_single_name_returns_one_class():
    WaSwitch = classes(FIXTURE, "WaSwitch")
    assert isinstance(WaSwitch, type) and WaSwitch.tag == "wa-switch"
    assert WaSwitch(checked=True).to_node()["props"]["checked"] == {"Bool": True}
    with pytest.raises(KeyError):
        classes(FIXTURE, "NoSuchComponent")


def test_text_and_element_authoring():
    from spaday import element

    node = element("div", class_="row", style="display:flex").child(element("wa-button").text("Go")).to_node()
    assert node["tag"] == "div"
    assert node["props"]["class"] == {"Str": "row"}  # class_ de-escaped to the real attribute
    assert node["props"]["style"] == {"Str": "display:flex"}
    button = node["slots"]["default"][0]
    assert button["tag"] == "wa-button"
    assert button["props"]["textContent"] == {"Str": "Go"}  # .text() sets the label
