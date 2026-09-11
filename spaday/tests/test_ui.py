import json

import pytest

import spaday
from spaday import (
    Button,
    Checkbox,
    ComponentPackage,
    Design,
    Dialog,
    Select,
    TextInput,
    ToggleSwitch,
    ValidationError,
    element,
    field,
    render_html,
    validate,
)
from spaday.bootstrap import tree_json
from spaday.components.shell import Column
from spaday.ui import NATIVE, ControlSpec, Open, Options, Part, Value, Wrap, conformance, resolve, select_design
from spaday.ui.controls import CONTROLS, Switch
from spaday.worker import WorkerApp


def _plain(node: dict) -> dict:
    """Props untagged throughout, for readable assertions."""
    from spaday.ui.design import _plain as plain

    out = {**node, "props": {k: plain(v) for k, v in node.get("props", {}).items()}}
    if "slots" in node:
        out["slots"] = {slot: [_plain(c) if isinstance(c, dict) else c for c in children] for slot, children in node["slots"].items()}
    return out


def test_controls_serialize_to_generic_nodes_with_schemas():
    assert set(CONTROLS) == {"button", "input", "checkbox", "switch", "select", "dialog"}
    assert ToggleSwitch is Switch
    node = Button(label="Save", intent="primary").to_node()
    assert node == {"tag": "ui-button", "props": {"label": {"Str": "Save"}, "intent": {"Str": "primary"}}}
    with pytest.raises(TypeError, match="expects kind 'enum'"):
        Button(intent=3)
    # validate() knows the generic vocabulary, and hints at it
    with pytest.raises(ValidationError, match="<ui-button> unknown prop 'intnet'"):
        validate(Column(Button(label="x", intnet="primary")))


def test_native_button_and_dialog():
    button = _plain(resolve(Button(label="Save", intent="primary", appearance="outline", size="lg", disabled=True, id="b").to_node(), NATIVE))
    assert button["tag"] == "button"
    assert button["props"] == {
        "type": "button",
        "data-ui": "button",
        "textContent": "Save",
        "data-intent": "primary",
        "data-appearance": "outline",
        "data-size": "lg",
        "disabled": True,
        "id": "b",
    }
    dialog = _plain(resolve(Dialog(element("p"), label="Confirm", id="d").bind("open", "open", mode="two-way").to_node(), NATIVE))
    assert dialog["tag"] == "dialog"
    assert [c["tag"] for c in dialog["slots"]["default"]] == ["h2", "p"]  # the title leads the content
    assert dialog["bindings"] == {"open": {"field": "open", "mode": "two-way", "event": "close", "methods": ["showModal", "close"]}}


def test_native_field_wraps_the_control_with_its_parts():
    node = _plain(
        resolve(
            TextInput(id="name", label="Name", help="Hint", error="Bad", placeholder="Ada", type="email")
            .bind("value", "name", mode="two-way")
            .to_node(),
            NATIVE,
        )
    )
    assert node["tag"] == "label" and node["props"] == {"data-ui": "field"}
    label, control, help_, error = node["slots"]["default"]
    assert (label["props"]["textContent"], help_["props"]["textContent"], error["props"]["textContent"]) == ("Name", "Hint", "Bad")
    assert control["props"] == {"data-ui": "input", "data-invalid": True, "id": "name", "placeholder": "Ada", "type": "email"}
    assert control["bindings"] == {"value": {"field": "name", "mode": "two-way"}}
    # a toggle's value is its checked state, and its label follows it
    box = _plain(resolve(Checkbox(label="Agree", value=True).bind("value", "agree", mode="two-way").to_node(), NATIVE))
    control, label = box["slots"]["default"]
    assert control["props"] == {"type": "checkbox", "data-ui": "checkbox", "checked": True}
    assert control["bindings"] == {"checked": {"field": "agree", "mode": "two-way"}}
    assert label["props"]["textContent"] == "Agree"


def test_native_select_renders_options_as_children_and_preselects_the_value():
    node = _plain(resolve(Select(label="Plan", options=["a", {"value": "b", "label": "B"}], value="b", placeholder="Pick").to_node(), NATIVE))
    select = node["slots"]["default"][1]
    assert select["tag"] == "select" and "placeholder" not in select["props"]  # unsupported here, dropped
    assert [(o["props"]["value"], o["props"]["textContent"], o["props"].get("selected")) for o in select["slots"]["default"]] == [
        ("a", "a", None),
        ("b", "B", True),
    ]
    with pytest.raises(ValueError, match="binds its options, which design 'native' renders as child elements"):
        resolve(Select(label="Plan").bind("options", "plans").to_node(), NATIVE)


def _design(**controls) -> Design:
    return Design(name="test", controls=controls)


def test_a_design_maps_names_values_parts_events_and_bindings():
    design = _design(
        button=ControlSpec(
            tag="x-button",
            label=Part(kind="text"),
            props={"intent": "variant", "size": None},
            values={"intent": {"primary": "brand"}},
            events={"click": "x-press"},
        ),
        input=ControlSpec(
            tag="x-input",
            label=Part(kind="attr", name="label"),
            help=Part(kind="slot", name="hint"),
            error=Part(kind="attr", name="error-message"),
            invalid={"invalid": True},
            value=Value(prop="text", event="x-changed"),
        ),
    )
    button = _plain(resolve(Button(label="Go", intent="primary", size="lg").on("click", spaday.SetField("x", 1)).to_node(), design))
    assert button["props"] == {"textContent": "Go", "variant": "brand"}  # size is unsupported: dropped, not leaked
    assert list(button["events"]) == ["x-press"]
    text = _plain(
        resolve(TextInput(label="Name", help="Hint", error="Bad").bind("value", "name", mode="two-way").bind("label", "caption").to_node(), design)
    )
    assert text["props"] == {"label": "Name", "error-message": "Bad", "invalid": True}
    assert text["slots"] == {"hint": [{"tag": "span", "props": {"slot": "hint", "textContent": "Hint"}}]}
    assert text["bindings"] == {"text": {"field": "name", "mode": "two-way", "event": "x-changed"}, "label": {"field": "caption", "mode": "one-way"}}


def test_options_as_a_property_and_a_wrapped_child_list():
    by_prop = _design(select=ControlSpec(tag="x-select", options=Options(kind="prop", name="items", value="key", label="text")))
    node = _plain(resolve(Select(options=["a", {"value": "b", "label": "B"}]).bind("options", "plans").to_node(), by_prop))
    assert node["props"]["items"] == [{"key": "a", "text": "a"}, {"key": "b", "text": "B"}]
    assert node["bindings"] == {"items": {"field": "plans", "mode": "one-way"}}
    wrapped = _design(select=ControlSpec(tag="x-dropdown", options=Options(kind="children", tag="x-option", wrap="x-listbox", label="label")))
    node = _plain(resolve(Select(options=["a"]).to_node(), wrapped))
    listbox = node["slots"]["default"][0]
    assert listbox["tag"] == "x-listbox" and listbox["slots"]["default"][0]["props"] == {"value": "a", "label": "a"}


def test_a_wrapped_design_keeps_key_outside_and_id_on_the_control():
    design = _design(
        input=ControlSpec(
            tag="x-input",
            wrap=Wrap(tag="x-field", props={"layout": "above"}, control={"slot": "input"}),
            label=Part(kind="sibling", tag="x-label", props={"slot": "label"}),
        )
    )
    node = _plain(resolve(TextInput(id="name", label="Name", key="k1").to_node(), design))
    assert node["tag"] == "x-field" and node["key"] == "k1" and node["props"] == {"layout": "above"}
    label, control = node["slots"]["default"]
    assert label["props"] == {"slot": "label", "textContent": "Name"}
    assert control["props"] == {"id": "name", "slot": "input"}
    with pytest.raises(ValueError, match="declares no wrap"):
        resolve(TextInput(label="x").to_node(), _design(input=ControlSpec(tag="x-input", label=Part(kind="sibling"))))


def test_a_missing_control_falls_back_to_native_and_says_so():
    node = _plain(resolve(Button(label="Go").to_node(), _design()))
    assert node["tag"] == "button" and node["props"]["data-ui-fallback"] == "native"
    with pytest.raises(ValueError, match="not a generic control"):
        resolve({"tag": "ui-slider"}, _design())


def test_for_design_sets_a_designs_own_props():
    design = _design(button=ControlSpec(tag="x-button", label=Part(kind="text"), props={"intent": "variant"}))
    button = Button(label="Go", intent="primary").for_design("test", pill=True, variant="loud").for_design("other", tone="x")
    assert _plain(resolve(button.to_node(), design))["props"] == {"textContent": "Go", "variant": "loud", "pill": True}
    assert "ui:overrides" not in _plain(resolve(button.to_node(), NATIVE))["props"]


def test_overlays_open_by_method_and_report_their_own_close():
    design = _design(
        dialog=ControlSpec(
            tag="x-dialog", label=Part(kind="attr", name="heading"), open=Open(prop="opened", event="x-closed", methods=("show", "hide"))
        )
    )
    node = _plain(resolve(Dialog(label="Hi", open=True).bind("open", "o", mode="two-way").to_node(), design))
    assert node["props"] == {"heading": "Hi", "opened": True}
    assert node["bindings"] == {"opened": {"field": "o", "mode": "two-way", "event": "x-closed", "methods": ["show", "hide"]}}


def test_bind_carries_event_and_methods_through_the_core():
    node = element("dialog").bind("open", "o", mode="two-way", event="close", methods=("showModal", "close"))
    assert node.to_node()["bindings"]["open"] == {"field": "o", "mode": "two-way", "event": "close", "methods": ["showModal", "close"]}
    patch = spaday.diff(element("dialog").to_json(), node.to_json())
    assert json.loads(spaday.apply(element("dialog").to_json(), patch)) == node.to_node()
    with pytest.raises(ValueError, match="pair of method names"):
        element("dialog").bind("open", "o", methods=("show",))


def test_select_design_follows_the_selected_packages():
    design = _design(button=ControlSpec(tag="x-button"))
    with_design = ComponentPackage("x", ".", (), design=design)
    other = ComponentPackage("y", ".", (), design=_design())
    plain = ComponentPackage("z", ".", ())
    assert select_design(None, [plain]) is NATIVE
    assert select_design(None, [plain, with_design]) is design
    assert select_design("x", [with_design]) is design
    assert select_design("native", [with_design]) is NATIVE
    assert select_design(design, []) is design
    with pytest.raises(ValueError, match="several selected packages publish a design \\('x', 'y'\\)"):
        select_design(None, [with_design, other])
    with pytest.raises(ValueError, match="no selected package publishes the design 'q'"):
        select_design("q", [with_design])
    with pytest.raises(TypeError, match="must be a spaday.ui.Design"):
        ComponentPackage("x", ".", (), design={"name": "x"})


def test_a_design_round_trips_as_data():
    dumped = NATIVE.model_dump_json()
    assert Design.model_validate_json(dumped) == NATIVE
    with pytest.raises(ValueError):
        ControlSpec(tag="x", labl=Part())  # a typo in a spec is an error, not a silently dropped mapping


def test_every_serving_path_resolves_generic_controls():
    page = Column(Button(label="Go"), TextInput(label="Name"))
    assert "ui-" not in tree_json(page)
    assert json.loads(tree_json(page))["slots"]["default"][0]["tag"] == "button"
    html = render_html(page)
    assert "<button" in html and "ui-button" not in html
    worker = WorkerApp(lambda: page, lambda _intent: None)
    assert worker.start()["tree"]["slots"]["default"][0]["tag"] == "button"


def test_the_conformance_page_covers_every_control():
    node = conformance.page().to_node()
    tags = set()

    def walk(n):
        tags.add(n["tag"])
        for children in n.get("slots", {}).values():
            for child in children:
                walk(child)

    walk(node)
    assert {f"ui-{kind}" for kind in CONTROLS} <= tags
    assert set(conformance.store()) == {"name", "agree", "dark", "plan", "saved", "open"}
    assert "ui-" not in json.dumps(resolve(node, NATIVE))


def test_bound_state_reaches_a_designs_value_prop_untouched_by_value_maps():
    """A bound intent is not mapped (its value is only known in the browser); a bound value is renamed."""
    design = _design(button=ControlSpec(tag="x-button", props={"intent": "variant"}, values={"intent": {"primary": "brand"}}))
    node = _plain(resolve(Button().compute("intent", field("tone")).to_node(), design))
    assert "variant" in node["bindings"] and node["bindings"]["variant"]["compute"]["expr"] == "field"


def test_the_conformance_server_serves_the_page_with_the_chosen_design(monkeypatch):
    import uvicorn

    started = []
    monkeypatch.setattr(uvicorn, "run", lambda app, **options: started.append((app, options)))
    conformance.main(["8123", "--design", "native"])
    app, options = started[0]
    assert options == {"host": "127.0.0.1", "port": 8123, "log_level": "warning"}
    from starlette.testclient import TestClient

    tree = TestClient(app).get("/tree.json").json()
    assert tree["props"]["id"] == {"Str": "conformance"} and "ui-" not in json.dumps(tree)


def test_a_plain_dict_tree_resolves_too():
    """A tree authored as dicts carries untagged values; they pass through the same mapping."""
    node = resolve({"tag": "ui-button", "props": {"label": "Go", "intent": "danger", "disabled": True}}, NATIVE, fallback=NATIVE)
    assert _plain(node)["props"] == {"type": "button", "data-ui": "button", "textContent": "Go", "data-intent": "danger", "disabled": True}


def test_bound_parts_and_unsupported_bindings():
    design = _design(
        button=ControlSpec(tag="x-button", label=Part(kind="text"), props={"size": None}),
        input=ControlSpec(tag="x-input", help=Part(kind="slot", name="hint"), error=Part(kind="none")),
    )
    button = _plain(resolve(Button().bind("label", "caption").bind("size", "sz").bind("readonly", "ro").to_node(), design))
    # a bound label lands on the text; a binding the design maps to nothing, or does not know, is dropped
    assert button["bindings"] == {"textContent": {"field": "caption", "mode": "one-way"}}
    text = _plain(resolve(TextInput(error="Bad").bind("help", "hint").to_node(), design))
    assert "error" not in text["props"]  # the design has nowhere to show it
    assert text["slots"]["hint"][0]["bindings"] == {"textContent": {"field": "hint", "mode": "one-way"}}


def test_options_bound_only_and_a_dialog_opened_one_way():
    design = _design(
        select=ControlSpec(tag="x-select", options=Options(kind="prop", name="items")),
        dialog=ControlSpec(tag="x-dialog", open=Open(prop="opened", event="x-closed", methods=("show", "hide"))),
    )
    select = _plain(resolve(Select().bind("options", "plans").to_node(), design))
    assert "items" not in select["props"] and select["bindings"] == {"items": {"field": "plans", "mode": "one-way"}}
    dialog = _plain(resolve(Dialog(open=True).to_node(), design))
    assert dialog["props"] == {"opened": True} and "bindings" not in dialog
    one_way = _plain(resolve(Dialog().bind("open", "o").to_node(), design))
    # one-way: driven by the methods, but the close event has nothing to write back to
    assert one_way["bindings"] == {"opened": {"field": "o", "mode": "one-way", "methods": ["show", "hide"]}}


def test_named_slots_pass_through_and_a_bare_wrap_has_no_props():
    design = _design(
        dialog=ControlSpec(tag="x-dialog", label=Part(kind="child", tag="h1", after=True)),
        input=ControlSpec(tag="x-input", wrap=Wrap(tag="x-field"), label=Part(kind="sibling")),
    )
    dialog = _plain(resolve(Dialog(element("p"), label="Title").child_in("footer", Button(label="OK")).to_node(), design))
    assert [c["tag"] for c in dialog["slots"]["default"]] == ["p", "h1"]  # `after` puts the title last
    assert dialog["slots"]["footer"][0]["tag"] == "button"  # a generic child in a named slot resolves too
    field = resolve(TextInput(label="Name").to_node(), design)
    assert field["tag"] == "x-field" and "props" not in field
