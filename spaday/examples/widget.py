"""Render a spaday UI in a notebook (or Panel) with no server — see :class:`spaday.widget.Widget`.

In a Jupyter cell::

    from spaday.examples.widget import demo
    w = demo(); w          # the cell renders the spaday tree

Click **Toggle panel**: the panel shows/hides *client-side* — the action DSL runs in the browser, no
kernel round-trip. Click **Ping Python**: a ``SendPatch`` intent rides the widget model back to the
kernel, where ``on_intent`` prints it (the browser → Python edge). ``w.update(build(...))`` re-syncs
the tree and the browser applies a minimal DOM patch.

The same widget renders in Panel (it bridges anywidgets)::

    import panel as pn; pn.extension()
    pn.panel(demo())

This demo uses raw elements + the ``spa-*`` shell, which the widget bundle defines on its own. To use
WebAwesome (``wa-*``) controls in a notebook, load WebAwesome in the page too (a follow-up is to
bundle it into the widget).
"""

from spaday import Component, SendPatch, Toggle, by_id, element, lit
from spaday.components.shell import Row, Stack
from spaday.widget import Widget


def build(message: str = "I'm a panel — the button flips my `hidden` property in the browser.") -> Component:
    """The demo tree: a client-side Toggle and a Python-bound SendPatch over a small shell layout."""
    return (
        Stack()
        .child(element("strong").text("spaday in a notebook — behavior runs in the browser"))
        .child(
            Row()
            .child(element("button").text("Toggle panel").on("click", Toggle(by_id("panel"), "hidden")))
            .child(element("button").text("Ping Python").on("click", SendPatch("demo", "ping", lit(True))))
        )
        .child(element("p").prop("id", "panel").text(message))
    )


def demo() -> Widget:
    """A ready-to-display `Widget`; intents from the browser are printed via `on_intent`."""
    widget = Widget(build())
    widget.on_intent(lambda content: print("intent from browser:", content))
    return widget
