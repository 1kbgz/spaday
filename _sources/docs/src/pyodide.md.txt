# How to run a spaday app in Pyodide

This guide shows you how to run Python UI logic in a Web Worker and apply its component-tree patches
on the browser's main thread.

## Build the wheel and browser runtime

Install the development dependencies once, then build the runtime and Pyodide wheel:

```bash
make develop
make build-js
make test-pyodide
```

The Python 3.14 WebAssembly wheel is written to `dist/pyodide/`.

## Open the example

Serve the repository root:

```bash
python -m http.server 8000
```

Open the example with the wheel URL in its query string, replacing `<wheel>` with the filename in
`dist/pyodide/`:

```text
http://127.0.0.1:8000/js/examples/pyodide.html?wheel=/dist/pyodide/<wheel>
```

Click **Increment in Python**. The Python handler sends a transports client proposal through its
authoritative session, renders the accepted model as a new component tree, and returns the diff.
`connectWorker` applies that patch without replacing the button.

The Python application is in [`spaday/examples/pyodide.py`](../../spaday/examples/pyodide.py). The
worker loader is in [`js/examples/pyodide-worker.js`](../../js/examples/pyodide-worker.js), and the page
is in [`js/examples/pyodide.html`](../../js/examples/pyodide.html).

## Connect your own worker

Wrap a render function and intent handler with `WorkerApp`:

```python
from spaday import SendPatch, WorkerApp, element, lit

count = 0


def render():
    return element("button").text(str(count)).on(
        "click", SendPatch("counter", "increment", lit(1))
    )


def on_intent(intent):
    global count
    count += intent["detail"]["value"]


app = WorkerApp(render, on_intent)
```

The worker must send `app.start_json()` after receiving `{type: "start"}` and pass later messages to
`app.dispatch_json(...)`. On the main thread, initialize spaday's browser runtime and connect the
worker:

```javascript
import { connectWorker, init } from "/js/dist/esm/index.js";

await init({ module_or_path: "/js/dist/pkg/spaday_bg.wasm" });
const worker = new Worker("/worker.js", { type: "module" });
await connectWorker(document.querySelector("#app"), worker).ready;
```

Keep DOM and custom-element work on the main thread. Keep Python rendering, state changes, and
tree diffing in the worker.

## Run the browser test

Run the focused Playwright test against the wheel already in `dist/pyodide/`:

```bash
make test-pyodide-browser
```
