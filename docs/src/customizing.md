# Ship your own variant

spaday's component packages are two halves bolted together: a **Python authoring surface** (typed
component classes, catalog schemas, actions, bindings) and a **JS implementation** (the bundle that
registers the custom elements). The bolt is meant to come out. This guide covers the four things
people want when they build on spaday rather than just using it:

1. [Theme a package from Python](#theme-a-package-from-python), without writing a stylesheet.
1. [Serve your own bundle](#serve-your-own-bundle) behind a package's Python surface.
1. [Point a component at your own element](#point-a-component-at-your-own-element) with a different tag.
1. [Share one engine](#share-one-engine-between-two-libraries) between two libraries on a page.

## Theme a package from Python

`css()` sets **CSS custom properties** — any of them, not a fixed list — so a design system's own
tokens are authored from Python with no stylesheet at all:

```python
from spaday.components.shell import App

App().css(spa_surface="#0C4253", wa_color_brand_fill_loud="#FC6B47")
# → --spa-surface: #0C4253; --wa-color-brand-fill-loud: #FC6B47
```

Kwargs are kebab-cased and `--`-prefixed (`spa_surface_2` → `--spa-surface-2`). Custom properties
inherit through shadow boundaries, so setting them on the `App` root reaches every component in the
tree.

### Three layers, in order

A color in any spaday component package resolves through three layers:

```css
var(--spa-dagre-node-fill,       /* 1. the package's own token   */
var(--spa-surface-2,             /* 2. the shell token it belongs to */
#fafafa))                        /* 3. a literal, for a standalone page */
```

So there are two ways to theme, and you pick by how wide you want the change:

```python
App().css(spa_surface_2="#1a2028")          # every package's panels follow
Dagre(graph=g).css(spa_dagre_node_fill="#1a2028")   # only the graph
```

`spaday.theme.SHELL_TOKENS` lists the shell palette (`--spa-surface`, `--spa-surface-2`,
`--spa-border`, `--spa-muted`, `--spa-accent`, `--spa-info`, `--spa-success`, `--spa-warning`,
`--spa-danger`, plus layout tokens). Each package publishes its own `TOKENS` mapping in the same
shape:

```python
from spaday_dagre import TOKENS

for kwarg, (prop, what) in TOKENS.items():
    print(f"{kwarg:<28} {prop:<34} {what}")
```

Package tokens are named `--spa-<package>-<thing>`, where `<package>` is the name you pass to
`packages=[...]`. They are only ever *read* by the package's stylesheet, never defined by it — that
is what lets a token set on an ancestor (an app-level theme) win over the package's default.

### Page mode

The dark palette is keyed off WebAwesome's `wa-dark` class, so one binding re-themes everything:

```python
App(...).bind_root_class("wa-dark", "dark")
```

`wa-light` on a subtree flips a nested island back. Both palettes are emitted at zero specificity,
so your own rules always win.

### When the design system should drive

`spaday-webawesome` maps WebAwesome's tokens *onto* the shell palette rather than the other way
round, so restyling WebAwesome carries the shell, the graphs, the tables and the trees with it:

```python
App().css(wa_color_brand_fill_loud="#0C4253")  # → --spa-accent, --spa-info, and everything downstream
```

A canvas component cannot read CSS, so `spaday-lightweight-charts` samples the resolved value of its
tokens and hands them to the chart. Theming it looks identical from Python.

## Render the generic controls with your own design

The generic controls (`spaday.ui`) reach a design system through a `Design`: data mapping each control
kind to the element that renders it and to where its generic surface lands there. A design-system
package publishes one on its `ComponentPackage`; an in-house design system publishes its own the same
way, and needs no Python beyond it:

```python
from spaday.ui import ControlSpec, Design, Open, Options, Part, Value

DESIGN = Design(
    name="acme",
    controls={
        "button": ControlSpec(
            tag="acme-button",
            label=Part(kind="text"),                       # the label is the button's text
            props={"intent": "tone", "size": "size", "disabled": "disabled"},
            values={"intent": {"primary": "brand"}},       # the design's word for it
        ),
        "input": ControlSpec(
            tag="acme-field",
            label=Part(kind="attr", name="label"),
            help=Part(kind="slot", name="hint"),           # an element in the `hint` slot
            error=Part(kind="attr", name="error-text"),
            invalid={"invalid": True},                     # set while an error is shown
            value=Value(prop="value", event="acme-change"), # written back on the design's event
        ),
        "select": ControlSpec(tag="acme-select", options=Options(kind="prop", name="items")),
        "dialog": ControlSpec(
            tag="acme-dialog",
            open=Open(prop="opened", event="acme-closed", methods=("show", "hide")),
        ),
    },
)
package = ComponentPackage(name="acme", ..., design=DESIGN)
```

`Part` places a label, help text or error message as an attribute, a slotted element, the control's
text, a child inside it, or a sibling in a `Wrap` around it (a `bp-field`, a `fluent-field`, a plain
`<label>`). `Options` renders a select's choices as child elements — optionally inside one wrapper —
or as a list property. `Value` and `Open` name the state property and its change event, and `Open`'s
method pair drives an overlay that opens by method. A control the design leaves out renders with the
native baseline. `python -m spaday.ui.conformance PORT --package acme` serves the conformance page
with your design, so the same browser checks spaday runs against the baseline (`js/tests/ui.spec.js`)
run against yours.

## Serve your own bundle

A `ComponentPackage` is a frozen dataclass of `(name, assets_dir, assets, components)`, and
`bootstrap(packages=[...])` takes descriptors directly. Keep the generated component classes and
their schemas, and serve your own JS:

```python
import dataclasses
from spaday.bootstrap import bootstrap
from spaday_webawesome import package as webawesome

mine = dataclasses.replace(
    webawesome,
    assets_dir=MY_DIST,                       # your built bundle
    assets=(("css", "my.css"), ("js", "my-wa.js")),
)
bootstrap(packages=[mine], ...)
```

Your bundle must register the tags the schemas name — that is the contract, and breaking it fails
silently: an unregistered tag renders an inert element and nothing reports it. It may register them
late, after the page has mounted: props written to an element before its tag is defined are set
through its properties once it is. `check_script` builds
a browser-side check from the schemas your package already carries, so test it:

```python
from spaday import check_script

problems = page.evaluate(check_script([mine]))   # any browser driver
assert problems == []
```

It verifies that every declared tag is a defined custom element, and that every `json`-kind prop is
exposed as a DOM property — the runtime falls back to an attribute when an element has no property,
and an attribute can only carry a string, so an attribute-only `json` prop would stringify your
object to `"[object Object]"`. String, number, boolean and enum props survive that fallback, so they
are not required to be properties. Neither are props named with a hyphen: no element has a property
by that name, so they are carried as attributes whichever bundle implements the element.

Two packages with the same `name` are rejected, which is the point: an app gets the peer's bundle or
yours, never both. That also means substitution is the simplest fix for the collision in
[Share one engine](#share-one-engine-between-two-libraries) — with one copy on the page, there is
nothing to collide.

## Point a component at your own element

If your element implements the same contract under a different tag, `retag()` gives you the Python
surface pointed at it:

```python
from spaday_perspective import PerspectivePanel, package

MyGrid = PerspectivePanel.retag("my-data-grid")
mine = dataclasses.replace(package, assets_dir=MY_DIST, assets=(("js", "grid.js"),), components=(MyGrid,))
```

`retag()` carries the tag into the class's `schema` too — `ComponentPackage` requires the two to
agree — and the new tag registers for dict-tree validation like any other schema-carrying class.

### You may not need the Python surface at all

Some packages contribute no server code. `spaday-perspective` is only `PerspectivePanel` plus the
package descriptor: the websocket is perspective-python's own `Server()` and handler, wired by your
application. If you have your own grid element and just want it fed by the same data, point it at
the same URL — neither side needs to know about the other.

## Share one engine between two libraries

Libraries that bundle an engine registering global custom element names (Perspective, WebAwesome)
cannot load twice on a page: the second copy throws from `customElements.define`. In order of
preference:

1. **Publish one copy behind an import map** — a package can publish its vendored modules under
   their bare specifiers, and `bootstrap` emits them as an import map ahead of every module script:

   ```python
   ComponentPackage(
       name="perspective",
       assets_dir=DIST,
       assets=(("js", "cdn/index.js"),),
       imports=(("@perspective-dev/", "vendor/"),),   # → /components/perspective/vendor/
   )
   ```

   Any other library on the page then resolves `@perspective-dev/client` to that one copy and needs
   no API at all. A specifier ending in `/` maps a whole subtree. Two packages publishing the same
   specifier at different URLs is an error naming both, because silently picking one is the
   ambiguity this removes. The map must precede the first module load — `bootstrap` handles the
   ordering, but if you are embedding a `fragment=True` snippet, put it in the page before any
   other module script, since a late map is ignored silently.

1. **Substitute** — if you have your own wrapper, serve one bundle (above). One copy, no collision.

1. **Reuse the object** — where the engine hands out a client, lend it rather than importing a
   second copy.

1. **Survive the collision** — packages that register elements install a define-guard, so the
   losing bundle skips names already taken instead of throwing and taking the page with it. This
   keeps the page alive; it does not make two copies agree, and two copies at different versions is
   still a bug to fix rather than a state to ship.

### Record the versions, and let spaday reconcile them

A package also records which library versions it serves, and which it imports but leaves to the page's
copy, with the range it was built against:

```python
ComponentPackage(
    name="webawesome",
    ...,
    provides={"@awesome.me/webawesome": "3.1.0"},  # written by the package's JS build
)
ComponentPackage(
    name="my-widgets",
    ...,
    requires={"@awesome.me/webawesome": "^3.1.0"},  # imported, not shipped
)
```

`serve()` and `bootstrap()` check the selected packages before they build a page. Two packages serving
one library at different versions is an error naming both packages and both versions, and so is a
`requires` whose range the served version misses, or that no selected package serves: the page would
otherwise load a copy that half-works. Two packages serving the *same* version may both publish it in
their import maps; the page imports the first. Ranges use npm's syntax — `^3.1.0`, `~25.2`, `1.x`,
`>=1.2 <2`, `||` — so a range can be copied from a `package.json`.

That covers the copies spaday serves. A copy it does not — one inside your own bundle — is the
define-guard's case above: the first registration wins, and the losing package logs which elements it
found already registered, with the library and version it serves. Each bundle also publishes the
version it serves on a global (`globalThis.__spadayWebawesome.version`, and so on).

### Third-party bundles cannot blank your page

`bootstrap(scripts=[...])` loads extra ES modules before the tree mounts. A failure in one is caught
and logged with the URL rather than aborting the page, so a third-party bundle that throws while
registering costs you that script, not every component on the page.
