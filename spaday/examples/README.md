# spaday examples

Charts, graphs, and controls **authored in typed Python**, serialized to spaday's wire form, and
rendered in the browser by the spaday **runtime** + the **lightweight-charts / dagre-d3 wrappers** —
with **transports** as the live wire.

| | files | shows |
|---|---|---|
| **Dashboard** | `dashboard.py` + `dashboard.html` | WebAwesome controls drive charts; **global** state shared across tabs vs **per-session** state isolated per browser |
| **Live chart** | `server.py` + `live.html` | a chart streamed from a Python server over transports |
| **Live graph** | `graph.py` + `graph.html` | a dagre-d3 graph grown a node at a time from a Python server over transports |
| **Offline** | `chart.py` + `index.html` | render + replay one precomputed patch, no server |

## Setup

```bash
pip install transports                       # the Python wire (also: starlette, uvicorn, websockets)
cd js && pnpm install && pnpm build && cd .. # builds js/dist; pulls @1kbgz/transports + webawesome
```

The servers serve the built `js/dist` bundles and the `@1kbgz/transports` / WebAwesome packages from
`js/node_modules`, so they're self-contained once built.

## Dashboard (all-in-one)

Two `Chart { type, data, live }` panels, each `WaSelect` / `WaSwitch` / `WaButton` / `LightweightChart`
authored in Python (`dashboard.chart_panel()`) and mounted by the runtime. Control changes are
transports **edits** (server-authoritative). The two panels differ in *scope*:

- **Global** — one shared model on a `transports.Server` at `/ws`. Every browser mirrors it, so a
  control change in one tab updates **all** tabs.
- **Per session** — a `transports.Hub` at `/ws/session` routes each connection (by a per-tab
  `?session=` id) to its **own private** model. Each browser gets an isolated chart — the multi-tenant
  case. Open the page in two browsers to see the difference.

```bash
python -m spaday.examples.dashboard          # -> http://127.0.0.1:8001
```

## Live chart

A `Chart { type, data }` hosted in a `transports.Session`; `transports.starlette_endpoint` + `autoflush`
stream patches as a ticker appends points. The browser mirrors the model with transports' JS `Client`
and feeds it to the chart.

```bash
python -m spaday.examples.server             # -> http://127.0.0.1:8000
```

## Live graph

A `Graph { direction, nodes, edges }` hosted in a `transports.Session`; a ticker adds a node (and an
edge to a random existing node) each second. The browser mirrors the model with transports' JS
`Client` and feeds it to the `<dagre-graph>` element (dagre-d3). This is daggre's **rendering path** —
the daggre app adds the typed Graph/Node/Edge domain and a notebook widget on top.

```bash
python -m spaday.examples.graph              # -> http://127.0.0.1:8002
```

## Offline (no server)

```bash
python -m spaday.examples.chart              # writes chart.json + chart.patch.json
python -m http.server 8000                   # from the repo root
#   -> http://localhost:8000/spaday/examples/index.html
```

## Notes

- **transports is the wire**: it carries the data model (Python `Session`/`Server`/`autoflush`; the JS
  `Client` mirrors it). spaday renders. The dashboard's edits are server-authoritative and fan out to
  every client.
- **Imperative event glue**: the dashboard wires control events to transports edits with hand-written
  JS, because spaday's declarative event→action binding (the action DSL) is a later phase — it will
  make that glue declarative.
- **Wholesale data patches**: the series is one opaque prop, so each change resends `data` (correct,
  not minimal); structured per-point deltas need the series modeled as tree state — later.
