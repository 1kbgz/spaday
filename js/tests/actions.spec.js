import { test, expect } from "@playwright/test";

// The action DSL end-to-end: a node carries an action in its `events` map (the exact wire shape
// `spaday/actions.py` emits and the Rust core defines), the runtime binds a listener in `build()`, and
// a real DOM event runs the interpreter against live DOM. Actions ride the wire as plain JSON (the
// core's own DSL form), not a tagged Value. No server, no `diff`/`apply` — behavior runs client-side.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("Toggle flips a boolean prop on the event's own element (this)", async ({
  page,
}) => {
  const states = await page.evaluate(() => {
    const btn = window.__spaday.mount(document.body, {
      tag: "button",
      events: {
        click: { kind: "toggle", target: { ref: "this" }, prop: "hidden" },
      },
    });
    const seen = [];
    btn.click();
    seen.push(btn.hidden); // true after first click
    btn.click();
    seen.push(btn.hidden); // false after second
    return seen;
  });
  expect(states).toEqual([true, false]);
});

test("SetProp by_id sets a literal on another element in the tree", async ({
  page,
}) => {
  const hidden = await page.evaluate(() => {
    const root = window.__spaday.mount(document.body, {
      tag: "div",
      slots: {
        default: [
          { tag: "div", props: { id: { Str: "panel" } } },
          {
            tag: "button",
            events: {
              click: {
                kind: "set",
                target: { ref: "id", id: "panel" },
                prop: "hidden",
                value: { expr: "lit", value: true },
              },
            },
          },
        ],
      },
    });
    root.querySelector("button").click();
    return document.getElementById("panel").hidden;
  });
  expect(hidden).toBe(true);
});

test("SetProp binds an element prop to the event value through not_", async ({
  page,
}) => {
  // The canonical `WaSwitch.on("change", SetProp(by_id("panel"), "hidden", not_(event_value())))`:
  // checking the box (event value true) shows the panel; unchecking hides it.
  const result = await page.evaluate(() => {
    const root = window.__spaday.mount(document.body, {
      tag: "div",
      slots: {
        default: [
          { tag: "div", props: { id: { Str: "panel" } } },
          {
            tag: "input",
            props: { type: { Str: "checkbox" } },
            events: {
              change: {
                kind: "set",
                target: { ref: "id", id: "panel" },
                prop: "hidden",
                value: { expr: "not", of: { expr: "event" } },
              },
            },
          },
        ],
      },
    });
    const box = root.querySelector("input");
    const panel = document.getElementById("panel");
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    const whenChecked = panel.hidden; // not(true) -> false (shown)
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    const whenUnchecked = panel.hidden; // not(false) -> true (hidden)
    return { whenChecked, whenUnchecked };
  });
  expect(result.whenChecked).toBe(false);
  expect(result.whenUnchecked).toBe(true);
});

test("Sequence runs its actions in order", async ({ page }) => {
  const state = await page.evaluate(() => {
    const btn = window.__spaday.mount(document.body, {
      tag: "button",
      events: {
        click: {
          kind: "seq",
          actions: [
            { kind: "toggle", target: { ref: "this" }, prop: "hidden" },
            {
              kind: "set",
              target: { ref: "this" },
              prop: "aria-pressed",
              value: { expr: "lit", value: "true" },
            },
          ],
        },
      },
    });
    btn.click();
    return { hidden: btn.hidden, pressed: btn.getAttribute("aria-pressed") };
  });
  expect(state).toEqual({ hidden: true, pressed: "true" });
});

test("Emit dispatches a bubbling custom event", async ({ page }) => {
  const detail = await page.evaluate(() => {
    const root = window.__spaday.mount(document.body, {
      tag: "div",
      slots: {
        default: [
          {
            tag: "button",
            events: {
              click: {
                kind: "emit",
                event: "ping",
                detail: { expr: "lit", value: "hi" },
              },
            },
          },
        ],
      },
    });
    return new Promise((resolve) => {
      root.addEventListener("ping", (e) => resolve(e.detail)); // bubbled from the button
      root.querySelector("button").click();
    });
  });
  expect(detail).toBe("hi");
});

test("SendPatch fires a routable spaday:patch intent carrying the event value", async ({
  page,
}) => {
  const detail = await page.evaluate(() => {
    const root = window.__spaday.mount(document.body, {
      tag: "div",
      slots: {
        default: [
          {
            tag: "input",
            props: { type: { Str: "checkbox" } },
            events: {
              change: {
                kind: "patch",
                model: "global",
                field: "live",
                value: { expr: "event" },
              },
            },
          },
        ],
      },
    });
    return new Promise((resolve) => {
      document.addEventListener("spaday:patch", (e) => resolve(e.detail), {
        once: true,
      });
      const box = root.querySelector("input");
      box.checked = true;
      box.dispatchEvent(new Event("change"));
    });
  });
  // the app routes this intent to its wire (e.g. a transports edit on model "global")
  expect(detail).toEqual({ model: "global", field: "live", value: true });
});

test("If runs then/else based on a prop condition read from another element", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const root = window.__spaday.mount(document.body, {
      tag: "div",
      slots: {
        default: [
          {
            tag: "input",
            props: { id: { Str: "sw" }, type: { Str: "checkbox" } },
          },
          { tag: "div", props: { id: { Str: "panel" } } },
          {
            tag: "button",
            events: {
              click: {
                kind: "if",
                cond: {
                  expr: "prop",
                  target: { ref: "id", id: "sw" },
                  name: "checked",
                },
                then: {
                  kind: "set",
                  target: { ref: "id", id: "panel" },
                  prop: "hidden",
                  value: { expr: "lit", value: true },
                },
                else: {
                  kind: "set",
                  target: { ref: "id", id: "panel" },
                  prop: "hidden",
                  value: { expr: "lit", value: false },
                },
              },
            },
          },
        ],
      },
    });
    const sw = root.querySelector("#sw");
    const btn = root.querySelector("button");
    const panel = document.getElementById("panel");
    btn.click(); // sw unchecked -> else -> hidden=false
    const whenUnchecked = panel.hidden;
    sw.checked = true;
    btn.click(); // sw checked (prop cond true) -> then -> hidden=true
    const whenChecked = panel.hidden;
    return { whenUnchecked, whenChecked };
  });
  expect(result.whenUnchecked).toBe(false);
  expect(result.whenChecked).toBe(true);
});
