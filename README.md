# spaday

[![Build Status](https://github.com/1kbgz/spaday/actions/workflows/build.yaml/badge.svg?branch=main&event=push)](https://github.com/1kbgz/spaday/actions/workflows/build.yaml)
[![codecov](https://codecov.io/gh/1kbgz/spaday/branch/main/graph/badge.svg)](https://codecov.io/gh/1kbgz/spaday)
[![License](https://img.shields.io/github/license/1kbgz/spaday)](https://github.com/1kbgz/spaday)
[![PyPI](https://img.shields.io/pypi/v/spaday.svg)](https://pypi.python.org/pypi/spaday)

Build reactive web-component UIs **configured in Python, executed in the browser**.

## Overview

You author a UI as a tree of typed Python components — [WebAwesome](https://webawesome.com) by default,
or any library that ships a [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest).
You attach behavior as **declarative data**: an action DSL (toggle a prop, send a model edit, call an
endpoint) and reactive **bindings** (a control two-way-bound to a state field, or a prop computed from
others). spaday's JavaScript runtime renders the tree to real web components and interprets that
behavior **client-side** — so a toggle or a derived value updates with no round-trip to Python.

That UI state is a [transports](https://github.com/1kbgz/transports) model, so it syncs over any
connection (WebSocket, SSE, Jupyter comm) and any codec; the same tree drops into a web app or a Jupyter
notebook unchanged.

Like transports, spaday is a **Rust core with thin bindings**: the component tree, the diff engine, the
CEM parser, the action interpreter, and the reactive engine live in Rust and compile to **PyO3** (Python
authors the tree) and **wasm** (the browser runs it). One core, two bindings.

```python
from spaday import Widget
from spaday.components.webawesome import WaCard, WaSwitch

# a switch two-way-bound to a state field, rendered in a Jupyter cell
ui = WaCard().child(WaSwitch().text("Lamp").bind("checked", "on", mode="two-way"))
w = Widget(ui, state={"on": True})
w  # flip the switch → w.state["on"] flips in Python; set w.state → the switch follows
```

## Install

```bash
pip install spaday            # core: author + serialize component trees
pip install "spaday[widget]"  # + the Jupyter / anywidget host
```

## Component ecosystem

Install only the integrations an application uses. Each package provides typed Python components and
registers its browser assets with spaday:

- [spaday-trees](https://github.com/1kbgz/spaday-trees) — virtualized project and repository trees from [Pierre](https://trees.software/docs).
- [spaday-spectrum](https://github.com/1kbgz/spaday-spectrum) — [Adobe Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/).
- [spaday-perspective](https://github.com/1kbgz/spaday-perspective) — live [Perspective](https://perspective-dev.github.io) workspaces and datagrids.

Select an installed integration by its entry-point name, for example `serve(page, packages=["trees"])`.

## Documentation

- **[Tutorial](docs/src/tutorial.md)** — build your first interactive UI, step by step (in a notebook).
- **How-to guides** — [author a component tree](docs/src/components.md),
  [add behavior and reactivity](docs/src/behavior.md),
  [serve and embed an app](docs/src/serving.md),
  [use it in a notebook](docs/src/notebook.md),
  [sync to a server over transports](docs/src/transports.md),
  [wrap an imperative JS library](docs/src/wrappers.md),
  [generate typed classes from a manifest](docs/src/cem.md).
- **[API reference](docs/src/api.md)** — the Python surface.
- **[How spaday works](docs/src/concepts.md)** — the architecture and the reasoning behind it.

> [!NOTE]
> This library was generated using [copier](https://copier.readthedocs.io/en/stable/) from the [Base Python Project Template repository](https://github.com/python-project-templates/base)
