import json

from spaday import apply, diff
from spaday.components.shell import App, Body, Footer, Gutter, Main, Nav, Row, Stack, Toolbar


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
