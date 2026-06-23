import fs from "fs";
import { test, expect } from "@playwright/test";
import { initSync } from "../dist/pkg/spaday";

// Structural reactivity: a `spa-show` MOUNTS its children when a store condition is truthy and REMOVES
// them (real DOM create/destroy, not hide) when falsy. The wrapper stays put; only its children toggle.

test.beforeAll(() => {
  initSync({ module: fs.readFileSync("./dist/pkg/spaday_bg.wasm") });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("spa-show creates and removes children as its field toggles", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ on: false });
    const root = mount(
      document.createElement("div"),
      {
        tag: "spa-show",
        bindings: { when: { field: "on", mode: "one-way" } },
        slots: {
          default: [
            { tag: "section", props: { textContent: { Str: "chart" } } },
          ],
        },
      },
      store,
    );
    const count = () => root.querySelectorAll("section").length;
    const steps = [count()]; // 0 — falsy initially, children not mounted
    store.set("on", true);
    steps.push(count()); // 1 — created
    store.set("on", false);
    steps.push(count()); // 0 — removed (not hidden)
    store.set("on", true);
    steps.push(count()); // 1 — created again
    return steps;
  });
  expect(result).toEqual([0, 1, 0, 1]);
});

test("a compute condition shows children when the expression is truthy", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ hidden: true });
    const root = mount(
      document.createElement("div"),
      {
        tag: "spa-show",
        bindings: {
          when: {
            compute: { expr: "not", of: { expr: "field", name: "hidden" } },
            mode: "one-way",
          },
        },
        slots: { default: [{ tag: "p" }] },
      },
      store,
    );
    const before = root.querySelectorAll("p").length; // not(true) → 0
    store.set("hidden", false); // not(false) → shown
    return { before, after: root.querySelectorAll("p").length };
  });
  expect(result.before).toBe(0);
  expect(result.after).toBe(1);
});

test("re-shown children are freshly bound to the current store value", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ on: true, label: "a" });
    const root = mount(
      document.createElement("div"),
      {
        tag: "spa-show",
        bindings: { when: { field: "on", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "span",
              bindings: { textContent: { field: "label", mode: "one-way" } },
            },
          ],
        },
      },
      store,
    );
    const first = root.querySelector("span").textContent; // "a"
    store.set("on", false); // unmount + tear down the span's binding
    store.set("label", "b"); // changes while unmounted
    store.set("on", true); // remount — a fresh build picks up the current value
    return { first, second: root.querySelector("span").textContent };
  });
  expect(result.first).toBe("a");
  expect(result.second).toBe("b");
});
