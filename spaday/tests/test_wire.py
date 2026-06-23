import json

import pytest

import spaday

TREE = json.dumps({"tag": "wa-switch", "props": {"checked": {"Bool": True}}})


def test_json_frame_round_trips():
    frame = spaday.encode_frame(TREE, "wa-switch", "snapshot", 0, "application/json")
    assert isinstance(frame, bytes)
    decoded = json.loads(spaday.decode_frame(frame))
    assert decoded["kind"] == "snapshot"
    assert decoded["model_type"] == "wa-switch"
    assert decoded["payload"] == json.loads(TREE)


def test_msgpack_frame_is_smaller_and_equivalent():
    js = spaday.encode_frame(TREE, "t", "snapshot", 1, "application/json")
    mp = spaday.encode_frame(TREE, "t", "snapshot", 1, "application/msgpack")
    assert len(mp) < len(js)
    assert json.loads(spaday.decode_frame(mp))["payload"] == json.loads(spaday.decode_frame(js))["payload"]


def test_patch_kind_and_rev_are_carried():
    patch = json.dumps({"ops": []})
    frame = spaday.encode_frame(patch, "p", "patch", 7, "application/msgpack")
    decoded = json.loads(spaday.decode_frame(frame))
    assert decoded["kind"] == "patch"
    assert decoded["rev"] == 7


def test_unknown_codec_raises():
    with pytest.raises(ValueError):
        spaday.encode_frame(TREE, "t", "snapshot", 0, "application/protobuf")
