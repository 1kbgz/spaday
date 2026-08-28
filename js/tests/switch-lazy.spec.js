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

test("refresh reaches into Show and Switch subtrees (mounted branch and stored cases)", async ({
  page,
}) => {
  let version = 1;
  await page.route("**/cond-tree.json", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tag: "main",
        slots: {
          default: [
            {
              tag: "h1",
              props: {
                id: { Str: "plain" },
                textContent: { Str: `plain=${version}` },
              },
            },
            {
              tag: "spa-switch",
              bindings: { on: { field: "sel", mode: "one-way" } },
              slots: {
                a: [
                  {
                    tag: "p",
                    props: {
                      id: { Str: "in-switch" },
                      textContent: { Str: `switch=${version}` },
                    },
                  },
                ],
                b: [
                  {
                    tag: "p",
                    props: {
                      id: { Str: "case-b" },
                      textContent: { Str: `b=${version}` },
                    },
                  },
                ],
                default: [{ tag: "p" }],
              },
            },
            {
              tag: "spa-show",
              bindings: { when: { field: "showing", mode: "one-way" } },
              slots: {
                default: [
                  {
                    tag: "p",
                    props: {
                      id: { Str: "in-show" },
                      textContent: { Str: `show=${version}` },
                    },
                  },
                ],
              },
            },
          ],
        },
      }),
    }),
  );
  const before = await page.evaluate(async () => {
    const node = await (await fetch("/cond-tree.json")).json();
    const store = new window.__spaday.Store({ sel: "a", showing: true });
    const root = window.__spaday.mount(document.body, node, store);
    window.__spaday.trackRoot(root, node, "/cond-tree.json", store);
    window.__store = store;
    return {
      plain: document.getElementById("plain").textContent,
      inSwitch: document.getElementById("in-switch").textContent,
      inShow: document.getElementById("in-show").textContent,
    };
  });
  version = 2;
  const after = await page.evaluate(async () => {
    await window.__spaday.refreshRoots();
    const read = () => ({
      plain: document.getElementById("plain").textContent,
      inSwitch: document.getElementById("in-switch")?.textContent ?? null,
      inShow: document.getElementById("in-show")?.textContent ?? null,
    });
    const refreshed = read();
    // the stored definition of the non-mounted case updated too: flip to it
    window.__store.set("sel", "b");
    const caseB = document.getElementById("case-b")?.textContent ?? null;
    // and a Show toggle re-mounts from the refreshed definition
    window.__store.set("showing", false);
    window.__store.set("showing", true);
    const remounted = document.getElementById("in-show")?.textContent ?? null;
    return { refreshed, caseB, remounted };
  });
  expect(before).toEqual({
    plain: "plain=1",
    inSwitch: "switch=1",
    inShow: "show=1",
  });
  expect(after.refreshed).toEqual({
    plain: "plain=2",
    inSwitch: "switch=2",
    inShow: "show=2",
  });
  expect(after.caseB).toBe("b=2");
  expect(after.remounted).toBe("show=2");
});

test("refresh refetches a loaded Lazy body and swaps it only when changed", async ({
  page,
}) => {
  let version = 1;
  let hits = 0;
  await page.route("**/lazy-body.json", (route) => {
    hits += 1;
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tag: "article",
        props: {
          id: { Str: "card" },
          textContent: { Str: `card v${version}` },
        },
      }),
    });
  });
  await page.route("**/lazy-tree.json", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tag: "div",
        slots: {
          default: [
            {
              tag: "spa-lazy",
              props: { src: { Str: "/lazy-body.json" } },
              slots: {
                default: [
                  { tag: "em", props: { textContent: { Str: "loading" } } },
                ],
              },
            },
          ],
        },
      }),
    }),
  );
  const before = await page.evaluate(async () => {
    const node = await (await fetch("/lazy-tree.json")).json();
    const root = window.__spaday.mount(document.body, node);
    window.__spaday.trackRoot(root, node, "/lazy-tree.json");
    await new Promise((resolve) => setTimeout(resolve, 50));
    return document.getElementById("card").textContent;
  });
  // an unchanged payload refresh keeps the mounted body's identity
  await page.evaluate(async () => {
    document.getElementById("card").dataset.identity = "kept";
    await window.__spaday.refreshRoots();
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  const unchanged = await page.evaluate(() => ({
    text: document.getElementById("card").textContent,
    identity: document.getElementById("card").dataset.identity,
  }));
  version = 2;
  const after = await page.evaluate(async () => {
    await window.__spaday.refreshRoots();
    await new Promise((resolve) => setTimeout(resolve, 50));
    return document.getElementById("card").textContent;
  });
  expect(before).toBe("card v1");
  expect(unchanged).toEqual({ text: "card v1", identity: "kept" });
  expect(after).toBe("card v2");
  expect(hits).toBe(3); // initial load + one refetch per refresh (cache invalidated)
});

test("patch ops route into structural definitions: child ops, events, bindings, replace", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const store = new window.__spaday.Store({
      sel: "a",
      label: "bound",
      fired: "",
    });
    const root = window.__spaday.mount(
      document.body,
      {
        tag: "div",
        slots: {
          default: [
            {
              tag: "spa-switch",
              bindings: { on: { field: "sel", mode: "one-way" } },
              slots: {
                a: [
                  {
                    tag: "p",
                    key: "first",
                    props: { id: { Str: "one" }, textContent: { Str: "one" } },
                  },
                  {
                    tag: "p",
                    props: { id: { Str: "two" }, textContent: { Str: "two" } },
                  },
                ],
                default: [],
              },
            },
          ],
        },
      },
      store,
    );
    const at = (index) => [
      { slot: "default", index: 0 },
      { slot: "a", index },
    ];
    window.__spaday.applyPatch(
      root,
      {
        ops: [
          // all paths cross the spa-switch boundary, so they mutate its stored definition
          {
            Replace: {
              path: at(0),
              node: {
                tag: "p",
                props: { id: { Str: "uno" }, textContent: { Str: "uno" } },
              },
            },
          },
          { SetKey: { path: at(0), key: null } },
          {
            RemoveChild: {
              path: [{ slot: "default", index: 0 }],
              slot: "a",
              index: 1,
            },
          },
          {
            InsertChild: {
              path: [{ slot: "default", index: 0 }],
              slot: "a",
              index: 1,
              node: {
                tag: "p",
                props: { id: { Str: "tres" }, textContent: { Str: "tres" } },
              },
            },
          },
          {
            InsertChild: {
              path: [{ slot: "default", index: 0 }],
              slot: "a",
              index: 2,
              node: { tag: "button", props: { id: { Str: "btn" } } },
            },
          },
          {
            MoveChild: {
              path: [{ slot: "default", index: 0 }],
              slot: "a",
              from: 1,
              to: 0,
            },
          },
          {
            SetProp: {
              path: at(0),
              name: "textContent",
              value: { Str: "tres!" },
            },
          },
          { RemoveProp: { path: at(1), name: "textContent" } },
          {
            SetEvent: {
              path: at(2),
              name: "click",
              action: {
                kind: "set-field",
                field: "fired",
                value: { expr: "lit", value: "yes" },
              },
            },
          },
          {
            SetBinding: {
              path: at(2),
              name: "textContent",
              binding: { field: "label", mode: "one-way" },
            },
          },
        ],
      },
      store,
    );
    const texts = Array.from(
      document.querySelectorAll("spa-switch > p, spa-switch > button"),
    ).map((el) => `${el.id}:${el.textContent}`);
    document.getElementById("btn").click();
    store.set("label", "rebound");
    return {
      texts,
      fired: store.get("fired"),
      rebound: document.getElementById("btn").textContent,
    };
  });
  expect(r.texts).toEqual(["tres:tres!", "uno:", "btn:bound"]);
  expect(r.fired).toBe("yes");
  expect(r.rebound).toBe("rebound");
});

test("patch ops into an Each template re-wire its instances", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const store = new window.__spaday.Store({
      rows: [
        { id: "x", name: "X" },
        { id: "y", name: "Y" },
      ],
    });
    const root = window.__spaday.mount(
      document.body,
      {
        tag: "div",
        slots: {
          default: [
            {
              tag: "spa-each",
              props: { itemKey: { Str: "id" } },
              bindings: { items: { field: "rows", mode: "one-way" } },
              slots: {
                default: [
                  {
                    tag: "span",
                    props: { class: { Str: "row" } },
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
          ],
        },
      },
      store,
    );
    const before = Array.from(document.querySelectorAll(".row")).map(
      (el) => el.className,
    );
    window.__spaday.applyPatch(
      root,
      {
        ops: [
          {
            SetProp: {
              path: [
                { slot: "default", index: 0 },
                { slot: "default", index: 0 },
              ],
              name: "class",
              value: { Str: "row loud" },
            },
          },
        ],
      },
      store,
    );
    const after = Array.from(document.querySelectorAll(".row")).map(
      (el) => el.className,
    );
    return { before, after };
  });
  expect(r.before).toEqual(["row", "row"]);
  expect(r.after).toEqual(["row loud", "row loud"]);
});
