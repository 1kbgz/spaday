"""A live chart on **transports**: host a chart model, append a point every second, stream it.

The chart's data lives in a `transports.Session`; `transports.Server` + `starlette_endpoint` serve it
over a WebSocket and `autoflush` broadcasts the patches. The browser (`live.html`) mirrors the model
with transports' JS `Client` and feeds it to the `<lightweight-chart>` element. transports is the
wire; spaday renders.

Run (needs `transports`, `starlette`, `uvicorn`, `websockets`, and the built `js/dist` bundles +
`@1kbgz/transports` in `js/node_modules`)::

    cd js && pnpm install && pnpm build && cd ..
    python -m spaday.examples.server      # -> http://127.0.0.1:8000
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
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"  # spaday/js — holds the built dist/ and node_modules/ we serve


class Chart(BaseModel):
    type: str = "area"
    data: list = Field(default_factory=list)


_value, _day = 100.0, date(2023, 1, 1)


def _point() -> dict:
    global _value, _day
    _value += random.uniform(-1.4, 1.5)
    point = {"time": _day.isoformat(), "value": round(_value, 2)}
    _day += timedelta(days=1)
    return point


random.seed(7)
chart = Chart(type="area", data=[_point() for _ in range(60)])
session = transports.Session()
session.host(chart)  # the only model; the browser finds it by id
server = transports.Server(session)


async def homepage(request):
    return FileResponse(HERE / "live.html")


async def ticker() -> None:
    while True:
        await asyncio.sleep(1.0)
        chart.data = chart.data + [_point()]  # reassign so the reactive Session observes the change


@asynccontextmanager
async def lifespan(app):
    flush = asyncio.create_task(transports.autoflush(server))  # broadcast patches to clients
    tick = asyncio.create_task(ticker())
    try:
        yield
    finally:
        flush.cancel()
        tick.cancel()


app = Starlette(
    routes=[
        Route("/", homepage),
        WebSocketRoute("/ws", transports.starlette_endpoint(server)),
        Mount("/js", StaticFiles(directory=JS)),
        Mount("/nm", StaticFiles(directory=JS / "node_modules")),  # serves @1kbgz/transports, webawesome
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
