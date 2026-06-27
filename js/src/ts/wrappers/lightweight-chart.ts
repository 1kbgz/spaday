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
  ColorType,
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

// Accept either a ready array of points, or a **time-keyed map** `{ time: value }` — which is the shape a
// transports `Chart` model field holds, so a bound `data` prop can flow straight from the model to the
// chart with no per-app transform. A map is sorted into the time-ordered array lightweight-charts wants.
function toSeries(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([time, v]) => ({ time, value: v }))
      .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  }
  return [];
}

/** A lightweight-charts chart as a custom element; set `type` and `data` to render. */
export class LightweightChart extends HTMLElement {
  private chart?: IChartApi;
  private series?: ISeriesApi<SeriesType>;
  private _type: ChartType = "line";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- data shape varies by series type
  private _data: any[] = [];
  private _theme: "light" | "dark" = "light";
  private resizeObserver?: ResizeObserver;

  connectedCallback(): void {
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height) this.style.height = "300px";
    // attributionLogo off: the page must carry TradingView attribution elsewhere (lightweight-charts NOTICE).
    this.chart = createChart(this, {
      autoSize: true,
      layout: { attributionLogo: false },
    });
    this.applyTheme();
    this.addSeries();
    this.draw();
    // `autoSize` keeps the canvas matched to the element, but it does not re-fit the time scale. While
    // the tree is mounting the element can still have zero width, so the initial `fitContent()` in
    // draw() leaves the series compacted until the next draw(); re-fit on resize so it spans the full
    // width on the first real layout (and stays fitted on later resizes).
    this.resizeObserver = new ResizeObserver(() =>
      this.chart?.timeScale().fitContent(),
    );
    this.resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
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
  set data(value: unknown) {
    this._data = toSeries(value);
    this.draw();
  }

  // lightweight-charts is a canvas — it doesn't read CSS, so it can't follow the page's light/dark
  // theme on its own. Set `theme` to recolor its text + grid; the background stays transparent so the
  // surface behind it (e.g. a wa-card) shows through and matches whichever mode is active.
  get theme(): "light" | "dark" {
    return this._theme;
  }
  set theme(value: "light" | "dark") {
    this._theme = value === "dark" ? "dark" : "light";
    this.applyTheme();
  }

  private applyTheme(): void {
    if (!this.chart) return;
    const dark = this._theme === "dark";
    this.chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: "rgba(0,0,0,0)" },
        textColor: dark ? "#c9c9d2" : "#222222",
      },
      grid: {
        vertLines: { color: dark ? "#2c2c34" : "#ededed" },
        horzLines: { color: dark ? "#2c2c34" : "#ededed" },
      },
    });
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
