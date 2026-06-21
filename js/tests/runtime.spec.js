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
