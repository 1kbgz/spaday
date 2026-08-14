"""Show loading, progress, status, and contextual feedback with WebAwesome.

Run ``python -m spaday.examples.webawesome_feedback`` and open http://127.0.0.1:8012.
"""

from spaday_webawesome import (
    Tabs,
    WaAnimation,
    WaAvatar,
    WaBadge,
    WaButton,
    WaCallout,
    WaIcon,
    WaPopup,
    WaProgressBar,
    WaProgressRing,
    WaSkeleton,
    WaSpinner,
    WaTag,
)

from spaday import Emit, SetField, ToggleField, element
from spaday.components.shell import AppShell, Column, Region, Row, Show, Toolbar

STYLE = """<style>
body { margin: 0; font-family: system-ui, sans-serif; }
.feedback-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: 1rem; }
.status-card { border: 1px solid var(--wa-color-neutral-border-normal); border-radius: .6rem; padding: 1rem; }
</style>"""


def build_page():
    """Return a status center driven by a local reactive store."""
    loading = Column(
        element("h2").text("Loading states"),
        Row(WaSpinner(), "Refreshing account data"),
        WaProgressBar(label="Import progress").bind("value", "progress"),
        Row(WaProgressRing(label="Import progress").bind("value", "progress"), element("span").bind("textContent", "progress")),
        Show(
            Column(
                WaSkeleton(effect="sheen").style(height="1.2rem"),
                WaSkeleton(effect="pulse").style(height="4rem"),
            ),
            field="busy",
        ),
        Toolbar(
            WaButton().text("Toggle loading").on("click", ToggleField("busy")),
            WaButton().text("Finish").on("click", SetField("progress", 100)),
        ),
        class_="status-card",
        gap="0.75rem",
    )

    notices = Column(
        element("h2").text("Status and notices"),
        WaCallout(variant="success").text("Deployment completed successfully."),
        WaCallout(variant="warning").text("Two API tokens expire this week."),
        Row(
            WaBadge(variant="danger", pill=True, attention="pulse").text("3"),
            WaTag(variant="brand", with_remove=True).text("production"),
            WaTag(variant="neutral").text("eu-west"),
        ),
        WaButton(appearance="outlined").text("Emit status event").on("click", Emit("status-requested", {"source": "feedback-example"})),
        class_="status-card",
        gap="0.75rem",
    )

    people = Column(
        element("h2").text("People and motion"),
        Row(
            WaAvatar(initials="AL", label="Ada Lovelace"),
            Column(element("strong").text("Ada Lovelace"), Row("Online", WaBadge(variant="success").text("active"))),
        ),
        WaAnimation(name="bounce", play=True, duration=900, iterations=2).child(
            WaIcon(name="bell", label="Notification bell").style(font_size="2rem")
        ),
        WaPopup(active=True, placement="bottom", arrow=True)
        .child_in("anchor", WaButton(appearance="outlined").text("Anchored status"))
        .child(WaCallout(variant="neutral").text("This low-level popup stays positioned beside its anchor.")),
        class_="status-card",
        gap="0.75rem",
    )

    tabs = (
        Tabs(active="live")
        .tab("Live", Column(loading, notices, people, class_="feedback-grid"), name="live")
        .tab(
            "Empty state",
            WaCallout(variant="neutral").child(
                WaIcon(name="inbox", label="Empty inbox"),
                "No incidents match the current filters.",
            ),
            name="empty",
        )
    )

    return (
        AppShell()
        .add(Region.HEADER_LEFT, element("strong").text("Operations status"))
        .add(Region.HEADER_RIGHT, WaBadge(variant="success").text("All systems operational"))
        .add(Region.MAIN, tabs)
        .add(Region.FOOTER_LEFT, "Reactive feedback patterns")
        .build()
    )


def create_app():
    """Create the optional Starlette app used by the runnable example."""
    from spaday.backends.starlette import serve

    return serve(
        build_page,
        packages=["webawesome"],
        store={"busy": True, "progress": 64},
        title="spaday — status and feedback",
        head=STYLE,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8012)
