import sys
from types import ModuleType

import pytest

import spaday.packages as package_registry
from spaday import Component, ComponentSchema, PropertySchema
from spaday.bootstrap import bootstrap
from spaday.packages import ComponentPackage, discover_component_package_names, discover_component_packages, resolve_component_packages


class EntryPoint:
    def __init__(self, name, package):
        self.name = name
        self.package = package
        self.loaded = False

    def load(self):
        self.loaded = True
        return self.package


@pytest.fixture
def python_path_package(monkeypatch):
    package = ComponentPackage("fixture", ".", (("css", "fixture.css"), ("js", "fixture.js")))
    module = ModuleType("spaday_package_fixture")
    module.package = package
    monkeypatch.setitem(sys.modules, module.__name__, module)
    return package


def test_resolves_a_descriptor_and_python_path(python_path_package):
    direct = ComponentPackage("direct", ".", (("js", "index.js"),))
    assert resolve_component_packages(direct) == (direct,)
    assert resolve_component_packages("spaday_package_fixture:package") == (python_path_package,)


def test_resolves_and_discovers_installed_entry_points(monkeypatch):
    first = ComponentPackage("first", ".", (("js", "first.js"),))
    second = ComponentPackage("second", ".", (("css", "second.css"),))
    candidates = [EntryPoint("z-second", second), EntryPoint("a-first", first)]
    monkeypatch.setattr(package_registry, "entry_points", lambda **_kwargs: candidates)

    assert resolve_component_packages("z-second") == (second,)
    assert discover_component_packages() == (first, second)


def test_discovers_installed_names_without_loading_entry_points(monkeypatch):
    candidates = [EntryPoint("z-second", object()), EntryPoint("a-first", object()), EntryPoint("a-first", object())]
    monkeypatch.setattr(package_registry, "entry_points", lambda **_kwargs: candidates)

    assert discover_component_package_names() == ("a-first", "z-second")
    assert not any(candidate.loaded for candidate in candidates)


def test_package_exposes_component_catalog():
    class GeneratedCard(Component):
        tag = "demo-card"
        schema = ComponentSchema(
            tag="demo-card",
            class_name="GeneratedCard",
            props=(PropertySchema(name="appearance", kind="enum", choices=("filled", "outlined")),),
            slots=("", "header"),
        )

    class Card(GeneratedCard):
        def __init__(self):
            raise AssertionError("catalog discovery must not construct components")

    package = ComponentPackage("demo", ".", (("js", "index.js"),), components=(Card,))

    assert package.components == (Card,)
    assert package.catalog[0].class_name == "Card"
    assert package.catalog[0].to_dict() == {
        "tag": "demo-card",
        "class_name": "Card",
        "props": [{"name": "appearance", "kind": "enum", "choices": ["filled", "outlined"]}],
        "events": [],
        "slots": ["", "header"],
    }


def test_package_rejects_components_without_matching_schema():
    class MissingSchema(Component):
        tag = "missing-schema"

    class WrongSchema(Component):
        tag = "wrong-schema"
        schema = ComponentSchema(tag="another-tag", class_name="WrongSchema")

    with pytest.raises(ValueError, match="does not define catalog schema"):
        ComponentPackage("missing", ".", (), components=(MissingSchema,))
    with pytest.raises(ValueError, match="schema tag does not match"):
        ComponentPackage("wrong", ".", (), components=(WrongSchema,))


def test_bootstrap_uses_the_same_descriptor_for_package_asset_urls(python_path_package):
    html = bootstrap(
        base="/dash",
        packages="spaday_package_fixture:package",
        nonce="abc123",
    )
    assert '<link rel="stylesheet" nonce="abc123" href="/dash/components/fixture/fixture.css" />' in html
    assert '<script type="module" nonce="abc123" src="/dash/components/fixture/fixture.js"></script>' in html


def test_rejects_unsafe_descriptors_and_duplicate_selection():
    with pytest.raises(ValueError, match="name"):
        ComponentPackage("Not Safe", ".", (("js", "index.js"),))
    with pytest.raises(ValueError, match="asset kind"):
        ComponentPackage("safe", ".", (("image", "index.png"),))
    with pytest.raises(ValueError, match="relative"):
        ComponentPackage("safe", ".", (("js", "../index.js"),))
    package = ComponentPackage("same", ".", (("js", "index.js"),))
    with pytest.raises(ValueError, match="more than once"):
        resolve_component_packages((package, package))


def test_unknown_entry_point_has_a_useful_error(monkeypatch):
    available = ComponentPackage("available", ".", ())
    monkeypatch.setattr(package_registry, "entry_points", lambda **_kwargs: (EntryPoint("available", available),))
    with pytest.raises(ValueError, match="available packages: available"):
        resolve_component_packages("missing")


def test_rejects_invalid_python_paths_and_entry_points(monkeypatch, python_path_package):
    module = sys.modules["spaday_package_fixture"]
    module.invalid = object()

    with pytest.raises(ValueError, match="expected 'module:attribute'"):
        resolve_component_packages(":package")
    with pytest.raises(ValueError, match="Python path 'missing_module:package'"):
        resolve_component_packages("missing_module:package")
    with pytest.raises(ValueError, match="Python path 'spaday_package_fixture:missing' does not exist"):
        resolve_component_packages("spaday_package_fixture:missing")
    with pytest.raises(TypeError, match="must expose a ComponentPackage"):
        resolve_component_packages("spaday_package_fixture:invalid")

    duplicates = [EntryPoint("duplicate", python_path_package), EntryPoint("duplicate", python_path_package)]
    monkeypatch.setattr(package_registry, "entry_points", lambda **_kwargs: duplicates)
    with pytest.raises(ValueError, match="multiple .* entry points"):
        resolve_component_packages("duplicate")


def test_retag_points_a_components_authoring_surface_at_another_element():
    """An app shipping its own element implementing the same contract keeps the Python surface."""

    class TheirGrid(Component):
        tag = "their-grid"
        schema = ComponentSchema(tag="their-grid", class_name="TheirGrid", props=(PropertySchema(name="rows", kind="json"),))

    Mine = TheirGrid.retag("my-grid")
    assert Mine.tag == "my-grid"
    assert Mine.schema.tag == "my-grid"  # ComponentPackage requires the two to agree
    assert Mine(rows=[1]).to_node()["tag"] == "my-grid"
    assert TheirGrid.tag == "their-grid"  # the original is untouched


def test_a_retagged_component_goes_into_a_package_descriptor():
    """The point of retag: substitute your own element behind a peer's authoring surface."""

    class TheirGrid(Component):
        tag = "their-grid"
        schema = ComponentSchema(tag="their-grid", class_name="TheirGrid")

    package = ComponentPackage(name="mine", assets_dir=".", assets=(("js", "mine.js"),), components=(TheirGrid.retag("my-grid"),))
    assert [component.tag for component in package.components] == ["my-grid"]
    assert package.catalog[0].tag == "my-grid"


def test_retag_requires_a_tag():
    class Anon(Component):
        tag = "anon"

    with pytest.raises(ValueError, match="retag requires a tag"):
        Anon.retag("")


def _vendored(name: str, imports: tuple[tuple[str, str], ...]) -> ComponentPackage:
    return ComponentPackage(name=name, assets_dir=".", assets=(("js", "cdn/index.js"),), imports=imports)


def test_a_package_publishes_its_vendored_modules_as_an_import_map():
    html = bootstrap(packages=[_vendored("perspective", (("@perspective-dev/client", "vendor/client.js"),))], fragment=True)
    assert '"@perspective-dev/client": "/components/perspective/vendor/client.js"' in html
    assert '<script type="importmap">' in html


def test_the_import_map_precedes_every_module_script():
    """A map that arrives after the first module load is ignored by the browser, silently."""
    html = bootstrap(packages=[_vendored("perspective", (("@perspective-dev/client", "vendor/client.js"),))], fragment=True)
    assert html.index('type="importmap"') < html.index('type="module"')


def test_the_import_map_is_nonce_stamped():
    html = bootstrap(packages=[_vendored("perspective", (("x", "vendor/x.js"),))], fragment=True, nonce="abc123")
    assert '<script type="importmap" nonce="abc123">' in html


def test_a_trailing_slash_specifier_maps_a_subtree():
    html = bootstrap(packages=[_vendored("perspective", (("@perspective-dev/", "vendor/"),))], fragment=True)
    assert '"@perspective-dev/": "/components/perspective/vendor/"' in html


def test_two_packages_publishing_one_specifier_differently_is_an_error():
    """Picking one silently is the ambiguity `imports` exists to remove."""
    packages = [_vendored("one", (("regular-table", "vendor/rt.js"),)), _vendored("two", (("regular-table", "vendor/rt.js"),))]
    with pytest.raises(ValueError, match="both publish the import 'regular-table'"):
        bootstrap(packages=packages, fragment=True)


def test_the_same_specifier_at_the_same_url_is_not_a_conflict():
    package = _vendored("perspective", (("@perspective-dev/client", "vendor/client.js"),))
    html = bootstrap(packages=[package], fragment=True)
    assert html.count('"@perspective-dev/client"') == 1


def test_no_import_map_is_emitted_when_no_package_publishes_one():
    assert "importmap" not in bootstrap(packages=[_vendored("plain", ())], fragment=True)


def test_import_paths_are_validated_like_asset_paths():
    for bad in (("@x", "/absolute.js"), ("@x", "../escape.js"), ("bad specifier", "x.js")):
        with pytest.raises(ValueError):
            _vendored("p", (bad,))


def test_a_subtree_specifier_must_map_to_a_subtree():
    with pytest.raises(ValueError, match="both end in '/'"):
        _vendored("p", (("@scope/", "vendor/file.js"),))
    with pytest.raises(ValueError, match="both end in '/'"):
        _vendored("p", (("@scope/thing", "vendor/"),))
