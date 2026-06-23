"""spaday as an anywidget: render a component tree in Jupyter (and the wider anywidget ecosystem).

`Widget(tree)` hosts a spaday component tree in any anywidget host — Jupyter (Lab/Notebook/Colab/VS
Code), Marimo, Shiny-for-Python, Solara, Panel — so a spaday UI drops into a notebook cell or a Panel
app with no server. The component tree rides the widget's model (`_tree`); the JS half
(`extension/cdn/widget.webawesome.js`) inlines the spaday runtime *and* its wasm core and registers the
full WebAwesome catalog, so it mounts the tree and renders `wa-*` controls in the notebook with no extra
script and nothing else to load. Behavior authored in Python (the action DSL) runs client-side with no
kernel round-trip; a `SendPatch` action's intent is delivered back to Python via `on_intent`.

`update(tree)` re-syncs the tree, and the browser applies a minimal `diff`/`applyPatch` — the same
core used over a transports wire — so a changed tree patches the live DOM rather than re-rendering.

The anywidget model is the sync channel here, in the role transports' comm adapter plays for a
transports-hosted domain model: use this `Widget` to render a spaday tree directly; use a transports
`Session` over the comm (`transports.serve_comm`) when the data is a transports model the tree reads.
"""

from pathlib import Path
from typing import Any, Callable, List, Optional, Union

import anywidget
import traitlets

from .component import Component

_EXT = Path(__file__).parent / "extension"
# the WebAwesome-inclusive bundle: every wa-* element is statically registered, so the default catalog
# renders in a notebook with no extra script (the lean `widget.js` is for hosts that load WA themselves).
_ESM = _EXT / "cdn" / "widget.webawesome.js"
_CSS = _EXT / "css" / "webawesome.css"  # WebAwesome's base + theme tokens (import chain resolved)

Tree = Union[Component, dict]


def _to_node(tree: Tree) -> dict:
    return tree.to_node() if isinstance(tree, Component) else tree


class Widget(anywidget.AnyWidget):
    """An anywidget that renders a spaday component tree; `update()` re-syncs it incrementally."""

    _esm = _ESM
    _css = _CSS  # WebAwesome base + theme tokens, injected into the host page
    _tree = traitlets.Dict().tag(sync=True)
    # the reactive data model the tree's bindings read/write; synced both ways over the comm, so a
    # two-way-bound control updates Python here, and a Python-side change updates the bound props.
    _state = traitlets.Dict().tag(sync=True)

    def __init__(self, tree: Tree, state: Optional[dict] = None, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._tree = _to_node(tree)
        self._state = dict(state or {})
        self._intent_handlers: List[Callable[[dict], None]] = []
        self.on_msg(self._on_msg)

    def update(self, tree: Tree) -> None:
        """Replace the rendered tree; the browser applies a minimal diff to the live DOM."""
        self._tree = _to_node(tree)

    @property
    def state(self) -> dict:
        """The reactive data model backing the tree's bindings. Assign it to drive bound props from
        Python; a two-way-bound control updates it from the browser. Use ``on_state`` to react."""
        return self._state

    @state.setter
    def state(self, value: dict) -> None:
        self._state = dict(value)

    def on_state(self, handler: Callable[[dict], None]) -> None:
        """Register a handler called with the new state dict whenever it changes (incl. from a control)."""
        self.observe(lambda change: handler(change["new"]), names="_state")

    def on_intent(self, handler: Callable[[dict], None]) -> None:
        """Register a handler for frontend intents — a `SendPatch` action's ``{type, detail}``."""
        self._intent_handlers.append(handler)

    def _on_msg(self, _widget: Any, content: Any, _buffers: Any) -> None:
        # Only the action DSL's intents (a `SendPatch`'s `spaday:patch`) reach handlers — not arbitrary
        # frontend/host custom messages that may share this channel.
        if isinstance(content, dict) and content.get("type") == "spaday:patch":
            for handler in self._intent_handlers:
                handler(content)
