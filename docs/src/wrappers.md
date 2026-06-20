# Wrapping an imperative library

Some libraries aren't web components and aren't configured by attributes — they expose a JavaScript
API you *call* (charts, data grids, editors). spaday binds these the same way it binds WebAwesome,
with one extra step: you write a thin **custom element** that drives the library's API internally, so
from Python it looks like any other component.

The recipe, with `LightweightChart` (TradingView lightweight-charts) as the worked example:

## 1. A custom element that drives the library

The element creates the chart on connect and exposes the config you want from Python as **properties**
whose setters call the library:

```ts
// js/src/ts/wrappers/lightweight-chart.ts (abridged)
import { createChart, LineSeries /* … */ } from "lightweight-charts";

export class LightweightChart extends HTMLElement {
  connectedCallback() {
    this.chart = createChart(this, { autoSize: true });
    this.series = this.chart.addSeries(SERIES[this._type]);
    this.draw();
  }
  set data(points) {
    this._data = points ?? [];
    this.series?.setData(this._data); // ← the imperative call
  }
}
customElements.define("lightweight-chart", LightweightChart);
```

It is bundled self-contained (the library included) so consumers just load it; nothing else to
install.

## 2. A hand-authored CEM → a typed Python class

The library ships no `custom-elements.json`, so you write a small one describing the element's
props, and run the generator (see [Components](components.md)):

```bash
python -m spaday.cem spaday/components/lightweight_charts.cem.json \
  -o spaday/components/lightweight_charts.py
```

That yields a typed class — same authoring experience as WebAwesome:

```python
from spaday.components import LightweightChart

chart = LightweightChart(
    type="line",
    data=[{"time": "2019-01-01", "value": 10}, {"time": "2019-01-02", "value": 12}],
)
chart.to_json()   # the wire form
```

`type` is a typed `Literal`; `data` is free-form (`Any`) — its shape is the library's, carried through
untouched.

## 3. The runtime mounts it

The browser runtime (see [Components](components.md)) instantiates
`<lightweight-chart>` and sets its `type`/`data` properties, so the element renders the real chart —
and a patch that changes `data` updates the live chart in place. From Python you authored typed
components; in the browser an imperative library draws.

```{note}
This is the seam for libraries like Perspective and regular-table too: a wrapper element exposing a
config property whose setter calls the library (e.g. `viewer.restore(config)`). Wiring component
*events* back to Python behavior is a separate, later capability (the action DSL).
```
