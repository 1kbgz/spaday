"""Generic controls and the designs that render them.

::

    from spaday.ui import Button, TextInput, Select, Dialog

    page = Column(
        TextInput(label="Name").bind("value", "name", mode="two-way"),
        Select(label="Plan", options=["basic", "plus"]).bind("value", "plan", mode="two-way"),
        Button(label="Save", intent="primary").on("click", SetField("saved", True)),
    )
    serve(page, packages=["webawesome"])   # rendered with WebAwesome's design
    serve(page)                            # rendered with the native baseline

See :mod:`spaday.ui.controls` for the vocabulary and :mod:`spaday.ui.design` for how a design
describes its elements.
"""

from .controls import APPEARANCES, CONTROLS, INTENTS, SIZES, Button, Checkbox, Control, Dialog, Select, Switch, TextInput
from .design import ControlSpec, Design, Open, Options, Part, Value, Wrap, resolve, select_design
from .native import NATIVE

__all__ = [
    "APPEARANCES",
    "CONTROLS",
    "INTENTS",
    "NATIVE",
    "SIZES",
    "Button",
    "Checkbox",
    "Control",
    "ControlSpec",
    "Design",
    "Dialog",
    "Open",
    "Options",
    "Part",
    "Select",
    "Switch",
    "TextInput",
    "Value",
    "Wrap",
    "resolve",
    "select_design",
]
