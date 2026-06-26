import json

import pytest

from spaday import apply, diff, element
from spaday.actions import field, not_
from spaday.components.shell import App, Body, Column, Footer, Gutter, Main, Nav, Row, Show, Stack, Toolbar


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
