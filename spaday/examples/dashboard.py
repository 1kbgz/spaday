"""An all-in-one dashboard showing **global vs per-session** state over transports.

Two charts, each WebAwesome-controlled and authored in typed Python:

- **Global** — one `Chart` in a shared `transports.Session`/`Server` at ``/ws``. Every browser mirrors
  the same model, so a control change in one tab updates all (server-authoritative).
- **Per session** — a `transports.Hub` at ``/ws/session`` routes each connection (by a per-tab
  ``?session=`` id) to its own private `Chart`. Each browser gets an isolated chart; changing one
  does not affect the others — the multi-tenant case.

Run::

    cd js && pnpm install && pnpm build && cd ..
    python -m spaday.examples.dashboard     # -> http://127.0.0.1:8001

The control→edit wiring in `dashboard.html` is hand-written JS — spaday's declarative event→action
binding (the action DSL) is a later phase; it will replace that glue.
"""

import asyncio
import random
from contextlib import asynccontextmanager
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Dict

import transports
import uvicorn
from pydantic import BaseModel, Field
from starlette.applications import Starlette
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket, WebSocketDisconnect

from spaday import element
from spaday.components.lightweight_charts import LightweightChart
from spaday.components.webawesome import WaButton, WaOption, WaSelect, WaSwitch

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"
TYPES = ["line", "area", "candlestick", "bar", "histogram"]


class Chart(BaseModel):
    type: str = "area"
    live: bool = True
    data: list = Field(default_factory=list)


class ChartSource:
    """A `Chart` model plus the running state that appends points to it."""

    def __init__(self, type: str = "area", seed: int = 0) -> None:
        self._rng = random.Random(seed)
        self._value, self._day = 100.0, date(2023, 1, 1)
        self.model = Chart(type=type, data=[self._point() for _ in range(60)])

    def _point(self) -> dict:
        self._value += self._rng.uniform(-1.4, 1.5)
        point = {"time": self._day.isoformat(), "value": round(self._value, 2)}
        self._day += timedelta(days=1)
        return point

    def tick(self) -> None:
        if self.model.live:
            self.model.data = self.model.data + [self._point()]  # reassign so the Session observes it


global_src = ChartSource(type="area", seed=7)
global_session = transports.Session()
global_session.host(global_src.model)
global_server = transports.Server(global_session)

session_hub = transports.Hub(key=lambda ws: ws.query_params.get("session", "anon"))
session_srcs: Dict[str, ChartSource] = {}


def chart_panel(prefix: str, title: str, chart_type: str) -> Any:
    """Author one panel (heading + WebAwesome controls + chart), ids prefixed so the page can wire it."""
    select = WaSelect(label="Series type", value=chart_type).prop("id", f"{prefix}-type")
    for t in TYPES:
        select = select.child(WaOption(value=t).text(t.capitalize()))
    heading = (
        element("div", style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px")
        .child(element("strong").text(title))
        .child(element("span", style="color:#2962ff;font-weight:600;font-size:13px").prop("id", f"{prefix}-status").text("connecting…"))
    )
    controls = (
        element("div", style="display:flex;gap:20px;align-items:end;margin-bottom:12px")
        .child(select)
        .child(WaSwitch(checked=True).prop("id", f"{prefix}-live").text("Live"))
        .child(WaButton(variant="neutral").prop("id", f"{prefix}-clear").text("Clear"))
    )
    chart_el = LightweightChart(type=chart_type).prop("id", f"{prefix}-chart")
    return element("div", class_="panel").child(heading).child(controls).child(chart_el)


def shell() -> dict:
    return (
        element("div")
        .child(chart_panel("global", "Global — shared by every browser", global_src.model.type))
        .child(chart_panel("session", "Per session — yours alone", "area"))
        .to_node()
    )


async def homepage(request):
    return FileResponse(HERE / "dashboard.html")


async def shell_route(request):
    return JSONResponse(shell())


async def _send(ws: WebSocket, msg) -> None:
    await (ws.send_bytes(msg) if isinstance(msg, (bytes, bytearray)) else ws.send_text(msg))


async def session_endpoint(ws: WebSocket) -> None:
    """Like transports' built-in Hub endpoint, but hosts a private chart for a tenant on first connect."""
    key = ws.query_params.get("session", "anon")
    sess = session_hub.tenant(key)
    if key not in session_srcs:
        src = ChartSource(type="area", seed=hash(key) & 0xFFFF)
        sess.host(src.model)
        session_srcs[key] = src
    await ws.accept()
    for msg in session_hub.open(ws):
        await _send(ws, msg)
    try:
        while True:
            frame = await ws.receive()
            if frame.get("type") == "websocket.disconnect":
                break
            data = frame.get("text")
            if data is None:
                data = frame.get("bytes")
            if data is None:
                continue
            for conn, msgs in session_hub.recv(ws, data).items():
                for m in msgs:
                    await _send(conn, m)
    except WebSocketDisconnect:
        pass
    finally:
        session_hub.close(ws)
        session_srcs.pop(key, None)  # stop ticking a gone tenant (its dormant Session is left behind)


async def ticker() -> None:
    while True:
        await asyncio.sleep(1.0)
        global_src.tick()
        for src in list(session_srcs.values()):
            src.tick()


@asynccontextmanager
async def lifespan(app):
    tasks = [
        asyncio.create_task(transports.autoflush(global_server)),
        asyncio.create_task(transports.autoflush(session_hub)),
        asyncio.create_task(ticker()),
    ]
    try:
        yield
    finally:
        for t in tasks:
            t.cancel()


app = Starlette(
    routes=[
        Route("/", homepage),
        Route("/shell.json", shell_route),
        WebSocketRoute("/ws", transports.starlette_endpoint(global_server)),
        WebSocketRoute("/ws/session", session_endpoint),
        Mount("/js", StaticFiles(directory=JS)),
        Mount("/nm", StaticFiles(directory=JS / "node_modules")),
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
