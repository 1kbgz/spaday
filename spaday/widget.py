"""spaday as an anywidget: render a component tree in Jupyter (and the wider anywidget ecosystem).

`Widget(tree)` hosts a spaday component tree in any anywidget host — Jupyter (Lab/Notebook/Colab/VS
Code), Marimo, Shiny-for-Python, Solara, Panel — so a spaday UI drops into a notebook cell or a Panel
app with no server. The component tree rides the widget's model (`_tree`); the JS half
(`extension/cdn/widget.js`) inlines the spaday runtime and its wasm core, so it mounts core and native
web components with no extra script. Behavior authored in Python (the action DSL) runs client-side with
no kernel round-trip; a `SendPatch` action's intent is delivered back to Python via `on_intent`.

`update(tree)` re-syncs the tree, and the browser applies a minimal `diff`/`applyPatch` — the same
core used over a transports wire — so a changed tree patches the live DOM rather than re-rendering.

Pass `state=` for a local traitlets dictionary, or `session=` and `wires=` to bind hosted transports
models through the widget comm. Each displayed view gets its own transports client, including binary
buffers, validated edits, ownership, and commands. The modes are mutually exclusive.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any

import anywidget
import traitlets

from .bootstrap import Wire
from .component import Component
from .packages import PackageRef, resolve_component_packages
from .ui.design import Design, resolve, select_design

if TYPE_CHECKING:
    from transports import Server, Session

_EXT = Path(__file__).parent / "extension"
_ESM = _EXT / "cdn" / "widget.js"

Tree = Component | dict


def _to_node(tree: Tree, design: Design | str | None) -> dict:
    return resolve(tree.to_node() if isinstance(tree, Component) else tree, select_design(design))


class Widget(anywidget.AnyWidget):
    """An anywidget that renders a spaday component tree; `update()` re-syncs it incrementally."""

    _esm = _ESM
    _tree = traitlets.Dict().tag(sync=True)
    # the reactive data model the tree's bindings read/write; synced both ways over the comm, so a
    # two-way-bound control updates Python here, and a Python-side change updates the bound props.
    _state = traitlets.Dict().tag(sync=True)
    _wires = traitlets.List().tag(sync=True)
    _packages = traitlets.List().tag(sync=True)

    def __init__(
        self,
        tree: Tree,
        state: dict | None = None,
        *,
        design: Design | str | None = None,
        packages: PackageRef | Sequence[PackageRef] = (),
        session: Session | Server | None = None,
        wires: Sequence[Wire | Mapping] | None = None,
        autosync: bool = True,
        **kwargs: Any,
    ) -> None:
        self._channel = None
        self._stop_sync = None
        self._server = None
        self._bundles = {}
        if session is not None and state is not None:
            raise ValueError("Widget state and session are mutually exclusive")
        if session is None and wires is not None:
            raise ValueError("Widget wires require a session")
        if not isinstance(autosync, bool):
            raise ValueError("Widget autosync must be a boolean")
        specs = []
        if session is not None:
            from .widget_transport import notebook_wires, server_for

            specs = notebook_wires(wires)
            self._server = server_for(session)
        self._autosync = autosync
        selected = resolve_component_packages(packages)
        resolved_design = select_design(design, selected)
        if selected:
            from .widget_packages import bundle_package

            for package in selected:
                bundle = bundle_package(package)
                self._bundles[bundle.descriptor["id"]] = bundle
        super().__init__(**kwargs)
        self._design = resolved_design
        self._tree = _to_node(tree, resolved_design)
        self._state = dict(state or {})
        self._wires = specs
        self._packages = [bundle.descriptor for bundle in self._bundles.values()]
        self._intent_handlers: list[Callable[[dict], None]] = []
        self.on_msg(self._on_msg)
        if self._server is not None:
            from .widget_transport import WidgetChannel

            self._channel = WidgetChannel(self, self._server, specs[0]["codec"])

    @property
    def server(self) -> Server | None:
        """The transports Server for this widget, or None in state mode."""
        return self._server

    def close(self) -> None:
        channel = getattr(self, "_channel", None)
        if channel is not None:
            channel.close()
            self._channel = None
        stop_sync = getattr(self, "_stop_sync", None)
        if stop_sync is not None:
            stop_sync()
            self._stop_sync = None
        self.on_msg(self._on_msg, remove=True)
        self._bundles.clear()
        super().close()

    def update(self, tree: Tree) -> None:
        """Replace the rendered tree; the browser applies a minimal diff to the live DOM."""
        self._tree = _to_node(tree, self._design)

    @property
    def state(self) -> dict:
        """The reactive data model backing the tree's bindings. Assign it to drive bound props from
        Python; a two-way-bound control updates it from the browser. Use ``on_state`` to react."""
        if self._server is not None:
            raise ValueError("Widget state is unavailable in session mode; read the hosted model")
        return self._state

    @state.setter
    def state(self, value: dict) -> None:
        if self._server is not None:
            raise ValueError("Widget state is unavailable in session mode; update the hosted model")
        self._state = dict(value)

    def on_state(self, handler: Callable[[dict], None]) -> None:
        """Register a handler called with the new state dict whenever it changes (incl. from a control)."""
        if self._server is not None:
            raise ValueError("Widget on_state is unavailable in session mode; observe the transports session")
        self.observe(lambda change: handler(change["new"]), names="_state")

    def on_intent(self, handler: Callable[[dict], None]) -> None:
        """Register a handler for frontend intents — a `SendPatch` action's ``{type, detail}``."""
        self._intent_handlers.append(handler)

    def _on_msg(self, _widget: Any, content: Any, _buffers: Any) -> None:
        if isinstance(content, dict) and content.get("type") == "spaday:assets":
            request = content.get("request")
            package_id = content.get("package")
            if not isinstance(request, str) or not isinstance(package_id, str):
                return
            bundle = self._bundles.get(package_id)
            if bundle is None:
                self.send({"type": "spaday:assets", "request": request, "error": "Package is not selected by this widget"})
            else:
                self.send({"type": "spaday:assets", "request": request, "files": bundle.files}, buffers=[bundle.data])
            return
        if isinstance(content, dict) and content.get("ready") and self._server is not None and self._autosync and self._stop_sync is None:
            try:
                asyncio.get_running_loop()
            except RuntimeError:
                pass  # Synchronous hosts use transports.sync(widget.server).
            else:
                from .widget_transport import start_sync

                self._stop_sync = start_sync(self._server)
        # Only the action DSL's intents (a `SendPatch`'s `spaday:patch`) reach handlers — not arbitrary
        # frontend/host custom messages that may share this channel.
        if isinstance(content, dict) and content.get("type") == "spaday:patch":
            for handler in self._intent_handlers:
                handler(content)
