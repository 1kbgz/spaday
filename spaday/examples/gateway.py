"""A csp-gateway-style frontend, self-contained in spaday (mock gateway — no csp-gateway needed).

This is the shape of the csp-gateway capstone (spaday Phase 5.3), built against a tiny stand-in backend
so it runs anywhere. It exercises the three things a gateway UI needs, and **uses no transports** — the
data path is REST + Perspective's own websocket (Mode B), exactly as a real gateway works:

- **Form → REST.** ``form(Order)`` generates a validated control per field (the schema's ``ge``/``le``
  become native constraints; a non-Optional number can't be left empty). "Send order" POSTs the order to
  the gateway's REST channel, which validates it again server-side (the authority) and streams it into…
- **A live Perspective blotter.** ``PerspectivePanel`` shows the ``orders`` table; the bulk data rides
  Perspective's own websocket, so a sent order appears in the blotter immediately.
- **A channel control.** "Clear blotter" is a declarative ``CallEndpoint`` POST; the header's **view
  selector** re-pushes the blotter layout (a flat blotter or a by-symbol roll-up).

It is laid out like a gateway dashboard — a dark header, a full-bleed Perspective workspace, a right
control gutter, a footer.

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
from spaday.components.shell import App, Body, Footer, Gutter, Main, Nav, Row, Stack
from spaday.components.webawesome import WaButton, WaOption, WaSelect

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
    orders.replace([])  # replace-all (not clear()) so the empty state pushes to connected blotters at once
    return JSONResponse({"ok": True})


async def psp_data(ws: WebSocket) -> None:
    """Perspective's own data websocket — the blotter's bulk data (not REST, not transports)."""
    await PerspectiveStarletteHandler(perspective_server=psp_server, websocket=ws).run()


def header() -> object:
    """A gateway-style top bar: a marked title + channel name on the left, a layout/view selector right."""
    view = WaSelect(value="blotter", size="small").prop("id", "view").prop("style", "margin-left:auto;width:200px")
    for value, label in (("blotter", "Blotter"), ("symbol", "By symbol")):
        view = view.child(WaOption(value=value).text(label))
    return (
        Nav()
        .child(element("span").text("◆").style(color="#88c0d0", font_size="1.3rem"))
        .child(element("strong").text("spaday gateway").style(letter_spacing=".02em"))
        .child(element("span").text("· orders").style(color="#81a1c1"))
        .child(view)
    )


def controls() -> object:
    """The right settings gutter: the order form (a channel send) + the actions + a status line."""
    return (
        Stack()
        .child(element("strong").text("Send to a channel"))
        .child(
            element("p")
            .text(
                "A form generated from the Order schema; Send POSTs it to the gateway's REST channel — validated server-side — and it streams into the blotter."
            )
            .style(margin="0 0 .25rem")
        )
        .child(form(Order))
        .child(WaButton(variant="brand").prop("id", "send").prop("style", "width:100%").text("Send order").on("click", NamedJs("send-order")))
        .child(
            Row()
            .child(WaButton(appearance="outlined").prop("id", "clear").text("Clear").on("click", CallEndpoint("POST", "/api/clear")))
            .child(element("span").prop("id", "status").prop("style", "margin-left:auto;color:#88c0d0;align-self:center"))
        )
    )


def page() -> dict:
    """A gateway dashboard: header, a full-bleed live Perspective workspace, a right control gutter, footer."""
    return (
        App()
        .css(spa_surface="#222b39", spa_surface_2="#2a3445", spa_border="#3b4860", spa_muted="#8fa3c0", spa_gap="0.85rem")
        .style(color="#e6eefb", height="100vh", background="#1b222e")  # cap to the viewport; inner regions scroll
        .child(header())
        .child(
            Body()
            .child(Main().style(padding="0").child(PerspectivePanel().prop("id", "blotter").prop("style", "height:100%;display:block")))
            .child(Gutter(width="340px").style(overflow_y="auto").child(controls()))  # a tall form scrolls in the gutter
        )
        .child(Footer().child(element("span").text("spaday × csp-gateway pattern — form → REST · live Perspective (Mode B) · no transports")))
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
