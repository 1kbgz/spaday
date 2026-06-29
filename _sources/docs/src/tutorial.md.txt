# Tutorial: build your first interactive UI

In this tutorial you will build a small settings panel — a card with a switch and a reveal button —
and make it interactive, all from Python. By the end you will have rendered web components, run
behavior in the browser with no server, and wired a control two-way to state your Python code can read.

We will work in a **Jupyter notebook**, because it renders a spaday UI with no setup. Everything you
learn here applies unchanged to a web app (see [the transports guide](transports.md) afterwards).

## Setup

Install spaday with the notebook host, and start a notebook:

```bash
pip install "spaday[widget]"
jupyter lab
```

## Step 1 — render a component

In a cell, build a card containing a switch and display it:

```python
from spaday import Widget
from spaday.components.webawesome import WaCard, WaSwitch

panel = WaCard().child(WaSwitch().text("Lamp"))
Widget(panel)
```

Run the cell. You should see a bordered card with a labelled toggle switch. `WaCard` and `WaSwitch` are
typed Python classes for [WebAwesome](https://webawesome.com) components; `.child(...)` nests one inside
another, and `Widget(...)` renders the tree in the output area.

## Step 2 — add a layout

Components nest, so add a second row and a heading using the same pattern. Use a `Stack` to lay the
children out vertically:

```python
from spaday import element, Widget
from spaday.components.shell import Stack
from spaday.components.webawesome import WaCard, WaSwitch

panel = WaCard().child(
    Stack()
    .child(element("strong").text("Settings"))
    .child(WaSwitch().text("Lamp"))
    .child(WaSwitch().text("Notifications"))
)
Widget(panel)
```

Run it. You should see a card titled **Settings** with two switches stacked under it. `Stack` is one of
spaday's `spa-*` layout components; `element("strong")` is an escape hatch for a plain HTML tag.

## Step 3 — make it do something, in the browser

Now add a button that reveals a panel — and have it run **in the browser**, with no call back to
Python. Attach a declarative action with `.on(...)`:

```python
from spaday import by_id, element, Toggle, Widget
from spaday.components.shell import Stack
from spaday.components.webawesome import WaButton, WaCallout, WaCard, WaSwitch

panel = WaCard().child(
    Stack()
    .child(element("strong").text("Settings"))
    .child(WaSwitch().text("Lamp"))
    .child(WaButton(variant="brand").text("Details").on("click", Toggle(by_id("info"), "hidden")))
    .child(WaCallout().prop("id", "info").prop("hidden", True).text("Runs entirely client-side."))
)
Widget(panel)
```

Run it and click **Details**. The callout appears and disappears each click. `Toggle(by_id("info"), "hidden")` is an *action* — serializable data, not Python code — that spaday's runtime interprets in the
browser. Your Python kernel is never contacted when you click.

## Step 4 — bind a control to state

Client-side behavior is good; reactive *state* is better. Give the widget a state model and bind the
switch's `checked` to a field of it, **two-way**:

```python
from spaday import element, Widget
from spaday.components.shell import Stack
from spaday.components.webawesome import WaCard, WaSwitch

panel = WaCard().child(
    Stack()
    .child(element("strong").text("Settings"))
    .child(WaSwitch().text("Lamp").bind("checked", "lamp", mode="two-way"))
)
w = Widget(panel, state={"lamp": True})
w
```

Run it. The switch starts **on**, because the `lamp` field is `True`. Now read the state back in Python —
in a new cell:

```python
w.state
```

Flip the switch in the rendered widget, then re-run `w.state`. You should see `{'lamp': False}`. The
control wrote the field. It works the other way too — set the field from Python:

```python
w.state = {"lamp": True}
```

The switch turns back on. The binding keeps the control and the state field in sync in both directions.

## Step 5 — react to changes in Python

Register a callback to run whenever the state changes (including from a click in the browser):

```python
w.on_state(lambda state: print("settings:", state))
```

Now flip the switch in the widget. Your cell prints `settings: {'lamp': False}`. You have a UI whose
interactions run in the browser *and* report back to Python.

## What you built

- A web-component UI authored entirely in typed Python.
- Behavior (`Toggle`) that runs client-side with no round-trip.
- A control two-way-bound to state, readable and writable from Python.

## Next steps

- [How spaday works](concepts.md) — why behavior is data and how one Rust core drives both Python and the browser.
- [Add behavior and reactivity](behavior.md) — the full action DSL and binding kinds (including
  *computed* props derived from state).
- [Author a component tree](components.md) — props, slots, keys, generated forms, and the shell components.
- [Serve and embed a spaday app](serving.md) — put this panel on a webserver, from a whole app down to a
  fragment in a page you already own.
- [Sync a UI to a server over transports](transports.md) — the same panel, multi-tenant, on a webserver.
