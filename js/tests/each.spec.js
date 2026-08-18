import fs from "fs";
import { test, expect } from "@playwright/test";
import { initSync } from "../dist/pkg/spaday";

test.beforeAll(() => {
  initSync({ module: fs.readFileSync("./dist/pkg/spaday_bg.wasm") });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("spa-each reconciles keyed instances without losing live state", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({
      rows: [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ],
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
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
    const first = root.children[0];
    const second = root.children[1];
    second.focus();
    second.selectionStart = 1;
    second.dataset.local = "kept";
    store.set("rows", [
      { id: 2, name: "Bee" },
      { id: 3, name: "C" },
      { id: 1, name: "A" },
    ]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const after = [...root.children];
    store.set("rows", [{ id: 2, name: "Bee" }]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      sameMoved: after[0] === second && after[2] === first,
      values: after.map((element) => element.value),
      focusKept: document.activeElement === second,
      cursorKept: second.selectionStart,
      propertyKept: second.dataset.local,
      finalCount: root.children.length,
      finalSame: root.firstElementChild === second,
    };
  });

  expect(result).toEqual({
    sameMoved: true,
    values: ["Bee", "C", "A"],
    focusKept: true,
    cursorKept: 1,
    propertyKept: "kept",
    finalCount: 1,
    finalSame: true,
  });
});

test("spa-each preserves focus on non-text inputs during a move", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ rows: [{ id: 1 }, { id: 2 }] });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [{ tag: "input", props: { type: { Str: "number" } } }],
        },
      },
      store,
    );
    const focused = root.children[0];
    focused.focus();
    store.set("rows", [{ id: 2 }, { id: 1 }]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      moved: root.children[1] === focused,
      focused: document.activeElement === focused,
    };
  });

  expect(result).toEqual({ moved: true, focused: true });
});

test("spa-each applies granular collection changes without resetting unchanged scopes", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    class DeltaProbe extends HTMLElement {
      set label(value) {
        this.updates = (this.updates ?? 0) + 1;
        this.textContent = value;
      }
    }
    if (!customElements.get("delta-probe"))
      customElements.define("delta-probe", DeltaProbe);
    const one = { id: 1, label: "A" };
    const two = { id: 2, label: "B" };
    const three = { id: 3, label: "C" };
    const store = new Store({ rows: [one, two, three] });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "delta-probe",
              bindings: {
                label: {
                  compute: { expr: "item", path: "label" },
                  mode: "one-way",
                },
              },
            },
          ],
        },
      },
      store,
    );
    const original = [...root.children];
    const updatedOne = { id: 1, label: "AA" };
    const four = { id: 4, label: "D" };
    store.setCollection(
      "rows",
      [three, updatedOne, four],
      [
        { kind: "update", key: 1, path: ["label"], value: "AA" },
        { kind: "reorder", keys: [3, 1, 2] },
        { kind: "remove", key: 2 },
        { kind: "insert", key: 4, index: 2, item: four },
      ],
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      values: [...root.children].map((element) => element.textContent),
      updates: [...root.children].map((element) => element.updates),
      movedIdentity: root.children[0] === original[2],
      updatedIdentity: root.children[1] === original[0],
      removed: !original[1].isConnected,
    };
  });

  expect(result).toEqual({
    values: ["C", "AA", "D"],
    updates: [1, 2, 1],
    movedIdentity: true,
    updatedIdentity: true,
    removed: true,
  });
});

test("invalid granular collection batches leave existing DOM unchanged", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ rows: [{ id: 1 }, { id: 2 }] });
    const errors = [];
    window.addEventListener("error", (event) => {
      errors.push(event.error?.message ?? event.message);
      event.preventDefault();
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: { default: [{ tag: "div" }] },
      },
      store,
    );
    const original = [...root.children];
    store.setCollection(
      "rows",
      [{ id: 2 }],
      [
        { kind: "remove", key: 1 },
        { kind: "update", key: 99, path: ["name"], value: "invalid" },
      ],
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      same: [...root.children].every(
        (element, index) => element === original[index],
      ),
      count: root.children.length,
      error: errors[0],
    };
  });

  expect(result.same).toBe(true);
  expect(result.count).toBe(2);
  expect(result.error).toContain("references unknown key 99");
});

test("native moves preserve custom-element connection state", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    class MoveProbe extends HTMLElement {
      connectedMoveCallback() {
        this.moves = (this.moves ?? 0) + 1;
      }
      disconnectedCallback() {
        this.disconnects = (this.disconnects ?? 0) + 1;
      }
    }
    if (!customElements.get("move-probe"))
      customElements.define("move-probe", MoveProbe);
    const store = new Store({ rows: [{ id: 1 }, { id: 2 }] });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: { default: [{ tag: "move-probe" }] },
      },
      store,
    );
    const movedElement = root.children[1];
    store.set("rows", [{ id: 2 }, { id: 1 }]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      supported: typeof root.moveBefore === "function",
      moved: root.children[0] === movedElement,
      moves: movedElement.moves ?? 0,
      disconnects: movedElement.disconnects ?? 0,
    };
  });
  expect(result.moved).toBe(true);
  expect(result.moves).toBe(result.supported ? 1 : 0);
  expect(result.disconnects).toBe(result.supported ? 0 : 1);
});

test("nested repeaters resolve inner, named outer, and global scope", async ({
  page,
}) => {
  const text = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({
      prefix: "global",
      stagings: [
        {
          id: "s1",
          channel: "stable",
          records: [{ id: "r1", name: "package" }],
        },
      ],
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: {
          itemKey: { Str: "id" },
          scopeName: { Str: "staging" },
        },
        bindings: { items: { field: "stagings", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "spa-each",
              props: { itemKey: { Str: "id" } },
              bindings: {
                items: {
                  compute: { expr: "item", path: "records" },
                  mode: "one-way",
                },
              },
              slots: {
                default: [
                  {
                    tag: "span",
                    bindings: {
                      textContent: {
                        compute: {
                          expr: "concat",
                          parts: [
                            { expr: "field", name: "prefix" },
                            { expr: "lit", value: ":" },
                            {
                              expr: "scope",
                              name: "staging",
                              path: "channel",
                            },
                            { expr: "lit", value: ":" },
                            { expr: "item", path: "name" },
                          ],
                        },
                        mode: "one-way",
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      store,
    );
    return root.textContent;
  });
  expect(text).toBe("global:stable:package");
});

test("updating one item does not recompute an unchanged sibling", async ({
  page,
}) => {
  const updates = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    class ItemProbe extends HTMLElement {
      set label(value) {
        this.updates = (this.updates ?? 0) + 1;
        this.textContent = value;
      }
    }
    if (!customElements.get("item-probe"))
      customElements.define("item-probe", ItemProbe);
    const unchanged = { id: 1, name: "A" };
    const store = new Store({
      rows: [unchanged, { id: 2, name: "B" }],
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "item-probe",
              bindings: {
                label: {
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
    store.set("rows", [unchanged, { id: 2, name: "Bee" }]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return [...root.children].map((element) => element.updates);
  });
  expect(updates).toEqual([1, 2]);
});

test("nested show and actions use current scope after a keyed move", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const requests = [];
    window.fetch = async (url, init) => {
      requests.push({ url: String(url), body: JSON.parse(init.body) });
      return new Response("", { status: 204 });
    };
    const store = new Store({
      rows: [
        { id: 1, name: "A", ready: false },
        { id: 2, name: "B", ready: true },
      ],
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" }, scopeName: { Str: "row" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "section",
              slots: {
                default: [
                  {
                    tag: "spa-show",
                    bindings: {
                      when: {
                        compute: { expr: "item", path: "ready" },
                        mode: "one-way",
                      },
                    },
                    slots: {
                      default: [
                        {
                          tag: "strong",
                          props: { textContent: { Str: "ready" } },
                        },
                      ],
                    },
                  },
                  {
                    tag: "button",
                    events: {
                      click: {
                        kind: "call",
                        method: "POST",
                        url: {
                          expr: "concat",
                          parts: [
                            { expr: "lit", value: "/rows/" },
                            { expr: "item", path: "id" },
                          ],
                        },
                        body: {
                          expr: "obj",
                          fields: {
                            name: {
                              expr: "scope",
                              name: "row",
                              path: "name",
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      store,
    );
    const first = root.children[0];
    store.set("rows", [
      { id: 2, name: "Bee", ready: false },
      { id: 1, name: "A", ready: true },
    ]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    root.children[0].querySelector("button").click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {
      moved: root.children[1] === first,
      ready: [...root.children].map(
        (element) => !!element.querySelector("strong"),
      ),
      requests,
    };
  });
  expect(result).toEqual({
    moved: true,
    ready: [false, true],
    requests: [{ url: "/rows/2", body: { name: "Bee" } }],
  });
});

test("invalid keys leave existing DOM unchanged", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ rows: [{ id: 1 }] });
    const errors = [];
    window.addEventListener("error", (event) => {
      errors.push(event.error?.message ?? event.message);
      event.preventDefault();
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: { default: [{ tag: "div" }] },
      },
      store,
    );
    const original = root.firstElementChild;
    store.set("rows", [{ id: 2 }, { id: 2 }]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      same: root.firstElementChild === original,
      count: root.children.length,
      error: errors[0],
    };
  });
  expect(result.same).toBe(true);
  expect(result.count).toBe(1);
  expect(result.error).toContain('key "id" contains duplicate value 2');
});

test("a SetBinding patch rewires the repeater source", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { applyPatch, mount, Store } = window.__spaday;
    const store = new Store({
      first: [{ id: 1, name: "A" }],
      second: [{ id: 2, name: "B" }],
    });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "first", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "span",
              bindings: {
                textContent: {
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
    applyPatch(
      root,
      {
        ops: [
          {
            SetBinding: {
              path: [],
              name: "items",
              binding: { field: "second", mode: "one-way" },
            },
          },
        ],
      },
      store,
    );
    const rewired = root.textContent;
    store.set("second", [{ id: 3, name: "C" }]);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return { rewired, updated: root.textContent };
  });
  expect(result).toEqual({ rewired: "B", updated: "C" });
});

test("removing a repeater cancels its pending reconciliation", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { applyPatch, mount, Store } = window.__spaday;
    const store = new Store({ rows: [{ id: 1 }] });
    const root = mount(
      document.body,
      {
        tag: "main",
        slots: {
          default: [
            {
              tag: "spa-each",
              props: { itemKey: { Str: "id" } },
              bindings: { items: { field: "rows", mode: "one-way" } },
              slots: { default: [{ tag: "span" }] },
            },
          ],
        },
      },
      store,
    );
    store.set("rows", [{ id: 1 }, { id: 2 }]);
    applyPatch(
      root,
      {
        ops: [
          {
            RemoveChild: { path: [], slot: "default", index: 0 },
          },
        ],
      },
      store,
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      children: root.children.length,
      bodyRepeaters: document.querySelectorAll("spa-each").length,
    };
  });
  expect(result).toEqual({ children: 0, bodyRepeaters: 0 });
});

test("bursts coalesce and removed instances unsubscribe", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    window.eachProbeConnections = 0;
    class ProbeElement extends HTMLElement {
      connectedCallback() {
        window.eachProbeConnections += 1;
      }
      set marker(value) {
        this.updates = (this.updates ?? 0) + 1;
        this.lastMarker = value;
      }
    }
    if (!customElements.get("each-probe"))
      customElements.define("each-probe", ProbeElement);
    const store = new Store({ rows: [{ id: 1 }], marker: "a" });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "each-probe",
              bindings: { marker: { field: "marker", mode: "one-way" } },
            },
          ],
        },
      },
      store,
    );
    const removed = root.firstElementChild;
    store.set("rows", [{ id: 1 }, { id: 2 }]);
    store.set("rows", [{ id: 1 }, { id: 2 }, { id: 3 }]);
    store.set("rows", []);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    store.set("marker", "b");
    return {
      count: root.children.length,
      connections: window.eachProbeConnections,
      removedUpdates: removed.updates,
      removedMarker: removed.lastMarker,
    };
  });
  expect(result).toEqual({
    count: 0,
    connections: 1,
    removedUpdates: 1,
    removedMarker: "a",
  });
});
