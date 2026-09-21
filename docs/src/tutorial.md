# Tutorial: build your first interactive UI

In this tutorial, you will build a settings panel with a switch and a button. You will try it in a
notebook, then serve the same page as a standalone web app. The component tree, actions, and bindings
will not change between hosts.

## Setup

Install spaday, JupyterLab, and the web host used in the last step:

```bash
pip install "spaday[widget]" jupyterlab starlette uvicorn
jupyter lab
```

Open a new Python notebook. Run each cell below in order.

## Step 1 — render real controls

Start with a switch and a button:

```python
from spaday import Widget
from spaday.components.shell import Column
from spaday.ui import Button, Switch

Widget(Column(Switch(label="Lamp"), Button(label="Details"), gap="0.75rem"))
```

You should see both controls in the cell output. `Switch` and `Button` are typed spaday controls;
`Column` is a layout web component. Spaday renders the controls with its native design when no
external design system is selected.

## Step 2 — add browser behavior

Make the button show and hide a message:

```python
from spaday import Toggle, by_id
from spaday.ui import Alert

panel = Column(
    Switch(label="Lamp"),
    Button(label="Details").on("click", Toggle(by_id("details"), "hidden")),
    Alert("This action runs in the browser.", label="Details", id="details", hidden=True),
    gap="0.75rem",
)
Widget(panel)
```

Click **Details**. The message appears and disappears. `Toggle` is a serializable action interpreted
in the browser; clicking the button does not call Python.

## Step 3 — put the page in one reusable module

Bind the switch to a state field, and save the finished page as `settings.py`. The notebook and web
app will import this same function. Run this cell:

```python
%%writefile settings.py
from spaday import Toggle, by_id
from spaday.components.shell import Column
from spaday.ui import Alert, Button, Switch

INITIAL = {"lamp": True}


def page():
    return Column(
        Switch(label="Lamp").bind("value", "lamp", mode="two-way"),
        Button(label="Details").on("click", Toggle(by_id("details"), "hidden")),
        Alert("This action runs in the browser.", label="Details", id="details", hidden=True),
        gap="0.75rem",
    )
```

The cell writes `settings.py` beside your notebook. Now render that page with its initial state:

```python
from settings import INITIAL, page

w = Widget(page(), state=INITIAL)
w
```

The switch starts on. Flip it, then run this in another cell:

```python
w.state
```

You should see `{'lamp': False}`. The binding wrote the field from the browser into the notebook's
Python state. Set it from Python to turn the switch on again:

```python
w.state = {"lamp": True}
```

You can also react to later changes:

```python
w.on_state(lambda state: print("settings:", state))
```

Flip the switch once more. The notebook prints `settings: {'lamp': False}`.

## Step 4 — serve the same page as a web app

Write a small web host beside `settings.py`:

```python
%%writefile app.py
from settings import INITIAL, page
from spaday.backends.starlette import serve

app = serve(page, store=INITIAL, title="Settings")
```

In a terminal, from the directory containing `app.py`, run:

```bash
uvicorn app:app --reload
```

Open <http://127.0.0.1:8000>. You should see the same switch, button, and message. The button still
runs in the browser, and the switch still binds two-way to `lamp`. `page()` and `INITIAL` are shared;
only the host call differs. The notebook's `Widget` syncs state with its Python kernel, while this
standalone page keeps state in the browser. The two windows do not share state.

## What you built

You authored one page with typed controls, a browser action, and a two-way binding, then ran it in a
notebook and as a standalone app.

## Next steps

- [Sync a UI to a server over transports](transports.md) to make the standalone app's state available
  to Python and share it across browser tabs.
- [Serve and embed a spaday app](serving.md) for other hosting options.
- [Use component packages](components.md) to render generic controls with a design system such as
  WebAwesome, or use its typed components directly.
