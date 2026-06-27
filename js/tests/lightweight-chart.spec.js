import { test, expect } from "@playwright/test";

// The <lightweight-chart> wrapper is mounted by the spaday runtime from a Python-shaped node (tagged
// Value props) and must render a real chart. Proves the imperative-library recipe end to end.

const LINE = [
  { time: "2019-01-01", value: 10 },
  { time: "2019-01-02", value: 12 },
  { time: "2019-01-03", value: 9 },
];

// the wire form the runtime receives (what spaday.diff would produce for these props)
const node = (type, points) => ({
  tag: "lightweight-chart",
  props: {
    type: { Str: type },
    data: {
      List: points.map((p) => ({
        Map: { time: { Str: p.time }, value: { Int: p.value } },
      })),
    },
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/lightweight-chart.html");
  await page.waitForFunction(
    () => window.__spaday && customElements.get("lightweight-chart"),
  );
});

test("renders a chart from Python-shaped props", async ({ page }) => {
  await page.evaluate(
    (n) => {
      window.__el = window.__spaday.mount(document.body, n);
    },
    node("line", LINE),
  );

  // lightweight-charts draws to canvas(es) once connected + sized
  await page.waitForFunction(
    () => document.querySelector("lightweight-chart canvas"),
    { timeout: 5000 },
  );

  const result = await page.evaluate(() => ({
    tag: window.__el.tagName.toLowerCase(),
    canvases: window.__el.querySelectorAll("canvas").length,
    dataLen: window.__el.data.length,
  }));
  expect(result.tag).toBe("lightweight-chart");
  expect(result.canvases).toBeGreaterThan(0);
  expect(result.dataLen).toBe(3);
});

test("accepts a time-keyed map and sorts it into a series (what a bound model field holds)", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const el = document.createElement("lightweight-chart");
    el.type = "area";
    document.body.appendChild(el);
    // an unsorted { time: value } map — the shape a transports `Chart.data` field holds; a bound `data`
    // prop flows it straight through, and the wrapper sorts it into the ascending series the chart wants
    el.data = { "2019-01-03": 9, "2019-01-01": 10, "2019-01-02": 12 };
    return { len: el.data.length, first: el.data[0], last: el.data[2] };
  });
  expect(result.len).toBe(3);
  expect(result.first).toEqual({ time: "2019-01-01", value: 10 });
  expect(result.last).toEqual({ time: "2019-01-03", value: 9 });
});

test("a SetProp patch updates the chart's data", async ({ page }) => {
  await page.evaluate(
    (n) => {
      window.__el = window.__spaday.mount(document.body, n);
    },
    node("line", LINE),
  );
  await page.waitForFunction(() =>
    document.querySelector("lightweight-chart canvas"),
  );

  const len = await page.evaluate(
    (more) => {
      window.__spaday.applyPatch(window.__el, {
        ops: [{ SetProp: { path: [], name: "data", value: more } }],
      });
      return window.__el.data.length;
    },
    node("line", [...LINE, { time: "2019-01-04", value: 14 }]).props.data,
  );

  expect(len).toBe(4); // the runtime set the live element's `data` property
});

test("re-fits the time scale on resize, so it isn't left compacted from a zero-width mount", async ({
  page,
}) => {
  await page.evaluate(
    (n) => {
      window.__el = window.__spaday.mount(document.body, n);
    },
    node("line", LINE),
  );
  await page.waitForFunction(() =>
    document.querySelector("lightweight-chart canvas"),
  );

  const fits = await page.evaluate(async () => {
    const el = window.__el;
    const ts = el.chart.timeScale(); // TS `private` is compile-time only — the field is live at runtime
    let count = 0;
    const orig = ts.fitContent.bind(ts);
    ts.fitContent = () => {
      count += 1;
      return orig();
    };
    el.style.width = "200px"; // a real size change → ResizeObserver → the wrapper re-fits
    await new Promise((r) => setTimeout(r, 150));
    return count;
  });
  expect(fits).toBeGreaterThan(0); // without the resize→fitContent the series stays compacted
});
