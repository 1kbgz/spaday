"""Run a Python-owned component tree behind a browser Web Worker.

The worker transports snapshots and intents; the browser runtime owns the DOM. ``WorkerApp`` keeps
the last rendered tree and returns core-generated incremental patches after Python handles an intent.
"""

import json
from collections.abc import Callable

from .component import Component
from .spaday import diff
from .ui.design import Design, resolve, select_design

Tree = Component | dict
Intent = dict


def _node(tree: Tree, design: Design | str | None) -> dict:
    return resolve(tree.to_node() if isinstance(tree, Component) else tree, select_design(design))


class WorkerApp:
    """Adapt a render function and intent handler to spaday's worker message protocol."""

    def __init__(self, render: Callable[[], Tree], on_intent: Callable[[Intent], None], *, design: Design | str | None = None) -> None:
        self._render = render
        self._design = design  # renders the tree's generic controls (spaday.ui); None is the native baseline
        self._on_intent = on_intent
        self._tree: str | None = None

    def start(self) -> dict:
        """Render and return the initial tree snapshot message."""
        tree = _node(self._render(), self._design)
        self._tree = json.dumps(tree)
        return {"type": "snapshot", "tree": tree}

    def dispatch(self, intent: Intent) -> dict:
        """Handle one browser intent and return its incremental tree patch message."""
        if self._tree is None:
            raise RuntimeError("start() must be called before dispatch()")
        if intent.get("type") != "spaday:patch":
            raise ValueError(f"unsupported worker intent: {intent.get('type')!r}")

        old = self._tree
        self._on_intent(intent)
        self._tree = json.dumps(_node(self._render(), self._design))
        patch = json.loads(diff(old, self._tree))
        return {"type": "patch", "patch": patch}

    def start_json(self) -> str:
        """Return :meth:`start` as JSON for a JavaScript worker boundary."""
        return json.dumps(self.start())

    def dispatch_json(self, intent: str) -> str:
        """Decode a JSON intent and return :meth:`dispatch` as JSON."""
        return json.dumps(self.dispatch(json.loads(intent)))
