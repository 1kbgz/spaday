import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

async function prepare(page, windowed = false) {
  await page.evaluate((windowed) => {
    const { mount, Store } = window.__spaday;
    const rows = Array.from({ length: 100000 }, (_, id) => ({
      id,
      name: String(id),
    }));
    const store = new Store({
      rows: windowed
        ? { items: rows.slice(0, 14), offset: 0, total: 100000 }
        : rows,
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: {
          itemKey: { Str: "id" },
          rowHeight: { Int: 20 },
          viewportHeight: { Int: 200 },
          overscan: { Int: 2 },
          windowed: { Bool: windowed },
        },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "input",
              bindings: {
                value: {
                  compute: { expr: "item", path: "name" },
                  mode: "one-way",
                },
              },
            },
          ],
        },
      },
      store,
    );
    window.virtualTest = { root, store, rows, ranges: [] };
    root.addEventListener("spaday:range", (event) =>
      window.virtualTest.ranges.push(event.detail),
    );
  }, windowed);
  await expect(page.locator("spa-each input")).toHaveCount(12);
}

test("100k rows mount a bounded viewport and retain overlapping and focused rows", async ({
  page,
}) => {
  await prepare(page);
  await page.evaluate(() => {
    const { root } = window.virtualTest;
    const input = root.querySelector("input");
    input.focus();
    input.value = "unsaved";
    input.setSelectionRange(2, 4);
    window.virtualTest.input = input;
    root.scrollTop = 1000000;
  });
  await expect(page.locator("spa-each input")).toHaveCount(15);
  const result = await page.evaluate(() => {
    const { root, input, store } = window.virtualTest;
    return {
      focused: document.activeElement === input,
      value: input.value,
      selection: [input.selectionStart, input.selectionEnd],
      keys: store.collectionKey("rows"),
      scroll: root.scrollTop,
      first: root.querySelector("input").value,
    };
  });
  expect(result.focused).toBe(true);
  expect(result.value).toBe("unsaved");
  expect(result.selection).toEqual([2, 4]);
  expect(result.scroll).toBe(1000000);
  expect(result.first).toBe("49998");
  await page.evaluate(() => window.virtualTest.input.blur());
  await expect(page.locator("spa-each input")).toHaveCount(14);
});

test("virtual updates retain scroll and clamp after deletion", async ({
  page,
}) => {
  await prepare(page);
  await page.evaluate(() => {
    window.virtualTest.root.scrollTop = 10000;
  });
  await expect(page.locator("spa-each input").first()).toHaveValue("498");
  await page.evaluate(() => {
    const { root, store, rows } = window.virtualTest;
    window.virtualTest.retained = root.querySelector("input");
    const next = rows.slice();
    next[500] = { id: 500, name: "updated" };
    store.setCollection("rows", next, [
      { kind: "update", key: 500, path: ["name"], value: "updated" },
    ]);
  });
  await expect(page.locator("spa-each input").nth(2)).toHaveValue("updated");
  expect(
    await page.evaluate(
      () =>
        window.virtualTest.root.querySelector("input") ===
        window.virtualTest.retained,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => window.virtualTest.root.scrollTop)).toBe(
    10000,
  );
  await page.evaluate(() => window.virtualTest.store.set("rows", []));
  await expect(page.locator("spa-each input")).toHaveCount(0);
  expect(await page.evaluate(() => window.virtualTest.root.scrollTop)).toBe(0);
});

test("server windows request ranges and retain only supplied rows", async ({
  page,
}) => {
  await prepare(page, true);
  expect(await page.evaluate(() => window.virtualTest.ranges)).toEqual([
    { start: 0, stop: 12 },
  ]);
  await page.evaluate(() => {
    window.virtualTest.root.scrollTop = 10000;
  });
  await expect
    .poll(() => page.evaluate(() => window.virtualTest.ranges.at(-1)))
    .toEqual({ start: 498, stop: 512 });
  await expect(page.locator("spa-each input")).toHaveCount(0);
  await page.evaluate(() => {
    const { store, rows } = window.virtualTest;
    store.set("rows", {
      items: rows.slice(498, 512),
      offset: 498,
      total: 100000,
    });
  });
  await expect(page.locator("spa-each input")).toHaveCount(14);
  await expect(page.locator("spa-each input").first()).toHaveValue("498");
  expect(
    await page.evaluate(
      () => window.virtualTest.store.get("rows").items.length,
    ),
  ).toBe(14);
  expect(await page.evaluate(() => window.virtualTest.root.scrollTop)).toBe(
    10000,
  );
});

test("disposal cancels pending frames and removes virtual subscriptions", async ({
  page,
}) => {
  await prepare(page);
  const result = await page.evaluate(async () => {
    const { root, store } = window.virtualTest;
    window.__spaday.applyPatch(
      root,
      { ops: [{ Replace: { path: [], node: { tag: "div" } } }] },
      store,
    );
    store.set("rows", [{ id: 1, name: "new" }]);
    await new Promise(requestAnimationFrame);
    return {
      oldInputs: root.querySelectorAll("input").length,
      connected: root.isConnected,
    };
  });
  expect(result).toEqual({ oldInputs: 0, connected: false });
});

test("virtual batches reject intermediate key changes before touching DOM", async ({
  page,
}) => {
  await prepare(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.evaluate(() => {
    const { store, rows, root } = window.virtualTest;
    window.virtualTest.retained = root.querySelector("input");
    store.setCollection("rows", rows.slice(), [
      { kind: "update", key: 0, path: ["id"], value: -1 },
      { kind: "update", key: 0, path: ["id"], value: 0 },
    ]);
  });
  await expect
    .poll(() => errors)
    .toEqual(["spa-each collection update cannot change an item key"]);
  expect(
    await page.evaluate(
      () =>
        window.virtualTest.root.querySelector("input") ===
        window.virtualTest.retained,
    ),
  ).toBe(true);
  await page.evaluate(() =>
    window.virtualTest.store.set("rows", [{ id: 9, name: "recovered" }]),
  );
  await expect(page.locator("spa-each input")).toHaveCount(1);
  await expect(page.locator("spa-each input")).toHaveValue("recovered");
});
