"""High-level layout / shell components.

spaday's "higher altitude" authoring surface: compose pages from these ``spa-*`` web components instead
of building layout out of raw ``div``s. Each wraps a shadow-DOM layout primitive defined by the spaday
runtime (``js/src/ts/shell.ts``); structure comes from nesting them and spacing from
:class:`Column` / :class:`Row` / :class:`Toolbar`::

    App(
        Nav("My app"),
        Body(Gutter(...), Main(...)),
        Footer("…"),
    )

Children nest positionally (a string child is a text node); spacing comes from :class:`Column` /
:class:`Row` / :class:`Toolbar`. :class:`Main` is the page's content region; a single :class:`Gutter`
becomes a left or right gutter by where it sits in a :class:`Body`.
"""

from typing import Any, Optional

from ..component import Child, Component
from .webawesome import WaTab, WaTabPanel

__all__ = ["App", "Nav", "Body", "Gutter", "Main", "Footer", "Column", "Stack", "Row", "Toolbar", "Show", "Tabs"]


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

    def __init__(self, *children: Child, width: Optional[str] = None, gap: Optional[str] = None, key: Optional[str] = None, **props: Any) -> None:
        super().__init__(*children, key=key, props={"width": width, "gap": gap}, **props)


class Main(Component):
    """The primary content region."""

    tag = "spa-main"


class Footer(Component):
    """The bottom bar."""

    tag = "spa-footer"


class Column(Component):
    """A vertical group — children stacked top to bottom. ``gap`` sets the space between them; ``align``
    the cross-axis alignment. Pairs with :class:`Row`. (``Stack`` is a back-compat alias.)"""

    tag = "spa-stack"

    def __init__(self, *children: Child, gap: Optional[str] = None, align: Optional[str] = None, key: Optional[str] = None, **props: Any) -> None:
        super().__init__(*children, key=key, props={"gap": gap, "align": align}, **props)


Stack = Column  # alias: `Column` pairs naturally with `Row`; `Stack` kept so existing code keeps working


class Row(Component):
    """A horizontal group. ``gap`` spaces children; ``align`` is cross-axis (default center) and
    ``justify`` is main-axis distribution."""

    tag = "spa-row"

    def __init__(
        self,
        *children: Child,
        gap: Optional[str] = None,
        align: Optional[str] = None,
        justify: Optional[str] = None,
        key: Optional[str] = None,
        **props: Any,
    ) -> None:
        super().__init__(*children, key=key, props={"gap": gap, "align": align, "justify": justify}, **props)


class Toolbar(Component):
    """A contained strip of actions/controls. ``gap`` spaces them; ``align``/``justify`` lay them out."""

    tag = "spa-toolbar"

    def __init__(
        self,
        *children: Child,
        gap: Optional[str] = None,
        align: Optional[str] = None,
        justify: Optional[str] = None,
        key: Optional[str] = None,
        **props: Any,
    ) -> None:
        super().__init__(*children, key=key, props={"gap": gap, "align": align, "justify": justify}, **props)


class Show(Component):
    """Conditionally render children from a reactive store field — they are *mounted* when the condition
    is truthy and *removed* (not merely hidden) when it is falsy, so a toggle can create and destroy real
    elements client-side.

    Unlike the layout components above this is not a shadow-DOM element but a runtime **structural
    binding** (``js/src/ts/runtime.ts``); the wrapper renders ``display:contents`` and is transparent.
    Pass ``field`` for a plain store field, or ``when`` for a field-expression
    (:func:`~spaday.actions.field` / ``not_`` / ``eq`` / ``all_`` / ``any_``)::

        Show(LightweightChart(...), field="show_chart")

    Active only when the tree is mounted with a signal ``Store`` (``mount(body, tree, store)``).
    """

    tag = "spa-show"

    def __init__(self, *children: Child, field: Optional[str] = None, when: Optional[Any] = None, key: Optional[str] = None, **props: Any) -> None:
        super().__init__(*children, key=key, props={"style": "display:contents"}, **props)
        if field is not None:
            self._bindings["when"] = {"field": field, "mode": "one-way"}
        elif when is not None:
            self._bindings["when"] = {"compute": when.to_dict(), "mode": "one-way"}
        else:
            raise ValueError("Show requires field= (a store field) or when= (a field-expression)")


def _tab_name(label: str) -> str:
    """A slug for a tab's panel name from its label (``"By symbol"`` → ``"by-symbol"``)."""
    return "-".join("".join(c if c.isalnum() else " " for c in label.lower()).split()) or "tab"


class Tabs(Component):
    """A WebAwesome ``wa-tab-group`` built ergonomically from ``(label, content)`` pairs with :meth:`tab`,
    instead of hand-pairing ``wa-tab`` headers with ``wa-tab-panel`` bodies.

    The group shows one panel at a time (WebAwesome handles the switching); the active panel is the
    ``active`` prop — a panel ``name``. **Bind it for routing-aware navigation** — a two-way binding drives
    the active tab from a state field *and* writes the user's selection back (the runtime listens for the
    group's ``wa-tab-show``)::

        Tabs().tab("Overview", overview).tab("Settings", settings).bind("active", "view", mode="two-way")

    ``name`` defaults to a slug of the label; pass it explicitly to bind against a stable value.
    """

    tag = "wa-tab-group"

    def __init__(self, *, active: Optional[str] = None, placement: Optional[str] = None, key: Optional[str] = None, **props: Any) -> None:
        super().__init__(key=key, props={"active": active, "placement": placement}, **props)

    def tab(self, label: str, *content: Child, name: Optional[str] = None) -> "Tabs":
        """Add a tab: a ``wa-tab`` header labelled ``label`` and a ``wa-tab-panel`` holding ``content``,
        linked by ``name`` (a slug of ``label`` by default)."""
        name = name or _tab_name(label)
        self.child_in("nav", WaTab(panel=name).text(label))  # tab headers live in the group's "nav" slot
        self.child(WaTabPanel(name=name).child(*content))  # panels in the default slot
        return self
