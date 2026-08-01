import enum
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from spaday.components import FormField, WaInput, form


class Color(enum.Enum):
    red = "r"
    green = "g"


class Settings(BaseModel):
    name: str  # required (no default)
    enabled: bool = True
    count: int = 0
    ratio: float = 1.0
    color: Color = Color.red
    mode: Literal["a", "b"] = "a"
    note: str | None = None


def _controls(model, **kw):
    """{field name: control node} for a generated form, keyed by each control's bound field."""
    out = {}
    for c in form(model, **kw).to_node()["slots"]["default"]:
        binding = next(iter(c.get("bindings", {}).values()))
        out[binding["field"]] = c
    return out


def test_field_types_map_to_controls_and_two_way_bindings():
    c = _controls(Settings)
    assert (c["name"]["tag"], next(iter(c["name"]["bindings"]))) == ("wa-input", "value")
    assert (c["enabled"]["tag"], next(iter(c["enabled"]["bindings"]))) == ("wa-switch", "checked")
    assert c["count"]["tag"] == "wa-input"
    assert c["color"]["tag"] == "wa-select"
    assert c["mode"]["tag"] == "wa-select"  # Literal → select
    assert c["note"]["tag"] == "wa-input"  # Optional[str] unwrapped to str
    # every control is two-way bound to its own field
    for control in c.values():
        assert next(iter(control["bindings"].values()))["mode"] == "two-way"


def test_numeric_fields_use_number_inputs():
    c = _controls(Settings)
    assert c["count"]["props"]["type"] == {"Str": "number"}
    assert c["ratio"]["props"]["type"] == {"Str": "number"}
    assert c["name"]["props"]["type"] == {"Str": "text"}


def test_required_blocks_empty_where_the_model_cannot_accept_it():
    c = _controls(Settings)
    # A non-Optional number or select can't be left empty — clearing it would send '' (the reported
    # server crash), so it's required even with a default. A str (where '' is valid) is required only if
    # it has no default, and an Optional field is never forced required.
    assert c["name"]["props"]["required"] == {"Bool": True}  # str, no default → required
    assert c["count"]["props"]["required"] == {"Bool": True}  # int with a default → still required
    assert c["ratio"]["props"]["required"] == {"Bool": True}  # float → required
    assert c["color"]["props"]["required"] == {"Bool": True}  # enum select → required
    assert "required" not in c["note"].get("props", {})  # Optional[str] → may be left empty


def test_schema_constraints_become_native_validation_attributes():
    class Constrained(BaseModel):
        level: Annotated[int, Field(ge=0, le=100)] = 50
        short: Annotated[str, Field(min_length=2, max_length=8)] = "ab"
        code: Annotated[str, Field(pattern="[A-Z]+")] = "AB"

    c = _controls(Constrained)
    assert c["level"]["props"]["min"] == {"Int": 0}
    assert c["level"]["props"]["max"] == {"Int": 100}
    assert c["level"]["props"]["step"] == {"Int": 1}  # int → integer steps only
    assert c["short"]["props"]["minlength"] == {"Int": 2}
    assert c["short"]["props"]["maxlength"] == {"Int": 8}
    assert c["code"]["props"]["pattern"] == {"Str": "[A-Z]+"}


def test_enum_and_literal_become_options():
    c = _controls(Settings)
    enum_opts = c["color"]["slots"]["default"]
    assert [o["props"]["value"]["Str"] for o in enum_opts] == ["r", "g"]  # enum values
    assert [o["props"]["textContent"]["Str"] for o in enum_opts] == ["red", "green"]  # names as labels
    literal_opts = c["mode"]["slots"]["default"]
    assert [o["props"]["value"]["Str"] for o in literal_opts] == ["a", "b"]


def test_exclude_skips_fields():
    assert "note" not in _controls(Settings, exclude=("note",))
    assert "name" in _controls(Settings, exclude=("note",))


def test_accepts_an_instance():
    assert set(_controls(Settings(name="x"))) == set(Settings.model_fields)


class Hinted(BaseModel):
    name: str = "x"
    secret: Annotated[str, FormField(exclude=True)] = ""
    size: Annotated[str, FormField(label="Box size")] = "m"
    color: Annotated[str, FormField(control=WaInput(label="Pick"))] = "red"


def test_annotated_formfield_excludes_and_relabels():
    c = _controls(Hinted)
    assert "secret" not in c  # FormField(exclude=True)
    assert "name" in c
    assert c["size"]["props"]["label"] == {"Str": "Box size"}  # FormField(label=...)


def test_annotated_formfield_swaps_the_control():
    c = _controls(Hinted)["color"]  # FormField(control=WaInput(label="Pick"))
    assert c["props"]["label"] == {"Str": "Pick"}
    assert c["bindings"]["value"]["field"] == "color"  # auto-bound two-way to the field
    assert c["bindings"]["value"]["mode"] == "two-way"


def test_call_site_overrides_win_over_annotated():
    c = _controls(Hinted, overrides={"size": FormField(label="CALL")})
    assert c["size"]["props"]["label"] == {"Str": "CALL"}  # call-site beats the Annotated label
    assert "name" not in _controls(Hinted, overrides={"name": FormField(exclude=True)})


def test_control_factory_receives_field_info_and_is_used_as_is():
    seen = {}

    def factory(name, annotation, required):
        seen["call"] = (name, annotation, required)
        return WaInput(label="factory").bind("value", name, mode="two-way")

    c = _controls(Hinted, overrides={"name": FormField(control=factory)})["name"]
    assert c["props"]["label"] == {"Str": "factory"}
    assert seen["call"] == ("name", str, False)  # has a default → not required


class Address(BaseModel):
    street: str = "Main"
    city: str = "NYC"


class Person(BaseModel):
    name: str = "Ada"
    address: Address = Address()


def _children(node):
    return node["slots"]["default"]


def test_sub_model_becomes_an_expand_collapse_group():
    top = _children(form(Person).to_node())
    assert top[0]["tag"] == "wa-input"  # name
    group = top[1]
    assert group["tag"] == "wa-details"  # a sub-model is a disclosure (expand/collapse) section
    assert group["props"]["summary"] == {"Str": "address"}
    assert group["props"]["open"] == {"Bool": True}


def test_sub_model_controls_bind_to_dotted_paths():
    group = _children(form(Person).to_node())[1]
    inner = _children(group["slots"]["default"][0])  # the wa-details holds a stack of controls
    assert [next(iter(c["bindings"].values()))["field"] for c in inner] == ["address.street", "address.city"]
    assert [c["props"]["label"]["Str"] for c in inner] == ["street", "city"]  # child name, not the path


def test_nested_field_excluded_by_dotted_path():
    group = _children(form(Person, exclude=("address.city",)).to_node())[1]
    inner = _children(group["slots"]["default"][0])
    assert [next(iter(c["bindings"].values()))["field"] for c in inner] == ["address.street"]


def test_group_override_wraps_the_sub_model():
    from spaday.components import WaCard

    top = _children(form(Person, overrides={"address": FormField(group=lambda label, inner: WaCard().child(inner))}).to_node())
    assert top[1]["tag"] == "wa-card"  # the custom group wrapper, instead of the default wa-details


# --- non-pydantic sources: a JSON Schema dict or a TypeAdapter -----------------------------------


def test_json_schema_dict_maps_fields_to_controls():
    c = _controls(Settings.model_json_schema())
    assert c["name"]["tag"] == "wa-input"
    assert c["enabled"]["tag"] == "wa-switch"
    assert c["count"]["props"]["type"] == {"Str": "number"}
    assert c["ratio"]["props"]["type"] == {"Str": "number"}
    assert c["color"]["tag"] == "wa-select"  # enum via $ref
    assert c["mode"]["tag"] == "wa-select"  # inline enum (from a Literal)
    assert c["note"]["tag"] == "wa-input"  # anyOf[str, null] unwrapped to a text input
    for control in c.values():
        assert next(iter(control["bindings"].values()))["mode"] == "two-way"


def test_json_schema_required_matches_the_schema():
    c = _controls(Settings.model_json_schema())
    assert c["name"]["props"]["required"] == {"Bool": True}  # listed in required[]
    assert c["count"]["props"]["required"] == {"Bool": True}  # number, not nullable → can't be empty
    assert c["color"]["props"]["required"] == {"Bool": True}  # enum, not nullable → can't be empty
    assert "required" not in c["note"].get("props", {})  # anyOf null → may be left empty


def test_json_schema_enum_options_use_raw_values_as_labels():
    # A JSON Schema drops Enum member names, so options are labeled by their raw value (unlike the
    # pydantic-model path, which labels them "red"/"green").
    opts = _controls(Settings.model_json_schema())["color"]["slots"]["default"]
    assert [o["props"]["value"]["Str"] for o in opts] == ["r", "g"]
    assert [o["props"]["textContent"]["Str"] for o in opts] == ["r", "g"]


def test_json_schema_constraints_become_native_validation_attributes():
    class Constrained(BaseModel):
        level: Annotated[int, Field(ge=0, le=100)] = 50
        short: Annotated[str, Field(min_length=2, max_length=8)] = "ab"
        code: Annotated[str, Field(pattern="[A-Z]+")] = "AB"

    c = _controls(Constrained.model_json_schema())
    assert c["level"]["props"]["min"] == {"Int": 0}
    assert c["level"]["props"]["max"] == {"Int": 100}
    assert c["level"]["props"]["step"] == {"Int": 1}  # integer → integer steps only
    assert c["short"]["props"]["minlength"] == {"Int": 2}
    assert c["short"]["props"]["maxlength"] == {"Int": 8}
    assert c["code"]["props"]["pattern"] == {"Str": "[A-Z]+"}


def test_json_schema_nested_object_becomes_a_group_bound_to_dotted_paths():
    top = _children(form(Person.model_json_schema()).to_node())
    assert top[0]["tag"] == "wa-input"  # name
    group = top[1]
    assert group["tag"] == "wa-details"  # a nested object is a disclosure section
    inner = _children(group["slots"]["default"][0])
    assert [next(iter(c["bindings"].values()))["field"] for c in inner] == ["address.street", "address.city"]


def test_json_schema_honors_exclude_and_call_site_overrides():
    c = _controls(Settings.model_json_schema(), exclude=("note",), overrides={"name": FormField(label="NAME")})
    assert "note" not in c  # excluded by name
    assert c["name"]["props"]["label"] == {"Str": "NAME"}  # relabeled at the call site


def test_json_schema_control_factory_receives_best_effort_python_type():
    seen = {}

    def factory(name, annotation, required):
        seen["call"] = (name, annotation, required)
        return WaInput(label="factory").bind("value", name, mode="two-way")

    c = _controls(Settings.model_json_schema(), overrides={"note": FormField(control=factory)})["note"]
    assert c["props"]["label"] == {"Str": "factory"}
    assert seen["call"] == ("note", str, False)  # anyOf[str, null] → str, optional (not required)


def test_type_adapter_dataclass_source():
    from dataclasses import dataclass

    from pydantic import TypeAdapter

    @dataclass
    class Point:
        x: int
        y: str = "hi"

    c = _controls(TypeAdapter(Point))
    assert c["x"]["props"]["type"] == {"Str": "number"}
    assert c["x"]["props"]["required"] == {"Bool": True}  # no default, number → required
    assert c["y"]["props"]["type"] == {"Str": "text"}


def test_unsupported_source_raises_type_error():
    import pytest

    with pytest.raises(TypeError):
        form(object())


def test_json_schema_nullable_type_array_is_optional_and_typed():
    # JSON Schema 2020-12 nullable form: {"type": ["integer", "null"]} — the non-null type is effective
    # and the field is optional (may be left empty).
    schema = {
        "type": "object",
        "properties": {"count": {"type": ["integer", "null"]}},
        "required": ["count"],
    }
    c = _controls(schema)
    assert c["count"]["props"]["type"] == {"Str": "number"}
    assert "required" not in c["count"].get("props", {})  # null allowed → optional


def test_json_schema_root_ref_is_dereferenced():
    schema = {
        "$ref": "#/$defs/Thing",
        "$defs": {"Thing": {"type": "object", "properties": {"name": {"type": "string"}}}},
    }
    c = _controls(schema)
    assert c["name"]["tag"] == "wa-input"


def test_json_schema_exclusive_integer_bounds_map_to_nearest_valid_int():
    schema = {
        "type": "object",
        "properties": {"n": {"type": "integer", "exclusiveMinimum": 0, "exclusiveMaximum": 10}},
    }
    c = _controls(schema)
    assert c["n"]["props"]["min"] == {"Int": 1}  # exclusive 0 → smallest valid int is 1
    assert c["n"]["props"]["max"] == {"Int": 9}  # exclusive 10 → largest valid int is 9


def test_json_schema_exclusive_number_bounds_are_dropped_not_reported_inclusive():
    schema = {
        "type": "object",
        "properties": {"r": {"type": "number", "exclusiveMinimum": 0.0, "exclusiveMaximum": 1.0}},
    }
    c = _controls(schema)
    # HTML min/max are inclusive and can't express an exclusive real bound, so neither is emitted.
    assert "min" not in c["r"].get("props", {})
    assert "max" not in c["r"].get("props", {})


def test_json_schema_const_becomes_a_single_option_choice():
    from pydantic import BaseModel as _BM

    class Tagged(_BM):
        kind: Literal["only"] = "only"

    c = _controls(Tagged.model_json_schema())
    assert c["kind"]["tag"] == "wa-select"  # const → a one-option select, not a free text input
    opts = c["kind"]["slots"]["default"]
    assert [o["props"]["value"]["Str"] for o in opts] == ["only"]
