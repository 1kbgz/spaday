"""Per-component theming: CSS custom properties, inline declarations, and classes from Python."""

import pickle
import re
from pathlib import Path

import pytest

from spaday import SHELL_TOKENS, Token, element
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
    assert SHELL_TOKENS["spa_text"] == ("--spa-text", "body text color")


def test_token_adds_fallback_metadata_without_breaking_legacy_sequence_usage():
    token = Token("--spa-chart-grid", "grid line color", fallback="--spa-border")

    assert isinstance(token, tuple)
    assert token == ("--spa-chart-grid", "grid line color")
    assert len(token) == 2
    assert token[0] == "--spa-chart-grid"
    assert token[-1] == "grid line color"
    assert token[:] == ("--spa-chart-grid", "grid line color")
    assert tuple(token) == ("--spa-chart-grid", "grid line color")
    assert token.property == "--spa-chart-grid"
    assert token.description == "grid line color"
    assert token.fallback == "--spa-border"
    assert pickle.loads(pickle.dumps(token)).fallback == "--spa-border"
    with pytest.raises(AttributeError, match="Token is immutable"):
        token.fallback = "--spa-muted"


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


def _check_package_tokens(name, tokens, *, native=False):
    for kwarg, entry in tokens.items():
        prop, description = entry
        assert description, f"{name}: {prop} has no description"
        assert element("div").css(**{kwarg: "x"}).to_node()["props"]["style"]["Str"] == f"{prop}: x", (
            f"{name}: css({kwarg}=…) does not produce {prop}"
        )
        if not native or prop.startswith("--spa-"):
            assert prop.startswith(f"--spa-{name}-"), f"{name}: {prop} does not follow --spa-<package>-*"
        fallback = getattr(entry, "fallback", None)
        if fallback is not None:
            assert fallback in {value[0] for value in SHELL_TOKENS.values()}, f"{name}: {prop} fallback {fallback} is not a shell token"


@pytest.mark.parametrize("fallback", [None, "--spa-muted"])
def test_design_system_native_tokens_do_not_require_shell_mapping_descriptions(fallback):
    _check_package_tokens("lion", {"disabled_text_color": Token("--disabled-text-color", "disabled text color", fallback=fallback)}, native=True)


@pytest.mark.parametrize(
    ("name", "tokens", "native"),
    [
        ("lion", {"spa_other_color": Token("--spa-other-color", "color")}, True),
        ("vega", {"color": Token("--color", "drives --spa-text")}, False),
        ("lion", {"color": Token("--color", "color", fallback="--missing")}, True),
        ("lion", {"wrong": Token("--color", "color")}, True),
    ],
)
def test_native_token_support_retains_namespace_serialization_and_fallback_checks(name, tokens, native):
    with pytest.raises(AssertionError):
        _check_package_tokens(name, tokens, native=native)


def test_installed_component_packages_follow_the_token_convention():
    """Package-owned tokens use --spa-<package>-*. Design systems can expose native properties
    with or without a shell fallback. Every token must serialize through its published css() kwarg.
    """
    import importlib

    from spaday.packages import discover_component_packages

    checked = 0
    for package in discover_component_packages():
        if not package.components:
            continue
        module = importlib.import_module(package.components[0].__module__.split(".")[0])
        tokens = getattr(module, "TOKENS", None)
        if tokens is None:
            continue
        checked += 1
        _check_package_tokens(package.name, tokens, native=package.design is not None)
    if not checked:
        pytest.skip("no component packages with TOKENS installed")
