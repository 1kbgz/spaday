"""Smart-home device panel in a notebook — switches two-way-bound to device state, no server.

The reactive engine end-to-end inside the anywidget host: each device's switch is `.bind`-ed two-way to
a field of the widget's `_state`, so flipping it in the browser updates Python — and a Python-side
``widget.state = {...}`` updates the switches. The runtime's signal `Store` is backed by the synced
`_state` model (the notebook counterpart to backing it from a transports session).

In a Jupyter cell::

    from spaday.examples.devices import demo
    w = demo(); w                # a panel of device switches

Flip a switch: the card updates *client-side* and `_state` syncs to Python, where `on_state` prints it.
Drive it the other way from Python::

    w.state = {**w.state, "Kitchen": True}   # the Kitchen switch turns on in the browser

This is the tadaima scenario (device cards, client-side toggles, state synced to a backend) — here the
backend is just the kernel.
"""

from spaday import Component, element
from spaday.components.shell import Row, Stack
from spaday.components.webawesome import WaCard, WaSwitch
from spaday.widget import Widget

DEVICES = {"Living room": True, "Kitchen": False, "Bedroom": False, "Garage": False}


def panel(devices: dict) -> Component:
    """A card per device; each switch is two-way-bound to its `_state` field by name."""
    cards = Stack()
    for name in devices:
        cards = cards.child(
            WaCard(appearance="outlined").child(
                Row().child(element("strong").text(name)).child(WaSwitch().prop("style", "margin-left:auto").bind("checked", name, mode="two-way"))
            )
        )
    return cards


def demo() -> Widget:
    """A ready-to-display device panel; UI-driven state changes are printed via `on_state`."""
    widget = Widget(panel(DEVICES), state=dict(DEVICES))
    widget.on_state(lambda state: print("devices:", state))
    return widget
