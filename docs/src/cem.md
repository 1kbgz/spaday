# Generate typed classes from a manifest

spaday's typed component classes are generated from a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
(`custom-elements.json`) — the standard description web-component libraries publish. This guide shows
you how to generate classes for any such library. (For a library that is *not* a web component, see
[Wrap an imperative library](wrappers.md).)

## Generate a committed module

For typed classes you check into your project, use the `spaday-cem` CLI or `spaday.generate`:

```bash
spaday-cem path/to/custom-elements.json -o my_components.py
```

```python
import spaday

code = spaday.generate("custom-elements.json")   # returns the module source (typed classes)
```

Peer packages use this workflow for committed catalogs. For example, `spaday-webawesome` generates
`spaday_webawesome/components.py` from its committed manifest and checks AST drift in its test suite.
Generated classes expose their normalized CEM metadata through `Component.schema`, ready for inclusion
in a [`ComponentPackage` catalog](serving.md).

A manifest describes two kinds of input, and the schema carries both. `schema.props` are the element's
**attributes** — each one becomes a typed keyword argument. `schema.fields` are its **property-only
inputs**: public fields the element declares with no attribute of their own, which is where a data
component keeps its payload (an object no attribute can express). A field is set exactly like a prop —
`Chart(data={...})` — and the runtime writes the property; it is not a typed parameter, because a
manifest's `members` describe the element's whole class surface, so only what survives filtering
(methods, private and static members, inherited and attribute-backed fields, element references and
callbacks are all dropped) is carried. Both kinds accept the snake_case spelling and both are checked
by `spaday.validate`.

A `json` prop or field also carries `type_text`, the manifest's declared type — `{ rows: string[]; … }`,
`SeriesPoint[]`, `HeatmapData`. It is kept only for that kind, since `string`, `boolean`, `number` and
`enum` already describe their own shape, and it is what lets a wrong payload shape be caught before the
browser (see [strict components](behavior.md)).

## Build classes at runtime

For a one-off or experimental manifest, `spaday.classes` builds the classes in memory instead — no file
and no static types, but the same `Component.schema`, so `spaday.validate` checks keyword names on the
built tree either way:

```python
import spaday

ns = spaday.classes("custom-elements.json")                    # {"WaSwitch": <class>, ...}
WaSwitch = spaday.classes("custom-elements.json", "WaSwitch")  # or one class by name
WaSwitch(checked=True).to_node()
```

Runtime-generated classes expose the same `Component.schema` metadata as committed classes.

## One manifest, both bindings

The parse that produces the Python classes ({py:func}`spaday.parse_cem`, in the Rust core) also drives
the JavaScript runtime's registry — how each prop is set, which events to bind, the slot names. So a
single manifest yields both the typed Python authoring API and the browser binding, with no chance of
the two disagreeing.
