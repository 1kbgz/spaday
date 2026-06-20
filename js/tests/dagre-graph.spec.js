import { test, expect } from "@playwright/test";

// The <dagre-graph> wrapper is mounted by the spaday runtime from a Python-shaped node (tagged Value
// props) and must render a real graph (dagre-d3 draws <g class="node"> per node). Proves the
// imperative-library recipe for a second, structurally different library (a graph, not a chart).

const NODES = [{ id: "a" }, { id: "b" }, { id: "c" }];
const EDGES = [
  { from: "a", to: "b" },
  { from: "b", to: "c" },
];

// the wire form the runtime receives (what spaday.diff would produce for these props)
const node = (nodes, edges) => ({
  tag: "dagre-graph",
  props: {
    direction: { Str: "left-to-right" },
    nodes: {
      List: nodes.map((n) => ({ Map: { id: { Str: n.id } } })),
    },
    edges: {
      List: edges.map((e) => ({
        Map: { from: { Str: e.from }, to: { Str: e.to } },
      })),
    },
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/dagre-graph.html");
  await page.waitForFunction(
    () => window.__spaday && customElements.get("dagre-graph"),
  );
});

test("renders a graph from Python-shaped props", async ({ page }) => {
  await page.evaluate(
    (n) => {
      window.__el = window.__spaday.mount(document.body, n);
    },
    node(NODES, EDGES),
  );

  // dagre-d3 draws one <g class="node"> per node once connected + laid out
  await page.waitForFunction(
    () => document.querySelectorAll("dagre-graph svg g.node").length >= 3,
    { timeout: 5000 },
  );

  const result = await page.evaluate(() => ({
    tag: window.__el.tagName.toLowerCase(),
    nodes: window.__el.querySelectorAll("svg g.node").length,
    edges: window.__el.querySelectorAll("svg g.edgePath").length,
    nodesLen: window.__el.nodes.length,
  }));
  expect(result.tag).toBe("dagre-graph");
  expect(result.nodes).toBe(3);
  expect(result.edges).toBe(2);
  expect(result.nodesLen).toBe(3);
});

test("a SetProp patch adds a node to the graph", async ({ page }) => {
  await page.evaluate(
    (n) => {
      window.__el = window.__spaday.mount(document.body, n);
    },
    node(NODES, EDGES),
  );
  await page.waitForFunction(
    () => document.querySelectorAll("dagre-graph svg g.node").length >= 3,
  );

  await page.evaluate(
    (more) => {
      window.__spaday.applyPatch(window.__el, {
        ops: [{ SetProp: { path: [], name: "nodes", value: more } }],
      });
    },
    node([...NODES, { id: "d" }], EDGES).props.nodes,
  );

  await page.waitForFunction(
    () => document.querySelectorAll("dagre-graph svg g.node").length === 4,
    { timeout: 5000 },
  );
  const n = await page.evaluate(
    () => window.__el.querySelectorAll("svg g.node").length,
  );
  expect(n).toBe(4); // the runtime set the live element's `nodes` property and it re-rendered
});
