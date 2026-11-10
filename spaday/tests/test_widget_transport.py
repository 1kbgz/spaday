import asyncio
import json
from unittest.mock import Mock

import pytest
from pydantic import BaseModel, Field

pytest.importorskip("anywidget")

import transports
from transports._buffers import join_buffers

from spaday import Wire, element
from spaday.bootstrap import bootstrap
from spaday.widget import Widget
from spaday.widget_transport import _SYNC


class Config(BaseModel):
    bpm: int = Field(120, ge=1)
    sample: bytes = b"pcm"


class Status(BaseModel):
    playing: bool = Field(False, json_schema_extra={"owner": "client"})


def setup_widget(**kwargs):
    session = transports.Session()
    config, status = Config(), Status()
    config_id, status_id = session.host(config), session.host(status)
    session.command(status_id, "playing", True)
    widget = Widget(
        element("div"), session=session, wires=[Wire(model=config_id, namespace="config"), Wire(model=status_id, namespace="status")], **kwargs
    )
    sent = []
    widget.send = Mock(side_effect=lambda content, buffers=(): sent.append((content, buffers)))
    return widget, config, status, sent


def receive(widget, content, buffers=()):
    widget._msg_callbacks(widget, content, buffers)


def messages(sent, view):
    return [
        json.loads(join_buffers(content["wire"], buffers, "json")) for content, buffers in sent if content.get("view") == view and "wire" in content
    ]


def test_session_sends_binary_buffers_and_queued_commands_to_distinct_views():
    widget, config, status, sent = setup_widget(autosync=False)
    try:
        assert not sent
        for view in ("owner", "observer"):
            receive(widget, {"ready": True, "ownership": True, "view": view})
        assert any(buffers for _, buffers in sent)
        assert [m["t"] for m in messages(sent, "owner")].count("command") == 1
        assert not any(m["t"] == "command" for m in messages(sent, "observer"))
        config.sample = b"changed"
        transports.sync(widget.server)
        assert bytes(next(buffers[0] for _, buffers in reversed(sent) if buffers)) == b"changed"
        receive(widget, {"closed": True, "view": "owner"})
        assert any(m["t"] == "command" for m in messages(sent, "observer"))
        assert status.playing is False  # commands are applied by the owning frontend
    finally:
        widget.close()
    assert not widget.server._codecs


def test_widget_close_releases_ownership_to_another_widget():
    widget, _, _, sent = setup_widget(autosync=False)
    other = Widget(element("div"), session=widget.server, autosync=False)
    other_sent = []
    other.send = Mock(side_effect=lambda content, buffers=(): other_sent.append((content, buffers)))
    try:
        receive(widget, {"ready": True, "ownership": True, "view": "owner"})
        receive(other, {"ready": True, "ownership": True, "view": "observer"})
        widget.close()
        assert any(m["t"] == "command" for m in messages(other_sent, "observer"))
        sent.clear()
        receive(widget, {"ready": True, "ownership": True, "view": "late"})
        assert not sent
    finally:
        other.close()


def test_kernel_autosync_is_shared_and_stops_with_last_widget():
    async def run():
        widget, config, _, sent = setup_widget()
        other = Widget(element("div"), session=widget.server)
        other.send = Mock()
        assert other.server is not None
        try:
            for w in (widget, other):
                receive(w, {"ready": True, "heartbeat": True, "view": "v"})
            task, users = _SYNC[widget.server]
            assert users == 2
            config.bpm = 133

            async def changed():
                while not any(m["t"] == "patch" for m in messages(sent, "v")):
                    await asyncio.sleep(0.01)

            await asyncio.wait_for(changed(), 2)
            widget.close()
            assert _SYNC[other.server] == (task, 1)
            other.close()
            await asyncio.sleep(0)
            assert task.cancelled()
            assert other.server not in _SYNC
            assert not other.server._codecs
        finally:
            widget.close()
            other.close()

    asyncio.run(run())


def test_widgets_given_the_same_session_share_a_server():
    session = transports.Session()
    session.host(Config())
    first, second = [Widget(element("div"), session=session) for _ in range(2)]
    try:
        assert first.server is second.server
    finally:
        first.close()
        second.close()


@pytest.mark.parametrize(
    "kwargs, message",
    [
        ({"state": {}}, "mutually exclusive"),
        ({"wires": []}, "at least one"),
        ({"wires": [{"url": "/ws"}]}, "WebSocket option"),
        ({"wires": [{"reconnect": True}]}, "WebSocket option"),
        ({"wires": [{"session": True}]}, "WebSocket option"),
        ({"wires": [{"batch": True}]}, "WebSocket option"),
        ({"wires": [{"retry": 2000}]}, "WebSocket option"),
        ({"wires": [{"authority": "client"}]}, "WebSocket option"),
        ({"wires": [{"flatten": 1}]}, "flatten"),
        ({"wires": [{"namespace": ""}]}, "namespace"),
        ({"wires": [{"codec": "invalid"}]}, "unknown codec"),
        ({"wires": [{"model": 0, "namespace": "x"}, {"model": 1, "namespace": "x.y"}]}, "overlap"),
        ({"wires": [{"model": 0, "namespace": "x"}, {"model": 1, "namespace": "y", "ownership": False}]}, "must agree"),
        ({"wires": [{"model": 0, "namespace": "x"}, {"model": 1, "namespace": "y", "codec": "cbor"}]}, "must agree"),
        ({"wires": [{"model": 0, "namespace": "x"}, {"model": 1, "namespace": "y", "update_interval": 0.5}]}, "must agree"),
        ({"wires": [{"namespace": "x"}, {"namespace": "y"}]}, "select a model"),
    ],
)
def test_rejects_ambiguous_or_unsupported_configuration(kwargs, message):
    with pytest.raises(ValueError, match=message):
        Widget(element("div"), session=transports.Session(), **kwargs)


def test_session_mode_rejects_state_access_and_page_wires_still_require_url():
    widget, *_ = setup_widget(autosync=False)
    try:
        with pytest.raises(ValueError, match="state is unavailable"):
            widget.state = {"bpm": 99}
        with pytest.raises(ValueError, match="on_state is unavailable"):
            widget.on_state(lambda _: None)
        with pytest.raises(ValueError, match="requires a url"):
            bootstrap(wire=Wire(model=0))
        with pytest.raises(ValueError, match="require a session"):
            Widget(element("div"), wires=[Wire(model=0)])
    finally:
        widget.close()
