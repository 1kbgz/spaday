import json

import pytest

from spaday import apply, diff, element
from spaday.actions import field, not_
from spaday.components.shell import App, AppShell, Body, Column, Footer, Gutter, Main, Nav, Region, Row, Show, Stack, Table, Tabs, Toolbar


def test_shell_classes_emit_spa_tags():
    got = {cls().tag for cls in (App, Nav, Body, Gutter, Main, Footer, Stack, Row, Toolbar)}
    assert got == {
        "spa-app",
        "spa-nav",
        "spa-body",
        "spa-gutter",
        "spa-main",
        "spa-footer",
        "spa-stack",
        "spa-row",
        "spa-toolbar",
    }


def test_shell_composes_a_page_and_round_trips_through_core():
    tree = App().child(Nav().child(Stack())).child(Body().child(Gutter()).child(Main().child(Stack().child(Row())))).child(Footer()).to_json()
    node = json.loads(tree)
    assert node["tag"] == "spa-app"
    assert [c["tag"] for c in node["slots"]["default"]] == ["spa-nav", "spa-body", "spa-footer"]
    # the shell tree is an ordinary component tree — it round-trips through the core diff/apply
    assert json.loads(apply(tree, diff(tree, tree))) == node


def test_shell_re_exported_from_components_package():
    import spaday.components as components

    assert components.App is App
    assert components.Stack is Stack


def test_shell_layout_props_become_attributes():
    # typed layout kwargs land as props (the runtime sets them as attributes -> CSS custom properties)
    assert Stack(gap="24px", align="end").to_node()["props"] == {"gap": {"Str": "24px"}, "align": {"Str": "end"}}
    assert Gutter(width="320px").to_node()["props"] == {"width": {"Str": "320px"}}
    assert Row(justify="space-between").to_node()["props"] == {"justify": {"Str": "space-between"}}
    # unset kwargs are omitted, so an unstyled primitive stays prop-free
    assert "props" not in Stack().to_node()


def test_column_is_canonical_and_stack_is_an_alias():
    # `Column` pairs with `Row`; `Stack` is kept as a back-compat alias for the same class
    assert Stack is Column
    assert Column(gap="8px").to_node()["tag"] == "spa-stack"


def test_constructor_children_and_string_text_and_generic_props():
    # children nest positionally; a string child becomes a <span> text node
    node = App(Nav("Title"), Body(Main())).to_node()
    assert [c["tag"] for c in node["slots"]["default"]] == ["spa-nav", "spa-body"]
    nav = node["slots"]["default"][0]
    assert nav["slots"]["default"][0] == {"tag": "span", "props": {"textContent": {"Str": "Title"}}}
    # a non-typed keyword passes through as a generic prop alongside the typed ones
    assert Gutter(width="320px", id="side").to_node()["props"]["id"] == {"Str": "side"}
    # the fluent .child() API composes the same tree as a constructor string child (back-compat)
    assert Nav().child("Title").to_node() == nav


def test_app_shell_composes_named_regions_into_the_frame():
    shell = (
        AppShell()
        .add(Region.HEADER_LEFT, "My app")
        .add(Region.HEADER_RIGHT, element("wa-button", id="theme"))
        .add(Region.GUTTER_LEFT, element("nav-menu"))
        .add(Region.MAIN, element("main-chart"))
        .add(Region.FOOTER_LEFT, "status")
    )
    node = shell.build().to_node()
    assert node["tag"] == "spa-app"
    assert [c["tag"] for c in node["slots"]["default"]] == ["spa-nav", "spa-body", "spa-footer"]
    nav, body, footer = node["slots"]["default"]
    # header: left items, a flex spacer, then the right-aligned items
    assert [c["tag"] for c in nav["slots"]["default"]] == ["span", "div", "wa-button"]
    assert nav["slots"]["default"][1]["props"]["style"] == {"Str": "flex:1"}
    # body: left gutter + main (no right gutter contributed)
    assert [c["tag"] for c in body["slots"]["default"]] == ["spa-gutter", "spa-main"]
    assert body["slots"]["default"][1]["slots"]["default"][0]["tag"] == "main-chart"
    # footer contributions ride in a Row strip
    assert footer["slots"]["default"][0]["tag"] == "spa-row"


def test_app_shell_orders_contributions_within_a_region():
    shell = AppShell()
    shell.add(Region.MAIN, element("late"), order=10)
    shell.add(Region.MAIN, element("early"), order=-1)
    shell.add(Region.MAIN, element("mid-a"), element("mid-b"))  # default order 0, insertion order kept
    main = shell.build().to_node()["slots"]["default"][0]["slots"]["default"][0]
    assert [c["tag"] for c in main["slots"]["default"]] == ["early", "mid-a", "mid-b", "late"]


def test_app_shell_omits_empty_frame_pieces():
    # nothing contributed: just Body(Main) — no Nav, no gutters, no Footer
    node = AppShell().build().to_node()
    assert [c["tag"] for c in node["slots"]["default"]] == ["spa-body"]
    assert [c["tag"] for c in node["slots"]["default"][0]["slots"]["default"]] == ["spa-main"]
    # the composed tree is an ordinary component tree — it rides the core diff/apply
    tree = AppShell().add(Region.MAIN, element("p")).build().to_json()
    assert json.loads(apply(tree, diff(tree, tree))) == json.loads(tree)


def test_show_field_authors_a_when_binding():
    node = Show(field="on").child(element("span")).to_node()
    assert node["tag"] == "spa-show"
    assert node["bindings"]["when"] == {"field": "on", "mode": "one-way"}
    assert node["props"]["style"] == {"Str": "display:contents"}  # transparent wrapper
    assert node["slots"]["default"][0]["tag"] == "span"


def test_show_when_authors_a_compute_binding():
    node = Show(when=not_(field("hidden"))).child(element("p")).to_node()
    binding = node["bindings"]["when"]
    assert binding["mode"] == "one-way"
    assert binding["compute"] == {"expr": "not", "of": {"expr": "field", "name": "hidden"}}


def test_show_requires_a_condition():
    with pytest.raises(ValueError):
        Show()


def test_tabs_builds_a_wa_tab_group_from_pairs():
    node = Tabs().tab("Overview", element("p")).tab("By symbol", element("span")).to_node()
    assert node["tag"] == "wa-tab-group"
    nav, panels = node["slots"]["nav"], node["slots"]["default"]  # headers in "nav", panels default
    assert [c["tag"] for c in nav] == ["wa-tab", "wa-tab"]
    assert [c["tag"] for c in panels] == ["wa-tab-panel", "wa-tab-panel"]
    # each wa-tab's `panel` matches its wa-tab-panel's `name`, slugged from the label
    assert nav[0]["props"]["panel"] == {"Str": "overview"} and panels[0]["props"]["name"] == {"Str": "overview"}
    assert nav[1]["props"]["panel"] == {"Str": "by-symbol"} and panels[1]["props"]["name"] == {"Str": "by-symbol"}
    assert nav[0]["props"]["textContent"] == {"Str": "Overview"}  # the header label
    assert panels[0]["slots"]["default"][0]["tag"] == "p"  # the panel body


def test_tabs_active_binds_for_routing():
    node = Tabs(active="overview").tab("Overview", element("p")).bind("active", "view", mode="two-way").to_node()
    assert node["props"]["active"] == {"Str": "overview"}  # initial active panel
    assert node["bindings"]["active"] == {"field": "view", "mode": "two-way"}  # state <-> active tab
    # an explicit name overrides the slug (bind against a stable value)
    assert Tabs().tab("A B", name="tab1").to_node()["slots"]["nav"][0]["props"]["panel"] == {"Str": "tab1"}


def test_table_authors_a_spa_table():
    node = Table(columns=["symbol", "qty"], rows=[{"symbol": "AAPL", "qty": 10}]).to_node()
    assert node["tag"] == "spa-table"
    assert node["props"]["columns"] == {"List": [{"Str": "symbol"}, {"Str": "qty"}]}
    assert node["props"]["rows"] == {"List": [{"Map": {"symbol": {"Str": "AAPL"}, "qty": {"Int": 10}}}]}


def test_table_rows_are_reactive():
    node = Table(columns=["a"]).compute("rows", field("orders")).to_node()
    assert node["bindings"]["rows"] == {"compute": {"expr": "field", "name": "orders"}, "mode": "one-way"}
    assert "rows" not in node.get("props", {})  # computed, not a static prop
