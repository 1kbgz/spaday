# Use spaday in a Jupyter notebook

This guide shows you how to render a spaday UI in a notebook and round-trip its state with Python — no
server. It works in Jupyter (Lab / Notebook / Colab / VS Code) and the wider
[anywidget](https://anywidget.dev) ecosystem (Marimo, Shiny-for-Python, Solara, Panel).

Install the host:

```bash
pip install "spaday[widget]"
```

## Render a tree

Wrap any component tree in `Widget` and return it from a cell:

```python
from spaday import Widget
from spaday.components.webawesome import WaCard, WaSwitch

Widget(WaCard().child(WaSwitch().text("Lamp")))
```

The full WebAwesome catalog and the spaday runtime are bundled into the widget, so `wa-*` components
render with nothing else to load.

## Update the rendered tree

Keep a reference and call `update` to replace the tree; the browser applies a minimal diff (live
elements are preserved, not rebuilt):

```python
w = Widget(WaCard().child(WaSwitch().text("Lamp")))
w  # display it

w.update(WaCard().child(WaSwitch().text("Lamp")).child(WaSwitch().text("Fan")))
```

## Back reactive bindings with state

Pass a `state` dict to drive the tree's [reactive bindings](behavior.md). A two-way-bound control
updates the state from the browser, and assigning `w.state` updates the control:

```python
from spaday import Widget
from spaday.components.webawesome import WaSwitch

w = Widget(WaSwitch().text("Lamp").bind("checked", "lamp", mode="two-way"), state={"lamp": True})
w
```

```python
w.state                 # -> {'lamp': True}; flip the switch, then re-read -> {'lamp': False}
w.state = {"lamp": True}  # turns the switch back on
```

React to changes (including browser-driven ones) with `on_state`:

```python
w.on_state(lambda state: print("state:", state))
```

## Handle a SendPatch intent

A [`SendPatch`](behavior.md) action surfaces an *intent* the host forwards to Python. Register a handler
with `on_intent`:

```python
w.on_intent(lambda content: print("intent:", content))   # content is {"type": "spaday:patch", "detail": {...}}
```

For most cases prefer a two-way binding over `SendPatch` + `on_intent` — the binding already carries the
control→state edit.

## Embed in Panel

Because the widget is an anywidget, Panel renders it directly:

```python
import panel as pn
pn.extension()
pn.panel(Widget(WaSwitch().text("Lamp")))
```
