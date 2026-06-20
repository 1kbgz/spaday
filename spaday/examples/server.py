"""A *live* spaday server: host a chart, append a point every second, and stream the changes.

A Starlette server holds the chart, and on each tick computes a spaday ``diff`` against the previous
tree and pushes the resulting patch to every connected browser over a WebSocket; the page applies it
incrementally with the runtime. This is the real "server-pushed live updates" loop (the static
``index.html`` only replays a precomputed patch).

Run it (needs ``starlette``, ``uvicorn``, ``websockets``, and the built ``js/dist`` bundles)::

    cd js && pnpm install && pnpm build && cd ..
    python -m spaday.examples.server      # -> http://127.0.0.1:8000

In production the wire is **transports** (it owns hosting / diffing / flush / fan-out); this hand-rolls
a minimal version so the example stays self-contained.
"""

import asyncio
import json
import random
from contextlib import asynccontextmanager
from datetime import date, timedelta
from pathlib import Path

import uvicorn
from starlette.applications import Starlette
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket, WebSocketDisconnect

from spaday import diff
from spaday.components import LightweightChart

HERE = Path(__file__).parent
REPO = HERE.parent.parent  # repository root, so we can serve js/dist


class Series:
    """A growing daily series; `node()` renders it as a spaday `LightweightChart`."""

    def __init__(self, start_points: int = 60) -> None:
        random.seed(7)
        self.value, self.day, self.points = 100.0, date(2023, 1, 1), []
        for _ in range(start_points):
            self.tick()

    def tick(self) -> None:
        self.value += random.uniform(-1.4, 1.5)
        self.points.append({"time": self.day.isoformat(), "value": round(self.value, 2)})
        self.day += timedelta(days=1)

    def node(self) -> dict:
        return LightweightChart(type="area", data=self.points).to_node()


series = Series()
state = series.node()  # the last tree we broadcast (what every client currently mirrors)
clients: set = set()


async def homepage(request):
    return FileResponse(HERE / "live.html")


async def stream(ws: WebSocket) -> None:
    await ws.accept()
    clients.add(ws)
    await ws.send_json({"t": "snapshot", "node": state})  # bring the new client up to date
    try:
        while True:
            await ws.receive_text()  # we don't expect inbound; this detects disconnect
    except WebSocketDisconnect:
        pass
    finally:
        clients.discard(ws)


async def ticker() -> None:
    global state
    while True:
        await asyncio.sleep(1.0)
        series.tick()
        old, state = state, series.node()
        patch = json.loads(diff(json.dumps(old), json.dumps(state)))  # the change, via the shared core
        if not patch["ops"]:
            continue
        message = {"t": "patch", "patch": patch}
        for ws in list(clients):
            try:
                await ws.send_json(message)
            except Exception:
                clients.discard(ws)


@asynccontextmanager
async def lifespan(app):
    task = asyncio.create_task(ticker())
    try:
        yield
    finally:
        task.cancel()


app = Starlette(
    routes=[
        Route("/", homepage),
        WebSocketRoute("/ws", stream),
        Mount("/js", StaticFiles(directory=REPO / "js")),  # serves the built /js/dist bundles
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
