# spaday examples — a chart authored in Python

A `LightweightChart` is authored in **typed Python**, serialized to spaday's wire form, and rendered
in the browser by the spaday **runtime** + the **lightweight-charts wrapper**. Two demos:

| | file | shows |
|---|---|---|
| **Live server** | `server.py` + `live.html` | a Python server **pushes** updates over a WebSocket |
| **Offline** | `chart.py` + `index.html` | render + replay one precomputed patch, no server |

Both load the built bundles from `/js/dist`, so build first:

```bash
cd js && pnpm install && pnpm build && cd ..
```

## Live server (server-pushed updates)

A Starlette server hosts the chart, appends a point every second, and streams each change to every
connected browser as a `spaday.diff` patch over a WebSocket; the page applies it incrementally.

```bash
pip install starlette uvicorn websockets        # if not already present
python -m spaday.examples.server                # -> http://127.0.0.1:8000
```

Open <http://127.0.0.1:8000> and watch the line grow in real time.

## Offline (no server)

```bash
python -m spaday.examples.chart    # writes chart.json + chart.patch.json
python -m http.server 8000         # from the repo root
#   -> http://localhost:8000/spaday/examples/index.html
```

Renders the Python-authored chart; the button replays one patch `spaday.diff` computed offline
(`area → line, +60 days`) so you can see the incremental-apply path without a server.

## What it shows

- **Author once, in Python** — `LightweightChart(type="area", data=[...])`, a typed component, no
  hand-written JSON or JS.
- **Render anywhere** — the runtime mounts the real web component; an *imperative* charting library
  (TradingView lightweight-charts) draws it.
- **Incremental updates** — changes are patches from the shared Rust diff engine, applied to the live
  element without a full re-render. In production the wire is **transports** (hosting / diffing /
  fan-out); `server.py` hand-rolls a minimal version to stay self-contained.
