"""Component-package descriptors and installed entry-point discovery."""

from __future__ import annotations

import re
from dataclasses import dataclass
from importlib import import_module
from importlib.metadata import entry_points
from pathlib import Path, PurePosixPath
from typing import Sequence, Union

ENTRY_POINT_GROUP = "spaday.component_packages"
_PACKAGE_NAME = re.compile(r"[a-z0-9][a-z0-9._-]*\Z")


@dataclass(frozen=True)
class ComponentPackage:
    """Assets that register one external component library in the browser.

    ``assets`` contains ``("css" | "js", relative_path)`` pairs under
    ``assets_dir``. Backends serve that directory at
    ``{prefix}/components/{name}``; :func:`spaday.bootstrap.bootstrap` emits
    the matching tags.
    """

    name: str
    assets_dir: Path
    assets: Sequence[tuple[str, str]]

    def __post_init__(self) -> None:
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


PackageRef = Union[ComponentPackage, str]


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
    value = getattr(import_module(module_name), attribute)
    return _require_package(value, f"component package Python path {spec!r}")


def _installed_entry_points():
    return tuple(entry_points(group=ENTRY_POINT_GROUP))


def _from_entry_point(name: str) -> ComponentPackage:
    matches = [candidate for candidate in _installed_entry_points() if candidate.name == name]
    if not matches:
        raise ValueError(f"unknown component package {name!r}; no {ENTRY_POINT_GROUP!r} entry point is installed")
    if len(matches) > 1:
        raise ValueError(f"multiple {ENTRY_POINT_GROUP!r} entry points are named {name!r}")
    return _require_package(matches[0].load(), f"component package entry point {name!r}")


def resolve_component_packages(packages: Union[PackageRef, Sequence[PackageRef]] = ()) -> tuple[ComponentPackage, ...]:
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
    return resolved


def discover_component_packages() -> tuple[ComponentPackage, ...]:
    """Load every installed component-package entry point, sorted by entry-point name."""
    return tuple(
        _require_package(candidate.load(), f"component package entry point {candidate.name!r}")
        for candidate in sorted(_installed_entry_points(), key=lambda candidate: candidate.name)
    )
