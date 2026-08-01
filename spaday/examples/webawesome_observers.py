"""Use includes, browser observers, and an embedded zoomable frame.

Run ``python -m spaday.examples.webawesome_observers`` and open http://127.0.0.1:8014.
"""

from spaday import Sequence, SetProp, Toggle, ToggleField, by_id, cond, element, field
from spaday.components.shell import App, Body, Column, Main, Nav, Toolbar
from spaday.components.webawesome import (
    WaButton,
    WaCallout,
    WaInclude,
    WaIntersectionObserver,
    WaMutationObserver,
    WaResizeObserver,
    WaZoomableFrame,
)

STYLE = """<style>
body { margin: 0; font-family: system-ui, sans-serif; }
.observer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); gap: 1rem; }
.observer-box { box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: .6rem; padding: 1rem; min-height: 10rem; }
#resize-target { width: 70%; transition: width .2s; }
#resize-target.resize-wide { width: 100%; }
.visible { outline: 3px solid #22c55e; }
</style>"""


def build_page() -> App:
    """Return a browser-utility page whose behavior stays inside custom elements."""
    mutation_target = element("div", id="mutation-target", class_="observer-box").child(
        element("strong").text("Mutation target"),
        element("p").text("Toggle hidden or replace the inline style to emit observer records."),
    )
    mutation = WaMutationObserver(attr="class,hidden,style", attr_old_value=True, child_list=True).child(mutation_target)

    resize_target = (
        element(
            "div",
            id="resize-target",
            class_="observer-box",
        )
        .child(
            element("strong").text("Resize target"),
            element("p", id="resize-status").text("Use the button to alternate between 70% and 100% width."),
        )
        .compute("className", cond(field("resize_wide"), "observer-box resize-wide", "observer-box"))
    )
    resize = (
        WaResizeObserver()
        .child(resize_target)
        .on(
            "wa-resize",
            SetProp(by_id("resize-status"), "textContent", "ResizeObserver emitted wa-resize."),
        )
    )

    intersection = WaIntersectionObserver(intersect_class="visible", threshold="0.5", once=True).child(
        element("div", class_="observer-box").child(
            element("strong").text("Intersection target"),
            element("p").text("Scroll this card into view; the observer adds the visible class once."),
        )
    )

    frame = WaZoomableFrame(
        srcdoc=(
            "<!doctype html><html><body style='box-sizing:border-box;font-family:system-ui;margin:0;"
            "padding:2rem;min-width:900px;min-height:600px;background:#f8fafc'>"
            "<h1>Embedded report</h1><p>Use the frame controls to zoom, then drag to pan around this larger canvas.</p>"
            "<svg width='800' height='400' viewBox='0 0 800 400'>"
            "<rect width='800' height='400' rx='24' fill='#dbeafe'/>"
            "<circle cx='190' cy='200' r='110' fill='#2563eb'/><circle cx='480' cy='200' r='150' fill='#7c3aed'/>"
            "<path d='M80 340 L720 340' stroke='#0f172a' stroke-width='12'/></svg>"
            "</body></html>"
        ),
        zoom=1,
        zoom_levels="0.5 0.75 1 1.25 1.5 2",
        with_theme_sync=True,
    ).style(height="28rem")

    controls = Toolbar(
        WaButton(appearance="outlined").text("Toggle target").on("click", Toggle(by_id("mutation-target"), "hidden")),
        WaButton(appearance="outlined")
        .text("Resize target")
        .on(
            "click",
            Sequence(
                ToggleField("resize_wide"),
                SetProp(by_id("resize-status"), "textContent", "Waiting for ResizeObserver…"),
            ),
        ),
    )

    return App(
        Nav(element("strong").text("Browser utility components")),
        Body(
            Main(
                Column(
                    WaCallout(variant="neutral").child(
                        element("strong").text("Server-provided partial"),
                        WaInclude(src="/partial.html", mode="same-origin"),
                    ),
                    controls,
                    Column(mutation, resize, intersection, class_="observer-grid"),
                    element("h2").text("Zoomable embedded content"),
                    frame,
                    gap="1rem",
                )
            )
        ),
    )


def create_app():
    """Create the optional Starlette app used by the runnable example."""
    from starlette.responses import HTMLResponse
    from starlette.routing import Route

    from spaday.backends.starlette import serve

    async def partial(_request):
        return HTMLResponse("<p>This reusable HTML fragment was fetched from <code>/partial.html</code>.</p>")

    return serve(
        build_page,
        bundles=["webawesome"],
        store={"resize_wide": False},
        routes=[Route("/partial.html", partial)],
        title="spaday — browser observers",
        head=STYLE,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8014)
