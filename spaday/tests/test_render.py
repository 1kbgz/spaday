"""Server-side rendering: a component tree → light-DOM HTML for first paint (hydrated client-side)."""

from spaday import element, render_html
from spaday.actions import Toggle, field, item, this
from spaday.components.shell import App, Each, Main, Show, Stack


def test_renders_tag_attrs_and_text():
    html = render_html(element("div", id="root").child(element("span").text("hi")))
    assert html == '<div id="root"><span>hi</span></div>'  # matches a mount's innerHTML


def test_named_slots_get_the_slot_attribute():
    card = element("wa-card").child_in("header", element("h3").text("T")).child(element("p").text("B"))
    html = render_html(card)
    assert '<h3 slot="header">T</h3>' in html
    assert "<p>B</p>" in html  # default slot has no slot attribute


def test_boolean_and_complex_props_and_behavior():
    node = (
        element("input", type="checkbox")
        .prop("checked", True)
        .prop("data", [1, 2, 3])  # complex value can't be an attribute — set on hydrate, omitted here
        .bind("checked", "on", mode="two-way")  # bindings attach on hydrate
        .on("change", Toggle(this(), "checked"))  # events attach on hydrate
    )
    html = render_html(node)
    assert html == '<input type="checkbox" checked>'  # void element, no close tag; behavior/complex omitted


def test_spa_show_renders_empty():
    # structural reactivity is client-side: the element renders, its subtree is mounted on hydrate
    html = render_html(Show(field("on"), element("span").text("x")))
    assert html == '<spa-show style="display:contents"></spa-show>'


def test_spa_each_renders_empty():
    html = render_html(Each(element("span").compute("textContent", item("name")), field="rows", key="id"))
    assert html == '<spa-each style="display:contents" itemKey="id"></spa-each>'


def test_escapes_attributes_and_text():
    html = render_html(element("div", title='a"b<c').text("x<y&z"))
    assert html == '<div title="a&quot;b&lt;c">x&lt;y&amp;z</div>'


def test_renders_a_shell_tree():
    html = render_html(App().child(Main().child(Stack().child(element("p").text("body")))))
    assert html == "<spa-app><spa-main><spa-stack><p>body</p></spa-stack></spa-main></spa-app>"


def test_accepts_an_already_built_node():
    assert render_html(element("b").text("x").to_node()) == "<b>x</b>"


def test_explicit_attributes_serialize_render_and_diff():
    import json

    import pytest

    from spaday import diff

    control = element("input").attr("list", "choices").attr("required", True).attr("readonly", False)
    assert render_html(control) == '<input list="choices" required>'
    assert control.to_node()["props"]["attr:list"] == {"Str": "choices"}
    assert control.bind_attr("list", "choices_id").to_node()["bindings"]["attr:list"] == {"field": "choices_id", "mode": "one-way"}
    assert "attr:list" in diff(json.dumps(control.to_node()), json.dumps(element("input").to_node()))
    control.attr("list", None)
    assert "list=" not in render_html(control)
    with pytest.raises(ValueError):
        element("input").attr('bad"name', "value")
