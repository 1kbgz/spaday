import pytest

import spaday
from spaday import (
    CallEndpoint,
    Emit,
    If,
    Sequence,
    SetProp,
    Toggle,
    ValidationError,
    by_id,
    concat,
    element,
    prop,
    this,
    validate,
)


def test_resolved_by_id_passes():
    tree = element("div").child(element("button").on("click", Toggle(by_id("panel"), "hidden"))).child(element("p").prop("id", "panel").text("hi"))
    validate(tree)  # no raise


def test_unresolved_by_id_raises_with_details():
    tree = element("button").on("click", Toggle(by_id("missing"), "hidden"))
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    assert "'missing'" in str(exc.value)


def test_this_target_needs_no_resolution():
    validate(element("button").on("click", Toggle(this(), "hidden")))


def test_refs_inside_sequence_if_and_expr_are_all_checked():
    tree = element("button").on(
        "click",
        Sequence(
            SetProp(by_id("a"), "hidden", False),
            If(prop(by_id("b"), "checked"), Emit("x"), SetProp(by_id("c"), "hidden", True)),
        ),
    )
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    msg = str(exc.value)
    assert "'a'" in msg and "'b'" in msg and "'c'" in msg  # nested action + expr refs all caught


def test_refs_inside_computed_endpoint_urls_are_checked():
    tree = element("button").on("click", CallEndpoint("POST", concat("/send/", prop(by_id("key"), "value"))))
    with pytest.raises(ValidationError, match="'key'"):
        validate(tree)


def test_only_unresolved_refs_are_reported():
    tree = (
        element("div")
        .child(element("button").on("click", Sequence(Toggle(by_id("ok"), "hidden"), Toggle(by_id("bad"), "hidden"))))
        .child(element("span").prop("id", "ok"))
    )
    with pytest.raises(ValidationError) as exc:
        validate(tree)
    unresolved = str(exc.value).split("known ids")[0]
    assert "'bad'" in unresolved and "'ok'" not in unresolved


def test_validate_accepts_a_serialized_node_dict():
    node = element("button").on("click", Toggle(by_id("x"), "hidden")).to_node()
    with pytest.raises(ValidationError):
        validate(node)


def test_exported_from_package():
    assert spaday.validate is validate
    assert issubclass(spaday.ValidationError, ValueError)
