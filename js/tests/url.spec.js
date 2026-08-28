import { test, expect } from "@playwright/test";

// `bindUrl` (the `url=` bootstrap option): store fields bound to query parameters — seeded from the
// URL at boot, pushed as history entries on change, written back on back/forward.

const bind = (page, seed, fields) =>
  page.evaluate(
    ({ seed, fields }) => {
      const store = new window.__spaday.Store(seed);
      window.__store = store;
      window.__spaday.bindUrl(store, fields);
      return Object.fromEntries(
        Object.keys(fields).map((f) => [f, store.get(f)]),
      );
    },
    { seed, fields },
  );
const field = (page, name) =>
  page.evaluate((name) => window.__store.get(name), name);
const search = (page) => page.evaluate(() => window.location.search);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html?model=beta");
  await page.waitForFunction(() => window.__spaday);
});

test("a query parameter seeds its field at boot, over the store's seed", async ({
  page,
}) => {
  const seeded = await bind(
    page,
    { model: "alpha", other: "x" },
    { model: "model", other: "o" },
  );
  expect(seeded).toEqual({ model: "beta", other: "x" }); // absent parameter: seed kept
});

test("changes push history entries and back/forward write the field back", async ({
  page,
}) => {
  await bind(page, { model: "alpha" }, { model: "model" });
  await page.evaluate(() => window.__store.set("model", "gamma"));
  expect(await search(page)).toBe("?model=gamma");
  await page.evaluate(() => window.__store.set("model", "gamma")); // unchanged: no new entry
  await page.evaluate(() => window.__store.set("model", "delta"));
  expect(await search(page)).toBe("?model=delta");

  await page.goBack();
  await expect.poll(() => field(page, "model")).toBe("gamma");
  await page.goBack();
  await expect.poll(() => field(page, "model")).toBe("beta");
  await page.goForward();
  await expect.poll(() => field(page, "model")).toBe("gamma");
  expect(await search(page)).toBe("?model=gamma");
});

test("an empty value clears the parameter and back restores the boot seed", async ({
  page,
}) => {
  await page.goto("/tests/runtime.html?page=3");
  await page.waitForFunction(() => window.__spaday);
  const seeded = await bind(
    page,
    { page: 1, model: null },
    { page: "page", model: "model" },
  );
  expect(seeded).toEqual({ page: 3, model: null }); // a non-string seed reads its parameter as JSON

  await page.evaluate(() => window.__store.set("page", 2));
  await page.evaluate(() => window.__store.set("model", "alpha"));
  expect(await search(page)).toBe("?page=2&model=alpha");
  await page.evaluate(() => window.__store.set("model", null));
  expect(await search(page)).toBe("?page=2");
  expect(await field(page, "page")).toBe(2);

  await page.goBack(); // ?page=2&model=alpha
  await expect.poll(() => field(page, "model")).toBe("alpha");
  await page.goBack(); // ?page=2
  await page.goBack(); // ?page=3, the boot URL: the field is back to its parameter value
  await expect.poll(() => field(page, "page")).toBe(3);
  await expect.poll(() => field(page, "model")).toBe(null);
});
