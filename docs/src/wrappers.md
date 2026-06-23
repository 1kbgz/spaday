# Wrap an imperative JS library

Some libraries aren't web components and aren't configured by attributes — they expose a JavaScript API
you *call* (charts, data grids, editors). This guide shows you how to bind one so that, from Python, it
looks like any other component. You write a thin **custom element** that drives the library's API
internally, then [generate a typed class](cem.md) for it.

The worked example is `LightweightChart` (TradingView lightweight-charts).

## 1. A custom element that drives the library

Write an element that creates the library object on connect and exposes the config you want from Python
as **properties** whose setters call the library:

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

Bundle it self-contained (the library included) so consumers just load it; nothing else to install.

## 2. A hand-authored CEM → a typed Python class

The library ships no `custom-elements.json`, so write a small one describing the element's props and
[generate a class from it](cem.md):

```bash
spaday-cem spaday/components/lightweight_charts.cem.json -o spaday/components/lightweight_charts.py
```

You now author it like any other component:

```python
from spaday.components import LightweightChart

LightweightChart(
    type="line",
    data=[{"time": "2019-01-01", "value": 10}, {"time": "2019-01-02", "value": 12}],
)
```

`type` is a typed `Literal`; `data` is free-form (`Any`) — its shape is the library's, carried through
untouched.

## 3. The runtime mounts it

The browser runtime instantiates `<lightweight-chart>` and sets its `type` / `data` properties, so the
element renders the real chart — and a patch that changes `data` updates the live chart in place. The
element is an ordinary custom element, so it also takes [actions and bindings](behavior.md): bind `data`
to a state field and the chart redraws reactively as the field changes.

```{note}
This is the seam for libraries like Perspective and regular-table too: a wrapper element exposing a
config property whose setter calls the library (e.g. `viewer.restore(config)`).
```
