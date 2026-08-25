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

test("the shell ships a dark palette keyed off wa-dark, with wa-light flipping a nested island back", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const nav = window.__spaday.mount(document.body, { tag: "spa-nav" });
    const bg = () => getComputedStyle(nav).backgroundColor;
    const light = bg();
    document.documentElement.classList.add("wa-dark"); // what bind_root_class("wa-dark", ...) toggles
    const dark = bg();
    const island = document.createElement("div");
    island.className = "wa-light";
    document.body.append(island);
    const islandNav = window.__spaday.mount(island, { tag: "spa-nav" });
    const islandBg = getComputedStyle(islandNav).backgroundColor;
    document.documentElement.classList.remove("wa-dark");
    return { light, dark, islandBg, back: bg() };
  });
  expect(r.light).toBe("rgb(255, 255, 255)"); // the light default
  expect(r.dark).toBe("rgb(21, 25, 30)"); // --spa-surface under .wa-dark
  expect(r.islandBg).toBe("rgb(255, 255, 255)"); // a light island inside a dark page
  expect(r.back).toBe("rgb(255, 255, 255)"); // removing the class restores the light palette
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

test("spa-table reconciles keyed row updates, additions, removals, and moves", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({
      orders: [
        { id: "a", symbol: "AAPL", qty: 10 },
        { id: "b", symbol: "MSFT", qty: 5 },
      ],
    });
    const el = mount(
      document.body,
      {
        tag: "spa-table",
        props: {
          columns: {
            List: [{ Str: "id" }, { Str: "symbol" }, { Str: "qty" }],
          },
          rowKey: { Str: "id" },
        },
        bindings: {
          rows: { compute: { expr: "field", name: "orders" }, mode: "one-way" },
        },
      },
      store,
    );
    const table = el.shadowRoot.querySelector("table");
    const [a, b] = [...table.tBodies[0].rows];
    const bSymbolText = b.cells[1].firstChild;

    store.set("orders", [
      { id: "b", symbol: "MSFT", qty: 7 },
      { id: "c", symbol: "GOOG", qty: 9 },
    ]);

    const rows = [...table.tBodies[0].rows];
    return {
      tablePreserved: el.shadowRoot.querySelector("table") === table,
      movedRowPreserved: rows[0] === b,
      unchangedCellPreserved: rows[0].cells[1].firstChild === bSymbolText,
      removedRowDetached: !a.isConnected,
      addedRowIsNew: rows[1] !== a && rows[1] !== b,
      values: rows.map((row) => [...row.cells].map((cell) => cell.textContent)),
    };
  });

  expect(result).toEqual({
    tablePreserved: true,
    movedRowPreserved: true,
    unchangedCellPreserved: true,
    removedRowDetached: true,
    addedRowIsNew: true,
    values: [
      ["b", "MSFT", "7"],
      ["c", "GOOG", "9"],
    ],
  });
});

test("spa-table rejects missing and duplicate row keys", async ({ page }) => {
  const errors = await page.evaluate(() => {
    const el = window.__spaday.mount(document.body, {
      tag: "spa-table",
      props: {
        columns: { List: [{ Str: "id" }] },
        rowKey: { Str: "id" },
        rows: { List: [] },
      },
    });
    const assign = (rows) => {
      try {
        el.rows = rows;
        return null;
      } catch (error) {
        return error.message;
      }
    };
    return {
      missing: assign([{ name: "missing" }]),
      duplicate: assign([{ id: 1 }, { id: 1 }]),
    };
  });

  expect(errors.missing).toContain('row_key "id" must exist');
  expect(errors.duplicate).toContain('row_key "id" contains duplicate value 1');
});

test("spa-table projects rich component cells with working actions", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const { mount, registerHandler } = window.__spaday;
    let call = null;
    registerHandler("inspect-order", (event, currentTarget) => {
      call = {
        event: event.type,
        id: currentTarget.id,
        symbol: currentTarget.getAttribute("data-symbol"),
      };
    });
    const el = mount(document.body, {
      tag: "spa-table",
      props: {
        columns: { List: [{ Str: "symbol" }, { Str: "action" }] },
        rows: {
          List: [
            {
              Map: {
                symbol: { Str: "AAPL" },
                action: {
                  Map: { __spaday_cell_slot__: { Str: "cell-0" } },
                },
              },
            },
          ],
        },
      },
      slots: {
        "cell-0": [
          {
            tag: "button",
            props: {
              id: { Str: "inspect" },
              "data-symbol": { Str: "AAPL" },
              textContent: { Str: "Inspect" },
            },
            events: {
              click: { kind: "js", handler: "inspect-order" },
            },
          },
        ],
      },
    });
    const slot = el.shadowRoot.querySelector('slot[name="cell-0"]');
    const button = slot.assignedElements()[0];
    button.click();
    return {
      call,
      cellText: button.textContent,
      assignedTag: button.tagName,
      slotName: button.getAttribute("slot"),
    };
  });

  expect(r).toEqual({
    call: { event: "click", id: "inspect", symbol: "AAPL" },
    cellText: "Inspect",
    assignedTag: "BUTTON",
    slotName: "cell-0",
  });
});

test("spa-popup opens at pointer coordinates from a contextmenu action and light-dismisses", async ({
  page,
}) => {
  await page.evaluate(() => {
    window.__spaday.mount(document.body, {
      tag: "spa-stack",
      slots: {
        default: [
          {
            tag: "div",
            props: {
              id: { Str: "surface" },
              textContent: { Str: "right-click me" },
              style: { Str: "width:400px;height:200px" },
            },
            events: {
              contextmenu: {
                kind: "seq",
                actions: [
                  {
                    kind: "set",
                    target: { ref: "id", id: "menu" },
                    prop: "x",
                    value: { expr: "event-prop", path: "clientX" },
                  },
                  {
                    kind: "set",
                    target: { ref: "id", id: "menu" },
                    prop: "y",
                    value: { expr: "event-prop", path: "clientY" },
                  },
                  {
                    kind: "set",
                    target: { ref: "id", id: "menu" },
                    prop: "open",
                    value: { expr: "lit", value: true },
                  },
                ],
              },
            },
          },
          {
            tag: "spa-popup",
            props: { id: { Str: "menu" } },
            slots: {
              default: [
                { tag: "span", props: { textContent: { Str: "item" } } },
              ],
            },
          },
        ],
      },
    });
    window.__nativeMenus = 0;
    document.addEventListener("contextmenu", (e) => {
      if (!e.defaultPrevented) window.__nativeMenus += 1;
    });
  });

  await page.click("#surface", {
    button: "right",
    position: { x: 120, y: 80 },
  });
  const opened = await page.evaluate(() => {
    const surface = document.getElementById("surface").getBoundingClientRect();
    const menu = document.getElementById("menu");
    const rect = menu.getBoundingClientRect();
    return {
      open: menu.open,
      visible: getComputedStyle(menu).display === "block",
      nativeSuppressed: window.__nativeMenus === 0,
      // event-prop reads clientX/clientY off the raw event, so the popup lands AT the pointer
      dx: Math.abs(rect.left - (surface.left + 120)),
      dy: Math.abs(rect.top - (surface.top + 80)),
    };
  });
  expect(opened.open).toBe(true);
  expect(opened.visible).toBe(true);
  expect(opened.nativeSuppressed).toBe(true); // preventDefault is scoped to the bound element
  expect(opened.dx).toBeLessThan(2);
  expect(opened.dy).toBeLessThan(2);

  // clicking inside does not dismiss; clicking outside does, and dispatches spa-popup-close
  await page.evaluate(() => {
    window.__closes = 0;
    document
      .getElementById("menu")
      .addEventListener("spa-popup-close", () => (window.__closes += 1));
  });
  await page.click("#menu span");
  expect(await page.evaluate(() => document.getElementById("menu").open)).toBe(
    true,
  );
  await page.mouse.click(390, 190);
  const closed = await page.evaluate(() => ({
    open: document.getElementById("menu").open,
    closes: window.__closes,
  }));
  expect(closed).toEqual({ open: false, closes: 1 });
});

test("spa-popup clamps into the viewport and closes on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 300 });
  await page.evaluate(() => {
    const menu = document.createElement("spa-popup");
    menu.id = "clamped";
    const body = document.createElement("div");
    body.style.cssText = "width:150px;height:100px";
    menu.appendChild(body);
    document.body.appendChild(menu);
    menu.x = 490; // would overflow right/bottom
    menu.y = 290;
    menu.open = true;
  });
  await page.waitForTimeout(50); // clamping happens on the next animation frame
  const r = await page.evaluate(() => {
    const rect = document.getElementById("clamped").getBoundingClientRect();
    return {
      right: rect.right,
      bottom: rect.bottom,
    };
  });
  expect(r.right).toBeLessThanOrEqual(500);
  expect(r.bottom).toBeLessThanOrEqual(300);
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(() => document.getElementById("clamped").open),
  ).toBe(false);
});
