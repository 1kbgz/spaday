import { test, expect } from "@playwright/test";

// The shell primitives (spa-app/nav/body/gutter/main/footer/stack/row/toolbar). They are real
// custom elements defined on import of the runtime — each a shadow root with one default slot and
// encapsulated layout CSS — so layout is authored by composing them, not by hand-writing div markup.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(
    () => window.__spaday && window.customElements.get("spa-app"),
  );
});

test("a shell element attaches a shadow root + default slot and projects its children", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const el = window.__spaday.mount(document.body, {
      tag: "spa-stack",
      slots: {
        default: [
          { tag: "span", props: { textContent: { Str: "a" } } },
          { tag: "span", props: { textContent: { Str: "b" } } },
        ],
      },
    });
    const slot = el.shadowRoot && el.shadowRoot.querySelector("slot");
    return {
      hasShadow: !!el.shadowRoot,
      hasSlot: !!slot,
      projected: slot ? slot.assignedElements().length : 0,
    };
  });
  expect(r).toEqual({ hasShadow: true, hasSlot: true, projected: 2 });
});

test("layout primitives carry their own encapsulated layout CSS", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const styleOf = (tag) => {
      const el = window.__spaday.mount(document.body, { tag });
      const cs = getComputedStyle(el); // requires being in the document — mounted into body
      return {
        display: cs.display,
        flexDirection: cs.flexDirection,
        alignItems: cs.alignItems,
      };
    };
    return { app: styleOf("spa-app"), row: styleOf("spa-row") };
  });
  expect(r.app.display).toBe("flex");
  expect(r.app.flexDirection).toBe("column"); // App stacks vertically
  expect(r.row.display).toBe("flex");
  expect(r.row.alignItems).toBe("center"); // Row centers its items
});

test("shell containers carry the slotted wa-button display fix", async ({
  page,
}) => {
  // WebAwesome's wa-button is inline-block; without this it blockifies to `block` as a flex item and
  // its internal base part overflows the host. Guard that the fix rule stays in the shadow style.
  const hasFix = await page.evaluate(() => {
    const el = window.__spaday.mount(document.body, { tag: "spa-row" });
    return el.shadowRoot
      .querySelector("style")
      .textContent.includes("::slotted(wa-button)");
  });
  expect(hasFix).toBe(true);
});

test("spa-table renders rows under columns and re-renders when the bound field changes", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ orders: [{ symbol: "AAPL", qty: 10 }] });
    // columns are static; rows are computed from a store field (the reactive case)
    const el = mount(
      document.body,
      {
        tag: "spa-table",
        props: { columns: { List: [{ Str: "symbol" }, { Str: "qty" }] } },
        bindings: {
          rows: { compute: { expr: "field", name: "orders" }, mode: "one-way" },
        },
      },
      store,
    );
    const read = () => {
      const t = el.shadowRoot.querySelector("table");
      return {
        headers: [...t.tHead.rows[0].cells].map((c) => c.textContent),
        cells: [...t.tBodies[0].rows].map((row) =>
          [...row.cells].map((c) => c.textContent),
        ),
      };
    };
    const before = read();
    store.set("orders", [
      { symbol: "MSFT", qty: 5 },
      { symbol: "GOOG", qty: 7 },
    ]); // a field change re-renders the table
    return { before, after: read() };
  });
  expect(r.before.headers).toEqual(["symbol", "qty"]); // columns → header cells
  expect(r.before.cells).toEqual([["AAPL", "10"]]); // seeded row
  expect(r.after.cells).toEqual([
    ["MSFT", "5"],
    ["GOOG", "7"],
  ]); // reactively re-rendered from the changed field
});
