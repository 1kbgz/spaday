"""An all-in-one dashboard: WebAwesome controls drive a live chart, over transports.

The chart state (`type`, `data`, `live`) is a model in a `transports.Session`, served over a
WebSocket. The UI — a `wa-select`, a `wa-switch`, a `wa-button`, and the `<lightweight-chart>` — is
**authored in typed Python** with `spaday.components` and mounted by the runtime. Control changes are
sent back as transports edits, so the server is authoritative and **every connected browser stays in
sync** (change the type in one tab, all tabs update).

Run::

    cd js && pnpm install && pnpm build && cd ..
    python -m spaday.examples.dashboard     # -> http://127.0.0.1:8001

Note: the control→edit wiring in `dashboard.html` is hand-written JS — spaday's declarative
event→action binding (the action DSL) is a later phase; it will replace that glue.
"""

import asyncio
import random
from contextlib import asynccontextmanager
from datetime import date, timedelta
from pathlib import Path

import transports
import uvicorn
from pydantic import BaseModel, Field
from starlette.applications import Starlette
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles

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


_value, _day = 100.0, date(2023, 1, 1)


def _point() -> dict:
    global _value, _day
    _value += random.uniform(-1.4, 1.5)
    point = {"time": _day.isoformat(), "value": round(_value, 2)}
    _day += timedelta(days=1)
    return point


random.seed(7)
chart = Chart(data=[_point() for _ in range(60)])
session = transports.Session()
session.host(chart)
server = transports.Server(session)


def shell() -> dict:
    """The dashboard UI as a spaday node, reflecting the current model state."""
    select = WaSelect(label="Series type", value=chart.type).prop("id", "type")
    for t in TYPES:
        select = select.child(WaOption(value=t).text(t.capitalize()))
    controls = (
        element("div", style="display:flex;gap:20px;align-items:end;margin-bottom:16px")
        .child(select)
        .child(WaSwitch(checked=chart.live).prop("id", "live").text("Live"))
        .child(WaButton(variant="neutral").prop("id", "clear").text("Clear"))
    )
    chart_el = LightweightChart(type=chart.type).prop("id", "chart")
    return element("div").child(controls).child(chart_el).to_node()


async def homepage(request):
    return FileResponse(HERE / "dashboard.html")


async def shell_route(request):
    return JSONResponse(shell())


async def ticker() -> None:
    while True:
        await asyncio.sleep(1.0)
        if chart.live:
            chart.data = chart.data + [_point()]


@asynccontextmanager
async def lifespan(app):
    flush = asyncio.create_task(transports.autoflush(server))
    tick = asyncio.create_task(ticker())
    try:
        yield
    finally:
        flush.cancel()
        tick.cancel()


app = Starlette(
    routes=[
        Route("/", homepage),
        Route("/shell.json", shell_route),
        WebSocketRoute("/ws", transports.starlette_endpoint(server)),
        Mount("/js", StaticFiles(directory=JS)),
        Mount("/nm", StaticFiles(directory=JS / "node_modules")),
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
