// A spaday wrapper for TradingView's lightweight-charts — the canonical "imperative library" case:
// the library is not a web component and configured by a JS API, so we expose it AS a custom element
// (`<lightweight-chart>`) whose props drive that API internally. A hand-authored CEM
// (spaday/components/lightweight_charts.cem.json) binds it to a typed Python class; the spaday runtime
// mounts it and sets `type`/`data` like any other component.
//
// Importing this module (side effect) defines the element. It is bundled self-contained
// (lightweight-charts included) into dist/cdn/wrappers/lightweight-chart.js.

import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineSeries,
  SeriesType,
} from "lightweight-charts";

const SERIES = {
  line: LineSeries,
  area: AreaSeries,
  candlestick: CandlestickSeries,
  bar: BarSeries,
  histogram: HistogramSeries,
} as const;

type ChartType = keyof typeof SERIES;

/** A lightweight-charts chart as a custom element; set `type` and `data` to render. */
export class LightweightChart extends HTMLElement {
  private chart?: IChartApi;
  private series?: ISeriesApi<SeriesType>;
  private _type: ChartType = "line";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- data shape varies by series type
  private _data: any[] = [];

  connectedCallback(): void {
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height) this.style.height = "300px";
    // attributionLogo off: the page must carry TradingView attribution elsewhere (lightweight-charts NOTICE).
    this.chart = createChart(this, {
      autoSize: true,
      layout: { attributionLogo: false },
    });
    this.addSeries();
    this.draw();
  }

  disconnectedCallback(): void {
    this.chart?.remove();
    this.chart = undefined;
    this.series = undefined;
  }

  get type(): ChartType {
    return this._type;
  }
  set type(value: ChartType) {
    this._type = value in SERIES ? value : "line";
    if (this.chart) {
      if (this.series) this.chart.removeSeries(this.series);
      this.addSeries();
      this.draw();
    }
  }

  get data(): unknown[] {
    return this._data;
  }
  set data(value: unknown[]) {
    this._data = (value as unknown[]) ?? [];
    this.draw();
  }

  private addSeries(): void {
    this.series = this.chart?.addSeries(SERIES[this._type]);
  }

  private draw(): void {
    if (this.series) {
      this.series.setData(this._data);
      this.chart?.timeScale().fitContent();
    }
  }
}

if (!customElements.get("lightweight-chart")) {
  customElements.define("lightweight-chart", LightweightChart);
}
