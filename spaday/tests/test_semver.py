import pytest

from spaday.semver import parse_range, parse_version, satisfies


@pytest.mark.parametrize(
    ("version", "range_"),
    [
        ("1.2.3", "1.2.3"),
        ("1.2.3", "=1.2.3"),
        ("1.9.0", "^1.2.3"),
        ("0.2.9", "^0.2.3"),
        ("0.0.3", "^0.0.3"),
        ("1.2.9", "~1.2.3"),
        ("1.9.9", "~1"),
        ("25.2.10", "~25.2"),
        ("1.5.0", "1.x"),
        ("1.2.7", "1.2.*"),
        ("5.0.0", "*"),
        ("5.0.0", ""),
        ("1.5.0", ">=1.2.3 <2"),
        ("3.1.0", ">= 3.0"),
        ("1.3.0", ">1.2"),
        ("1.2.9", "<=1.2"),
        ("1.1.9", "<1.2"),
        ("3.1.0", "<1.2 || >=3"),
        ("2.3.4", "1.2.3 - 2.3.4"),
        ("2.3.9", "1.2.3 - 2.3"),
        ("1.0.0-alpha.24", "^1.0.0-alpha.20"),
        ("1.2.3-beta", "1.2.3-beta"),
        ("1.0.0", "^1.0.0-alpha"),
        ("1.9.0", "^1"),
        ("2.9.9", "1.2.3 - 2"),
        ("9.0.0", "1.2.3 - x"),
        ("0.5.0", "* - 1.0.0"),
    ],
)
def test_versions_inside_a_range(version, range_):
    assert satisfies(version, range_)


@pytest.mark.parametrize(
    ("version", "range_"),
    [
        ("1.2.4", "1.2.3"),
        ("2.0.0", "^1.2.3"),
        ("1.2.2", "^1.2.3"),
        ("0.3.0", "^0.2.3"),
        ("0.0.4", "^0.0.3"),
        ("1.3.0", "~1.2.3"),
        ("25.3.0", "~25.2"),
        ("2.0.0", "1.x"),
        ("1.3.0", "1.2"),
        ("2.0.0", ">=1.2.3 <2"),
        ("1.2.9", ">1.2"),
        ("1.3.0", "<=1.2"),
        ("2.0.0", "<1.2 || >=3"),
        ("2.3.5", "1.2.3 - 2.3.4"),
        ("2.4.0", "1.2.3 - 2.3"),
        ("1.0.0-alpha.10", "^1.0.0-alpha.20"),
        ("2.0.0", "^1"),
        ("3.0.0", "1.2.3 - 2"),
        ("1.2.2", "1.2.3 - x"),
        ("1.0.0", "<*"),
    ],
)
def test_versions_outside_a_range(version, range_):
    assert not satisfies(version, range_)


def test_a_prerelease_only_matches_a_range_naming_its_own_release():
    """npm's rule: ^1.2.3 does not admit 1.5.0-beta, and >1.2 does not admit 1.3.0-beta."""
    assert not satisfies("1.5.0-beta", "^1.2.3")
    assert not satisfies("1.3.0-beta", ">1.2")
    assert not satisfies("3.0.0-beta.1", ">=2")
    assert not satisfies("1.0.0-rc.1", "<1.0.0")
    assert satisfies("1.5.0-beta", ">=1.5.0-alpha")


def test_versions_order_by_semver_precedence():
    ordered = ["1.0.0-alpha", "1.0.0-alpha.1", "1.0.0-alpha.beta", "1.0.0-beta", "1.0.0-beta.2", "1.0.0-beta.11", "1.0.0-rc.1", "1.0.0"]
    assert [str(v) for v in sorted(parse_version(v) for v in reversed(ordered))] == ordered
    assert parse_version("1.0.0+build.5") == parse_version("1.0.0")
    assert repr(parse_version("1.0.0-rc.1")) == "Version('1.0.0-rc.1')"


@pytest.mark.parametrize("text", ["1.2", "v1.2.3", "01.2.3", "1.2.3-", "x", ""])
def test_an_exact_version_must_be_complete(text):
    with pytest.raises(ValueError, match="not a semantic version"):
        parse_version(text)


@pytest.mark.parametrize("text", ["^^1", "1.2.3.4", ">=abc"])
def test_an_unparseable_range_is_an_error(text):
    with pytest.raises(ValueError):
        parse_range(text)
