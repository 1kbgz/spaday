import sys
from types import ModuleType

import pytest

import spaday.packages as package_registry
from spaday.bootstrap import bootstrap
from spaday.packages import ComponentPackage, discover_component_packages, resolve_component_packages


class EntryPoint:
    def __init__(self, name, package):
        self.name = name
        self.package = package

    def load(self):
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
    monkeypatch.setattr(package_registry, "entry_points", lambda **_kwargs: ())
    with pytest.raises(ValueError, match="spaday.component_packages"):
        resolve_component_packages("missing")
