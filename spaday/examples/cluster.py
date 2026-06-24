"""Multi-worker clustering: one shared, windowed chart fanned across ``uvicorn --workers N``.

Each worker runs a :class:`~transports.Hub` holding the same shared ``Chart`` model, bridged to the other
workers by a :class:`~transports.RelayBroadcaster` over a :class:`~transports.ZmqBackplane`. The **one**
elected worker drives the ticker (``relay.is_leader``) and publishes each update; every worker keeps a
replica and fans it to *its own* clients. So a client on **any** worker sees the same chart, and a refresh
re-fetches the current authoritative snapshot — they always match (unlike a naive multi-worker setup where
each worker would tick its own diverging series).

    # one process:
    python -m spaday.examples.cluster                       # -> http://127.0.0.1:8003
    # the cluster (the point of this example):
    uvicorn spaday.examples.cluster:app --workers 4 --port 8003

Then open two tabs (kernel-balanced across workers) and refresh — the chart is identical everywhere.
"""

import asyncio
import os
import random
from contextlib import asynccontextmanager
from datetime import date, timedelta
from pathlib import Path

import transports
import uvicorn
from pydantic import BaseModel, Field
from starlette.applications import Starlette
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket, WebSocketDisconnect
from transports import Hub, LastWriteWins, RelayBroadcaster, ZmqBackplane

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"
WINDOW = 120


class Chart(BaseModel):
    data: dict = Field(default_factory=dict)  # ISO date -> value; a time-keyed map (bounded, per-point deltas)


hub = Hub(key=lambda ws: "all")  # one READ tenant: every client fans from the same shared chart
CHART_SID = hub.share(Chart(), merge=LastWriteWins)  # single writer (the ticker) — no merge conflicts
hub.subscribe("all", CHART_SID, "read")
# The ZMQ bus addresses. Override per run (env) so two independent local clusters don't attach to the
# same proxy and cross-talk — the shared id is deterministic, so a stray second run would corrupt state.
_FRONT = os.environ.get("SPADAY_CLUSTER_FRONT", "tcp://127.0.0.1:5599")
_BACK = os.environ.get("SPADAY_CLUSTER_BACK", "tcp://127.0.0.1:5600")
relay = RelayBroadcaster(hub, ZmqBackplane(_FRONT, _BACK))


def _resume(current: dict):
    """Continue the walk from the already-caught-up shared chart, or seed a fresh window if it's empty.
    Returns ``(value, day, data, rng)``. This is what stops an elected/restarted leader from rewinding the
    cluster to the initial series: it picks up after the last caught-up point instead of re-seeding."""
    rng = random.Random(7)
    data = dict(current or {})
    if data:
        last = max(data)  # ISO-date keys sort lexically = chronologically
        return data[last], date.fromisoformat(last) + timedelta(days=1), data, rng
    value, day = 100.0, date(2023, 1, 1)
    for _ in range(WINDOW):
        value += rng.uniform(-1.4, 1.5)
        data[day.isoformat()] = round(value, 2)
        day += timedelta(days=1)
    return value, day, data, rng


async def ticker() -> None:
    """The single cluster-wide ticker (runs only on the elected worker); each update fans to all workers.
    Resumes from the caught-up shared chart (``relay.start()`` ran first), so a leader restart never rewinds."""
    value, day, data, rng = _resume(transports.from_value(hub.snapshot_shared(CHART_SID)["value"], Chart).data)
    while True:
        await relay.set_shared(CHART_SID, transports.to_value(Chart(data=dict(data))))
        await asyncio.sleep(1.0)
        value += rng.uniform(-1.4, 1.5)
        data[day.isoformat()] = round(value, 2)
        day += timedelta(days=1)
        while len(data) > WINDOW:
            del data[next(iter(data))]


async def _send(ws: WebSocket, msg) -> None:
    await (ws.send_bytes(msg) if isinstance(msg, (bytes, bytearray)) else ws.send_text(msg))


async def ws_handler(ws: WebSocket) -> None:
    await ws.accept()
    for msg in relay.open(ws):  # the current authoritative snapshot — a (re)connect always refetches
        await _send(ws, msg)
    try:
        while True:
            frame = await ws.receive()
            if frame.get("type") == "websocket.disconnect":
                break
            data = frame.get("text") if frame.get("text") is not None else frame.get("bytes")
            if data is None:
                continue
            for conn, msgs in relay.recv(ws, data).items():
                for m in msgs:
                    await _send(conn, m)
    except WebSocketDisconnect:
        pass
    finally:
        relay.close(ws)


async def homepage(_request):
    return FileResponse(HERE / "cluster.html")


@asynccontextmanager
async def lifespan(app):
    await relay.start()  # joins the cluster + catches up to the current chart before serving
    tasks = [asyncio.create_task(transports.autosync(relay))]
    if relay.is_leader:  # exactly one worker drives the ticker
        tasks.append(asyncio.create_task(ticker()))
    yield
    for t in tasks:
        t.cancel()
    await relay.stop()


app = Starlette(
    routes=[
        Route("/", homepage),
        WebSocketRoute("/ws", ws_handler),
        Mount("/js", StaticFiles(directory=JS)),
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)  # one worker; add `--workers N` (via the uvicorn CLI) to cluster
