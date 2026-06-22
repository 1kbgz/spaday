import { test, expect } from "@playwright/test";

// The action DSL end-to-end: a node carries an action in its `events` map (the exact wire shape
// `spaday/actions.py` emits), the runtime binds a listener in `build()`, and a real DOM event runs the
// interpreter against live DOM. There is no server and no `diff`/`apply` here — that is the point:
// behavior runs client-side with no round-trip to Python.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("Toggle flips a boolean prop on the event's own element (this)", async ({
  page,
}) => {
  const states = await page.evaluate(() => {
    const { mount, tag } = window.__spaday;
    const btn = mount(document.body, {
      tag: "button",
      events: {
        click: tag({ kind: "toggle", target: { ref: "this" }, prop: "hidden" }),
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
    const { mount, tag } = window.__spaday;
    const root = mount(document.body, {
      tag: "div",
      slots: {
        default: [
          { tag: "div", props: { id: { Str: "panel" } } },
          {
            tag: "button",
            events: {
              click: tag({
                kind: "set",
                target: { ref: "id", id: "panel" },
                prop: "hidden",
                value: { expr: "lit", value: true },
              }),
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
    const { mount, tag } = window.__spaday;
    const root = mount(document.body, {
      tag: "div",
      slots: {
        default: [
          { tag: "div", props: { id: { Str: "panel" } } },
          {
            tag: "input",
            props: { type: { Str: "checkbox" } },
            events: {
              change: tag({
                kind: "set",
                target: { ref: "id", id: "panel" },
                prop: "hidden",
                value: { expr: "not", of: { expr: "event" } },
              }),
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
    const { mount, tag } = window.__spaday;
    const btn = mount(document.body, {
      tag: "button",
      events: {
        click: tag({
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
        }),
      },
    });
    btn.click();
    return { hidden: btn.hidden, pressed: btn.getAttribute("aria-pressed") };
  });
  expect(state).toEqual({ hidden: true, pressed: "true" });
});

test("Emit dispatches a bubbling custom event", async ({ page }) => {
  const detail = await page.evaluate(() => {
    const { mount, tag } = window.__spaday;
    const root = mount(document.body, {
      tag: "div",
      slots: {
        default: [
          {
            tag: "button",
            events: {
              click: tag({
                kind: "emit",
                event: "ping",
                detail: { expr: "lit", value: "hi" },
              }),
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
