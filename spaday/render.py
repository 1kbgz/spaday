"""Server-side rendering: a spaday component tree → an HTML string for fast first paint.

:func:`render_html` emits the tree's **light DOM** — tags, scalar props as attributes, text, and
slotted children — so the page shows structured content immediately. The browser then *hydrates* it
(``hydrate(container, tree, store)`` in the JS runtime): the web components upgrade and render their own
shadow DOM client-side, and the runtime **adopts** the existing elements — attaching event handlers and
reactive bindings and setting non-attribute props — instead of rebuilding the tree. So there is no flash
and no double render.

What is intentionally *not* rendered here:

- **Web-component shadow DOM.** This is light-DOM SSR; the elements' internals render on upgrade in the
  browser (full Declarative-Shadow-DOM SSR would need the component library running server-side).
- **Events / bindings.** Attached on hydrate, not present in the HTML.
- **Complex props** (lists / maps, e.g. a chart's ``data``) — can't be attributes; set on hydrate.
- **``spa-show`` children** — structural reactivity is client-side, so the element renders empty and its
  subtree is mounted during hydrate.
"""

import html
from typing import Any

from .component import DEFAULT_SLOT, Component

#: Raw-HTML void elements (no close tag). Web components are never void.
_VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def render_html(tree: Component | dict) -> str:
    """Render a component (or an already-built node dict) to a light-DOM HTML string for hydration."""
    return _render(tree.to_node() if isinstance(tree, Component) else tree, None)


def _render(node: dict, slot: str) -> str:
    tag = node["tag"]
    attrs = ""
    if slot and slot != DEFAULT_SLOT:
        attrs += f' slot="{html.escape(slot, quote=True)}"'  # structural slot position → the slot attribute
    text = None
    for name, tagged in node.get("props", {}).items():
        value = _untag(tagged)
        if name == "textContent":
            text = value
            continue
        attrs += _attr(name, value)
    open_close = f"<{tag}{attrs}>"
    if tag in _VOID:
        return open_close
    inner = ""
    if text is not None:
        inner = html.escape(str(text))
    elif tag != "spa-show":  # spa-show children are mounted client-side during hydrate
        for slot_name, children in node.get("slots", {}).items():
            for child in children:
                inner += _render(child, slot_name)
    return f"{open_close}{inner}</{tag}>"


def _attr(name: str, value: Any) -> str:
    """One prop → its HTML attribute string (``""`` to omit). Complex values are set client-side."""
    if value is None or isinstance(value, (list, dict)):
        return ""
    if value is True:
        return f" {name}"  # boolean attribute present
    if value is False:
        return ""
    return f' {name}="{html.escape(str(value), quote=True)}"'


def _untag(tagged: Any) -> Any:
    """Decode the core's externally-tagged ``Value`` back to a plain Python value (inverse of ``_tag``)."""
    if tagged == "Null":
        return None
    if isinstance(tagged, dict):
        for key in ("Bool", "Int", "Float", "Str"):
            if key in tagged:
                return tagged[key]
        if "List" in tagged:
            return [_untag(v) for v in tagged["List"]]
        if "Map" in tagged:
            return {k: _untag(v) for k, v in tagged["Map"].items()}
    return tagged
