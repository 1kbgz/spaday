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

test("a computed binding writes once per settled change, not once per dependency notification", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ action_result: null });
    // The toast pattern: one endpoint-result object, a message expression reading three of
    // its paths. A single settled write notifies each subscribed path, but an effectful
    // prop (spa-toast's message enqueues per non-empty write) must see one write.
    const el = mount(
      document.body,
      {
        tag: "spa-toast",
        bindings: {
          message: {
            compute: {
              expr: "cond",
              test: {
                expr: "all",
                of: [
                  { expr: "field", name: "action_result" },
                  {
                    expr: "not",
                    of: { expr: "field", name: "action_result.ok" },
                  },
                ],
              },
              then: {
                expr: "concat",
                parts: [
                  { expr: "lit", value: "Request failed: " },
                  { expr: "field", name: "action_result.status" },
                ],
              },
              else: { expr: "lit", value: "" },
            },
            mode: "one-way",
          },
        },
      },
      store,
    );
    const toasts = () =>
      [...el.shadowRoot.querySelectorAll(".toast")].map((t) => t.textContent);
    store.set("action_result", { ok: false, status: 500, body: "boom" });
    const afterFailure = toasts();
    store.set("action_result", { ok: true, status: 200, body: "fine" });
    const afterSuccess = toasts(); // message cleared to "": enqueues nothing
    store.set("action_result", { ok: false, status: 502, body: "bad gateway" });
    return { afterFailure, afterSuccess, afterSecondFailure: toasts() };
  });
  // one settled change notified three dependencies but enqueued exactly one toast
  expect(result.afterFailure).toEqual(["Request failed: 500"]);
  expect(result.afterSuccess).toEqual(["Request failed: 500"]);
  // a value that genuinely changes back writes again
  expect(result.afterSecondFailure).toEqual([
    "Request failed: 500",
    "Request failed: 502",
  ]);
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

test("a concat expr composes strings from fields reactively", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ key: "A" });
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: {
          textContent: {
            compute: {
              expr: "concat",
              parts: [
                { expr: "lit", value: "Basket " },
                { expr: "field", name: "key" },
              ],
            },
            mode: "one-way",
          },
        },
      },
      store,
    );
    const initial = root.textContent;
    store.set("key", "B");
    return { initial, after: root.textContent };
  });
  expect(result).toEqual({ initial: "Basket A", after: "Basket B" });
});

test("item and named scope expressions resolve lexically and update reactively", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Scope, Store } = window.__spaday;
    const store = new Store({ prefix: "Row" });
    const staging = new Scope({ channel: "alpha", enabled: true }, "staging");
    const record = new Scope({ id: 7, ready: true }, "record", staging);
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: {
          textContent: {
            compute: {
              expr: "concat",
              parts: [
                { expr: "field", name: "prefix" },
                { expr: "lit", value: ":" },
                { expr: "scope", name: "staging", path: "channel" },
                { expr: "lit", value: ":" },
                {
                  expr: "cond",
                  test: {
                    expr: "all",
                    of: [
                      { expr: "item", path: "ready" },
                      {
                        expr: "scope",
                        name: "staging",
                        path: "enabled",
                      },
                    ],
                  },
                  then: { expr: "item", path: "id" },
                  else: { expr: "lit", value: "waiting" },
                },
              ],
            },
            mode: "one-way",
          },
        },
      },
      store,
      record,
    );
    const values = [root.textContent];
    staging.set({ channel: "beta", enabled: true });
    values.push(root.textContent);
    record.set({ id: 8, ready: false });
    values.push(root.textContent);
    store.set("prefix", "Item");
    values.push(root.textContent);
    const shadow = new Scope({ channel: "nearest" }, "staging", record);
    return {
      values,
      missingItem: record.get("missing"),
      missingScope: record.resolve("missing")?.get(),
      shadowedScope: shadow.resolve("staging")?.get("channel"),
    };
  });

  expect(result.values).toEqual([
    "Row:alpha:7",
    "Row:beta:7",
    "Row:beta:waiting",
    "Item:beta:waiting",
  ]);
  expect(result.missingItem).toBeUndefined();
  expect(result.missingScope).toBeUndefined();
  expect(result.shadowedScope).toBe("nearest");
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

test("a root-attr binding writes the field's value as an attribute on <html>", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({
      density: "comfortable",
      vivid: false,
      lang: "en",
    });
    mount(
      document.createElement("div"),
      {
        tag: "div",
        bindings: {
          "root-attr:data-density": { field: "density", mode: "one-way" },
          "root-attr:data-vivid": { field: "vivid", mode: "one-way" },
          "root-attr:lang": { field: "lang", mode: "one-way" },
        },
      },
      store,
    );
    const root = document.documentElement;
    const seeded = root.getAttribute("data-density"); // seeded field applies at mount
    store.set("density", "compact"); // an enum replaces rather than accumulates
    const replaced = root.getAttribute("data-density");
    store.set("density", null);
    const cleared = root.hasAttribute("data-density");
    store.set("vivid", true); // true is the bare attribute, not the string "true"
    const bare = root.getAttribute("data-vivid");
    // `lang` is also a property of <html>: a root-attr binding still writes the attribute
    const attribute = root.getAttribute("lang");
    return { seeded, replaced, cleared, bare, attribute };
  });
  expect(result).toEqual({
    seeded: "comfortable",
    replaced: "compact",
    cleared: false,
    bare: "",
    attribute: "en",
  });
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

test("collection subscribers receive resets while ordinary subscribers keep value semantics", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store({ rows: [{ id: 1 }] });
    const values = [];
    const deltas = [];
    store.subscribe("rows", (value) => values.push(value));
    store.subscribeCollection("rows", "id", (delta) => deltas.push(delta));

    const rows = [{ id: 1 }, { id: 2 }];
    store.set("rows", rows);
    store.set("rows", rows);
    return { values, deltas };
  });

  expect(result.values).toEqual([[{ id: 1 }, { id: 2 }]]);
  expect(result.deltas).toEqual([
    { kind: "reset", items: [{ id: 1 }, { id: 2 }] },
  ]);
});

test("setCollection publishes exact deltas after storing the final collection", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store({ rows: [{ id: 1, name: "A" }] });
    const values = [];
    const changes = [];
    store.subscribe("rows", (value) => values.push(value));
    store.subscribeCollection("rows", "id", (delta) => {
      changes.push({ delta, visible: store.get("rows") });
    });

    const rows = [
      { id: 1, name: "AA" },
      { id: 2, name: "B" },
    ];
    store.setCollection("rows", rows, [
      { kind: "update", key: 1, path: ["name"], value: "AA" },
      { kind: "insert", key: 2, index: 1, item: rows[1] },
    ]);
    return { values, changes };
  });

  const rows = [
    { id: 1, name: "AA" },
    { id: 2, name: "B" },
  ];
  expect(result.values).toEqual([rows]);
  expect(result.changes).toEqual([
    {
      delta: { kind: "update", key: 1, path: ["name"], value: "AA" },
      visible: rows,
    },
    {
      delta: { kind: "insert", key: 2, index: 1, item: rows[1] },
      visible: rows,
    },
  ]);
});

test("collection-only dotted subscriptions stay indexed until unsubscribe", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store({ model: { rows: [] } });
    const deltas = [];
    const unsubscribe = store.subscribeCollection("model.rows", "id", (delta) =>
      deltas.push(delta),
    );
    store.set("model", { rows: [{ id: 1 }] });
    unsubscribe();
    store.set("model", { rows: [{ id: 2 }] });
    return deltas;
  });

  expect(result).toEqual([{ kind: "reset", items: [{ id: 1 }] }]);
});

test("collection subscribers expose a key only while all repeaters agree", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store();
    const first = store.subscribeCollection("rows", "id", () => {});
    const shared = store.collectionKey("rows");
    const second = store.subscribeCollection("rows", "slug", () => {});
    const conflicted = store.collectionKey("rows") ?? null;
    second();
    const restored = store.collectionKey("rows");
    first();
    const absent = store.collectionKey("rows") ?? null;
    return { shared, conflicted, restored, absent };
  });

  expect(result).toEqual({
    shared: "id",
    conflicted: null,
    restored: "id",
    absent: null,
  });
});

test("subscriber paths retain ancestor and descendant notifications after index pruning", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store({
      profile: { name: { first: "Ada", last: "Lovelace" } },
      unrelated: 0,
    });
    const seen = { parent: 0, leaf: 0, descendant: 0, unrelated: 0 };
    store.subscribe("profile", () => (seen.parent += 1));
    const unsubscribe = store.subscribe("profile.name", () => (seen.leaf += 1));
    store.subscribe("profile.name.first", () => (seen.descendant += 1));
    store.subscribe("unrelated", () => (seen.unrelated += 1));

    store.set("profile.name", { first: "Grace", last: "Hopper" });
    unsubscribe();
    store.set("profile.name.first", "Rear Admiral Grace");
    return seen;
  });

  expect(result).toEqual({
    parent: 2,
    leaf: 1,
    descendant: 2,
    unrelated: 0,
  });
});

test("a notification can unsubscribe a related descendant", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { Store } = window.__spaday;
    const store = new Store({ profile: { name: "Ada" } });
    let descendant = 0;
    const unsubscribe = store.subscribe(
      "profile.name",
      () => (descendant += 1),
    );
    store.subscribe("profile", unsubscribe);
    store.set("profile", { name: "Grace" });
    return descendant;
  });

  expect(result).toBe(0);
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

test("an arr expr composes a list from sub-expressions reactively", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    // a probe element with a real `selected` property, so the list lands unstringified
    customElements.define(
      "arr-probe",
      class extends HTMLElement {
        selected = null;
      },
    );
    const store = new Store({ path: "a/b" });
    const root = mount(
      document.createElement("div"),
      {
        tag: "arr-probe",
        bindings: {
          selected: {
            compute: {
              expr: "arr",
              of: [
                { expr: "field", name: "path" },
                { expr: "lit", value: "pinned" },
              ],
            },
            mode: "one-way",
          },
        },
      },
      store,
    );
    const initial = root.selected;
    store.set("path", "c/d");
    return { initial, after: root.selected };
  });
  expect(result.initial).toEqual(["a/b", "pinned"]);
  expect(result.after).toEqual(["c/d", "pinned"]);
});
