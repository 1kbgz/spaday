"""A csp-gateway-style frontend, self-contained in spaday (mock gateway — no csp-gateway needed).

This is the shape of the csp-gateway capstone (spaday Phase 5.3), built against a tiny stand-in backend
so it runs anywhere. It exercises the three things a gateway UI needs, and **uses no transports** — the
data path is REST + Perspective's own websocket (Mode B), exactly as a real gateway works:

- **Form → REST.** ``form(Order)`` generates a validated control per field (the schema's ``ge``/``le``
  become native constraints; a non-Optional number can't be left empty). "Send order" POSTs the order to
  the gateway's REST channel, which validates it again server-side (the authority) and streams it into…
- **A live Perspective blotter.** ``PerspectivePanel`` shows the ``orders`` table; the bulk data rides
  Perspective's own websocket, so a sent order appears in the blotter immediately.
- **A channel control.** "Clear blotter" is a declarative ``CallEndpoint`` POST (no round-trip code).

The one bit of glue: "Send order" reads the form's store and POSTs it via a ``NamedJs`` handler, because
composing a whole object as a ``CallEndpoint`` body isn't expressible in the action DSL yet — that is the
roadmap's ``CallEndpoint(body=form.value)``. Everything else is declarative.

Run: ``python -m spaday.examples.gateway`` then open http://127.0.0.1:8006/.
"""

import enum
from pathlib import Path
from typing import Annotated

import perspective
import uvicorn
from perspective.handlers.starlette import PerspectiveStarletteHandler
from pydantic import BaseModel, Field, ValidationError
from starlette.applications import Starlette
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles
from starlette.websockets import WebSocket

from spaday import element
from spaday.actions import CallEndpoint, NamedJs
from spaday.components.form import form
from spaday.components.perspective import PerspectivePanel
from spaday.components.shell import App, Body, Main, Nav, Row, Stack
from spaday.components.webawesome import WaButton, WaCard

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"


class Side(str, enum.Enum):
    buy = "buy"
    sell = "sell"


class Order(BaseModel):
    """The request struct POSTed to the gateway's ``orders`` channel — the form is generated from it."""

    symbol: str = "AAPL"
    side: Side = Side.buy
    qty: Annotated[int, Field(ge=1, le=1_000_000)] = 100
    price: Annotated[float, Field(ge=0)] = 100.0


# The Perspective server holding the 'orders' channel as a live table (a ring buffer). A sent order is
# appended and streams to every connected blotter over Perspective's own websocket (served at /perspective).
psp_server = perspective.Server()
psp_client = psp_server.new_local_client()
ORDERS_SCHEMA = {"id": "integer", "symbol": "string", "side": "string", "qty": "integer", "price": "float"}
orders = psp_client.table(ORDERS_SCHEMA, limit=500, name="orders")
_next_id = 0


async def send_order(request):
    """The 'orders' channel: validate the posted struct (the server is the authority) and append it."""
    global _next_id
    try:
        order = Order(**(await request.json()))
    except ValidationError as exc:
        return JSONResponse({"error": exc.errors()[0]["msg"]}, status_code=422)
    _next_id += 1
    orders.update([{"id": _next_id, **order.model_dump(mode="json")}])  # streams to the blotter
    return JSONResponse({"id": _next_id})


async def clear_orders(_request):
    orders.clear()
    return JSONResponse({"ok": True})


async def psp_data(ws: WebSocket) -> None:
    """Perspective's own data websocket — the blotter's bulk data (not REST, not transports)."""
    await PerspectiveStarletteHandler(perspective_server=psp_server, websocket=ws).run()


def send_card() -> object:
    return WaCard(appearance="outlined").child(
        Stack()
        .child(element("strong").text("Send an order — a Form generated from the schema, POSTed to a channel"))
        .child(
            element("p").text(
                "form(Order) builds a validated control per field (ge/le → min/max; a non-Optional number "
                "can't be empty). Send POSTs the order to the gateway's REST channel — validated again "
                "server-side — and it streams into the blotter below."
            )
        )
        .child(form(Order))
        .child(
            Row()
            .child(WaButton(variant="brand").prop("id", "send").text("Send order").on("click", NamedJs("send-order")))
            .child(WaButton(appearance="outlined").text("Clear blotter").on("click", CallEndpoint("POST", "/api/clear")))
            .child(element("span").prop("id", "status").prop("style", "margin-left:auto;color:#2962ff;align-self:center"))
        )
    )


def blotter_card() -> object:
    return WaCard(appearance="outlined").child(
        Stack()
        .child(element("strong").text("Orders blotter — a live Perspective table (Mode B: data over Perspective's own ws)"))
        .child(PerspectivePanel().prop("id", "blotter").prop("style", "height:340px;display:block"))
    )


def page() -> dict:
    return (
        App()
        .child(
            Nav()
            .child(element("strong").text("spaday × csp-gateway pattern"))
            .child(element("span").text("· form → REST · live Perspective · no transports"))
        )
        .child(Body().child(Main().child(send_card()).child(blotter_card())))
        .to_node()
    )


async def homepage(_request):
    return FileResponse(HERE / "gateway.html")


async def tree(_request):
    return JSONResponse(page())


app = Starlette(
    routes=[
        Route("/", homepage),
        Route("/tree.json", tree),
        Route("/api/send/orders", send_order, methods=["POST"]),
        Route("/api/clear", clear_orders, methods=["POST"]),
        WebSocketRoute("/perspective", psp_data),
        Mount("/js", StaticFiles(directory=JS)),
    ]
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8006)
