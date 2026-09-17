import json

import pytest

import spaday
from spaday import (
    Alert,
    Button,
    Checkbox,
    ComponentPackage,
    DateInput,
    Design,
    Dialog,
    NumberInput,
    Progress,
    RadioGroup,
    Select,
    Slider,
    TextArea,
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
    assert set(CONTROLS) == {
        "alert",
        "button",
        "checkbox",
        "date-input",
        "dialog",
        "input",
        "number-input",
        "progress",
        "radio-group",
        "select",
        "slider",
        "switch",
        "textarea",
    }
    assert ToggleSwitch is Switch
    node = Button(label="Save", intent="primary").to_node()
    assert node == {"tag": "ui-button", "props": {"label": {"Str": "Save"}, "intent": {"Str": "primary"}}}
    with pytest.raises(TypeError, match="expects kind 'enum'"):
        Button(intent=3)
    input_type = next(prop for prop in TextInput.schema.props if prop.name == "type")
    assert "number" not in input_type.choices
    # validate() knows the generic vocabulary, and hints at it
    with pytest.raises(ValidationError, match="<ui-button> unknown prop 'intnet'"):
        validate(Column(Button(label="x", intnet="primary")))


def test_the_wider_controls_have_typed_generic_contracts():
    assert TextArea(label="Notes", value="hello", rows=4).to_node()["tag"] == "ui-textarea"
    assert NumberInput(label="Count", value=3, min=0, max=10, step=1).to_node()["props"]["value"] == {"Int": 3}
    assert DateInput(label="When", value="2026-09-14", min="2026-01-01").to_node()["tag"] == "ui-date-input"
    assert Slider(label="Volume", value=0.5, min=0, max=1, step=0.1).to_node()["props"]["value"] == {"Float": 0.5}
    assert RadioGroup(options=[1, {"value": 2, "label": "Two", "disabled": True}], value=1).to_node()["props"]["value"] == {"Int": 1}
    assert Alert("Saved", intent="success").to_node()["tag"] == "ui-alert"
    assert Progress(label="Upload", value=None, max=100).to_node()["tag"] == "ui-progress"


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
    node = _plain(
        resolve(
            Select(label="Plan", options=[1, {"value": 2, "label": "Two", "disabled": True}], value=2, placeholder="Pick").to_node(),
            NATIVE,
        )
    )
    select = node["slots"]["default"][1]
    assert select["tag"] == "spa-select"
    assert select["props"]["options"] == [{"value": 1, "label": "1"}, {"value": 2, "label": "Two", "disabled": True}]
    assert select["props"]["value"] == 2 and select["props"]["placeholder"] == "Pick"
    bound = _plain(resolve(Select(label="Plan").bind("options", "plans").to_node(), NATIVE))
    assert bound["slots"]["default"][1]["bindings"] == {
        "options": {
            "field": "plans",
            "mode": "one-way",
            "options": {"value": "value", "label": "label", "disabled": "disabled"},
        }
    }


def test_the_wider_controls_have_native_fallbacks():
    textarea = _plain(resolve(TextArea(label="Notes", rows=5, minlength=2, maxlength=20).bind("value", "notes", mode="two-way").to_node(), NATIVE))
    assert textarea["slots"]["default"][1]["props"] == {"data-ui": "textarea", "rows": 5, "minlength": 2, "maxlength": 20}
    number = _plain(resolve(NumberInput(label="Count", min=0, max=10, step=1).bind("value", "count", mode="two-way").to_node(), NATIVE))
    assert number["slots"]["default"][1]["props"] == {"type": "number", "data-ui": "number-input", "min": 0, "max": 10, "step": 1}
    assert number["slots"]["default"][1]["bindings"] == {"value": {"field": "count", "mode": "two-way", "codec": "number"}}
    date = _plain(resolve(DateInput(label="When", min="2026-01-01", max="2026-12-31").to_node(), NATIVE))
    assert date["slots"]["default"][1]["props"] == {
        "type": "date",
        "data-ui": "date-input",
        "min": "2026-01-01",
        "max": "2026-12-31",
    }
    slider = _plain(resolve(Slider(label="Volume", value=5, min=0, max=10, step=1).bind("value", "volume", mode="two-way").to_node(), NATIVE))
    assert slider["slots"]["default"][1]["props"] == {"type": "range", "data-ui": "slider", "min": 0, "max": 10, "step": 1, "value": 5}
    assert slider["slots"]["default"][1]["bindings"]["value"]["codec"] == "number"
    radios = _plain(resolve(RadioGroup(label="Priority", options=["low", "high"], value="low").to_node(), NATIVE))
    assert radios["slots"]["default"][1]["tag"] == "spa-radio-group"
    assert _plain(resolve(Alert("Saved", intent="success").to_node(), NATIVE))["props"] == {
        "role": "alert",
        "data-ui": "alert",
        "data-intent": "success",
    }
    progress = _plain(resolve(Progress(label="Upload", value=25, max=100).to_node(), NATIVE))
    assert progress["slots"]["default"][1]["props"] == {"data-ui": "progress", "value": 25, "max": 100}


def _design(**controls) -> Design:
    return Design(name="test", controls=controls)


def test_design_rejects_a_text_binding_that_resolves_to_a_dead_native_attribute():
    with pytest.raises(ValueError, match="<button> has no 'text' DOM property"):
        resolve(Button(label="Hi").bind("text", "message").to_node(), NATIVE)


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
    resolved = resolve(Select(options=["a", {"value": "b", "label": "B"}]).bind("options", "plans").to_node(), by_prop)
    node = _plain(resolved)
    assert node["props"]["items"] == [{"key": "a", "text": "a"}, {"key": "b", "text": "B"}]
    assert node["bindings"] == {
        "items": {
            "field": "plans",
            "mode": "one-way",
            "options": {"value": "key", "label": "text", "disabled": "disabled"},
        }
    }
    empty = json.dumps({"tag": "x-select"})
    patch = spaday.diff(empty, json.dumps(resolved))
    assert json.loads(spaday.apply(empty, patch)) == resolved
    wrapped = _design(select=ControlSpec(tag="x-dropdown", options=Options(kind="children", tag="x-option", wrap="x-listbox", label="label")))
    node = _plain(resolve(Select(options=["a"]).to_node(), wrapped))
    listbox = node["slots"]["default"][0]
    assert listbox["tag"] == "x-listbox" and listbox["slots"]["default"][0]["props"] == {"value": "a", "label": "a"}

    deferred = _design(select=ControlSpec(tag="x-select", value=Value(codec="json", defer=True)))
    node = _plain(resolve(Select(value="a").to_node(), deferred))
    assert "value" not in node.get("props", {})
    assert node["bindings"] == {
        "value": {
            "compute": {"expr": "lit", "value": "a"},
            "mode": "one-way",
            "defer": True,
            "codec": "json",
        }
    }

    checked = _design(select=ControlSpec(tag="x-radio-group", options=Options(kind="children", tag="x-radio", selected="checked")))
    node = _plain(resolve(Select(options=["a", "b"], value="b").to_node(), checked))
    assert node["slots"]["default"][0]["props"] == {"value": "a", "textContent": "a"}
    assert node["slots"]["default"][1]["props"] == {"value": "b", "checked": True, "textContent": "b"}

    labelled = _design(
        select=ControlSpec(
            tag="x-radio-group",
            options=Options(
                kind="children",
                tag="x-radio",
                fixed={"role": "radio"},
                selected="checked",
                label=Part(kind="sibling", tag="span", after=True),
                label_attr="aria-label",
                item_wrap=Wrap(tag="label", props={"class": "choice"}, control={"class": "radio"}),
            ),
        )
    )
    node = _plain(resolve(Select(options=["a", {"value": "b", "label": "Bee"}], value="b").to_node(), labelled))
    assert node["slots"]["default"] == [
        {
            "tag": "label",
            "props": {"class": "choice"},
            "slots": {
                "default": [
                    {"tag": "x-radio", "props": {"role": "radio", "value": "a", "aria-label": "a", "class": "radio"}},
                    {"tag": "span", "props": {"textContent": "a"}},
                ]
            },
        },
        {
            "tag": "label",
            "props": {"class": "choice"},
            "slots": {
                "default": [
                    {
                        "tag": "x-radio",
                        "props": {"role": "radio", "value": "b", "aria-label": "Bee", "checked": True, "class": "radio"},
                    },
                    {"tag": "span", "props": {"textContent": "Bee"}},
                ]
            },
        },
    ]
    with pytest.raises(ValueError, match="child-only rendering settings"):
        resolve(
            Select(options=["a"]).to_node(),
            _design(select=ControlSpec(tag="x-select", options=Options(kind="prop", fixed={"role": "option"}))),
        )


def test_typed_disabled_options_can_cross_a_string_dom_value():
    design = _design(
        select=ControlSpec(
            tag="x-select",
            options=Options(kind="children", tag="x-option", value="value", label="text", disabled="disabled"),
            value=Value(codec="json"),
        )
    )
    resolved = resolve(
        Select(options=[1.0, {"value": True, "label": "Yes", "disabled": True}], value=1).bind("value", "choice", mode="two-way").to_node(),
        design,
    )
    node = _plain(resolved)
    assert node["props"]["value"] == "1"
    assert node["bindings"]["value"]["codec"] == "json"
    first, second = node["slots"]["default"]
    assert first["props"]["value"] == "1"
    assert second["props"] == {"value": "true", "disabled": True, "textContent": "Yes"}
    unicode_node = _plain(resolve(Select(options=["café"], value="café").to_node(), design))
    assert unicode_node["props"]["value"] == '"café"'
    assert unicode_node["slots"]["default"][0]["props"]["value"] == '"café"'
    numbers = _plain(resolve(Select(options=[1e-7, 1e21, {"value": -0.0, "label": None}], value=0).to_node(), design))
    assert [(option["props"]["value"], option["props"]["textContent"]) for option in numbers["slots"]["default"]] == [
        ("1e-7", "1e-7"),
        ("1e+21", "1e+21"),
        ("0", "0"),
    ]
    assert numbers["slots"]["default"][2]["props"]["selected"] is True
    with pytest.raises(ValueError, match="safe range"):
        resolve(Select(options=[2**53]).to_node(), design)
    empty = json.dumps({"tag": "x-select"})
    patch = spaday.diff(empty, json.dumps(resolved))
    assert json.loads(spaday.apply(empty, patch)) == resolved


def test_option_values_validate_and_format_for_javascript():
    design = _design(
        select=ControlSpec(
            tag="x-select",
            options=Options(kind="children"),
            value=Value(codec="json"),
        )
    )
    node = _plain(resolve(Select(options=[True, False, 1e-6], value=True).to_node(), design))
    assert [(option["props"]["value"], option["props"]["textContent"]) for option in node["slots"]["default"]] == [
        ("true", "true"),
        ("false", "false"),
        ("0.000001", "0.000001"),
    ]
    assert node["slots"]["default"][0]["props"]["selected"] is True
    assert "selected" not in node["slots"]["default"][1]["props"]

    invalid_options = [
        ([{"label": "Missing value"}], "needs a 'value'"),
        ([None], "strings, numbers or booleans"),
        ([["nested"]], "strings, numbers or booleans"),
        ([float("inf")], "must be finite"),
    ]
    for options, message in invalid_options:
        with pytest.raises(ValueError, match=message):
            resolve(Select(options=options).to_node(), design)


def test_generic_props_are_derived_from_the_control_schema():
    design = _design(textarea=ControlSpec(tag="x-textarea", props={"rows": None}))
    node = _plain(resolve(TextArea(rows=4, maxlength=20, id="notes", data_test="kept").to_node(), design))
    assert node["props"] == {"id": "notes", "data_test": "kept"}
    single = _plain(resolve(Select(options=["a"], multiple=True).bind("multiple", "many").to_node(), NATIVE))
    select = single["slots"]["default"][0]
    assert "multiple" not in select.get("props", {}) and "multiple" not in select.get("bindings", {})


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
        resolve({"tag": "ui-unknown"}, _design())


def test_for_design_sets_a_designs_own_props():
    design = _design(button=ControlSpec(tag="x-button", label=Part(kind="text"), props={"intent": "variant"}))
    button = Button(label="Go", intent="primary").for_design("test", pill=True, variant="loud").for_design("other", tone="x")
    assert _plain(resolve(button.to_node(), design))["props"] == {"textContent": "Go", "variant": "loud", "pill": True}
    assert "ui:overrides" not in _plain(resolve(button.to_node(), NATIVE))["props"]


def test_overlays_open_by_method_and_report_their_own_close():
    design = _design(
        dialog=ControlSpec(
            tag="x-dialog",
            label=Part(kind="attr", name="heading"),
            open=Open(prop="opened", event="x-closed", methods=("show", "hide"), state="dialog.open"),
        )
    )
    node = _plain(resolve(Dialog(label="Hi", open=True).bind("open", "o", mode="two-way").to_node(), design))
    assert node["props"] == {"heading": "Hi"}
    assert node["bindings"] == {
        "opened": {
            "field": "o",
            "mode": "two-way",
            "event": "x-closed",
            "methods": ["show", "hide"],
            "state": "dialog.open",
        }
    }
    literal = _plain(resolve(Dialog(open=True).to_node(), design))
    assert literal.get("props", {}) == {}
    assert literal["bindings"] == {
        "opened": {
            "compute": {"expr": "lit", "value": True},
            "mode": "one-way",
            "methods": ["show", "hide"],
            "state": "dialog.open",
        }
    }


def test_bind_carries_event_and_methods_through_the_core():
    node = element("dialog").bind(
        "open",
        "o",
        mode="two-way",
        event="close",
        methods=("showModal", "close"),
        state="dialog.open",
        defer=True,
    )
    assert node.to_node()["bindings"]["open"] == {
        "field": "o",
        "mode": "two-way",
        "event": "close",
        "methods": ["showModal", "close"],
        "state": "dialog.open",
        "defer": True,
    }
    patch = spaday.diff(element("dialog").to_json(), node.to_json())
    assert json.loads(spaday.apply(element("dialog").to_json(), patch)) == node.to_node()
    with pytest.raises(ValueError, match="pair of method names"):
        element("dialog").bind("open", "o", methods=("show",))
    with pytest.raises(ValueError, match="dotted property path"):
        element("dialog").bind("open", "o", state="dialog..open")
    numeric = element("input").bind("value", "count", mode="two-way", codec="number")
    assert numeric.to_node()["bindings"]["value"]["codec"] == "number"
    patch = spaday.diff(element("input").to_json(), numeric.to_json())
    assert json.loads(spaday.apply(element("input").to_json(), patch)) == numeric.to_node()
    with pytest.raises(ValueError, match="binding codec"):
        element("input").bind("value", "x", codec="integer")


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
    custom = _design(
        select=ControlSpec(
            tag="x-radio-group",
            options=Options(label=Part(kind="sibling"), item_wrap=Wrap(tag="label")),
        ),
        input=ControlSpec(tag="x-input", value=Value(defer=True)),
        dialog=ControlSpec(tag="x-dialog", open=Open(methods=("show", "hide"), state="dialog.open")),
    )
    assert Design.model_validate_json(custom.model_dump_json()) == custom
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
    assert set(conformance.store()) == {
        "agree",
        "count",
        "dark",
        "date",
        "name",
        "notes",
        "open",
        "plan",
        "priority",
        "progress",
        "saved",
        "volume",
    }
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
    assert "items" not in select["props"] and select["bindings"] == {
        "items": {
            "field": "plans",
            "mode": "one-way",
            "options": {"value": "value", "label": "text", "disabled": "disabled"},
        }
    }
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
