import json
from pathlib import Path

from spaday import Component, apply, diff, generate, parse_cem

FIXTURE = str(Path(__file__).parent / "fixtures" / "webawesome.cem.json")


def _module():
    """Generate the fixture's components and exec them into a fresh namespace."""
    ns: dict = {}
    exec(generate(FIXTURE), ns)
    return ns


def test_parse_cem_filters_to_custom_elements():
    schemas = json.loads(parse_cem(Path(FIXTURE).read_text()))
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
    assert 'size: Optional[Literal["small", "medium", "large"]] = None' in code
    assert "name: Optional[str] = None" in code  # `string | null` -> Optional
    assert "checked: Optional[bool] = None" in code


def test_python_keyword_attribute_is_escaped():
    # wa-button has a `for` attribute; the param is `for_`, mapped back to the `for` prop.
    code = generate(FIXTURE)
    assert "for_: Optional[str] = None" in code
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


def test_committed_webawesome_components_import():
    from spaday.components.webawesome import WaButton, WaCard, WaSwitch

    assert WaSwitch.tag == "wa-switch"
    assert WaButton.tag == "wa-button"
    assert WaCard.tag == "wa-card"
    assert issubclass(WaSwitch, Component)
    # a generated component composes and round-trips like any node
    tree = WaCard().child(WaSwitch(checked=True)).to_json()
    assert json.loads(apply(tree, diff(tree, tree))) == json.loads(tree)
