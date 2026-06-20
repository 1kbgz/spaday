# API Reference

## Component authoring

```{eval-rst}
.. autoclass:: spaday.Component
   :members:
   :member-order: bysource
```

## CEM binding generator

```{eval-rst}
.. autofunction:: spaday.parse_cem

.. autofunction:: spaday.generate
```

## Core diff / apply

The low-level component-tree engine (JSON wire form), shared byte-for-byte with the browser.

```{eval-rst}
.. autofunction:: spaday.diff

.. autofunction:: spaday.apply
```
