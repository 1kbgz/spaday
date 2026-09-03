# API reference

The Python surface of spaday. Peer-package component classes are not listed here; see
[Author a component tree](components.md) and
[Generate typed classes](cem.md).

## Authoring

```{eval-rst}
.. autoclass:: spaday.Component
   :members:
   :member-order: bysource

.. autofunction:: spaday.element

.. autoclass:: spaday.components.shell.Each
```

## Action DSL

Behavior attached to a component with `Component.on`; see [Add behavior and reactivity](behavior.md).

### Actions

```{eval-rst}
.. autoclass:: spaday.SetProp
.. autoclass:: spaday.Toggle
.. autoclass:: spaday.Sequence
.. autoclass:: spaday.Emit
.. autoclass:: spaday.SendPatch
.. autoclass:: spaday.If
.. autoclass:: spaday.CallEndpoint
.. autoclass:: spaday.NamedJs
```

### Expressions and references

```{eval-rst}
.. autofunction:: spaday.lit
.. autofunction:: spaday.event_value
.. autofunction:: spaday.not_
.. autofunction:: spaday.prop
.. autofunction:: spaday.field
.. autofunction:: spaday.item
.. autofunction:: spaday.scope
.. autofunction:: spaday.eq
.. autofunction:: spaday.all_
.. autofunction:: spaday.any_
.. autofunction:: spaday.cond
.. autofunction:: spaday.obj
.. autofunction:: spaday.this
.. autofunction:: spaday.by_id
```

### Binding helper

`spaday.bind` is a one-way event-driven convenience (control change → set a target prop). For reactive
state bindings prefer `Component.bind` / `Component.compute` (above).

```{eval-rst}
.. autofunction:: spaday.bind
```

## Validation

```{eval-rst}
.. autofunction:: spaday.validate
.. autoexception:: spaday.ValidationError
```

## CEM binding generator

```{eval-rst}
.. autofunction:: spaday.parse_cem
.. autofunction:: spaday.generate
.. autofunction:: spaday.classes
```

### Component catalog schemas

```{eval-rst}
.. autoclass:: spaday.ComponentSchema
   :members:

.. autoclass:: spaday.PropertySchema
   :members:
```

## Serving

Generate a page and deliver it on any backend; see [Serve and embed](serving.md) and
[Sync over transports](transports.md). The generator is framework-agnostic (`spaday.bootstrap`); a backend
(`spaday.backends.<name>` — `starlette`, `aiohttp`, `flask`, `tornado`) wires it into routes.

```{eval-rst}
.. autofunction:: spaday.backends.starlette.serve
.. autofunction:: spaday.backends.starlette.mount
.. autofunction:: spaday.bootstrap.bootstrap
.. autoclass:: spaday.Wire
.. autofunction:: spaday.bootstrap.tree_json
.. autofunction:: spaday.bootstrap.tree_frame
.. autofunction:: spaday.bootstrap.bundles_dir
```

### External component packages

```{eval-rst}
.. autoclass:: spaday.ComponentPackage
.. autofunction:: spaday.resolve_component_packages
.. autofunction:: spaday.discover_component_packages
.. autofunction:: spaday.discover_component_package_names
```

## Server-side rendering

```{eval-rst}
.. autofunction:: spaday.render_html
```

## Notebook host

```{eval-rst}
.. autoclass:: spaday.Widget
   :members: update, state, on_state, on_intent
```

## Web Worker host

```{eval-rst}
.. autoclass:: spaday.WorkerApp
   :members: start, dispatch, start_json, dispatch_json
```

## Core diff / apply

The low-level component-tree engine (JSON wire form), shared byte-for-byte with the browser runtime.
`encode_frame` / `decode_frame` wrap a tree (or patch) in a transports `Frame` so the UI rides the same
envelope as model state (used by `tree="frame"`).

```{eval-rst}
.. autofunction:: spaday.diff
.. autofunction:: spaday.apply
.. autofunction:: spaday.encode_frame
.. autofunction:: spaday.decode_frame
```

## Theming

The `spa-*` shell components are re-themed by setting their `--spa-*` CSS custom properties via
`Component.css` (e.g. `App().css(spa_surface="#111", spa_border="#333")`, which cascades to the whole
shell). `spaday.SHELL_TOKENS` maps each `css()` keyword to the CSS custom property it drives and what it
controls — `spa_surface`, `spa_surface_2`, `spa_border`, `spa_muted`, `spa_gap`, `spa_align`,
`spa_justify`, `spa_gutter_width`. The shell ships neutral light and dark defaults — the dark palette is
keyed off WebAwesome's `wa-dark` class (`wa-light` flips a nested island back), so
`App(...).bind_root_class("wa-dark", "dark")` alone re-themes the whole page. Both palettes are emitted
at zero specificity, so an application or component package overrides them by mapping its own theme
tokens onto those variables.

`wa-dark`/`wa-light` on the root is spaday's page-mode convention, and component packages join it
through whichever channel themes them:

- a package themed by **CSS tokens** ships mode-keyed rules in its own package stylesheet (its `css`
  assets land in `<head>` via `packages=`, and custom properties cascade into its shadow roots) — key
  them off the same classes, at low specificity (`:where(.wa-dark) { --my-token: … }`), exactly as the
  shell does;
- a package themed by a **prop or constructor options** (Perspective's `theme`, Lightweight Charts)
  binds that prop to the same field that drives the root class:
  `component.compute("theme", cond(field("dark"), "dark", "light"))`.

A class states a boolean. For page-level state that carries a *value* — a design system whose tokens
hang off `:root[data-density='comfortable']`, or a family of root flags in one control group —
`Component.bind_root_attr(name, field)` writes an attribute on `<html>` instead:

```python
App(...).bind_root_attr("data-density", "density")  # "comfortable" | None
App(...).bind_root_attr("data-vivid", "vivid")      # True | False
```

The field's value is written as the runtime writes any attribute: `None`/`False` remove it, `True` and
`""` give the bare form (`data-vivid`), anything else is stringified — so an enumerated field replaces
the attribute's value rather than accumulating names, and clearing the field removes it. Both root
bindings are one-way and seeded from the store at mount, so a field restored by `persist=` or `url=`
themes the page before the tree renders.
