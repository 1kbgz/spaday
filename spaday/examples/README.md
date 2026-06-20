# spaday examples

Charts and controls **authored in typed Python**, serialized to spaday's wire form, and rendered in
the browser by the spaday **runtime** + the **lightweight-charts wrapper** — with **transports** as
the live wire.

| | files | shows |
|---|---|---|
| **Dashboard** | `dashboard.py` + `dashboard.html` | WebAwesome controls drive a live chart; control edits sync across tabs |
| **Live chart** | `server.py` + `live.html` | a chart streamed from a Python server over transports |
| **Offline** | `chart.py` + `index.html` | render + replay one precomputed patch, no server |

## Setup

```bash
pip install transports                       # the Python wire (also: starlette, uvicorn, websockets)
cd js && pnpm install && pnpm build && cd .. # builds js/dist; pulls @1kbgz/transports + webawesome
```

The servers serve the built `js/dist` bundles and the `@1kbgz/transports` / WebAwesome packages from
`js/node_modules`, so they're self-contained once built.

## Dashboard (all-in-one)

A `Chart { type, data, live }` model in a `transports.Session`, served over a WebSocket. The UI —
`WaSelect` / `WaSwitch` / `WaButton` / `LightweightChart` — is authored in Python (`dashboard.shell()`)
and mounted by the runtime. Changing a control sends a transports **edit**, so the server is
authoritative and **every open tab stays in sync** (change the type in one, all update).

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
