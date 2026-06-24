import enum
from typing import Annotated, Literal, Optional

from pydantic import BaseModel

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
    note: Optional[str] = None


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


def test_required_is_surfaced_from_the_schema():
    c = _controls(Settings)
    assert c["name"]["props"].get("required") == {"Bool": True}  # no default → required
    assert "required" not in c["count"].get("props", {})  # has a default → not required


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
