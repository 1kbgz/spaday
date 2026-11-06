import fs from "fs";
import { test, expect } from "@playwright/test";
import { diff } from "../src/ts/index";
import { initSync } from "../dist/pkg/spaday";

// `diff` (the wasm core) runs here in node to produce patches; the runtime (mount/applyPatch) runs
// in the browser page against real DOM. Each test mounts into a fresh detached container.
test.beforeAll(() => {
  initSync({ module: fs.readFileSync("./dist/pkg/spaday_bg.wasm") });
});

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("mounts a tree to the DOM", async ({ page }) => {
  const html = await page.evaluate(() => {
    const c = document.createElement("div");
    window.__spaday.mount(c, {
      tag: "div",
      props: { id: { Str: "root" } },
      slots: {
        default: [{ tag: "span", props: { textContent: { Str: "hi" } } }],
      },
    });
    return c.innerHTML;
  });
  expect(html).toBe('<div id="root"><span>hi</span></div>');
});

test("binary props reach DOM properties and preserve view boundaries", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, applyPatch, tag } = window.__spaday;
    customElements.define(
      "binary-sample",
      class extends HTMLElement {
        data = null;
      },
    );
    const bytes = new Uint8Array([99, 0, 128, 255, 99]);
    const value = tag(new DataView(bytes.buffer, 1, 3));
    const root = mount(document.createElement("div"), {
      tag: "binary-sample",
      props: { data: value },
    });
    const initial = [...root.data];
    const typed = root.data instanceof Uint8Array;
    applyPatch(root, {
      ops: [
        {
          SetProp: {
            path: [],
            name: "data",
            value: tag(new Uint8Array([1, 2]).buffer),
          },
        },
      ],
    });
    return {
      initial,
      typed,
      updated: [...root.data],
      attribute: root.getAttribute("data"),
    };
  });
  expect(result).toEqual({
    initial: [0, 128, 255],
    typed: true,
    updated: [1, 2],
    attribute: null,
  });
});

test("SetProp updates a live element via its DOM property", async ({
  page,
}) => {
  const value = await page.evaluate(() => {
    const { mount, applyPatch } = window.__spaday;
    const root = mount(document.createElement("div"), { tag: "input" });
    applyPatch(root, {
      ops: [{ SetProp: { path: [], name: "value", value: { Str: "abc" } } }],
    });
    return root.value; // a DOM property, not an attribute
  });
  expect(value).toBe("abc");
});

test("props reach an element whose class is defined after it mounts", async ({
  page,
}) => {
  // a package whose bundle defines its elements late -- one that awaits at the top level, or loads
  // lazily -- must still get every prop, through the property its class declares
  const r = await page.evaluate(async () => {
    const c = document.createElement("div");
    document.body.appendChild(c);
    const el = window.__spaday.mount(c, {
      tag: "late-grid",
      props: {
        rows: { List: [{ Int: 1 }, { Int: 2 }] },
        theme: { Str: "dark" },
      },
    });
    const before = {
      rows: el.getAttribute("rows"),
      theme: el.getAttribute("theme"),
    };
    customElements.define(
      "late-grid",
      class extends HTMLElement {
        #theme = "light";
        rows = null;
        // property-only, like a hand-written element that never reads its attributes
        get theme() {
          return this.#theme;
        }
        set theme(value) {
          this.#theme = value;
        }
      },
    );
    await customElements.whenDefined("late-grid");
    return { before, rows: el.rows, theme: el.theme };
  });
  // an object waits rather than stringifying into an attribute...
  expect(r.before.rows).toBeNull();
  // ...while a primitive also lands as an attribute straight away, as it always has
  expect(r.before.theme).toBe("dark");
  expect(r.rows).toEqual([1, 2]);
  expect(r.theme).toBe("dark");
});

test("writes before the definition collapse to the last, and a removal cancels one", async ({
  page,
}) => {
  const r = await page.evaluate(async () => {
    const { mount, applyPatch } = window.__spaday;
    // detached: the definition upgrades only elements in the document, so this one must be upgraded
    const el = mount(document.createElement("div"), {
      tag: "late-panel",
      props: {
        config: { Map: { layout: { Int: 1 } } },
        extra: { Map: { x: { Int: 1 } } },
      },
    });
    applyPatch(el, {
      ops: [
        {
          SetProp: {
            path: [],
            name: "config",
            value: { Map: { layout: { Int: 2 } } },
          },
        },
        { RemoveProp: { path: [], name: "extra" } },
      ],
    });
    let writes = 0;
    customElements.define(
      "late-panel",
      class extends HTMLElement {
        #config = null;
        extra = "untouched";
        get config() {
          return this.#config;
        }
        set config(value) {
          writes += 1;
          this.#config = value;
        }
      },
    );
    await customElements.whenDefined("late-panel");
    return { config: el.config, writes, extra: el.extra };
  });
  expect(r.config).toEqual({ layout: 2 });
  expect(r.writes).toBe(1);
  expect(r.extra).toBe("untouched");
});

test("named slots route children via the slot attribute", async ({ page }) => {
  const html = await page.evaluate(() => {
    const c = document.createElement("div");
    window.__spaday.mount(c, {
      tag: "wa-card",
      slots: {
        header: [{ tag: "h3", props: { textContent: { Str: "T" } } }],
        default: [{ tag: "p", props: { textContent: { Str: "B" } } }],
      },
    });
    return c.innerHTML;
  });
  expect(html).toContain('<h3 slot="header">T</h3>');
  expect(html).toContain("<p>B</p>");
});

test("Replace swaps a subtree on tag change", async ({ page }) => {
  const html = await page.evaluate(() => {
    const { mount, applyPatch } = window.__spaday;
    const c = document.createElement("div");
    mount(c, {
      tag: "div",
      slots: {
        default: [{ tag: "span", props: { textContent: { Str: "x" } } }],
      },
    });
    applyPatch(c.firstElementChild, {
      ops: [
        {
          Replace: {
            path: [{ slot: "default", index: 0 }],
            node: { tag: "b", props: { textContent: { Str: "y" } } },
          },
        },
      ],
    });
    return c.innerHTML;
  });
  expect(html).toBe("<div><b>y</b></div>");
});

test("a root-level Replace returns the new root (caller's old ref goes stale)", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, applyPatch } = window.__spaday;
    const c = document.createElement("div");
    const root = mount(c, {
      tag: "section",
      props: { textContent: { Str: "x" } },
    });
    const newRoot = applyPatch(root, {
      ops: [
        {
          Replace: {
            path: [],
            node: { tag: "article", props: { textContent: { Str: "y" } } },
          },
        },
      ],
    });
    return {
      html: c.innerHTML,
      newTag: newRoot.tagName.toLowerCase(),
      oldDetached: root.parentNode === null, // the original root was swapped out
      newInDom: newRoot.parentNode === c,
    };
  });
  expect(result.html).toBe("<article>y</article>");
  expect(result.newTag).toBe("article");
  expect(result.oldDetached).toBe(true);
  expect(result.newInDom).toBe(true);
});

test("a keyed reorder patch moves live elements (incremental == full render)", async ({
  page,
}) => {
  const item = (k) => ({
    tag: "li",
    key: k,
    props: { textContent: { Str: k } },
  });
  const oldTree = {
    tag: "ul",
    slots: { default: [item("a"), item("b"), item("c")] },
  };
  const newTree = {
    tag: "ul",
    slots: { default: [item("c"), item("a"), item("b")] },
  };
  const patch = JSON.parse(
    diff(JSON.stringify(oldTree), JSON.stringify(newTree)),
  );

  const result = await page.evaluate(
    ({ oldTree, newTree, patch }) => {
      const { mount, applyPatch } = window.__spaday;
      const root = mount(document.createElement("div"), oldTree);
      // mark the original elements with a non-serialized property to prove they're moved, not rebuilt
      [...root.children].forEach((c, i) => (c.__orig = i));
      applyPatch(root, patch);

      const full = mount(document.createElement("div"), newTree); // a fresh full render
      return {
        after: root.outerHTML,
        full: full.outerHTML,
        origOrder: [...root.children].map((c) => c.__orig),
      };
    },
    { oldTree, newTree, patch },
  );

  expect(result.after).toBe(result.full); // incremental apply == a full re-render
  expect(result.origOrder).toEqual([2, 0, 1]); // c, a, b — the *same* elements, reordered
});

const TOGGLE = { kind: "toggle", target: { ref: "this" }, prop: "hidden" };

test("an incremental SetEvent patch binds the new action on a live element", async ({
  page,
}) => {
  const oldTree = { tag: "button" };
  const newTree = { tag: "button", events: { click: TOGGLE } };
  const patch = JSON.parse(
    diff(JSON.stringify(oldTree), JSON.stringify(newTree)),
  );
  expect(JSON.stringify(patch)).toContain("SetEvent"); // the core emits it

  const hidden = await page.evaluate(
    ({ oldTree, patch }) => {
      const { mount, applyPatch } = window.__spaday;
      const btn = mount(document.body, oldTree); // no listener yet
      applyPatch(btn, patch); // SetEvent binds it
      btn.click();
      return btn.hidden;
    },
    { oldTree, patch },
  );
  expect(hidden).toBe(true); // the action added by the patch actually ran
});

test("an incremental RemoveEvent patch detaches the action from a live element", async ({
  page,
}) => {
  const oldTree = { tag: "button", events: { click: TOGGLE } };
  const newTree = { tag: "button" };
  const patch = JSON.parse(
    diff(JSON.stringify(oldTree), JSON.stringify(newTree)),
  );
  expect(JSON.stringify(patch)).toContain("RemoveEvent");

  const states = await page.evaluate(
    ({ oldTree, patch }) => {
      const { mount, applyPatch } = window.__spaday;
      const btn = mount(document.body, oldTree); // listener bound on build
      btn.click(); // toggles hidden -> true (proves it was active)
      const afterFirst = btn.hidden;
      applyPatch(btn, patch); // RemoveEvent detaches it
      btn.click(); // would toggle back to false if still attached
      return { afterFirst, afterRemoved: btn.hidden };
    },
    { oldTree, patch },
  );
  expect(states.afterFirst).toBe(true); // listener worked before removal
  expect(states.afterRemoved).toBe(true); // unchanged ⇒ the listener was detached
});

test("explicit datalist attributes hydrate, bind, patch and remove without assigning readonly properties", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, hydrate, applyPatch, Store } = window.__spaday;
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = '<input list="first">';
    document.body.insertAdjacentHTML(
      "beforeend",
      '<datalist id="first"></datalist><datalist id="second"></datalist>',
    );
    const input = host.firstElementChild;
    const tree = {
      tag: "input",
      props: { "attr:list": { Str: "first" } },
      bindings: { "attr:list": { field: "list_id", mode: "one-way" } },
    };
    const store = new Store({ list_id: "second" });
    const root = hydrate(host, tree, store);
    const bound = input.list?.id;
    store.set("list_id", "first");
    const updated = input.list?.id;
    applyPatch(
      root,
      {
        ops: [
          { RemoveBinding: { path: [], name: "attr:list" } },
          {
            SetProp: { path: [], name: "attr:list", value: { Str: "second" } },
          },
        ],
      },
      store,
    );
    store.set("list_id", "missing");
    const patched = input.list?.id;
    applyPatch(root, {
      ops: [{ RemoveProp: { path: [], name: "attr:list" } }],
    });
    const removed = input.hasAttribute("list");
    const mounted = mount(document.createElement("div"), {
      tag: "input",
      props: { "attr:list": { Str: "first" }, "attr:required": { Bool: true } },
    });
    return {
      same: root === input,
      bound,
      updated,
      patched,
      removed,
      mounted: mounted.getAttribute("list"),
      required: mounted.required,
    };
  });
  expect(result).toEqual({
    same: true,
    bound: "second",
    updated: "first",
    patched: "second",
    removed: false,
    mounted: "first",
    required: true,
  });
});
