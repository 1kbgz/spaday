"""High-level layout / shell components.

spaday's "higher altitude" authoring surface: compose pages from these ``spa-*`` web components instead
of building layout out of raw ``div``s. Each wraps a shadow-DOM layout primitive defined by the spaday
runtime (``js/src/ts/shell.ts``); structure comes from nesting them and spacing from
:class:`Stack` / :class:`Row` / :class:`Toolbar`::

    App(...).child(Nav(...)).child(
        Body(...).child(Gutter(...)).child(Main(...))
    ).child(Footer(...))

First cut — pure structural containers (no typed props yet). :class:`Main` is the page's content region;
a single :class:`Gutter` becomes a left or right gutter by where it sits in a
:class:`Body`. Tune spacing/surfaces with CSS custom properties (``--spa-gap``, ``--spa-gutter-width``)
via ``.prop("style", ...)``.
"""

from typing import Any, Optional

from ..component import Component

__all__ = ["App", "Nav", "Body", "Gutter", "Main", "Footer", "Stack", "Row", "Toolbar", "Show"]


class App(Component):
    """The page frame: stacks its children vertically (Nav / Body / Footer), filling the viewport."""

    tag = "spa-app"


class Nav(Component):
    """The top app bar."""

    tag = "spa-nav"


class Body(Component):
    """The middle region: lays its children out horizontally (gutters + Main)."""

    tag = "spa-body"


class Gutter(Component):
    """A sidebar; place it before or after Main in a Body to get a left or right gutter.

    ``width`` sets the gutter width (any CSS length); ``gap`` spaces its children.
    """

    tag = "spa-gutter"

    def __init__(self, *, width: Optional[str] = None, gap: Optional[str] = None, key: Optional[str] = None) -> None:
        super().__init__(key=key, props={"width": width, "gap": gap})


class Main(Component):
    """The primary content region."""

    tag = "spa-main"


class Footer(Component):
    """The bottom bar."""

    tag = "spa-footer"


class Stack(Component):
    """A vertical group. ``gap`` sets the space between children; ``align`` the cross-axis alignment."""

    tag = "spa-stack"

    def __init__(self, *, gap: Optional[str] = None, align: Optional[str] = None, key: Optional[str] = None) -> None:
        super().__init__(key=key, props={"gap": gap, "align": align})


class Row(Component):
    """A horizontal group. ``gap`` spaces children; ``align`` is cross-axis (default center) and
    ``justify`` is main-axis distribution."""

    tag = "spa-row"

    def __init__(self, *, gap: Optional[str] = None, align: Optional[str] = None, justify: Optional[str] = None, key: Optional[str] = None) -> None:
        super().__init__(key=key, props={"gap": gap, "align": align, "justify": justify})


class Toolbar(Component):
    """A contained strip of actions/controls. ``gap`` spaces them; ``align``/``justify`` lay them out."""

    tag = "spa-toolbar"

    def __init__(self, *, gap: Optional[str] = None, align: Optional[str] = None, justify: Optional[str] = None, key: Optional[str] = None) -> None:
        super().__init__(key=key, props={"gap": gap, "align": align, "justify": justify})


class Show(Component):
    """Conditionally render children from a reactive store field — they are *mounted* when the condition
    is truthy and *removed* (not merely hidden) when it is falsy, so a toggle can create and destroy real
    elements client-side.

    Unlike the layout components above this is not a shadow-DOM element but a runtime **structural
    binding** (``js/src/ts/runtime.ts``); the wrapper renders ``display:contents`` and is transparent.
    Pass ``field`` for a plain store field, or ``when`` for a field-expression
    (:func:`~spaday.actions.field` / ``not_`` / ``eq`` / ``all_`` / ``any_``)::

        Show(field="show_chart").child(LightweightChart(...))

    Active only when the tree is mounted with a signal ``Store`` (``mount(body, tree, store)``).
    """

    tag = "spa-show"

    def __init__(self, *, field: Optional[str] = None, when: Optional[Any] = None, key: Optional[str] = None) -> None:
        super().__init__(key=key, props={"style": "display:contents"})
        if field is not None:
            self._bindings["when"] = {"field": field, "mode": "one-way"}
        elif when is not None:
            self._bindings["when"] = {"compute": when.to_dict(), "mode": "one-way"}
        else:
            raise ValueError("Show requires field= (a store field) or when= (a field-expression)")
