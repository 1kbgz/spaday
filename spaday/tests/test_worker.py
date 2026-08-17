import json

import pytest

from spaday import SendPatch, WorkerApp, element, lit


def test_worker_app_snapshots_then_patches_after_an_intent() -> None:
    state = {"count": 0}

    def render():
        return element("button").text(str(state["count"])).on("click", SendPatch("counter", "increment", lit(1)))

    def handle(intent: dict) -> None:
        state["count"] += intent["detail"]["value"]

    app = WorkerApp(render, handle)
    snapshot = app.start()
    message = app.dispatch({"type": "spaday:patch", "detail": {"model": "counter", "field": "increment", "value": 1}})

    assert snapshot["type"] == "snapshot"
    assert snapshot["tree"]["props"]["textContent"] == {"Str": "0"}
    assert message == {
        "type": "patch",
        "patch": {"ops": [{"SetProp": {"path": [], "name": "textContent", "value": {"Str": "1"}}}]},
    }


def test_worker_app_json_boundary() -> None:
    state = {"label": "before"}
    app = WorkerApp(lambda: element("p").text(state["label"]), lambda _intent: state.update(label="after"))

    assert json.loads(app.start_json())["tree"]["props"]["textContent"] == {"Str": "before"}
    result = json.loads(app.dispatch_json('{"type":"spaday:patch","detail":{}}'))
    assert result["patch"]["ops"][0]["SetProp"]["value"] == {"Str": "after"}


def test_worker_app_rejects_invalid_order_and_intents() -> None:
    app = WorkerApp(lambda: element("p"), lambda _intent: None)

    with pytest.raises(RuntimeError, match=r"start\(\)"):
        app.dispatch({"type": "spaday:patch"})

    app.start()
    with pytest.raises(ValueError, match="unsupported worker intent"):
        app.dispatch({"type": "other"})
