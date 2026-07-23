"""A csp-gateway-style frontend, self-contained in spaday (mock gateway — no csp-gateway needed).

This is the shape of the csp-gateway capstone (spaday Phase 5.3), built against a tiny stand-in backend
so it runs anywhere. It exercises the three things a gateway UI needs, and **uses no transports** — the
data path is REST + Perspective's own websocket (Mode B), exactly as a real gateway works:

- **Form → REST.** ``form(Order)`` generates a validated control per field (the schema's ``ge``/``le``
  become native constraints; a non-Optional number can't be left empty). "Send order" POSTs the order to
  the gateway's REST channel, which validates it again server-side (the authority) and streams it into…
- **A live Perspective blotter.** ``PerspectivePanel`` shows the ``orders`` table; the bulk data rides
  Perspective's own websocket, so a sent order appears in the blotter immediately.
- **Controls.** "Clear" empties the channel; the header has a dark/light toggle and a **view selector**
  that re-pushes the blotter layout (a flat blotter or a by-symbol roll-up).

It is laid out like a gateway dashboard — a header (title + dark/light + view), a full-bleed Perspective
workspace, a right control gutter, a footer.

**There is no hand-written HTML page** — ``serve(page, …)`` generates the bootstrap, and the whole UI is
declarative against a seeded signal ``store``:

- *Send* is ``CallEndpoint("POST", …, obj({f: field(f) …}))`` — the form's two-way-bound fields composed
  into the POST body, no handler.
- *Theme* is ``bind_root_class("wa-dark", "dark")`` (the shell + WebAwesome follow the class via CSS
  tokens) plus ``blotter.compute("theme", cond(field("dark"), …))`` for Perspective (its viewers don't
  read a page class).
- *View* is ``select.bind("value", "view")`` plus ``blotter.compute("config", obj({… layout: cond(…)}))``
  — switching the selector recomputes the pushed layout.

The one piece that can't be declarative is *Clear*'s repaint: a Perspective datagrid doesn't repaint when
its view is emptied, so a tiny ``NamedJs`` handler (``examples/gateway.ts`` → ``…/examples/gateway.js``,
loaded via ``scripts=``) POSTs the clear and forces each viewer to restore. That's the lone escape hatch.

Run: ``python -m spaday.examples.gateway`` then open http://127.0.0.1:8006/.
"""

import enum
from typing import Annotated

import perspective
import uvicorn
from perspective.handlers.starlette import PerspectiveStarletteHandler
from pydantic import BaseModel, Field, ValidationError
from spaday_perspective import PerspectivePanel
from starlette.responses import JSONResponse
from starlette.routing import Route, WebSocketRoute
from starlette.websockets import WebSocket

from spaday import element
from spaday.actions import CallEndpoint, NamedJs, cond, eq, field, obj
from spaday.backends.starlette import serve
from spaday.components.form import form
from spaday.components.shell import App, Body, Footer, Gutter, Main, Nav, Row, Stack
from spaday.components.webawesome import WaButton, WaOption, WaSelect, WaSwitch


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


# The shell + WebAwesome theme themselves from the `wa-dark` class (toggled by bind_root_class); this is
# the CSS that keys the page chrome + the spa-* tokens off it, so one boolean field re-themes everything
# except Perspective (which has its own theme system — see the blotter's `theme` compute below).
THEME_CSS = """<style>
      html, body { height: 100%; }
      body { margin: 0; font-family: system-ui, sans-serif; background: #1b222e; }
      spa-app { --spa-gap: 0.85rem; height: 100vh; }
      html.wa-dark { background: #1b222e; }
      html.wa-dark spa-app {
        --spa-surface: #222b39; --spa-surface-2: #2a3445; --spa-border: #3b4860; --spa-muted: #8fa3c0;
        color: #e6eefb; background: #1b222e;
      }
      html:not(.wa-dark) { background: #eef1f5; }
      html:not(.wa-dark) spa-app {
        --spa-surface: #ffffff; --spa-surface-2: #f3f5f8; --spa-border: #dde3ec; --spa-muted: #5a6a80;
        color: #1a2230; background: #eef1f5;
      }
      p { margin: 0 0 4px; color: var(--wa-color-text-quiet, #8fa3c0); line-height: 1.5; font-size: 0.85rem; }
    </style>"""


def _layout(extra: dict) -> dict:
    """A Perspective workspace layout showing the 'orders' table in a single datagrid viewer."""
    return {
        "sizes": [1],
        "detail": {"main": {"type": "tab-area", "widgets": ["orders"], "currentIndex": 0}},
        "master": {"sizes": [], "widgets": []},
        "mode": "globalFilters",
        "viewers": {"orders": {"table": "orders", "plugin": "Datagrid", **extra}},
    }


# The two saved layouts the view selector switches between — a flat blotter and a by-symbol roll-up.
BLOTTER_LAYOUT = _layout({"title": "Orders", "sort": [["id", "desc"]]})
SYMBOL_LAYOUT = _layout({"title": "By symbol", "group_by": ["symbol"], "columns": ["qty", "price"], "aggregates": {"qty": "sum", "price": "avg"}})


def header() -> object:
    """A gateway-style top bar: a marked title + channel left, a dark/light toggle + view selector right."""
    view = WaSelect(value="blotter", size="s").bind("value", "view", mode="two-way").prop("style", "width:200px")
    for value, label in (("blotter", "Blotter"), ("symbol", "By symbol")):
        view = view.child(WaOption(value=value).text(label))
    # the toggle drives the `dark` field; bind_root_class on the App turns it into the page-wide wa-dark class
    dark = WaSwitch(checked=True).bind("checked", "dark", mode="two-way").prop("style", "margin-left:auto").text("Dark")
    return (
        Nav()
        .child(element("span").text("◆").style(color="#88c0d0", font_size="1.3rem"))
        .child(element("strong").text("spaday gateway").style(letter_spacing=".02em"))
        .child(element("span").text("· orders").style(color="#81a1c1"))
        .child(dark)  # margin-left:auto pushes the toggle + the view selector to the right
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
        # Send is fully declarative: compose the form's two-way-bound store fields into the POST body
        # (obj + field), no hand-written handler. The blotter streaming the new row back is the feedback.
        .child(
            WaButton(variant="brand")
            .prop("id", "send")
            .prop("style", "width:100%")
            .text("Send order")
            .on("click", CallEndpoint("POST", "/api/send/orders", obj({name: field(name) for name in Order.model_fields})))
        )
        .child(
            Row()
            .child(WaButton(appearance="outlined").prop("id", "clear").text("Clear").on("click", NamedJs("clear-blotter")))
            .child(element("span").prop("id", "status").prop("style", "margin-left:auto;color:#88c0d0;align-self:center"))
        )
    )


def page() -> object:
    """A gateway dashboard: header, a full-bleed live Perspective workspace, a right control gutter, footer."""
    blotter = (
        PerspectivePanel()
        .prop("id", "blotter")
        .prop("style", "height:100%;display:block")
        # Perspective themes itself (its viewers don't follow the page's wa-dark class), so map the `dark`
        # field to its theme; the layout is recomputed from the `view` field (a flat blotter or roll-up).
        .compute("theme", cond(field("dark"), "dark", "light"))
        .compute(
            "config",
            obj({"ws_url": "/perspective", "tables": ["orders"], "layout": cond(eq(field("view"), "symbol"), SYMBOL_LAYOUT, BLOTTER_LAYOUT)}),
        )
    )
    return (
        App()
        .style(height="100vh")  # cap to the viewport (inner regions scroll); color/bg/tokens come from THEME_CSS
        .bind_root_class("wa-dark", "dark")  # one boolean field re-themes the shell + WebAwesome page-wide
        .child(header())
        .child(
            Body()
            .child(Main().style(padding="0").child(blotter))
            .child(Gutter(width="340px").style(overflow_y="auto").child(controls()))  # a tall form scrolls in the gutter
        )
        .child(Footer().child(element("span").text("spaday × csp-gateway pattern — form → REST · live Perspective (Mode B) · no transports")))
    )


# No hand-written HTML: serve() generates the bootstrap (WebAwesome + Perspective package, the seeded
# signal store the controls bind to, and the clear-blotter NamedJs handler module) and mounts `page`.
app = serve(
    page,
    routes=[
        Route("/api/send/orders", send_order, methods=["POST"]),
        Route("/api/clear", clear_orders, methods=["POST"]),
        WebSocketRoute("/perspective", psp_data),
    ],
    bundles=["webawesome"],
    packages=["perspective"],
    store={"symbol": "AAPL", "side": "buy", "qty": 100, "price": 100.0, "dark": True, "view": "blotter"},
    scripts=["/js/dist/cdn/examples/gateway.js"],
    head=THEME_CSS,
    title="spaday gateway",
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8006)
