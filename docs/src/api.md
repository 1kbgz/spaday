# API reference

The Python surface of spaday. The component classes themselves (`WaButton`, `Stack`, `LightweightChart`,
…) are generated and not listed here — see [Author a component tree](components.md) and
[Generate typed classes](cem.md).

## Authoring

```{eval-rst}
.. autoclass:: spaday.Component
   :members:
   :member-order: bysource

.. autofunction:: spaday.element
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
.. autofunction:: spaday.eq
.. autofunction:: spaday.all_
.. autofunction:: spaday.any_
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

## Notebook host

```{eval-rst}
.. autoclass:: spaday.Widget
   :members: update, state, on_state, on_intent
```

## Core diff / apply

The low-level component-tree engine (JSON wire form), shared byte-for-byte with the browser runtime.

```{eval-rst}
.. autofunction:: spaday.diff
.. autofunction:: spaday.apply
```
