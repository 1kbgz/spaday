import enum
from typing import Literal, Optional

from pydantic import BaseModel

from spaday.components import form


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
