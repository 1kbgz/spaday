# Example: a chart authored in Python

`chart.py` builds a `LightweightChart` component in **typed Python** and writes spaday's wire form;
`index.html` renders it in the browser with the spaday **runtime** + the **lightweight-charts
wrapper**. The *Apply update* button applies a patch computed by the Rust `diff` engine — a live,
incremental update (`area → line`, `+60 days`).

## Run

```bash
# 1. build the JS bundles (runtime + wrapper) -> js/dist
cd js && pnpm install && pnpm build && cd ..

# 2. author the chart in Python (writes chart.json + chart.patch.json next to this file)
python -m spaday.examples.chart        # (or `python spaday/examples/chart.py` if spaday is installed)

# 3. serve the repo root, then open the example
python -m http.server 8000
#    -> http://localhost:8000/spaday/examples/index.html
```

`spaday` must be importable (`pip install -e .` builds the extension), and the page loads the bundles
from `/js/dist/...`, so serve from the repository root.

## What it shows

- **Author once, in Python** — `LightweightChart(type="area", data=[...])`, a typed component, with no
  hand-written JSON or JS.
- **Render anywhere** — the runtime mounts the real web component; an *imperative* charting library
  (TradingView lightweight-charts) draws it.
- **Incremental updates** — the change between two Python-authored charts is a 2-op patch from the
  shared Rust diff engine, applied to the live element without a full re-render.
