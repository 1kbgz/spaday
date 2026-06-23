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

This is how the built-in WebAwesome catalog is produced. A test checks the committed
`spaday/components/webawesome.py` against its source manifest so it can't silently drift; regenerate it
with `spaday-cem <manifest> -o spaday/components/webawesome.py` followed by `ruff format`.

## Build classes at runtime

For a one-off or experimental manifest, `spaday.classes` builds the classes in memory instead — no file,
no static types, but it still validates keyword names:

```python
import spaday

ns = spaday.classes("custom-elements.json")                    # {"WaSwitch": <class>, ...}
WaSwitch = spaday.classes("custom-elements.json", "WaSwitch")  # or one class by name
WaSwitch(checked=True).to_node()
```

## One manifest, both bindings

The parse that produces the Python classes ({py:func}`spaday.parse_cem`, in the Rust core) also drives
the JavaScript runtime's registry — how each prop is set, which events to bind, the slot names. So a
single manifest yields both the typed Python authoring API and the browser binding, with no chance of
the two disagreeing.
