"""Build a local-state dashboard with shell components, a chart, and a reactive table.

Run ``python -m spaday.examples.data_dashboard`` and open http://127.0.0.1:8015.
"""

from spaday_lightweight_charts import LightweightChart
from spaday_webawesome import Tabs, WaCallout, WaOption, WaSelect, WaSwitch, WaTag

from spaday import cond, element, field
from spaday.components.shell import AppShell, Column, Region, Row, Show, Table, Toolbar

STYLE = """<style>
body { margin: 0; font-family: system-ui, sans-serif; }
lightweight-chart { display: block; width: 100%; height: 24rem; }
.metric { border: 1px solid #cbd5e1; border-radius: .6rem; padding: .75rem; }
</style>"""

ORDERS = [
    {"symbol": "AAPL", "side": "Buy", "quantity": 120, "price": 211.10},
    {"symbol": "MSFT", "side": "Sell", "quantity": 60, "price": 503.02},
    {"symbol": "NVDA", "side": "Buy", "quantity": 40, "price": 172.41},
]
SERIES = [
    {"time": "2026-07-18", "value": 102.0},
    {"time": "2026-07-19", "value": 104.5},
    {"time": "2026-07-20", "value": 103.2},
    {"time": "2026-07-21", "value": 108.8},
    {"time": "2026-07-22", "value": 110.4},
]


def build_page():
    """Return a dashboard whose chart and table are driven by local reactive state."""
    controls = Column(
        element("strong").text("Display"),
        WaSelect(label="Series type")
        .child(
            WaOption(value="line").text("Line"),
            WaOption(value="area").text("Area"),
            WaOption(value="histogram").text("Histogram"),
        )
        .bind("value", "chart_type", mode="two-way"),
        WaSwitch().text("Show chart").bind("checked", "show_chart", mode="two-way"),
        WaSwitch().text("Dark theme").bind("checked", "dark", mode="two-way"),
        gap="0.8rem",
    )

    chart = (
        LightweightChart()
        .compute("type", field("chart_type"))
        .compute("data", field("series"))
        .compute("theme", cond(field("dark"), "dark", "light"))
    )
    overview = Column(
        Row(
            Column(element("small").text("Net exposure"), element("strong").text("$1.28M"), class_="metric"),
            Column(element("small").text("Open orders"), element("strong").text("3"), class_="metric"),
            Column(element("small").text("Status"), WaTag(variant="success").text("Connected"), class_="metric"),
        ),
        Show(chart, field="show_chart"),
        gap="1rem",
    )
    blotter = Column(
        WaCallout(variant="neutral").text("Table rows are bound to the same local Store used by the chart controls."),
        Table(
            columns=[
                {"key": "symbol", "label": "Symbol"},
                {"key": "side", "label": "Side"},
                {"key": "quantity", "label": "Quantity"},
                {"key": "price", "label": "Limit price"},
            ]
        ).compute("rows", field("orders")),
        gap="1rem",
    )

    tabs = Tabs(active="overview").tab("Overview", overview).tab("Orders", blotter)
    app = (
        AppShell(
            containers={
                Region.GUTTER_LEFT: {"width": "17rem"},
                Region.MAIN: {"style": "min-width:0"},
            }
        )
        .add(Region.HEADER_LEFT, element("strong").text("Trading dashboard"))
        .add(Region.HEADER_RIGHT, WaTag(variant="success").text("Market open"))
        .add(Region.GUTTER_LEFT, controls)
        .add(Region.MAIN, tabs)
        .add(
            Region.FOOTER_LEFT,
            Toolbar(Row("Data is static; replace the local Store with transports for server-authoritative updates.")),
        )
        .build()
    )
    return app.bind_root_class("wa-dark", "dark")


def create_app():
    """Create the optional Starlette app used by the runnable example."""
    from spaday.backends.starlette import serve

    return serve(
        build_page,
        packages=["webawesome", "lightweight-charts"],
        store={
            "chart_type": "area",
            "show_chart": True,
            "dark": False,
            "orders": ORDERS,
            "series": SERIES,
        },
        title="spaday — data dashboard",
        head=STYLE,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8015)
