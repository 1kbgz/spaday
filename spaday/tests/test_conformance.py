"""The conformance check for a substitute bundle, run in a real browser.

The check exists to catch bundles that break the implicit contract silently, so the test drives a
conforming bundle and a broken one and asserts it distinguishes them.
"""

import pytest

from spaday import Component, ComponentPackage, ComponentSchema, PropertySchema
from spaday.conformance import check_script, expectations


def _package(name: str = "demo") -> ComponentPackage:
    class Chart(Component):
        tag = "demo-chart"
        schema = ComponentSchema(
            tag="demo-chart",
            class_name="Chart",
            props=(
                PropertySchema(name="series", kind="json"),
                PropertySchema(name="title", kind="string"),
                PropertySchema(name="height", kind="number"),
                PropertySchema(name="render-hint", kind="json"),
            ),
        )

    return ComponentPackage(name=name, assets_dir=".", assets=(("js", "cdn/index.js"),), components=(Chart,))


def test_expectations_name_the_tag_and_only_its_json_props():
    """Only json props are required to be DOM properties; the rest survive the attribute fallback."""
    assert expectations([_package()]) == ({"tag": "demo-chart", "jsonProps": ["series"]},)


def test_a_hyphenated_name_is_not_asked_to_be_a_property():
    """No element has a ``render-hint`` property, so every bundle -- the package's own too -- carries
    it as an attribute; requiring the property would fail them all and tell none of them apart."""
    assert "render-hint" not in expectations([_package()])[0]["jsonProps"]


def test_the_script_is_self_contained():
    script = check_script([_package()])
    assert script.startswith("((expectations)")
    assert '"demo-chart"' in script


@pytest.fixture
def browser_page():
    playwright = pytest.importorskip("playwright.sync_api", reason="needs the [develop] extra")
    with playwright.sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception as error:  # no browser binary installed
            pytest.skip(f"no chromium available: {error}")
        page = browser.new_page()
        yield page
        browser.close()


CONFORMING = """
class Chart extends HTMLElement {
  set series(value) { this._series = value; }
  get series() { return this._series; }
}
customElements.define('demo-chart', Chart);
"""

ATTRIBUTE_ONLY = """
class Chart extends HTMLElement {}
customElements.define('demo-chart', Chart);
"""


def test_a_conforming_bundle_reports_no_problems(browser_page):
    browser_page.add_script_tag(content=CONFORMING)
    assert browser_page.evaluate(check_script([_package()])) == []


def test_an_unregistered_tag_is_reported(browser_page):
    """The silent no-render: the Python surface is fine, the element was never defined."""
    problems = browser_page.evaluate(check_script([_package()]))
    assert len(problems) == 1
    assert "<demo-chart> is not a defined custom element" in problems[0]


def test_a_json_prop_with_no_dom_property_is_reported(browser_page):
    """setProp would fall back to an attribute, stringifying the object to "[object Object]"."""
    browser_page.add_script_tag(content=ATTRIBUTE_ONLY)
    problems = browser_page.evaluate(check_script([_package()]))
    assert len(problems) == 1
    assert "has no series DOM property" in problems[0]
