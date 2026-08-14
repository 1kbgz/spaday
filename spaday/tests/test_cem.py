import json
from pathlib import Path

import pytest

from spaday import Component, apply, classes, diff, generate, parse_cem

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
