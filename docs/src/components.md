# Components

spaday binds **web components** into a tree you author in typed Python. A UI is a tree of
{py:class}`~spaday.component.Component` nodes — each a tag, props, and child slots — that serializes
to the wire form the core's `diff`/`apply` engine understands.

## Authoring a tree

Component classes are generated from a web-component library's manifest (see below). WebAwesome ships
built-in:

```python
from spaday.components.webawesome import WaCard, WaSwitch, WaButton

card = (
    WaCard(appearance="filled")
    .child_in("header", WaButton(variant="brand"))
    .child(WaSwitch(checked=True, size="large").key("lamp"))
)

card.to_json()   # the wire form for spaday.diff / spaday.apply
```

Each attribute is a typed keyword argument (`checked: Optional[bool]`, `size:
Optional[Literal["small", "medium", "large"]]`, ...). A prop you don't set is omitted, so the element
keeps its own default and patches stay minimal. Compose children with `child` / `child_in`, and set a
reconciliation key with `key`.

```{note}
This is the binding layer — structure and props. Wiring *behavior* to events (the declarative action
DSL) is a later phase; generated classes expose props and slots today.
```

## Binding any library — the CEM generator

The typed classes are generated from a [Custom Elements Manifest] (`custom-elements.json`), the
standard description web-component libraries publish. {py:func}`spaday.parse_cem` (in the Rust core)
normalizes a manifest into component schemas; {py:func}`spaday.generate` renders them into a Python
module. Point it at any library:

```bash
spaday-cem path/to/custom-elements.json -o my_components.py
```

```python
import spaday

code = spaday.generate("custom-elements.json")   # returns the module source (typed classes)
```

`generate` is the right choice when you want **typed, committed** classes (the WebAwesome catalog is
produced this way). For a one-off or experimental manifest, {py:func}`spaday.classes` builds the
component classes **at runtime** instead — no file, no static types, but it still validates keyword
names:

```python
ns = spaday.classes("custom-elements.json")          # {"WaSwitch": <class>, ...}
WaSwitch = spaday.classes("custom-elements.json", "WaSwitch")   # or just one class by name
WaSwitch(checked=True).to_json()
```

The same parse drives the JavaScript runtime registry (`registry(manifest)` in `spaday`'s JS
package), so one manifest yields both the typed Python authoring API and the browser binding — the
"one core, two bindings" model the diff engine already uses.

The committed `spaday/components/webawesome.py` is checked against its source manifest by a test, so
it can't silently drift from the generator; regenerate it with `python -m spaday.cem <manifest> -o
spaday/components/webawesome.py` followed by `ruff format`.

[Custom Elements Manifest]: https://github.com/webcomponents/custom-elements-manifest
