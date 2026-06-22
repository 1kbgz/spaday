"""spaday as an anywidget: render a component tree in Jupyter (and the wider anywidget ecosystem).

`Widget(tree)` hosts a spaday component tree in any anywidget host — Jupyter (Lab/Notebook/Colab/VS
Code), Marimo, Shiny-for-Python, Solara, Panel — so a spaday UI drops into a notebook cell or a Panel
app with no server. The component tree rides the widget's model (`_tree`); the spaday wasm core (the
action interpreter) rides `_wasm`; the JS half (`extension/cdn/widget.js`) mounts the tree with the
spaday runtime. Behavior authored in Python (the action DSL) runs client-side with no kernel
round-trip; a `SendPatch` action's intent is delivered back to Python via `on_intent`.

`update(tree)` re-syncs the tree, and the browser applies a minimal `diff`/`applyPatch` — the same
core used over a transports wire — so a changed tree patches the live DOM rather than re-rendering.

The anywidget model is the sync channel here, in the role transports' comm adapter plays for a
transports-hosted domain model: use this `Widget` to render a spaday tree directly; use a transports
`Session` over the comm (`transports.serve_comm`) when the data is a transports model the tree reads.
"""

from pathlib import Path
from typing import Any, Callable, List, Union

import anywidget
import traitlets

from .component import Component

_EXT = Path(__file__).parent / "extension"
_ESM = _EXT / "cdn" / "widget.js"
_WASM = (_EXT / "pkg" / "spaday_bg.wasm").read_bytes()

Tree = Union[Component, dict]


def _to_node(tree: Tree) -> dict:
    return tree.to_node() if isinstance(tree, Component) else tree


class Widget(anywidget.AnyWidget):
    """An anywidget that renders a spaday component tree; `update()` re-syncs it incrementally."""

    _esm = _ESM
    # the spaday wasm core (action interpreter), shipped to the frontend as a synced byte buffer
    _wasm = traitlets.Bytes(_WASM).tag(sync=True)
    _tree = traitlets.Dict().tag(sync=True)

    def __init__(self, tree: Tree, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._tree = _to_node(tree)
        self._intent_handlers: List[Callable[[dict], None]] = []
        self.on_msg(self._on_msg)

    def update(self, tree: Tree) -> None:
        """Replace the rendered tree; the browser applies a minimal diff to the live DOM."""
        self._tree = _to_node(tree)

    def on_intent(self, handler: Callable[[dict], None]) -> None:
        """Register a handler for frontend intents — a `SendPatch` action's ``{type, detail}``."""
        self._intent_handlers.append(handler)

    def _on_msg(self, _widget: Any, content: Any, _buffers: Any) -> None:
        if isinstance(content, dict):
            for handler in self._intent_handlers:
                handler(content)
