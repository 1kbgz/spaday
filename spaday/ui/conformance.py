"""The conformance page: one page using every generic control, for checking that a design renders
them with the same behavior as the native baseline.

:func:`page` and :func:`store` build it; ``python -m spaday.ui.conformance PORT [--package NAME …]
[--design NAME]`` serves it, so a design-system package's browser tests can drive the same page
rendered with its design (spaday's own ``js/tests/ui.spec.js`` drives it with the baseline). The
page reports its store in ``#state`` as ``name|agree|dark|plan|saved|open``, so a test reads state
back from the DOM whichever elements a design used.
"""

from __future__ import annotations

import argparse

from ..actions import Sequence, SetField, concat, field
from ..component import Component, Paragraph, element
from ..components.shell import Column, Row
from .controls import Button, Checkbox, Dialog, Select, Switch, TextInput

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
        Checkbox(id="agree", label="Agree").bind("value", "agree", mode="two-way"),
        Switch(id="dark", label="Dark").bind("value", "dark", mode="two-way"),
        Select(id="plan", label="Plan", options=PLANS).bind("value", "plan", mode="two-way"),
        Button(id="open", label="Open dialog").on("click", SetField("open", True)),
        Dialog(
            Paragraph("Confirm?"),
            Button(id="close", label="Close").on("click", SetField("open", False)),
            id="dialog",
            label="Confirm",
        ).bind("open", "open", mode="two-way"),
        element("output", id="state").compute(
            "textContent",
            concat(field("name"), "|", field("agree"), "|", field("dark"), "|", field("plan"), "|", field("saved"), "|", field("open")),
        ),
        gap="1rem",
        id="conformance",
    )


def store() -> dict:
    """The store the page's bindings read and write."""
    return {"name": "", "agree": False, "dark": False, "plan": "basic", "saved": False, "open": False}


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
