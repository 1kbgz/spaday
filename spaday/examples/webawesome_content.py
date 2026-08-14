"""Present cards, media, formatted values, and shareable content with WebAwesome.

Run ``python -m spaday.examples.webawesome_content`` and open http://127.0.0.1:8013.
"""

from spaday_webawesome import (
    WaAnimatedImage,
    WaButton,
    WaCard,
    WaCarousel,
    WaCarouselItem,
    WaComparison,
    WaCopyButton,
    WaDivider,
    WaFormatBytes,
    WaFormatDate,
    WaFormatNumber,
    WaMarkdown,
    WaQrCode,
    WaRelativeTime,
    WaScroller,
    WaSplitPanel,
)

from spaday import element
from spaday.components.shell import App, Body, Column, Main, Nav, Row

STYLE = """<style>
body { margin: 0; font-family: system-ui, sans-serif; }
.content-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr)); gap: 1rem; }
.sample { box-sizing: border-box; min-height: 10rem; display: grid; place-items: center; padding: 1rem; color: white; font-size: 1.25rem; }
</style>"""
PIXEL_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="


def build_page() -> App:
    """Return a content-rich product update page."""
    release_card = (
        WaCard(appearance="outlined", with_header=True, with_footer=True)
        .child_in("header", element("strong").text("Version 2.4 is ready"))
        .child(
            WaMarkdown().child(
                element("script", type="text/markdown").text(
                    "### Highlights\n\n- Faster workspace loading\n- Shareable reports\n- Improved keyboard navigation"
                )
            )
        )
        .child_in(
            "footer",
            Column(
                Row(
                    "Published ",
                    WaRelativeTime(date="2026-07-23T12:00:00Z", numeric="auto", sync=True),
                    gap="0.35rem",
                ),
                WaButton(variant="brand").text("Read release notes").style(align_self="flex-start"),
                gap="0.75rem",
                align="start",
            ),
        )
    )

    metrics = WaCard(appearance="filled").child(
        Column(
            element("strong").text("Monthly usage"),
            Row("Storage", WaFormatBytes(value=82_345_678, display="short"), justify="space-between"),
            Row(
                "Spend",
                WaFormatNumber(value=1482.75, type="currency", currency="USD", maximum_fraction_digits=0),
                justify="space-between",
            ),
            Row(
                "Renewal",
                WaFormatDate(date="2026-09-01T09:00:00Z", month="long", day="numeric", year="numeric"),
                justify="space-between",
            ),
            gap="0.6rem",
        )
    )

    carousel = WaCarousel(navigation=True, pagination=True, loop=True).child(
        WaCarouselItem().child(element("div", "Plan work", class_="sample", style="background:#2563eb")),
        WaCarouselItem().child(element("div", "Review changes", class_="sample", style="background:#7c3aed")),
        WaCarouselItem().child(element("div", "Ship confidently", class_="sample", style="background:#059669")),
    )

    comparison = (
        WaComparison(position=55)
        .child_in("before", element("div", "Before", class_="sample", style="background:#475569"))
        .child_in("after", element("div", "After", class_="sample", style="background:#0f766e"))
    )

    share = WaCard(appearance="outlined").child(
        Column(
            element("strong").text("Share this report"),
            Row(
                element("code", "https://example.com/reports/atlas", id="report-url"),
                WaCopyButton(from_="report-url", success_label="Copied"),
            ),
            WaQrCode(
                value="https://example.com/reports/atlas",
                label="QR code for the Atlas report",
                size=150,
                error_correction="M",
            ),
            gap="0.75rem",
            align="center",
        )
    )

    media = WaCard(appearance="outlined").child(
        Column(
            element("strong").text("Accessible motion"),
            WaAnimatedImage(src=PIXEL_GIF, alt="A tiny embedded demonstration image", play=False).style(min_height="7rem", background="#e2e8f0"),
            element("small").text("Animated images expose explicit play and pause controls."),
            gap="0.75rem",
        )
    )

    split = (
        WaSplitPanel(position=42)
        .style(height="14rem")
        .child_in("start", element("div", "Editor", class_="sample", style="height:100%;background:#1e293b"))
        .child_in("end", element("div", "Preview", class_="sample", style="height:100%;background:#334155"))
    )

    scroller = WaScroller(orientation="horizontal").child(
        Row(
            *[
                WaCard(appearance="filled")
                .style(min_width="12rem")
                .child(
                    element("strong").text(f"Template {index}"),
                    element("p").text("Reusable content in a horizontal scroller."),
                )
                for index in range(1, 6)
            ]
        )
    )

    return App(
        Nav(element("strong").text("Atlas product update")),
        Body(
            Main(
                Column(
                    Column(release_card, metrics, share, media, class_="content-grid"),
                    WaDivider(),
                    element("h2").text("Story carousel"),
                    carousel,
                    element("h2").text("Before and after"),
                    comparison,
                    element("h2").text("Resizable workspace"),
                    split,
                    element("h2").text("More templates"),
                    scroller,
                    gap="1rem",
                )
            )
        ),
    )


def create_app():
    """Create the optional Starlette app used by the runnable example."""
    from spaday.backends.starlette import serve

    return serve(
        build_page,
        packages=["webawesome"],
        title="spaday — rich content",
        head=STYLE,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8013)
