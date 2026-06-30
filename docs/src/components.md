# Author a component tree

This guide shows you how to build a spaday UI from typed components: setting props, nesting children,
laying out with shell components, and serializing the result. To attach behavior, see
[Add behavior and reactivity](behavior.md).

## Use a built-in component

WebAwesome components are generated as typed classes. Import one and set its attributes as keyword
arguments:

```python
from spaday.components.webawesome import WaButton

WaButton(variant="brand", size="large")
```

Every attribute is a typed keyword (`variant: Optional[Literal["brand", "neutral", ...]]`,
`disabled: Optional[bool]`, …), so a typo or a wrong type is an error at authoring time. A prop you
**don't** pass is omitted, so the element keeps its own default and update patches stay minimal.

To use a component library other than WebAwesome, [generate its classes from a manifest](cem.md).

## Nest children into slots

Compose a tree with `.child(...)` for the default slot and `.child_in("slot", ...)` for a named one:

```python
from spaday.components.webawesome import WaCard, WaButton, WaSwitch

WaCard().child_in("header", WaButton(variant="brand")).child(WaSwitch())
```

`.child` returns the parent, so calls chain. Children are other components (or a raw element — below).

## Set text

`.text(...)` sets a leaf's text content — use it for labels, not alongside child nodes:

```python
WaButton(variant="brand").text("Save")
```

## Lay out with shell components

spaday does not expose `div`. Compose layout from the `spa-*` shell components, which carry their own
encapsulated layout:

```python
from spaday.components.shell import App, Nav, Body, Gutter, Main, Footer, Stack, Row, Toolbar

App().child(Nav().child(...)).child(Body().child(Gutter().child(...)).child(Main().child(...)))
```

`Stack` stacks children vertically, `Row` lays them horizontally, `Toolbar` is a control strip; `App` /
`Nav` / `Body` / `Gutter` / `Main` / `Footer` are the page shell.

## Generate a form from a model

`form(Model)` turns a pydantic model into a `Stack` of labelled `wa-*` controls — one per field, typed
from the schema and each **two-way bound** to a field of the same name. An `Enum` field becomes a
`wa-select` of its members; a nested sub-model becomes an expand/collapse `wa-details` whose controls bind
to dotted `parent.child` paths:

```python
import enum
from pydantic import BaseModel
from spaday.components.form import FormField, form

class Size(str, enum.Enum):
    small = "small"
    large = "large"

class Settings(BaseModel):
    name: str = "lamp"
    enabled: bool = True
    size: Size = Size.small

form(Settings)   # a Stack of bound controls — none authored by hand
```

`form` needs pydantic — install it with the `form` extra (`pip install "spaday[form]"`); it's also pulled
in by `spaday[examples]`. The controls bind to fields named `name` / `enabled` / `size`, so back them with
a seeded [`store=`](serving.md) or a hosted model over [transports](transports.md). Relabel a field with
`FormField` (as `Annotated[int, FormField(label="…")]` metadata or via `overrides=`), and drop fields with
`exclude=`.

## Reach for a raw element

For text or a structural tag a typed class doesn't cover, use `element`:

```python
from spaday import element

element("strong").text("Settings")
element("a", href="https://example.com").text("docs")
```

A trailing underscore on a prop name is stripped, so reserved words work: `element("label", for_="x")`.

## Set a prop a typed class doesn't expose

`.prop(name, value)` is the escape hatch for an attribute the generated class doesn't have (a custom
attribute, `style`, `id`, …):

```python
WaButton().prop("id", "save").prop("style", "margin-left:auto")
```

## Key for stable updates

Give a node a stable `key` so the diff engine reconciles it by identity across updates (so a reordered
list moves live elements instead of rebuilding them):

```python
WaSwitch().key("lamp")
```

## Serialize

`.to_node()` returns the JSON-ready node dict; `.to_json()` returns its string form. This is the wire
form the core's `diff` / `apply` understand and the runtime mounts:

```python
WaCard().child(WaSwitch()).to_node()
```

In a notebook you rarely call these directly — [`Widget`](notebook.md) does it for you; over a server
they are served as the tree the browser mounts.
