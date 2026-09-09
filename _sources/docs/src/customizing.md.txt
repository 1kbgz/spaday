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

Your bundle must register the tags the schemas name, with the attributes they declare — that is the
whole contract. Nothing checks it for you, so a browser test asserting the tags are defined is worth
writing.

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

1. **Substitute** — if you have your own wrapper, serve one bundle (above). One copy, no collision.
1. **Reuse the object** — where the engine hands out a client, lend it rather than importing a
   second copy.
1. **Survive the collision** — packages that register elements install a define-guard, so the
   losing bundle skips names already taken instead of throwing and taking the page with it. This
   keeps the page alive; it does not make two copies agree, and two copies at different versions is
   still a bug to fix rather than a state to ship.

`spaday-webawesome` publishes the version it bundles as `globalThis.__spadayWebawesome.version`, so
a page holding a second copy can compare and refuse rather than half-work.

### Third-party bundles cannot blank your page

`bootstrap(scripts=[...])` loads extra ES modules before the tree mounts. A failure in one is caught
and logged with the URL rather than aborting the page, so a third-party bundle that throws while
registering costs you that script, not every component on the page.
