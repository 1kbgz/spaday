"""The spaday omnibus example — the whole stack in one self-serving app.

Run it and open the URL::

    python -m spaday.examples        # -> http://127.0.0.1:8000

It shows, on one page authored entirely in Python:

- **Shell layout** — the page is composed from ``spa-*`` shell components
  (:mod:`spaday.components.shell`: ``App`` / ``Nav`` / ``Body`` / ``Gutter`` / ``Main`` / ``Footer`` with
  ``Stack`` / ``Row`` / ``Toolbar``), not raw ``div``s.
- **Action DSL (client-side)** — controls carry declarative actions (:mod:`spaday.actions` +
  :meth:`~spaday.component.Component.on`) interpreted in the browser: a Toggle, a SetProp bound to the
  event value, a Sequence, and buttons that switch a chart's series type. The page wires **no** event
  listeners and never calls the server for these.
- **transports (server-authoritative, multi-tenant)** — two live charts mirror Python models over
  ``@1kbgz/transports``. A **global** model on a shared :class:`transports.Server` syncs to every browser;
  a **per-session** model on a :class:`transports.Hub` is private to each tab. Control changes are
  declarative :class:`~spaday.actions.SendPatch` actions: each fires a ``spaday:patch`` intent that one
  generic sink in ``index.html`` routes to the right transports model — applied on the server and fanned
  to clients. The per-control listeners are gone; only the model→wire bridge remains.
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
from starlette.websockets import WebSocket, WebSocketDisconnect

from spaday import element
from spaday.actions import SendPatch, Sequence, SetProp, Toggle, bind, by_id, event_value, lit, not_
from spaday.components.lightweight_charts import LightweightChart
from spaday.components.shell import App, Body, Footer, Gutter, Main, Nav, Row, Stack, Toolbar
from spaday.components.webawesome import WaButton, WaCallout, WaCard, WaOption, WaSelect, WaSwitch

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"
# value-shaped series only — the ticker emits {time, value}; candlestick/bar need OHLC points
TYPES = ["line", "area", "histogram"]


def random_walk(n: int, *, seed: int = 7, start: float = 100.0) -> list:
    """A deterministic daily-value series, e.g. ``[{"time": "2023-01-01", "value": 99.54}, ...]``."""
    rng = random.Random(seed)
    value, day, points = start, date(2023, 1, 1), []
    for i in range(n):
        value += rng.uniform(-1.4, 1.5)
        points.append({"time": (day + timedelta(days=i)).isoformat(), "value": round(value, 2)})
    return points


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
session_srcs: dict = {}


def callout(id: str, text: str, *, hidden: bool = False) -> object:
    return WaCallout(variant="neutral").prop("id", id).prop("hidden", hidden or None).text(text)


def type_button(label: str, value: str) -> object:
    """A button that switches the action-DSL chart's series type — client-side, no server."""
    return WaButton(variant="neutral").text(label).on("click", SetProp(by_id("dsl-chart"), "type", value))


def dsl_card() -> object:
    """Behavior that runs entirely in the browser: each control carries a declarative Action."""
    return WaCard(appearance="outlined").child(
        Stack()
        .child(element("strong").text("Client-side behavior — the action DSL"))
        .child(
            element("p").text(
                "Each control carries an Action authored in Python and interpreted in the browser. "
                "The page wires no event listeners and never calls the server for these."
            )
        )
        .child(
            Row()
            .child(WaButton(variant="brand").text("Toggle details").on("click", Toggle(by_id("details"), "hidden")))
            .child(callout("details", "Visible to start; the button flips this panel's hidden property (Toggle)."))
        )
        .child(
            Row()
            .child(bind(WaSwitch().text("Reveal advanced"), by_id("advanced"), "hidden", transform=not_))
            .child(callout("advanced", "Hidden until the switch is on — a one-way bind(switch -> advanced.hidden, not_).", hidden=True))
        )
        .child(
            Row()
            .child(
                WaButton(variant="neutral")
                .text("Reset")
                .on("click", Sequence(SetProp(by_id("details"), "hidden", False), SetProp(by_id("advanced"), "hidden", True)))
            )
            .child(element("span").text("One click runs both (Sequence)."))
        )
        .child(
            Stack()
            .child(Toolbar().child(type_button("Line", "line")).child(type_button("Area", "area")).child(type_button("Histogram", "histogram")))
            .child(LightweightChart(type="area", data=random_walk(120)).prop("id", "dsl-chart"))
        )
    )


def transports_panel(prefix: str, title: str, chart_type: str) -> object:
    """One live chart + its controls. Edits are declarative SendPatch actions (routed to transports in
    index.html); the ids remain so the inbound update can reflect the model back onto the controls."""
    select = WaSelect(label="Type", value=chart_type).prop("id", f"{prefix}-type").on("change", SendPatch(prefix, "type", event_value()))
    for t in TYPES:
        select = select.child(WaOption(value=t).text(t.capitalize()))
    status = element("span").prop("id", f"{prefix}-status").prop("style", "margin-left:auto;color:#2962ff;font-size:.8rem").text("connecting…")
    return (
        Stack()
        .child(Row().child(element("strong").text(title)).child(status))
        .child(
            Toolbar()
            .child(select)
            .child(WaSwitch(checked=True).prop("id", f"{prefix}-live").text("Live").on("change", SendPatch(prefix, "live", event_value())))
            .child(WaButton(variant="neutral").prop("id", f"{prefix}-clear").text("Clear").on("click", SendPatch(prefix, "data", lit([]))))
        )
        .child(LightweightChart(type=chart_type).prop("id", f"{prefix}-chart"))
    )


def transports_card() -> object:
    """Live models over transports: a shared global one and a per-tab private one."""
    return WaCard(appearance="outlined").child(
        Stack()
        .child(element("strong").text("Live data over transports — server-authoritative, multi-tenant"))
        .child(
            element("p").text(
                "Each chart mirrors a Python model over transports; control changes are edits applied on "
                "the server and fanned to clients. Global is shared by every browser; per-session is "
                "private to each tab — open two tabs to see the difference."
            )
        )
        .child(transports_panel("global", "Global — shared by every browser", global_src.model.type))
        .child(transports_panel("session", "Per session — yours alone", "area"))
    )


def page() -> dict:
    """The whole page, authored from shell components (no layout divs; raw elements only for text)."""
    return (
        App()
        .child(
            Nav()
            .child(element("strong").text("spaday"))
            .child(element("span").text("· shell + action DSL + transports"))
            # right-aligned; wired to a `wa-dark` class toggle in index.html (class/root toggling
            # is page chrome the action DSL doesn't model yet, like the transports edits below)
            .child(WaSwitch().prop("id", "theme-toggle").prop("style", "margin-left:auto").text("Dark"))
        )
        .child(
            Body()
            .child(
                Gutter().child(
                    Stack()
                    .child(element("strong").text("Shows"))
                    .child(element("span").text("spa-* shell layout"))
                    .child(element("span").text("action DSL (client-side)"))
                    .child(element("span").text("transports live + edits"))
                    .child(element("span").text("global vs per-session"))
                )
            )
            .child(Main().child(dsl_card()).child(transports_card()))
        )
        .child(
            Footer()
            .child(element("span").text("Charts by "))
            .child(element("a", href="https://www.tradingview.com/").text("TradingView Lightweight Charts"))
        )
        .to_node()
    )


async def homepage(request):
    return FileResponse(HERE / "index.html")


async def tree(request):
    return JSONResponse(page())


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
        Route("/tree.json", tree),
        WebSocketRoute("/ws", transports.starlette_endpoint(global_server)),
        WebSocketRoute("/ws/session", session_endpoint),
        Mount("/js", StaticFiles(directory=JS)),
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
