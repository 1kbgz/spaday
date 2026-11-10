import { test, expect } from "@playwright/test";

const input = (path, prop = "value") => ({
  tag: "input",
  props: { class: { Str: path } },
  bindings: { [prop]: { compute: { expr: "item", path }, mode: "two-way" } },
});
const each = (template, source = { field: "rows" }, name) => ({
  tag: "spa-each",
  props: {
    itemKey: { Str: "id" },
    ...(name ? { scopeName: { Str: name } } : {}),
  },
  bindings: { items: { ...source, mode: "one-way" } },
  slots: { default: [template] },
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("item edits use current keyed rows before pending reorder and field updates render", async ({
  page,
}) => {
  const tree = each({
    tag: "div",
    slots: { default: [input("label"), input("note")] },
  });
  const result = await page.evaluate(async (tree) => {
    const { Store, mount } = __spaday;
    const store = new Store({
      rows: [
        { id: "a", label: "A", note: "old" },
        { id: "b", label: "B", note: "B" },
      ],
    });
    const root = mount(document.body, tree, store);
    const row = root.firstElementChild;
    const label = row.querySelector(".label");
    const note = row.querySelector(".note");
    label.focus();
    store.set("rows", [
      { id: "b", label: "B", note: "B" },
      { id: "a", label: "Remote", note: "Remote note", extra: true },
    ]);
    label.value = "Local";
    label.dispatchEvent(new Event("input"));
    const afterLabel = store.get("rows");
    note.value = "Local note";
    note.dispatchEvent(new Event("input"));
    await new Promise(requestAnimationFrame);
    return {
      afterLabel,
      final: store.get("rows"),
      retained: root.lastElementChild === row,
      focused: document.activeElement === label,
      values: [label.value, note.value],
    };
  }, tree);
  expect(result.afterLabel[1]).toEqual({
    id: "a",
    label: "Local",
    note: "Remote note",
    extra: true,
  });
  expect(result.final).toEqual([
    { id: "b", label: "B", note: "B" },
    { id: "a", label: "Local", note: "Local note", extra: true },
  ]);
  expect(result.retained).toBe(true);
  expect(result.focused).toBe(true);
  expect(result.values).toEqual(["Local", "Local note"]);
});

test("nested item and named ancestor bindings keep both identities during pending updates", async ({
  page,
}) => {
  const tree = each(
    each(
      {
        tag: "div",
        slots: {
          default: [
            input("label"),
            {
              tag: "input",
              props: { class: { Str: "owner" } },
              bindings: {
                value: {
                  compute: { expr: "scope", name: "group", path: "owner" },
                  mode: "two-way",
                },
              },
            },
          ],
        },
      },
      { compute: { expr: "item", path: "children" } },
    ),
    { field: "rows" },
    "group",
  );
  const result = await page.evaluate(async (tree) => {
    const { Store, mount } = __spaday;
    const store = new Store({
      rows: [
        { id: "a", owner: "Alice", children: [{ id: 1, label: "A" }] },
        { id: "b", owner: "Bob", children: [{ id: 1, label: "B" }] },
      ],
    });
    const root = mount(document.body, tree, store);
    const label = root.querySelector(".label");
    const owner = root.querySelector(".owner");
    const current = store.get("rows");
    store.set("rows", [
      current[1],
      {
        ...current[0],
        children: [
          { id: 2, label: "New" },
          { id: 1, label: "Remote", extra: 42 },
        ],
      },
    ]);
    label.value = "Edited";
    label.dispatchEvent(new Event("input"));
    owner.value = "New owner";
    owner.dispatchEvent(new Event("input"));
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return {
      rows: store.get("rows"),
      retained: root.lastElementChild.querySelectorAll(".label")[1] === label,
    };
  }, tree);
  expect(result.rows).toEqual([
    { id: "b", owner: "Bob", children: [{ id: 1, label: "B" }] },
    {
      id: "a",
      owner: "New owner",
      children: [
        { id: 2, label: "New" },
        { id: 1, label: "Edited", extra: 42 },
      ],
    },
  ]);
  expect(result.retained).toBe(true);
});

test("deleted and disposed row controls cannot resurrect a record", async ({
  page,
}) => {
  const result = await page.evaluate(
    async (tree) => {
      const { Store, mount } = __spaday;
      const store = new Store({
        rows: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      });
      const root = mount(document.body, tree, store);
      const input = root.firstElementChild;
      store.set("rows", [{ id: "b", label: "B" }]);
      input.value = "Late edit";
      input.dispatchEvent(new Event("input"));
      await new Promise(requestAnimationFrame);
      store.set("rows", [
        { id: "b", label: "B" },
        { id: "a", label: "Replacement" },
      ]);
      await new Promise(requestAnimationFrame);
      input.value = "Detached edit";
      input.dispatchEvent(new Event("input"));
      return { rows: store.get("rows"), detached: !input.isConnected };
    },
    each(input("label")),
  );
  expect(result).toEqual({
    rows: [
      { id: "b", label: "B" },
      { id: "a", label: "Replacement" },
    ],
    detached: true,
  });
});

test("an item binding cannot rename its identity", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const result = await page.evaluate(
    (tree) => {
      const { Store, mount } = __spaday;
      const store = new Store({ rows: [{ id: "a", label: "A" }] });
      const input = mount(document.body, tree, store).firstElementChild;
      input.value = "b";
      input.dispatchEvent(new Event("input"));
      return { rows: store.get("rows"), input: input.value };
    },
    each(input("id")),
  );
  expect(result).toEqual({ rows: [{ id: "a", label: "A" }], input: "a" });
  expect(errors).toEqual(["item bindings cannot change the Each key"]);
});

test("derived collections and missing scopes reject writable item bindings", async ({
  page,
}) => {
  const template = input("label");
  const literal = {
    compute: { expr: "lit", value: [{ id: "a", label: "A" }] },
  };
  const result = await page.evaluate(
    (trees) =>
      trees.map((tree) => {
        try {
          __spaday.mount(
            document.body,
            tree,
            new __spaday.Store({ rows: [{ id: "a", label: "A" }] }),
          );
          return "accepted";
        } catch (error) {
          return error.message;
        }
      }),
    [each(template, literal), template],
  );
  expect(result).toEqual([
    "two-way binding requires a writable field or item scope",
    "two-way binding requires a writable field or item scope",
  ]);
});

test("virtual rows write through the collection after scrolling", async ({
  page,
}) => {
  const tree = each(input("label"));
  tree.props = {
    ...tree.props,
    rowHeight: { Int: 30 },
    viewportHeight: { Int: 90 },
    overscan: { Int: 1 },
  };
  await page.evaluate((tree) => {
    window.store = new __spaday.Store({
      rows: Array.from({ length: 100 }, (_, id) => ({
        id,
        label: `Row ${id}`,
      })),
    });
    window.root = __spaday.mount(document.body, tree, store);
  }, tree);
  await expect(page.locator("input").first()).toHaveValue("Row 0");
  await page.evaluate(() => {
    root.scrollTop = 1500;
    root.dispatchEvent(new Event("scroll"));
  });
  await expect(page.locator("input").first()).toHaveValue("Row 49");
  await page.locator("input").first().fill("Edited");
  expect(await page.evaluate(() => store.get("rows")[49])).toEqual({
    id: 49,
    label: "Edited",
  });
  expect(await page.locator("input").count()).toBeLessThan(10);
});

test("WASM binding validation permits direct references and rejects derived writes", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { validateBinding } = await import("/dist/esm/index.js");
    const valid = [
      { expr: "item", path: "label" },
      { expr: "scope", name: "row", path: "label" },
      { expr: "field", name: "name" },
    ];
    const normalized = valid.map((compute) =>
      validateBinding({ compute, mode: "two-way" }),
    );
    let error;
    try {
      validateBinding({
        compute: { expr: "not", of: valid[0] },
        mode: "two-way",
      });
    } catch (caught) {
      error = caught.message;
    }
    return { normalized, error };
  });
  expect(result.normalized).toHaveLength(3);
  expect(result.error).toContain(
    "two-way bindings require a field, item, or scope reference",
  );
});

for (const source of [
  { field: "rows" },
  { compute: { expr: "field", name: "rows" } },
]) {
  test(`item bindings create optional maps with ${source.field ? "field" : "expression"} sources`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const control = input("details.quantity");
    control.bindings.value.codec = "number";
    const result = await page.evaluate(
      async (tree) => {
        const store = new __spaday.Store({ rows: [{ id: "a" }] });
        const root = __spaday.mount(document.body, tree, store);
        const input = root.querySelector("input");
        input.value = "12";
        input.dispatchEvent(new Event("input"));
        await new Promise(requestAnimationFrame);
        return {
          rows: store.get("rows"),
          text: root.querySelector("output").textContent,
        };
      },
      each(
        {
          tag: "div",
          slots: {
            default: [
              control,
              {
                tag: "output",
                bindings: {
                  textContent: {
                    compute: { expr: "item", path: "details.quantity" },
                    mode: "one-way",
                  },
                },
              },
            ],
          },
        },
        source,
      ),
    );
    expect(result).toEqual({
      rows: [{ id: "a", details: { quantity: 12 } }],
      text: "12",
    });
    expect(errors).toEqual([]);
  });
}

test("item writes reconcile repeaters that use different keys for the same collection", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const first = each(input("label"));
  const second = each(input("label"));
  second.props.itemKey = { Str: "other" };
  const result = await page.evaluate(
    async (trees) => {
      const store = new __spaday.Store({
        rows: [{ id: "a", other: "x", label: "Old" }],
      });
      const roots = trees.map((tree) =>
        __spaday.mount(document.body, tree, store),
      );
      const input = roots[0].firstElementChild;
      input.value = "New";
      input.dispatchEvent(new Event("input"));
      await new Promise(requestAnimationFrame);
      return roots.map((root) => root.firstElementChild.value);
    },
    [first, second],
  );
  expect(result).toEqual(["New", "New"]);
  expect(errors).toEqual([]);
});

test("server-windowed collections reject item writes instead of editing a partial dataset", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const tree = each(input("label"));
  tree.props = {
    ...tree.props,
    rowHeight: { Int: 30 },
    windowed: { Bool: true },
  };
  await page.evaluate((tree) => {
    window.store = new __spaday.Store({
      rows: { items: [{ id: "a", label: "A" }], offset: 0, total: 100 },
    });
    __spaday.mount(document.body, tree, store);
  }, tree);
  await expect.poll(() => errors.length).toBeGreaterThan(0);
  expect(
    errors.every(
      (error) =>
        error === "two-way binding requires a writable field or item scope",
    ),
  ).toBe(true);
  expect(await page.evaluate(() => store.get("rows"))).toEqual({
    items: [{ id: "a", label: "A" }],
    offset: 0,
    total: 100,
  });
});
