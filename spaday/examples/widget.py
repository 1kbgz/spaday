"""Render a WebAwesome UI in a notebook (or Panel) with no server — see :class:`spaday.widget.Widget`.

In a Jupyter cell::

    from spaday.examples.widget import demo
    w = demo(); w          # the cell renders the spaday tree, WebAwesome and all

Click **Toggle panel**: the callout shows/hides *client-side* — the action DSL runs in the browser, no
kernel round-trip. Flip **Reveal advanced**: a one-way `bind` drives a second callout. Click **Ping
Python**: a ``SendPatch`` intent rides the widget model back to the kernel, where ``on_intent`` prints
it (the browser → Python edge). ``w.update(build(...))`` re-syncs the tree and the browser applies a
minimal DOM patch.

The same widget renders in Panel (it bridges anywidgets)::

    import panel as pn; pn.extension()
    pn.panel(demo())
"""

from spaday import Component, SendPatch, Toggle, bind, by_id, element, lit, not_
from spaday.components.shell import Row, Stack
from spaday.components.webawesome import WaButton, WaCallout, WaCard, WaSwitch
from spaday.widget import Widget


def build(message: str = "I'm a panel — the button flips my `hidden` property, in the browser.") -> Component:
    """The demo tree: WebAwesome controls carrying client-side actions + a Python-bound SendPatch."""
    return WaCard(appearance="outlined").child(
        Stack()
        .child(element("strong").text("spaday in a notebook — WebAwesome, behavior in the browser"))
        .child(
            Row()
            .child(WaButton(variant="brand").text("Toggle panel").on("click", Toggle(by_id("panel"), "hidden")))
            .child(WaButton(variant="neutral").text("Ping Python").on("click", SendPatch("demo", "ping", lit(True))))
        )
        .child(bind(WaSwitch().text("Reveal advanced"), by_id("advanced"), "hidden", transform=not_))
        .child(WaCallout(variant="neutral").prop("id", "panel").text(message))
        .child(
            WaCallout(variant="brand")
            .prop("id", "advanced")
            .prop("hidden", True)
            .text("Advanced — revealed by the switch (a one-way bind, client-side).")
        )
    )


def demo() -> Widget:
    """A ready-to-display `Widget`; intents from the browser are printed via `on_intent`."""
    widget = Widget(build())
    widget.on_intent(lambda content: print("intent from browser:", content))
    return widget
