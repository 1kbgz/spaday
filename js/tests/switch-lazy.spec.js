import { test, expect } from "@playwright/test";

// `spa-switch` (route on one field; one branch mounted at a time), `spa-lazy` (a subtree deferred
// to a URL, fetched on first activation and cached per page), and the `refresh` action (re-fetch
// the tracked tree and diff it into the live DOM).

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("Switch mounts exactly the matching case and swaps in O(1)", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const store = new window.__spaday.Store({ selected: "a" });
    const el = window.__spaday.mount(
      document.body,
      {
        tag: "spa-switch",
        bindings: { on: { field: "selected", mode: "one-way" } },
        slots: {
          a: [{ tag: "span", props: { textContent: { Str: "case A" } } }],
          b: [{ tag: "strong", props: { textContent: { Str: "case B" } } }],
          default: [{ tag: "em", props: { textContent: { Str: "nothing" } } }],
        },
      },
      store,
    );
    const state = () => ({
      text: el.textContent,
      children: el.children.length,
    });
    const initial = state();
    store.set("selected", "b");
    const switched = state();
    store.set("selected", "zzz"); // no case: the default renders
    const fallback = state();
    return { initial, switched, fallback };
  });
  expect(r.initial).toEqual({ text: "case A", children: 1 }); // one branch, not three
  expect(r.switched).toEqual({ text: "case B", children: 1 });
  expect(r.fallback).toEqual({ text: "nothing", children: 1 });
});

test("Lazy fetches on first activation, shows its placeholder, and caches by src", async ({
  page,
}) => {
  let hits = 0;
  await page.route("**/card/alpha", (route) => {
    hits += 1;
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tag: "section",
        props: { textContent: { Str: "the card body" } },
      }),
    });
  });
  const first = await page.evaluate(async () => {
    const store = new window.__spaday.Store({ open: false });
    const el = window.__spaday.mount(
      document.body,
      {
        tag: "spa-lazy",
        props: { src: { Str: "/card/alpha" } },
        bindings: { when: { field: "open", mode: "one-way" } },
        slots: {
          default: [{ tag: "em", props: { textContent: { Str: "loading…" } } }],
        },
      },
      store,
    );
    const placeholder = el.textContent;
    store.set("open", true);
    await new Promise((resolve) => setTimeout(resolve, 80));
    const loaded = el.textContent;
    // a second lazy with the same src reuses the page cache: no second request
    const twin = window.__spaday.mount(document.body, {
      tag: "spa-lazy",
      props: { src: { Str: "/card/alpha" } },
    });
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { placeholder, loaded, twin: twin.textContent };
  });
  expect(first.placeholder).toBe("loading…"); // nothing fetched while the condition is false
  expect(first.loaded).toBe("the card body");
  expect(first.twin).toBe("the card body");
  expect(hits).toBe(1); // cached per src
});

test("the refresh action re-fetches the tracked tree and diffs it in place", async ({
  page,
}) => {
  let version = 1;
  await page.route("**/my-tree.json", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tag: "div",
        slots: {
          default: [
            {
              tag: "span",
              props: { id: { Str: "keep" }, textContent: { Str: "stable" } },
            },
            { tag: "p", props: { textContent: { Str: `version ${version}` } } },
          ],
        },
      }),
    }),
  );
  const r = await page.evaluate(async () => {
    const node = await (await fetch("/my-tree.json")).json();
    const root = window.__spaday.mount(document.body, node);
    window.__spaday.trackRoot(root, node, "/my-tree.json");
    const keep = document.getElementById("keep");
    keep.dataset.identity = "kept"; // survives only if the diff patches in place
    window.__bump && window.__bump();
    return { before: root.querySelector("p").textContent };
  });
  version = 2;
  const after = await page.evaluate(async () => {
    // the wire form the `refresh` action produces; run through the real interpreter
    const btn = window.__spaday.mount(document.body, {
      tag: "button",
      events: { click: { kind: "refresh" } },
    });
    btn.click();
    await new Promise((resolve) => setTimeout(resolve, 80));
    const keep = document.getElementById("keep");
    return {
      text: document.querySelector("p").textContent,
      identity: keep.dataset.identity,
    };
  });
  expect(r.before).toBe("version 1");
  expect(after.text).toBe("version 2"); // the server's new state landed
  expect(after.identity).toBe("kept"); // unchanged elements kept identity through the diff
});
