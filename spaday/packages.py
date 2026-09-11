"""Component-package descriptors and installed entry-point discovery."""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from importlib import import_module
from importlib.metadata import entry_points
from pathlib import Path, PurePosixPath

from .catalog import ComponentSchema
from .component import Component
from .semver import parse_range, parse_version, satisfies
from .ui.design import Design

ENTRY_POINT_GROUP = "spaday.component_packages"
_PACKAGE_NAME = re.compile(r"[a-z0-9][a-z0-9._-]*\Z")
_NPM_NAME = re.compile(r"(?:@[a-z0-9][a-z0-9._~-]*/)?[a-z0-9][a-z0-9._~-]*\Z")


@dataclass(frozen=True)
class ComponentPackage:
    """Assets and catalog metadata for one external component library.

    ``assets`` contains ``("css" | "js", relative_path)`` pairs under
    ``assets_dir``. Backends serve that directory at
    ``{prefix}/components/{name}``; :func:`spaday.bootstrap.bootstrap` emits
    the matching tags. ``components`` contains the package's public
    :class:`~spaday.component.Component` subclasses. Generated CEM classes
    already carry schemas; hand-authored classes set ``Component.schema``.
    ``catalog`` returns those schemas without constructing components.

    ``imports`` publishes vendored modules under their bare specifiers as
    ``(specifier, relative_path)`` pairs, which :func:`~spaday.bootstrap.bootstrap`
    emits as an import map. It exists for engines that register global custom
    element names -- Perspective, a design system -- where a second copy on the
    page throws from ``customElements.define`` and the two cannot coexist. A
    package that publishes its copy this way lets every other library on the page
    resolve the same bare specifier to it, so there is one copy rather than a
    collision. A specifier ending in ``/`` maps a whole subtree, per the import-map
    spec. Two packages publishing the same specifier at different paths is an
    error: it is the ambiguity the feature exists to remove.

    ``provides`` records the JS libraries the package puts on the page, by npm
    name, with the exact version it serves (``{"@awesome.me/webawesome": "3.1.0"}``);
    a package's build writes them, so the Python side knows what the browser gets.
    ``design`` publishes the package's :class:`~spaday.ui.design.Design` — how it renders the
    generic controls of :mod:`spaday.ui` — which a page selecting the package renders with.

    ``requires`` records libraries the package's own bundle imports without
    shipping, with the npm version range it was built against
    (``{"@awesome.me/webawesome": "^3.1.0"}``). :func:`resolve_component_packages`
    reconciles them across the packages selected for a page: a page holds one copy
    of a library, so two packages serving it at different versions, or a
    requirement no selected package satisfies, is an error naming the packages and
    versions, where the second copy would otherwise half-work. Packages serving the
    same version of a library may both publish it; the page imports the first.
    """

    name: str
    assets_dir: Path
    assets: Sequence[tuple[str, str]]
    components: Sequence[type[Component]] = ()
    imports: Sequence[tuple[str, str]] = ()
    provides: Mapping[str, str] | Sequence[tuple[str, str]] = ()
    requires: Mapping[str, str] | Sequence[tuple[str, str]] = ()
    design: Design | None = None

    def __post_init__(self) -> None:
        if self.design is not None and not isinstance(self.design, Design):
            raise TypeError(f"component package design must be a spaday.ui.Design, got {type(self.design).__name__}")
        if not _PACKAGE_NAME.fullmatch(self.name):
            raise ValueError("component package name must contain only lowercase letters, digits, '.', '_', or '-'")
        normalized = []
        for kind, path in self.assets:
            if kind not in ("css", "js"):
                raise ValueError("component package asset kind must be 'css' or 'js'")
            asset_path = PurePosixPath(path)
            if asset_path.is_absolute() or not path or ".." in asset_path.parts:
                raise ValueError("component package asset paths must be relative and cannot contain '..'")
            normalized.append((kind, asset_path.as_posix()))
        object.__setattr__(self, "assets_dir", Path(self.assets_dir))
        object.__setattr__(self, "assets", tuple(normalized))
        imports = []
        for specifier, path in self.imports:
            if not specifier or specifier.strip() != specifier or any(c.isspace() for c in specifier):
                raise ValueError(f"component package import specifier {specifier!r} must be a bare specifier with no whitespace")
            import_path = PurePosixPath(path)
            if import_path.is_absolute() or not path or ".." in import_path.parts:
                raise ValueError("component package import paths must be relative and cannot contain '..'")
            # a specifier mapping a subtree must map to one, per the import-map spec
            if specifier.endswith("/") != path.endswith("/"):
                raise ValueError(f"component package import {specifier!r} and its path must either both end in '/' or neither")
            imports.append((specifier, import_path.as_posix() + ("/" if path.endswith("/") else "")))
        object.__setattr__(self, "imports", tuple(imports))
        object.__setattr__(self, "provides", _libraries(self.provides, "provides", parse_version))
        object.__setattr__(self, "requires", _libraries(self.requires, "requires", parse_range))
        components = tuple(self.components)
        seen: set[str] = set()
        for component in components:
            if not isinstance(component, type) or not issubclass(component, Component):
                raise TypeError("component package components must be Component subclasses")
            if component.schema is None:
                raise ValueError(f"component {component.__name__!r} does not define catalog schema")
            if component.schema.tag != component.tag:
                raise ValueError(f"component {component.__name__!r} schema tag does not match {component.tag!r}")
            if component.tag in seen:
                raise ValueError(f"component package contains duplicate tag {component.tag!r}")
            seen.add(component.tag)
        object.__setattr__(self, "components", components)

    @property
    def catalog(self) -> tuple[ComponentSchema, ...]:
        """Schemas for the package's public component classes."""
        return tuple(
            component.schema.model_copy(update={"class_name": component.__name__}) for component in self.components if component.schema is not None
        )


def _libraries(value: Mapping[str, str] | Sequence[tuple[str, str]], field: str, parse) -> tuple[tuple[str, str], ...]:
    """Normalize ``provides`` / ``requires`` to sorted ``(npm name, version or range)`` pairs, rejecting
    a name npm would not accept, a version or range that does not parse, and a library named twice."""
    pairs = tuple(value.items() if isinstance(value, Mapping) else value)
    for name, spec in pairs:
        if not isinstance(name, str) or not _NPM_NAME.fullmatch(name):
            raise ValueError(f"component package {field} names {name!r}, which is not an npm package name")
        if not isinstance(spec, str):
            raise ValueError(f"component package {field} gives {name!r} a {type(spec).__name__}, not a version string")
        try:
            parse(spec)
        except ValueError as error:
            raise ValueError(f"component package {field} gives {name!r} {spec!r}: {error}") from None
    names = [name for name, _ in pairs]
    duplicate = next((name for name in names if names.count(name) > 1), None)
    if duplicate is not None:
        raise ValueError(f"component package {field} names {duplicate!r} more than once")
    return tuple(sorted(pairs))


def npm_package(specifier: str) -> str:
    """The npm package a bare import specifier belongs to: ``@scope/name/dist/x.js`` → ``@scope/name``."""
    parts = specifier.split("/")
    return "/".join(parts[:2] if specifier.startswith("@") else parts[:1])


def _reconcile(packages: Sequence[ComponentPackage]) -> None:
    """Reject a page whose packages disagree about a JS library: served at two versions, or required at
    a version no selected package serves."""
    served: dict[str, tuple[str, str]] = {}
    for package in packages:
        for library, version in package.provides:
            if library in served and served[library][0] != version:
                other, owner = served[library]
                raise ValueError(
                    f"component packages {owner!r} and {package.name!r} serve different versions of {library} "
                    f"({other} and {version}); a page can hold only one copy, so select one of them or align their versions"
                )
            served.setdefault(library, (version, package.name))
    for package in packages:
        for library, range_ in package.requires:
            if library not in served:
                raise ValueError(
                    f"component package {package.name!r} requires {library} {range_}, which no selected package serves; "
                    "select the package that provides it"
                )
            version, owner = served[library]
            if not satisfies(version, range_):
                raise ValueError(f"component package {package.name!r} requires {library} {range_}, but {owner!r} serves {version}")


PackageRef = ComponentPackage | str


def package_url_prefix(package: ComponentPackage, base: str = "") -> str:
    """URL prefix where a backend serves ``package.assets_dir``."""
    return f"{base}/components/{package.name}"


def _require_package(value: object, source: str) -> ComponentPackage:
    if not isinstance(value, ComponentPackage):
        raise TypeError(f"{source} must expose a ComponentPackage, got {type(value).__name__}")
    return value


def _from_python_path(spec: str) -> ComponentPackage:
    module_name, separator, attribute = spec.partition(":")
    if not separator or not module_name or not attribute:
        raise ValueError(f"invalid component package Python path {spec!r}; expected 'module:attribute'")
    try:
        module = import_module(module_name)
    except ImportError as error:
        raise ValueError(f"could not import component package Python path {spec!r}: {error}") from error
    try:
        value = getattr(module, attribute)
    except AttributeError as error:
        raise ValueError(f"component package Python path {spec!r} does not exist") from error
    return _require_package(value, f"component package Python path {spec!r}")


def _installed_entry_points():
    return tuple(entry_points(group=ENTRY_POINT_GROUP))


def _from_entry_point(name: str) -> ComponentPackage:
    candidates = _installed_entry_points()
    matches = [candidate for candidate in candidates if candidate.name == name]
    if not matches:
        available = sorted({candidate.name for candidate in candidates})
        choices = f"; available packages: {', '.join(available)}" if available else "; no component packages are installed"
        raise ValueError(f"unknown component package {name!r}{choices}")
    if len(matches) > 1:
        raise ValueError(f"multiple {ENTRY_POINT_GROUP!r} entry points are named {name!r}")
    return _require_package(matches[0].load(), f"component package entry point {name!r}")


def resolve_component_packages(packages: PackageRef | Sequence[PackageRef] = ()) -> tuple[ComponentPackage, ...]:
    """Resolve descriptors, ``module:attribute`` paths, or installed entry-point names.

    Entry points are loaded only when explicitly named; installing an integration
    never injects assets into unrelated applications.
    """
    refs = (packages,) if isinstance(packages, (str, ComponentPackage)) else packages
    resolved = tuple(
        package if isinstance(package, ComponentPackage) else (_from_python_path(package) if ":" in package else _from_entry_point(package))
        for package in refs
    )
    names = [package.name for package in resolved]
    duplicate = next((name for name in names if names.count(name) > 1), None)
    if duplicate is not None:
        raise ValueError(f"component package {duplicate!r} was selected more than once")
    _reconcile(resolved)
    return resolved


def discover_component_packages() -> tuple[ComponentPackage, ...]:
    """Load every installed component-package entry point, sorted by entry-point name."""
    return tuple(
        _require_package(candidate.load(), f"component package entry point {candidate.name!r}")
        for candidate in sorted(_installed_entry_points(), key=lambda candidate: candidate.name)
    )


def discover_component_package_names() -> tuple[str, ...]:
    """Return installed component-package entry-point names without loading them."""
    return tuple(sorted({candidate.name for candidate in _installed_entry_points()}))
