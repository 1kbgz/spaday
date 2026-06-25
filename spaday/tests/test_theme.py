"""Per-component theming: CSS custom properties, inline declarations, and classes from Python."""

from spaday import SHELL_TOKENS, element


def test_css_sets_custom_properties():
    props = element("wa-button").css(background_color="navy").to_node()["props"]
    assert props["style"] == {"Str": "--background-color: navy"}


def test_style_sets_inline_declarations_kebab_cased():
    props = element("div").style(padding="1rem", font_size="2rem").to_node()["props"]
    assert props["style"] == {"Str": "padding: 1rem; font-size: 2rem"}


def test_classes_accumulate():
    props = element("div").classes("a", "b").classes("c").to_node()["props"]
    assert props["class"] == {"Str": "a b c"}


def test_theming_composes_with_a_literal_style_prop():
    # a literal style prop (e.g. spa-show's display:contents) survives; theming appends to it
    props = element("div", style="display:contents").css(spa_surface="#111").to_node()["props"]
    assert props["style"] == {"Str": "display:contents; --spa-surface: #111"}


def test_trailing_underscore_escape():
    props = element("div").style(float_="left").to_node()["props"]
    assert props["style"] == {"Str": "float: left"}


def test_unthemed_component_stays_prop_free():
    assert "props" not in element("div").to_node()


def test_shell_tokens_reference_is_exposed():
    assert SHELL_TOKENS["spa_surface"][0] == "--spa-surface"  # css(spa_surface=...) drives this property
