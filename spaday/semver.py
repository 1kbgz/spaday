"""npm-style semantic versions and version ranges, for reconciling the JS libraries component packages
serve (:attr:`~spaday.packages.ComponentPackage.provides`) with the ones they were built against
(:attr:`~spaday.packages.ComponentPackage.requires`).

Ranges follow node-semver, the syntax a ``package.json`` uses: exact versions, comparators
(``>=1.2.3 <2``), ``^`` and ``~``, x-ranges (``1.x``, ``1.2.*``, ``*``), hyphen ranges
(``1.2.3 - 2.3``) and ``||``. A prerelease version satisfies a range only through a comparator that
names a prerelease of the same ``major.minor.patch``, as in npm.
"""

from __future__ import annotations

import re
from functools import total_ordering

__all__ = ["Version", "parse_range", "parse_version", "satisfies"]

_NUMBER = r"0|[1-9]\d*"
_IDENTIFIER = r"(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)"
_VERSION = re.compile(rf"({_NUMBER})\.({_NUMBER})\.({_NUMBER})(?:-({_IDENTIFIER}(?:\.{_IDENTIFIER})*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?\Z")
_WILD = r"x|X|\*"
_PARTIAL = re.compile(
    rf"(?P<major>{_NUMBER}|{_WILD})(?:\.(?P<minor>{_NUMBER}|{_WILD})(?:\.(?P<patch>{_NUMBER}|{_WILD})"
    rf"(?:-(?P<pre>{_IDENTIFIER}(?:\.{_IDENTIFIER})*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?)?)?\Z"
)
_SIMPLE = re.compile(r"(?P<op>\^|~|>=|<=|>|<|=)?\s*(?P<partial>\S+)\Z")


@total_ordering
class Version:
    """A semantic version, ordered by semver precedence (build metadata is ignored)."""

    __slots__ = ("major", "minor", "patch", "prerelease")

    def __init__(self, major: int, minor: int, patch: int, prerelease: tuple[int | str, ...] = ()) -> None:
        self.major, self.minor, self.patch, self.prerelease = major, minor, patch, prerelease

    @property
    def release(self) -> tuple[int, int, int]:
        return (self.major, self.minor, self.patch)

    def _key(self) -> tuple:
        # a release sorts after its prereleases; numeric identifiers sort before alphanumeric ones
        pre = tuple((0, part, "") if isinstance(part, int) else (1, 0, part) for part in self.prerelease)
        return (self.release, not self.prerelease, pre)

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Version) and self._key() == other._key()

    def __lt__(self, other: Version) -> bool:
        return self._key() < other._key()

    def __str__(self) -> str:
        pre = "-" + ".".join(str(part) for part in self.prerelease) if self.prerelease else ""
        return f"{self.major}.{self.minor}.{self.patch}{pre}"

    def __repr__(self) -> str:
        return f"Version({str(self)!r})"


def _prerelease(text: str | None) -> tuple[int | str, ...]:
    return tuple(int(part) if part.isdigit() else part for part in text.split(".")) if text else ()


def parse_version(text: str) -> Version:
    """Parse an exact version such as ``3.1.0`` or ``1.0.0-alpha.24``; anything else is a ``ValueError``."""
    match = _VERSION.match(text.strip())
    if match is None:
        raise ValueError(f"{text!r} is not a semantic version like '3.1.0'")
    major, minor, patch, pre = match.groups()
    return Version(int(major), int(minor), int(patch), _prerelease(pre))


# a comparator: (operator, version), the operator one of "<", "<=", ">", ">=", "="
Comparator = tuple[str, Version]


def _floor(major: int, minor: int = 0, patch: int = 0) -> Version:
    """The lowest version of a release line, prereleases included (``2.0.0-0``)."""
    return Version(major, minor, patch, (0,))


def _partial(text: str) -> tuple[int | None, int | None, int | None, tuple[int | str, ...]]:
    match = _PARTIAL.match(text)
    if match is None:
        raise ValueError(f"{text!r} is not a version or partial version")

    def number(key: str) -> int | None:
        value = match.group(key)
        return None if value is None or value in ("x", "X", "*") else int(value)

    major, minor, patch = number("major"), number("minor"), number("patch")
    # a wildcard swallows everything after it: 1.x.3 means 1.x
    if major is None:
        minor = patch = None
    elif minor is None:
        patch = None
    return major, minor, patch, _prerelease(match.group("pre")) if patch is not None else ()


def _simple(token: str) -> list[Comparator]:
    """Desugar one range token (``^1.2``, ``>=1.2.3``, ``1.x``) into comparators."""
    match = _SIMPLE.match(token)  # any token matches; its partial version is checked below
    op, (major, minor, patch, pre) = match.group("op") or "", _partial(match.group("partial"))
    if major is None:
        # "*", "x", ">=*": any version; "<*" and ">*" match nothing
        return [("<", _floor(0))] if op in ("<", ">") else []
    if op == "^":
        if minor is None:
            return [(">=", Version(major, 0, 0)), ("<", _floor(major + 1))]
        low = Version(major, minor, patch or 0, pre)
        if major > 0:
            return [(">=", low), ("<", _floor(major + 1))]
        if patch is None or minor > 0:
            return [(">=", low), ("<", _floor(0, minor + 1))]
        return [(">=", low), ("<", _floor(0, 0, patch + 1))]
    if op == "~":
        if minor is None:
            return [(">=", Version(major, 0, 0)), ("<", _floor(major + 1))]
        return [(">=", Version(major, minor, patch or 0, pre)), ("<", _floor(major, minor + 1))]
    if patch is not None:
        return [(op or "=", Version(major, minor, patch, pre))]
    # a partial version: the whole release line it names
    low = Version(major, minor or 0, 0)
    high = _floor(major + 1) if minor is None else _floor(major, minor + 1)
    if op in ("", "="):
        return [(">=", low), ("<", high)]
    if op == ">":
        return [(">=", Version(*high.release))]
    if op == ">=":
        return [(">=", low)]
    if op == "<":
        return [("<", _floor(*low.release))]
    return [("<", high)]  # "<="


def _hyphen(low: str, high: str) -> list[Comparator]:
    lmajor, lminor, lpatch, lpre = _partial(low)
    hmajor, hminor, hpatch, hpre = _partial(high)
    comparators = [] if lmajor is None else [(">=", Version(lmajor, lminor or 0, lpatch or 0, lpre))]
    if hmajor is None:
        return comparators
    if hminor is None:
        return [*comparators, ("<", _floor(hmajor + 1))]
    if hpatch is None:
        return [*comparators, ("<", _floor(hmajor, hminor + 1))]
    return [*comparators, ("<=", Version(hmajor, hminor, hpatch, hpre))]


def parse_range(text: str) -> list[list[Comparator]]:
    """Parse an npm version range into alternatives (``||``), each a list of comparators that must all
    hold. An unparseable range is a ``ValueError``."""
    alternatives = []
    for part in text.split("||"):
        part = re.sub(r"(\^|~|>=|<=|>|<|=)\s+", r"\1", part.strip())  # ">= 1.2" means ">=1.2"
        hyphen = re.fullmatch(r"(\S+)\s+-\s+(\S+)", part)
        if hyphen:
            alternatives.append(_hyphen(*hyphen.groups()))
        else:
            alternatives.append([comparator for token in part.split() for comparator in _simple(token)])
    return alternatives


def _holds(version: Version, comparator: Comparator) -> bool:
    op, bound = comparator
    return {
        "<": version < bound,
        "<=": version <= bound,
        ">": version > bound,
        ">=": version >= bound,
        "=": version == bound,
    }[op]


def satisfies(version: str | Version, range_: str) -> bool:
    """Whether ``version`` falls within the npm range ``range_``."""
    version = parse_version(version) if isinstance(version, str) else version
    for comparators in parse_range(range_):
        if not all(_holds(version, comparator) for comparator in comparators):
            continue
        if version.prerelease and not any(bound.prerelease and bound.release == version.release for _, bound in comparators):
            continue  # a prerelease only matches a range that names one of its own release
        return True
    return False
