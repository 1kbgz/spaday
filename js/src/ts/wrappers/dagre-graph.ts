// A spaday wrapper for dagre-d3-es (the dagre directed-graph renderer) — another "imperative library"
// case: dagre-d3 is not a web component and is driven by a JS API, so we expose it AS a custom element
// (`<dagre-graph>`) whose props drive that API internally. A hand-authored CEM
// (spaday/components/dagre_graph.cem.json) binds it to a typed Python class; the spaday runtime mounts
// it and sets `direction`/`nodes`/`edges` like any other component. (Named after the library it wraps,
// as `<lightweight-chart>` is; the daggre app's Graph/Node/Edge domain consumes this element.)
//
// Importing this module (side effect) defines the element. It is bundled self-contained (dagre-d3-es +
// d3 included) into dist/cdn/wrappers/dagre-graph.js.

import * as d3 from "d3";
import { graphlib, render as makeRender } from "dagre-d3-es";

type NodeInput = {
  id?: string;
  name?: string;
  label?: string;
  color?: string;
  backgroundColor?: string;
  [k: string]: unknown;
};
type EdgeInput = {
  from?: string;
  to?: string;
  source?: string;
  target?: string;
  line?: string;
  [k: string]: unknown;
};

// dagre layout direction (`rankdir`) keyed by the human-readable prop value.
const RANKDIR: Record<string, string> = {
  "top-to-bottom": "TB",
  "bottom-to-top": "BT",
  "left-to-right": "LR",
  "right-to-left": "RL",
};

/** A dagre-d3 graph as a custom element; set `direction`, `nodes`, and `edges` to render. */
export class DagreGraph extends HTMLElement {
  private renderer = makeRender();
  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private inner?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private zoom?: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private _direction = "top-to-bottom";
  private _nodes: NodeInput[] = [];
  private _edges: EdgeInput[] = [];

  connectedCallback(): void {
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height) this.style.height = "400px";
    this.svg = d3
      .select(this)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");
    this.inner = this.svg.append("g");
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .on("zoom", (event) => this.inner?.attr("transform", event.transform));
    this.svg.call(this.zoom);
    this.draw();
  }

  disconnectedCallback(): void {
    this.svg?.remove();
    this.svg = undefined;
    this.inner = undefined;
    this.zoom = undefined;
  }

  get direction(): string {
    return this._direction;
  }
  set direction(value: string) {
    this._direction = value || "top-to-bottom";
    this.draw();
  }

  get nodes(): NodeInput[] {
    return this._nodes;
  }
  set nodes(value: NodeInput[]) {
    this._nodes = value ?? [];
    this.draw();
  }

  get edges(): EdgeInput[] {
    return this._edges;
  }
  set edges(value: EdgeInput[]) {
    this._edges = value ?? [];
    this.draw();
  }

  // Build a fresh dagre graph from the current props. nodes/edges are opaque props resent wholesale,
  // so each draw rebuilds; dagre-d3's render keys by id and diffs against the live DOM.
  private build(): graphlib.Graph {
    const g = new graphlib.Graph({ directed: true });
    g.setGraph({
      rankdir: RANKDIR[this._direction] ?? "TB",
      nodesep: 50,
      ranksep: 50,
      marginx: 20,
      marginy: 20,
    });
    g.setDefaultEdgeLabel(() => ({}));

    for (const n of this._nodes) {
      const id = String(n.id ?? n.name ?? "");
      if (!id) continue;
      const { id: _id, name: _name, color, backgroundColor, ...rest } = n;
      const opts: Record<string, unknown> = { label: n.label ?? id, ...rest };
      if (color) opts.labelStyle = `fill: ${color};`;
      if (backgroundColor) opts.style = `fill: ${backgroundColor};`;
      g.setNode(id, opts);
    }

    for (const e of this._edges) {
      const from = String(e.from ?? e.source ?? "");
      const to = String(e.to ?? e.target ?? "");
      if (!from || !to) continue;
      const { from: _f, to: _t, source: _s, target: _tg, line, ...rest } = e;
      const opts: Record<string, unknown> = { curve: d3.curveBasis, ...rest };
      if (line === "dash")
        opts.style = `${opts.style ?? ""}stroke-dasharray: 5, 5;`;
      g.setEdge(from, to, opts);
    }
    return g;
  }

  private draw(): void {
    if (!this.inner) return;
    const g = this.build();
    if (g.nodeCount() === 0) {
      this.inner.selectAll("*").remove();
      return;
    }
    // dagre-d3's render expects its own bundled d3-selection type; the shapes match at runtime.
    this.renderer(this.inner as never, g);
    this.fit(g);
  }

  // Center and scale the drawn graph to fit the element.
  private fit(g: graphlib.Graph): void {
    if (!this.svg || !this.zoom) return;
    const w = this.clientWidth || 1;
    const h = this.clientHeight || 1;
    const graph = g.graph();
    const gw = graph.width || 1;
    const gh = graph.height || 1;
    const scale = Math.min(w / gw, h / gh, 1.5) * 0.9 || 1;
    const tx = (w - gw * scale) / 2;
    const ty = (h - gh * scale) / 2;
    this.svg.call(
      this.zoom.transform,
      d3.zoomIdentity.translate(tx, ty).scale(scale),
    );
  }
}

if (!customElements.get("dagre-graph")) {
  customElements.define("dagre-graph", DagreGraph);
}
