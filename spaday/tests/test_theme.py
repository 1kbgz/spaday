"""Per-component theming: CSS custom properties, inline declarations, and classes from Python."""

import re
from pathlib import Path

import pytest

from spaday import SHELL_TOKENS, element
from spaday.theme import package_token


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


def test_shell_tokens_documents_every_token_the_shell_palette_defines():
    """SHELL_TOKENS is what a Python author discovers; the palette in shell.ts is what actually
    renders. They drifted once — the palette gained the tone colors and the reference didn't, so
    component packages hardcoded their own instead of chaining to them."""
    palette = Path(__file__).parents[2] / "js" / "src" / "ts" / "shell.ts"
    theme_css = palette.read_text().split("const THEME_CSS = `", 1)[1].split("`;", 1)[0]
    defined = set(re.findall(r"(--spa-[a-z0-9-]+):", theme_css))
    documented = {prop for prop, _ in SHELL_TOKENS.values()}
    assert defined - documented == set(), "shell.ts defines tokens SHELL_TOKENS does not document"


def test_package_token_spells_the_component_package_convention():
    assert package_token("dagre", "node-fill") == "--spa-dagre-node-fill"


def test_installed_component_packages_follow_the_token_convention():
    """Every component package publishes a TOKENS mapping shaped like SHELL_TOKENS, naming
    properties `--spa-<package>-*`, with a css() kwarg that actually produces that property.

    `spaday-webawesome` is the documented exception: it maps a design system's own tokens onto the
    shell palette instead of exposing tokens of its own, so its kwargs are `--wa-*`.
    """
    import importlib

    from spaday.packages import discover_component_packages

    checked = 0
    for package in discover_component_packages():
        module = importlib.import_module(package.components[0].__module__.split(".")[0])
        tokens = getattr(module, "TOKENS", None)
        if tokens is None:
            continue
        checked += 1
        for kwarg, entry in tokens.items():
            prop, description = entry  # (property, what it controls), like SHELL_TOKENS
            assert description, f"{package.name}: {prop} has no description"
            assert element("div").css(**{kwarg: "x"}).to_node()["props"]["style"]["Str"] == f"{prop}: x", (
                f"{package.name}: css({kwarg}=…) does not produce {prop}"
            )
            if package.name != "webawesome":
                assert prop.startswith(f"--spa-{package.name}-"), f"{package.name}: {prop} does not follow --spa-<package>-*"
    if not checked:
        pytest.skip("no component packages with TOKENS installed")
