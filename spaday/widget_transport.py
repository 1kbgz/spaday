"""Lifecycle of a transports session served through an existing widget comm."""

import asyncio
from collections.abc import Callable, Mapping, Sequence
from dataclasses import asdict
from typing import Any
from weakref import WeakValueDictionary, ref

import transports

from .bootstrap import Wire

_SERVERS: WeakValueDictionary = WeakValueDictionary()
_SYNC: dict[transports.Server, tuple[asyncio.Task, int]] = {}


def server_for(session: transports.Session | transports.Server) -> transports.Server:
    if isinstance(session, transports.Server):
        return session
    if not isinstance(session, transports.Session):
        raise TypeError("Widget session must be a transports Session or Server")
    server = _SERVERS.get(session)
    if server is None:
        server = transports.Server(session)
        _SERVERS[session] = server
    return server


def notebook_wires(wires: Sequence[Wire | Mapping] | None) -> list[dict]:
    specs = [asdict(w if isinstance(w, Wire) else Wire(**w)) for w in (wires if wires is not None else [Wire()])]
    if not specs:
        raise ValueError("Widget wires must select at least one model")
    for spec in specs:
        for key, default in {"url": None, "session": False, "batch": False, "reconnect": False, "retry": 1000, "authority": "server"}.items():
            if spec.pop(key) != default:
                raise ValueError(f"Widget wires do not support WebSocket option {key!r}")
        spec["codec"] = transports.protocol.normalize_codec(spec["codec"])
        if spec["codec"] not in ("json", "msgpack", "cbor"):
            raise ValueError("Widget wires require json, msgpack, or cbor")
        if not isinstance(spec["flatten"], bool):
            raise ValueError("Widget wire flatten must be a boolean")
        for key in ("namespace", "connected"):
            if spec[key] is not None and (not isinstance(spec[key], str) or not spec[key].strip()):
                raise ValueError(f"Widget wire {key} must be a nonempty string")
        if len(specs) > 1 and spec["model"] is None:
            raise ValueError("Each Widget wire must select a model when using multiple wires")
    for index, spec in enumerate(specs):
        if any(spec[key] != specs[0][key] for key in ("codec", "ownership", "update_interval")):
            raise ValueError("Widget wires share a connection; codec, ownership, and update_interval must agree")
        namespace = spec["namespace"] or ""
        for other in specs[:index]:
            prefix = other["namespace"] or ""
            if not namespace or not prefix or namespace == prefix or namespace.startswith(prefix + ".") or prefix.startswith(namespace + "."):
                raise ValueError("Widget wire namespaces must not overlap")
    return specs


def start_sync(server: transports.Server) -> Callable[[], None]:
    """Reference-count one comm sync task per Server, shared by notebook widgets."""
    loop = asyncio.get_running_loop()
    task, count = _SYNC.get(server, (None, 0))
    if task is None:

        async def sync_comm() -> None:
            # transports.autosync drives async socket handles; comm handles use sync().
            while True:
                await asyncio.sleep(0.01)
                transports.sync(server)

        task = loop.create_task(sync_comm())
    _SYNC[server] = (task, count + 1)

    def stop() -> None:
        task, count = _SYNC[server]
        if count == 1:
            del _SYNC[server]
            task.cancel()
        else:
            _SYNC[server] = (task, count - 1)

    return stop


class WidgetChannel:
    """Delegate the comm protocol to transports and close every view with the widget.

    serve_anywidget has no registration disposer. This adapter records its callback and view IDs
    so close() can use the same closed-view protocol and unregister the callback without reaching
    into transports' connection or heartbeat internals. All messages use the original widget comm.
    """

    def __init__(self, widget: Any, server: transports.Server, codec: str) -> None:
        self._widget = ref(widget)
        self._views: set[str] = set()
        self._receive: Callable | None = None
        transports.serve_anywidget(server, self, codec)

    def on_msg(self, callback: Callable) -> None:
        self._receive = callback
        widget = self._widget()
        assert widget is not None
        widget.on_msg(self.receive)

    def send(self, content: dict, buffers=()) -> None:
        if content.get("expired"):
            self._views.discard(content.get("view"))
        widget = self._widget()
        if widget is not None:
            widget.send(content, buffers=buffers)

    def receive(self, widget: Any, content: Any, buffers: Any) -> None:
        if not isinstance(content, dict):
            return
        view = content.get("view")
        if not isinstance(view, str) or not view:
            return
        if content.get("ready"):
            self._views.add(view)
        elif content.get("closed"):
            self._views.discard(view)
        if self._receive is not None:
            self._receive(widget, content, buffers)

    def close(self) -> None:
        widget = self._widget()
        if self._receive is not None:
            if widget is not None:
                widget.on_msg(self.receive, remove=True)
            for view in tuple(self._views):
                self._receive(widget, {"closed": True, "view": view}, [])
            self._views.clear()
            self._receive = None
