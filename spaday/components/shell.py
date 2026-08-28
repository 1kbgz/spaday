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

import math
from enum import Enum
from typing import Any

from ..actions import Expr
from ..component import Child, Component, element

__all__ = [
    "App",
    "AppShell",
    "Body",
    "Column",
    "Each",
    "Footer",
    "Gutter",
    "Main",
    "Nav",
    "Popup",
    "Lazy",
    "Region",
    "Row",
    "Show",
    "Switch",
    "Stack",
    "Table",
    "Toast",
    "Toolbar",
]


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

    def __init__(self, *children: Child, width: str | None = None, gap: str | None = None, key: str | None = None, **props: Any) -> None:
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
    HEADER_CENTER = "header-center"
    HEADER_RIGHT = "header-right"
    GUTTER_LEFT = "gutter-left"
    MAIN = "main"
    GUTTER_RIGHT = "gutter-right"
    FOOTER_LEFT = "footer-left"
    FOOTER_RIGHT = "footer-right"
    DRAWER_LEFT = "drawer-left"
    DRAWER_RIGHT = "drawer-right"
    DRAWER_BOTTOM = "drawer-bottom"
    OVERLAY = "overlay"


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
    its regions have contributions (``Main`` is always present). ``containers`` sets generic props on
    the ``MAIN`` / ``GUTTER_LEFT`` / ``GUTTER_RIGHT`` containers, e.g. full-bleed content with
    ``AppShell(containers={Region.MAIN: {"style": "padding:0;overflow:hidden"}})``.
    """

    def __init__(self, *, containers: dict[Region, dict[str, Any]] | None = None) -> None:
        self._items: dict[Region, list[tuple[float, int, Child]]] = {region: [] for region in Region}
        self._containers = {Region(region): dict(props) for region, props in (containers or {}).items()}
        self._count = 0  # insertion sequence, so equal orders keep add() order

    def add(self, region: Region, *components: Child, order: float = 0) -> "AppShell":
        """Contribute ``components`` to ``region`` at ``order``; returns ``self`` for chaining."""
        for component in components:
            self._items[Region(region)].append((order, self._count, component))
            self._count += 1
        return self

    def _in(self, region: Region) -> list[Child]:
        return [c for _, _, c in sorted(self._items[region], key=lambda item: (item[0], item[1]))]

    @staticmethod
    def _sides(left: list[Child], right: list[Child]) -> list[Child]:
        """Left items, then right items pushed to the far edge (a flex spacer between)."""
        return [*left, element("div", style="flex:1"), *right] if right else list(left)

    def build(self) -> App:
        """The composed ``App`` tree (call again after further ``add``\\s for an updated tree)."""
        children: list[Child] = []
        header_left = self._in(Region.HEADER_LEFT)
        header_center = self._in(Region.HEADER_CENTER)
        header_right = self._in(Region.HEADER_RIGHT)
        header = (
            [*header_left, element("div", style="flex:1"), *header_center, element("div", style="flex:1"), *header_right]
            if header_center
            else self._sides(header_left, header_right)
        )
        if header:
            children.append(Nav(*header))
        body: list[Component] = []
        gutter_left = self._in(Region.GUTTER_LEFT)
        if gutter_left:
            body.append(Gutter(*gutter_left, **self._containers.get(Region.GUTTER_LEFT, {})))
        body.append(Main(*self._in(Region.MAIN), **self._containers.get(Region.MAIN, {})))
        gutter_right = self._in(Region.GUTTER_RIGHT)
        if gutter_right:
            body.append(Gutter(*gutter_right, **self._containers.get(Region.GUTTER_RIGHT, {})))
        children.append(Body(*body))
        footer = self._sides(self._in(Region.FOOTER_LEFT), self._in(Region.FOOTER_RIGHT))
        if footer:
            children.append(Footer(Row(*footer)))  # the footer itself isn't flex; Row lays the strip out
        for region in (Region.DRAWER_LEFT, Region.DRAWER_RIGHT, Region.DRAWER_BOTTOM, Region.OVERLAY):
            children.extend(self._in(region))
        return App(*children)


class Column(Component):
    """A vertical group — children stacked top to bottom. ``gap`` sets the space between them; ``align``
    the cross-axis alignment. Pairs with :class:`Row`. (``Stack`` is a back-compat alias.)"""

    tag = "spa-stack"

    def __init__(self, *children: Child, gap: str | None = None, align: str | None = None, key: str | None = None, **props: Any) -> None:
        super().__init__(*children, key=key, props={"gap": gap, "align": align}, **props)


Stack = Column  # alias: `Column` pairs naturally with `Row`; `Stack` kept so existing code keeps working


class Row(Component):
    """A horizontal group. ``gap`` spaces children; ``align`` is cross-axis (default center) and
    ``justify`` is main-axis distribution."""

    tag = "spa-row"

    def __init__(
        self,
        *children: Child,
        gap: str | None = None,
        align: str | None = None,
        justify: str | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(*children, key=key, props={"gap": gap, "align": align, "justify": justify}, **props)


class Toolbar(Component):
    """A contained strip of actions/controls. ``gap`` spaces them; ``align``/``justify`` lay them out."""

    tag = "spa-toolbar"

    def __init__(
        self,
        *children: Child,
        gap: str | None = None,
        align: str | None = None,
        justify: str | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(*children, key=key, props={"gap": gap, "align": align, "justify": justify}, **props)


class Popup(Component):
    """A floating surface for context menus and other transient overlays.

    Closed it renders nothing; open it places its children at viewport coordinates (``x``, ``y``),
    clamped on-screen, and light-dismisses on an outside pointerdown or Escape (closing dispatches a
    bubbling ``spa-popup-close``). Open it with :func:`~spaday.actions.open_popup`, whose defaults
    read the pointer position off the triggering event — when the event carries no pointer
    coordinates (a ``CustomEvent``), ``x``/``y`` fall back to the last-known pointer position — and
    a bound ``contextmenu`` action suppresses the native browser menu automatically::

        menu = Popup(WaDropdown(...), id="node-menu")
        graph.on("contextmenu", open_popup(by_id("node-menu"), context_field="menu_ctx"))

    Children are ordinary components mounted with the page; wrap them in :class:`Show` keyed to a
    store field if a heavy subtree should only mount while the popup is open.
    """

    tag = "spa-popup"

    def __init__(self, *children: Child, key: str | None = None, **props: Any) -> None:
        super().__init__(*children, key=key, **props)


class Switch(Component):
    """Route between subtrees on one store field — the O(1) spelling of N ``Show`` branches.

    Exactly one case is mounted at a time; changing the field tears down the old branch and mounts
    the new one, without evaluating a predicate per case. Cases are keyed by the field's value
    (compared as strings); ``default`` renders when nothing matches::

        Switch("selected", {"a/b": card_ab, "c/d": card_cd}, default=placeholder)

    Pairs with :class:`Lazy` for large case bodies: ``Switch("selected", {p: Lazy(src=f"/card/{p}")
    for p in paths})`` keeps both the DOM and the initial tree small.
    """

    tag = "spa-switch"

    def __init__(
        self,
        field: str | Any,
        cases: dict[str, Child],
        default: Child | None = None,
        *,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(key=key, props={"style": "display:contents"}, **props)
        if isinstance(field, Expr):
            self._bindings["on"] = {"compute": field.to_dict(), "mode": "one-way"}
        else:
            self._bindings["on"] = {"field": field, "mode": "one-way"}
        for value, child in cases.items():
            self.child_in(str(value), child)
        if default is not None:
            self.child_in("default", default)


class Lazy(Component):
    """A subtree deferred to a URL, fetched when first shown — so a large branch does not ride the
    initial tree at all.

    ``src`` must return a serialized component (``tree_json(element(...))`` — any node JSON). The
    body is fetched once per URL and cached for the page; :class:`~spaday.actions.RefreshTree`
    re-fetches every loaded body from its ``src`` and swaps it only if it changed, so "defer big
    subtrees with ``Lazy``, refresh them with ``RefreshTree``" keeps deferred content current.
    Without ``when``/``field`` the fetch happens on mount; with a condition it happens when the
    condition first turns truthy. Children are the placeholder shown until the body arrives::

        Lazy(Paragraph("Loading…"), src=f"/card/{path}", when=eq(field("selected"), path))
    """

    tag = "spa-lazy"

    def __init__(
        self,
        *children: Child,
        src: str,
        field: str | None = None,
        when: Any | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(*children, key=key, props={"src": src, "style": "display:contents"}, **props)
        if field is not None:
            self._bindings["when"] = {"field": field, "mode": "one-way"}
        elif when is not None:
            if not isinstance(when, Expr):
                raise TypeError(f"Lazy when must be an Expr, got {type(when).__name__}")
            self._bindings["when"] = {"compute": when.to_dict(), "mode": "one-way"}


class Toast(Component):
    """Transient corner notifications (``spa-toast``) — the shell's surface for reporting action
    outcomes, most usefully failures.

    Notices stack in the viewport corner with a tone accent (``"info"`` / ``"success"`` /
    ``"danger"``) and auto-dismiss after ``timeout`` ms (default 5000; ``0`` keeps a toast until its
    close × is clicked). Trigger one two ways. Imperatively, :class:`~spaday.actions.Invoke` the
    element's ``notify`` method from any action chain::

        toasts = Toast(id="toasts")
        save.on("click", Invoke(by_id("toasts"), "notify", obj({"message": lit("Saved"), "tone": lit("success")})))

    Reactively, drive the bindable ``message`` prop from state — every non-empty write enqueues a
    toast, with the optional ``tone`` prop read at enqueue time (an empty message enqueues nothing).
    This is the canonical way to surface a ``CallEndpoint`` failure from its ``result=`` field::

        toasts = Toast(tone="danger", id="toasts")
        submit.on("click", CallEndpoint("POST", "/api/thing", body=..., result="submit_result"))
        # surface failures from the result field …
        toasts.compute("message", cond(field("submit_result.ok"), lit(""), field("submit_result.body")))
        # … or drive any reactive fallback UI from the same field
        page.add(Show(..., when=not_(field("submit_result.ok"))))

    **Testing note**: notices render in the element's *shadow root*, so ``innerText``/``textContent``
    on ``<spa-toast>`` are ``""`` even while toasts are visible — assert via
    ``el.shadowRoot.querySelectorAll(".toast")`` (the same pattern as ``spaday-tree`` rows). And the
    ``message`` prop is *cleared after each enqueue* (so the same text can re-notify), so reading it
    back is not a way to assert what was shown.
    """

    tag = "spa-toast"


class Show(Component):
    """Conditionally render children from a reactive store field — they are *mounted* when the condition
    is truthy and *removed* (not merely hidden) when it is falsy, so a toggle can create and destroy real
    elements client-side.

    Unlike the layout components above this is not a shadow-DOM element but a runtime **structural
    binding** (``js/src/ts/runtime.ts``); the wrapper renders ``display:contents`` and is transparent.
    Pass ``field`` for a plain store field, or ``when`` for a field-expression
    (:func:`~spaday.actions.field` / ``not_`` / ``eq`` / ``all_`` / ``any_``)::

        Show(LightweightChart(...), field="show_chart")

    A ``field`` condition requires a signal ``Store``. A computed condition may instead read the
    current ``Each`` item or a named repeater scope.
    """

    tag = "spa-show"

    def __init__(self, *children: Child, field: str | None = None, when: Any | None = None, key: str | None = None, **props: Any) -> None:
        super().__init__(*children, key=key, props={"style": "display:contents"}, **props)
        if field is not None:
            self._bindings["when"] = {"field": field, "mode": "one-way"}
        elif when is not None:
            if not isinstance(when, Expr):
                raise TypeError(f"Show when must be an Expr, got {type(when).__name__}")
            self._bindings["when"] = {"compute": when.to_dict(), "mode": "one-way"}
        else:
            raise ValueError("Show requires field= (a store field) or when= (a field-expression)")


class Each(Component):
    """Render one live component subtree per item in a reactive collection, reusing instances by key.

    ``field`` reads a global store collection. ``items`` accepts an expression, including
    :func:`~spaday.actions.item` for a nested collection. Inside ``template``, ``item()`` reads the
    current item and ``scope("name.path")`` reads a named current or ancestor repeater scope::

        Each(Row(Strong().compute("textContent", item("name"))), field="rows", key="id", scope="row")

    The first release supports one component template root and read-only item scopes. Item keys must be
    unique strings or finite numbers. Reordering preserves each live root element and its local state.
    """

    tag = "spa-each"

    def __init__(
        self,
        template: Component,
        *,
        field: str | None = None,
        items: Any | None = None,
        key: str,
        scope: str | None = None,
        **props: Any,
    ) -> None:
        if not isinstance(template, Component):
            raise TypeError("Each template must be one Component")
        if (field is None) == (items is None):
            raise ValueError("Each requires exactly one of field= or items=")
        if not isinstance(key, str) or not key:
            raise ValueError("Each key must be a non-empty item field")
        if scope is not None and (not scope or "." in scope):
            raise ValueError("Each scope must be a non-empty name without dots")
        super().__init__(template, props={"style": "display:contents", "itemKey": key, "scopeName": scope}, **props)
        if field is not None:
            self._bindings["items"] = {"field": field, "mode": "one-way"}
        else:
            try:
                expression = items.to_dict()
            except AttributeError as exc:
                raise TypeError("Each items must be an expression") from exc
            self._bindings["items"] = {"compute": expression, "mode": "one-way"}


class Table(Component):
    """A lightweight data table — a ``spa-table`` that renders ``rows`` (a list of dicts) under
    ``columns``. Both are reactive: bind or compute ``rows`` to a state field and the table re-renders::

        Table(columns=["symbol", "qty", "price"], row_key="id").compute("rows", field("orders"))

    ``columns`` may be plain keys (``["symbol"]`` — the label is the key) or ``{"key": …, "label": …}``
    dicts; omit it to infer the columns from the first row. Pass ``rows`` for a static table. A static
    cell may be a :class:`Component`; it is rendered as a normal component tree node, including its
    bindings and events. Other cell values render as text. Set ``row_key`` to a field containing a unique
    string or number; reactive row changes then reuse, update, insert, remove, and reorder existing table
    rows by that identity. For virtual scrolling or very large datasets, use a dedicated grid wrapper.
    """

    tag = "spa-table"

    def __init__(
        self,
        *,
        columns: list | None = None,
        rows: list | None = None,
        row_key: str | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        normalized_rows = None if rows is None else []
        rich_cells: list[tuple[str, Component]] = []
        identities: set[tuple[str, str | float]] = set()
        for row in rows or []:
            if row_key is not None:
                value = row.get(row_key)
                if isinstance(value, str):
                    identity = ("string", value)
                elif isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value):
                    identity = ("number", float(value))
                else:
                    raise ValueError(f"Table row_key {row_key!r} must exist and contain a string or finite number")
                if identity in identities:
                    raise ValueError(f"Table row_key {row_key!r} contains duplicate value {value!r}")
                identities.add(identity)
            normalized_row = {}
            for name, value in row.items():
                if isinstance(value, Component):
                    slot = f"cell-{len(rich_cells)}"
                    normalized_row[name] = {"__spaday_cell_slot__": slot}
                    rich_cells.append((slot, value))
                else:
                    normalized_row[name] = value
            normalized_rows.append(normalized_row)
        super().__init__(key=key, props={"columns": columns, "rowKey": row_key, "rows": normalized_rows}, **props)
        for slot, component in rich_cells:
            self.child_in(slot, component)
