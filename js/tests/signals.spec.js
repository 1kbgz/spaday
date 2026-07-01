import fs from "fs";
import { test, expect } from "@playwright/test";
import { diff } from "../src/ts/index";
import { initSync } from "../dist/pkg/spaday";

// The reactive engine: a `Store` of named fields backs the tree's `bindings` (prop ↔ field). One-way
// bindings flow field → prop; two-way bindings also write the field when the control changes. `diff`
// runs here in node to produce SetBinding ops; `mount`/`applyPatch` run in the browser page.

test.beforeAll(() => {
  initSync({ module: fs.readFileSync("./dist/pkg/spaday_bg.wasm") });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("one-way binding flows a field to the bound prop, reactively", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ msg: "hi" });
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: { textContent: { field: "msg", mode: "one-way" } },
      },
      store,
    );
    const initial = root.textContent; // field's initial value applied on mount
    store.set("msg", "bye"); // a field change updates the bound prop
    return { initial, after: root.textContent };
  });
  expect(result.initial).toBe("hi");
  expect(result.after).toBe("bye");
});

test("two-way binding: a control writes its field, updating other props bound to it", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ on: false });
    const checkbox = (key) => ({
      tag: "input",
      key,
      props: { type: { Str: "checkbox" } },
      bindings: { checked: { field: "on", mode: "two-way" } },
    });
    const root = mount(
      document.createElement("div"),
      { tag: "div", slots: { default: [checkbox("a"), checkbox("b")] } },
      store,
    );
    const [a, b] = root.querySelectorAll("input");
    const before = [a.checked, b.checked];
    a.checked = true;
    a.dispatchEvent(new Event("change")); // control → field
    return { before, storeOn: store.get("on"), bChecked: b.checked };
  });
  expect(result.before).toEqual([false, false]);
  expect(result.storeOn).toBe(true); // the control's change wrote the field
  expect(result.bChecked).toBe(true); // ...which flowed to the other bound control
});

test("two-way binding writes on wa-tab-show (routing-aware Tabs.active)", async ({
  page,
}) => {
  const view = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ view: "a" });
    const root = mount(
      document.createElement("div"),
      {
        tag: "div",
        slots: {
          default: [
            {
              tag: "wa-tab-group",
              bindings: { active: { field: "view", mode: "two-way" } },
            },
          ],
        },
      },
      store,
    );
    const group = root.querySelector("wa-tab-group");
    group.setAttribute("active", "b"); // WebAwesome reflects the newly active tab...
    group.dispatchEvent(new CustomEvent("wa-tab-show", { bubbles: true })); // ...and fires this
    return store.get("view");
  });
  expect(view).toBe("b"); // the user's tab selection flowed back into the bound field
});

test("two-way binding skips an invalid value (gated on the control's validity)", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ n: 5 });
    const root = mount(
      document.createElement("div"),
      {
        tag: "input",
        props: { type: { Str: "number" }, required: { Bool: true } },
        bindings: { value: { field: "n", mode: "two-way" } },
      },
      store,
    );
    root.value = ""; // empty + required → checkValidity() is false: the field must NOT be overwritten
    root.dispatchEvent(new Event("input"));
    const afterInvalid = store.get("n");
    root.value = "42"; // a valid number → written through
    root.dispatchEvent(new Event("input"));
    return { afterInvalid, afterValid: store.get("n") };
  });
  expect(result.afterInvalid).toBe(5); // the invalid value was not propagated (no doomed edit)
  expect(result.afterValid).toBe("42"); // a valid value still writes
});

test("an incremental SetBinding patch wires a binding on a live element", async ({
  page,
}) => {
  const oldTree = { tag: "span" };
  const newTree = {
    tag: "span",
    bindings: { textContent: { field: "x", mode: "one-way" } },
  };
  const patch = JSON.parse(
    diff(JSON.stringify(oldTree), JSON.stringify(newTree)),
  );
  expect(JSON.stringify(patch)).toContain("SetBinding"); // the core emits it

  const result = await page.evaluate(
    ({ oldTree, patch }) => {
      const { mount, applyPatch, Store } = window.__spaday;
      const store = new Store({ x: "a" });
      const root = mount(document.createElement("div"), oldTree, store); // unbound
      applyPatch(root, patch, store); // SetBinding wires it
      const initial = root.textContent;
      store.set("x", "b");
      return { initial, after: root.textContent };
    },
    { oldTree, patch },
  );
  expect(result.initial).toBe("a"); // bound on apply, initial value applied
  expect(result.after).toBe("b"); // and reactive thereafter
});

test("a computed binding derives a prop from fields and recomputes reactively", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ enabled: true, mode: "basic" });
    // disabled = not(enabled); hidden = (mode == "advanced")
    const tree = {
      tag: "div",
      slots: {
        default: [
          {
            tag: "button",
            bindings: {
              disabled: {
                compute: {
                  expr: "not",
                  of: { expr: "field", name: "enabled" },
                },
                mode: "one-way",
              },
            },
          },
          {
            tag: "span",
            bindings: {
              hidden: {
                compute: {
                  expr: "eq",
                  a: { expr: "field", name: "mode" },
                  b: { expr: "lit", value: "advanced" },
                },
                mode: "one-way",
              },
            },
          },
        ],
      },
    };
    const root = mount(document.createElement("div"), tree, store);
    const btn = root.querySelector("button");
    const span = root.querySelector("span");
    const initial = { disabled: btn.disabled, hidden: span.hidden };
    store.set("enabled", false); // not(false) → true
    store.set("mode", "advanced"); // eq(advanced, advanced) → true
    return { initial, after: { disabled: btn.disabled, hidden: span.hidden } };
  });
  expect(result.initial).toEqual({ disabled: false, hidden: false }); // not(true); eq(basic,advanced)
  expect(result.after).toEqual({ disabled: true, hidden: true }); // recomputed when the fields changed
});

test("a cond expr selects between two values by a field, reactively", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ dark: false });
    // textContent = cond(dark, "dark", "light")
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: {
          textContent: {
            compute: {
              expr: "cond",
              test: { expr: "field", name: "dark" },
              then: { expr: "lit", value: "dark" },
              else: { expr: "lit", value: "light" },
            },
            mode: "one-way",
          },
        },
      },
      store,
    );
    const initial = root.textContent; // cond(false, …) → "light"
    store.set("dark", true); // → "dark"
    return { initial, after: root.textContent };
  });
  expect(result.initial).toBe("light");
  expect(result.after).toBe("dark");
});

test("a root-class binding toggles a class on <html> from a field", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ dark: false });
    mount(
      document.createElement("div"),
      {
        tag: "div",
        bindings: { "root-class:wa-dark": { field: "dark", mode: "one-way" } },
      },
      store,
    );
    const initial = document.documentElement.classList.contains("wa-dark");
    store.set("dark", true); // field drives the class on the document root
    const on = document.documentElement.classList.contains("wa-dark");
    store.set("dark", false);
    const off = document.documentElement.classList.contains("wa-dark");
    return { initial, on, off };
  });
  expect(result).toEqual({ initial: false, on: true, off: false });
});

test("nested-path fields: set/get a dotted path; notify the leaf and its ancestor, not a sibling", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store({ address: { street: "Main", city: "NYC" } });
    const seen = { leaf: [], parent: 0, sibling: 0 };
    store.subscribe("address.street", (v) => seen.leaf.push(v));
    store.subscribe("address", () => (seen.parent += 1));
    store.subscribe("address.city", () => (seen.sibling += 1));
    const before = store.get("address.street");
    store.set("address.street", "Oak"); // write one nested leaf
    return {
      before,
      after: store.get("address.street"),
      siblingValue: store.get("address.city"), // sibling preserved through the immutable set
      leaf: seen.leaf,
      parentFired: seen.parent, // ancestor identity changed → notified
      siblingFired: seen.sibling, // unchanged → not notified
    };
  });
  expect(result.before).toBe("Main");
  expect(result.after).toBe("Oak");
  expect(result.siblingValue).toBe("NYC");
  expect(result.leaf).toEqual(["Oak"]);
  expect(result.parentFired).toBe(1);
  expect(result.siblingFired).toBe(0);
});

test("a binding to a dotted path reacts to nested state, two-way", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ address: { street: "Main" } });
    const root = mount(
      document.createElement("div"),
      {
        tag: "input",
        bindings: { value: { field: "address.street", mode: "two-way" } },
      },
      store,
    );
    const initial = root.value; // nested field → prop on mount
    root.value = "Oak";
    root.dispatchEvent(new Event("change")); // two-way: control → nested field
    return { initial, stored: store.get("address.street") };
  });
  expect(result.initial).toBe("Main");
  expect(result.stored).toBe("Oak");
});
