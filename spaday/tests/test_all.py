import json

from spaday import apply, diff


# The wire form of a prop value is the externally-tagged `Value` enum, e.g. {"Bool": true},
# {"Int": 3}, {"Str": "x"}. The ergonomic typed component classes will hide this; for
# now the tests speak the raw wire contract directly.
def _switch(checked: bool) -> str:
    return json.dumps({"tag": "wa-switch", "props": {"checked": {"Bool": checked}}})


def test_exports():
    assert callable(diff)
    assert callable(apply)


def test_diff_apply_round_trip():
    old, new = _switch(False), _switch(True)
    patch = diff(old, new)
    got = apply(old, patch)
    assert json.loads(got) == json.loads(new)


def test_identical_trees_produce_empty_patch():
    tree = json.dumps({"tag": "wa-card"})
    assert json.loads(diff(tree, tree)) == {"ops": []}


def test_keyed_children_reorder():
    item = lambda k: {"tag": "wa-card", "key": k}  # noqa: E731
    old = json.dumps({"tag": "spa-list", "slots": {"default": [item("a"), item("b"), item("c")]}})
    new = json.dumps({"tag": "spa-list", "slots": {"default": [item("c"), item("a"), item("b")]}})
    patch = diff(old, new)
    assert json.loads(apply(old, patch)) == json.loads(new)


def test_malformed_input_raises():
    import pytest

    with pytest.raises(ValueError):
        diff("{not json", "{}")
