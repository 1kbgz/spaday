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

from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from ..component import Child, Component, element
from .webawesome import WaTab, WaTabPanel

__all__ = ["App", "AppShell", "Region", "Nav", "Body", "Gutter", "Main", "Footer", "Column", "Stack", "Row", "Toolbar", "Show", "Tabs", "Table"]


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


class Region(str, Enum):
    """A named insertion point in an :class:`AppShell`."""

    HEADER_LEFT = "header-left"
    HEADER_RIGHT = "header-right"
    GUTTER_LEFT = "gutter-left"
    MAIN = "main"
    GUTTER_RIGHT = "gutter-right"
    FOOTER_LEFT = "footer-left"
    FOOTER_RIGHT = "footer-right"


class AppShell:
    """Compose the ``App(Nav / Body(Gutter, Main, Gutter) / Footer)`` shell from ordered, named-region
    contributions — so independent pieces of an app (or plugins) inject into the frame without
    re-implementing the compose/ordering logic::

        shell = AppShell()
        shell.add(Region.HEADER_LEFT, "My app")
        shell.add(Region.MAIN, chart)
        shell.add(Region.HEADER_RIGHT, theme_toggle, order=10)
        app = shell.build()

    Within a region, contributions sort by ``order`` (lower first; ties keep insertion order).
    ``HEADER_RIGHT`` / ``FOOTER_RIGHT`` are right-aligned; a Nav / Gutter / Footer is only emitted when
    its regions have contributions (``Main`` is always present).
    """

    def __init__(self) -> None:
        self._items: Dict[Region, List[Tuple[float, int, Child]]] = {region: [] for region in Region}
        self._count = 0  # insertion sequence, so equal orders keep add() order

    def add(self, region: Region, *components: Child, order: float = 0) -> "AppShell":
        """Contribute ``components`` to ``region`` at ``order``; returns ``self`` for chaining."""
        for component in components:
            self._items[Region(region)].append((order, self._count, component))
            self._count += 1
        return self

    def _in(self, region: Region) -> List[Child]:
        return [c for _, _, c in sorted(self._items[region], key=lambda item: (item[0], item[1]))]

    @staticmethod
    def _sides(left: List[Child], right: List[Child]) -> List[Child]:
        """Left items, then right items pushed to the far edge (a flex spacer between)."""
        return [*left, element("div", style="flex:1"), *right] if right else list(left)

    def build(self) -> App:
        """The composed ``App`` tree (call again after further ``add``\\s for an updated tree)."""
        children: List[Component] = []
        header = self._sides(self._in(Region.HEADER_LEFT), self._in(Region.HEADER_RIGHT))
        if header:
            children.append(Nav(*header))
        body: List[Component] = []
        gutter_left = self._in(Region.GUTTER_LEFT)
        if gutter_left:
            body.append(Gutter(*gutter_left))
        body.append(Main(*self._in(Region.MAIN)))
        gutter_right = self._in(Region.GUTTER_RIGHT)
        if gutter_right:
            body.append(Gutter(*gutter_right))
        children.append(Body(*body))
        footer = self._sides(self._in(Region.FOOTER_LEFT), self._in(Region.FOOTER_RIGHT))
        if footer:
            children.append(Footer(Row(*footer)))  # the footer itself isn't flex; Row lays the strip out
        return App(*children)


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


class Table(Component):
    """A lightweight data table — a ``spa-table`` that renders ``rows`` (a list of dicts) under
    ``columns``. Both are reactive: bind or compute ``rows`` to a state field and the table re-renders::

        Table(columns=["symbol", "qty", "price"]).compute("rows", field("orders"))

    ``columns`` may be plain keys (``["symbol"]`` — the label is the key) or ``{"key": …, "label": …}``
    dicts; omit it to infer the columns from the first row. Pass ``rows`` for a static table. (For virtual
    scrolling / very large datasets, wrap regular-table — Phase 7.)
    """

    tag = "spa-table"

    def __init__(self, *, columns: Optional[list] = None, rows: Optional[list] = None, key: Optional[str] = None, **props: Any) -> None:
        super().__init__(key=key, props={"columns": columns, "rows": rows}, **props)
