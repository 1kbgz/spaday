# spaday examples

This directory contains focused starting points and complete integration examples. Choose the smallest
example that matches how spaday will fit into your application.

## Setup

From a source checkout, install the serving dependencies and build the browser assets:

```bash
pip install -e ".[examples]"
```

Examples using Perspective need the larger extra instead:

```bash
pip install -e ".[perspective]"
```

The multi-worker example needs:

```bash
pip install -e ".[cluster]"
```

Notebook examples need:

```bash
pip install -e ".[widget]"
```

The [Pyodide example](../../js/examples/pyodide.html) runs
[`pyodide.py`](./pyodide.py) inside a Web Worker. Follow
[Run a spaday app in Pyodide](../../docs/src/pyodide.md) to build its wheel and browser runtime.

## Omnibus: the complete application

[`__main__.py`](./__main__.py) combines the major spaday features in one Python-authored application:

- shell layout and theming;
- client-side actions, bindings, computed values, and conditional structure;
- global and per-session models synchronized through transports;
- namespaced stores and server-authoritative edits;
- a form generated from a nested Pydantic model;
- a Lightweight Charts component;
- a Perspective workspace whose configuration and data use separate channels;
- generated bootstrap, routes, background tasks, and package-provided browser assets.

Install the Perspective extra, run the package, and open <http://127.0.0.1:8000>:

```bash
python -m spaday.examples
```

Open the page in two tabs. Global chart changes synchronize between tabs; per-session chart changes stay
within one tab. The example contains no hand-written HTML page or page-specific JavaScript.

## Focused component examples

Each module below exposes a pure `build_page()` function and an optional `create_app()` runner. Run one
with `python -m`, then open its listed URL.

| Goal                           | Module                                                   | URL                     | Demonstrates                                                                             |
| ------------------------------ | -------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| Build a reactive settings form | [`webawesome_forms.py`](./webawesome_forms.py)           | <http://127.0.0.1:8010> | local store, two-way bindings, computed props, actions, conditional content, REST result |
| Build application navigation   | [`webawesome_navigation.py`](./webawesome_navigation.py) | <http://127.0.0.1:8011> | page layout, breadcrumbs, tabs, tree, menus, dialog, drawer, popover                     |
| Show status and feedback       | [`webawesome_feedback.py`](./webawesome_feedback.py)     | <http://127.0.0.1:8012> | progress, loading states, callouts, badges, animation, popup, `AppShell`                 |
| Present rich content           | [`webawesome_content.py`](./webawesome_content.py)       | <http://127.0.0.1:8013> | cards, carousel, comparison, formatters, Markdown, QR code, split and scroller layouts   |
| Use browser utility components | [`webawesome_observers.py`](./webawesome_observers.py)   | <http://127.0.0.1:8014> | include, mutation, intersection and resize observers, zoomable frame                     |
| Build a local data dashboard   | [`data_dashboard.py`](./data_dashboard.py)               | <http://127.0.0.1:8015> | shell regions, reactive table, tabs, conditional chart, local theme                      |
| Build a live actionable list   | [`keyed_records.py`](./keyed_records.py)                 | <http://127.0.0.1:8017> | nested keyed collections, item-scoped actions, server CRUD, identity-preserving moves    |

Run one, for example:

```bash
python -m spaday.examples.webawesome_forms
```

The five `webawesome_*` modules collectively instantiate every generated component from the
`spaday-webawesome` catalog. `spaday/tests/test_example_gallery.py` enforces that coverage.

## Focused data and rendering examples

| Goal                                          | Module                                   | Extra         | Run                                                           |
| --------------------------------------------- | ---------------------------------------- | ------------- | ------------------------------------------------------------- |
| Bind controls to a server-authoritative model | [`reactive.py`](./reactive.py)           | `examples`    | `python -m spaday.examples.reactive`                          |
| Generate a bound form from a Pydantic model   | [`form.py`](./form.py)                   | `examples`    | `python -m spaday.examples.form`                              |
| Share one live chart across multiple workers  | [`cluster.py`](./cluster.py)             | `cluster`     | `uvicorn spaday.examples.cluster:app --workers 4 --port 8003` |
| Server-render and hydrate a themed tree       | [`ssr.py`](./ssr.py)                     | `examples`    | `python -m spaday.examples.ssr`                               |
| Build a REST and Perspective gateway UI       | [`gateway.py`](./gateway.py)             | `perspective` | `python -m spaday.examples.gateway`                           |
| Build a keyed server-driven staging queue     | [`keyed_records.py`](./keyed_records.py) | `examples`    | `python -m spaday.examples.keyed_records`                     |

The applications listen on:

| Module             | URL                     | Key behavior to verify                                                |
| ------------------ | ----------------------- | --------------------------------------------------------------------- |
| `reactive.py`      | <http://127.0.0.1:8001> | edits synchronize between two tabs through `connectStore`             |
| `form.py`          | <http://127.0.0.1:8002> | generated controls edit the hosted Pydantic model                     |
| `cluster.py`       | <http://127.0.0.1:8003> | clients connected to different workers receive the same bounded chart |
| `ssr.py`           | <http://127.0.0.1:8005> | page source contains rendered elements that the browser hydrates      |
| `gateway.py`       | <http://127.0.0.1:8006> | validated REST orders appear in the Perspective blotter               |
| `keyed_records.py` | <http://127.0.0.1:8017> | per-record actions patch nested lists without replacing live row DOM  |

`cluster.py` uses `tcp://127.0.0.1:5599` and `tcp://127.0.0.1:5600` for its default ZeroMQ backplane.
Set `SPADAY_CLUSTER_FRONT` and `SPADAY_CLUSTER_BACK` when running multiple independent clusters.

## Embedding examples

These examples show the integration ladder from a spaday-owned application to a host-owned page.

| Ownership model                           | Module                                                       | URL                     | Integration seam                                  |
| ----------------------------------------- | ------------------------------------------------------------ | ----------------------- | ------------------------------------------------- |
| spaday owns the page                      | [`reactive.py`](./reactive.py) and the other served examples | varies                  | `serve(page, ...)`                                |
| host application owns routes and lifespan | [`embed.py`](./embed.py)                                     | <http://127.0.0.1:8007> | `mount(app, page, prefix="/spaday", ...)`         |
| host owns the complete HTML page          | [`fragment.py`](./fragment.py)                               | <http://127.0.0.1:8008> | `bootstrap(fragment=True, target="#spaday-root")` |

Run the host-application example:

```bash
python -m spaday.examples.embed
```

Its root page links to the mounted spaday application at `/spaday/`. The host owns the Starlette lifespan
and runs transports synchronization.

Run the host-page example:

```bash
python -m spaday.examples.fragment
```

The host serves its own HTML, CSS, Content Security Policy, spaday assets, and tree endpoint. spaday mounts
only into `#spaday-root`; the generated inline module receives the host's CSP nonce.

## Notebook examples

[`widget.py`](./widget.py) demonstrates native components, client-side actions, browser-to-Python
intents, and incremental tree updates:

```python
from spaday.examples.widget import demo

widget = demo()
widget
```

[`devices.py`](./devices.py) demonstrates two-way state synchronization between device switches and the
Python kernel:

```python
from spaday.examples.devices import demo

widget = demo()
widget
widget.state = {**widget.state, "Kitchen": True}
```

Both return `spaday.widget.Widget` instances and run without an application server. With Panel installed
(`pip install panel`), they also render through its anywidget bridge:

```python
import panel as pn

pn.extension()
pn.panel(widget)
```

## File index

| File                                                     | Purpose                               |
| -------------------------------------------------------- | ------------------------------------- |
| [`__main__.py`](./__main__.py)                           | omnibus application                   |
| [`reactive.py`](./reactive.py)                           | transports and reactive-store seam    |
| [`form.py`](./form.py)                                   | schema-generated form                 |
| [`cluster.py`](./cluster.py)                             | multi-worker shared state             |
| [`ssr.py`](./ssr.py)                                     | server rendering and hydration        |
| [`gateway.py`](./gateway.py)                             | REST and Perspective integration      |
| [`embed.py`](./embed.py)                                 | mounting into an existing application |
| [`fragment.py`](./fragment.py)                           | mounting into host-owned HTML         |
| [`widget.py`](./widget.py)                               | general notebook widget               |
| [`devices.py`](./devices.py)                             | notebook device-state widget          |
| [`webawesome_forms.py`](./webawesome_forms.py)           | form controls and local actions       |
| [`webawesome_navigation.py`](./webawesome_navigation.py) | navigation and overlays               |
| [`webawesome_feedback.py`](./webawesome_feedback.py)     | status and feedback                   |
| [`webawesome_content.py`](./webawesome_content.py)       | rich content                          |
| [`webawesome_observers.py`](./webawesome_observers.py)   | browser observers and utilities       |
| [`data_dashboard.py`](./data_dashboard.py)               | shell, table, and chart dashboard     |
| [`keyed_records.py`](./keyed_records.py)                 | keyed server-driven record actions    |
