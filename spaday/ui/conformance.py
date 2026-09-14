"""The conformance page: one page using every generic control, for checking that a design renders
them with the same behavior as the native baseline.

:func:`page` and :func:`store` build it; ``python -m spaday.ui.conformance PORT [--package NAME …]
[--design NAME]`` serves it, so a design-system package's browser tests can drive the same page
rendered with its design (spaday's own ``js/tests/ui.spec.js`` drives it with the baseline). The
The page reports its store in ``#state``, so a test reads state back from the DOM whichever elements
a design used.
"""

from __future__ import annotations

import argparse

from ..actions import Sequence, SetField, concat, field
from ..component import Component, Paragraph, element
from ..components.shell import Column, Row
from .controls import Alert, Button, Checkbox, DateInput, Dialog, NumberInput, Progress, RadioGroup, Select, Slider, Switch, TextArea, TextInput

PLANS = [{"value": "basic", "label": "Basic"}, {"value": "plus", "label": "Plus"}, {"value": "premium", "label": "Premium"}]


def page() -> Component:
    """Every generic control, wired to the store :func:`store` seeds."""
    return Column(
        Row(
            Button(id="save", label="Save", intent="primary").on("click", SetField("saved", True)),
            Button(id="reset", label="Reset", appearance="outline").on("click", Sequence(SetField("name", ""), SetField("saved", False))),
            Button(id="never", label="Disabled", disabled=True),
            gap=".5rem",
        ),
        TextInput(id="name", label="Name", help="Your name", placeholder="Ada").bind("value", "name", mode="two-way"),
        TextInput(id="email", label="Email", error="Required", type="email"),
        TextArea(id="notes", label="Notes", rows=3).bind("value", "notes", mode="two-way"),
        NumberInput(id="count", label="Count", min=0, max=10, step=1).bind("value", "count", mode="two-way"),
        DateInput(id="date", label="Date").bind("value", "date", mode="two-way"),
        Checkbox(id="agree", label="Agree").bind("value", "agree", mode="two-way"),
        Switch(id="dark", label="Dark").bind("value", "dark", mode="two-way"),
        Select(id="plan", label="Plan", options=PLANS).bind("value", "plan", mode="two-way"),
        RadioGroup(id="priority", label="Priority", options=[1, {"value": 2, "label": "High"}]).bind("value", "priority", mode="two-way"),
        Slider(id="volume", label="Volume", min=0, max=10, step=1).bind("value", "volume", mode="two-way"),
        Alert("All controls use the same generic contract.", id="alert", label="Portable", intent="info"),
        Progress(id="progress", label="Progress", max=100).bind("value", "progress"),
        Button(id="open", label="Open dialog").on("click", SetField("open", True)),
        Dialog(
            Paragraph("Confirm?"),
            Button(id="close", label="Close").on("click", SetField("open", False)),
            id="dialog",
            label="Confirm",
        ).bind("open", "open", mode="two-way"),
        element("output", id="state").compute(
            "textContent",
            concat(
                field("name"),
                "|",
                field("notes"),
                "|",
                field("count"),
                "|",
                field("date"),
                "|",
                field("agree"),
                "|",
                field("dark"),
                "|",
                field("plan"),
                "|",
                field("priority"),
                "|",
                field("volume"),
                "|",
                field("progress"),
                "|",
                field("saved"),
                "|",
                field("open"),
            ),
        ),
        gap="1rem",
        id="conformance",
    )


def store() -> dict:
    """The store the page's bindings read and write."""
    return {
        "name": "",
        "notes": "",
        "count": 2,
        "date": "2026-09-14",
        "agree": False,
        "dark": False,
        "plan": "basic",
        "priority": 1,
        "volume": 5,
        "progress": 25,
        "saved": False,
        "open": False,
    }


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Serve the generic-control conformance page.")
    parser.add_argument("port", type=int)
    parser.add_argument("--package", action="append", default=[], help="a component package to select (entry-point name or module:attribute)")
    parser.add_argument("--design", default=None, help="the design to render with (a selected package's name, or 'native')")
    args = parser.parse_args(argv)

    import uvicorn

    from ..backends.starlette import serve

    app = serve(page, packages=args.package, design=args.design, store=store(), title="spaday ui conformance")
    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="warning")


if __name__ == "__main__":
    main()
