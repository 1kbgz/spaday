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

test("CallEndpoint makes the REST call with the templated JSON body", async ({
  page,
}) => {
  const seen = [];
  await page.route("**/api/save", (route) => {
    const req = route.request();
    seen.push({ method: req.method(), body: req.postData() });
    return route.fulfill({ status: 200, body: "ok" });
  });
  await page.evaluate(() => {
    const btn = window.__spaday.mount(document.body, {
      tag: "button",
      events: {
        click: {
          kind: "call",
          method: "POST",
          url: "/api/save",
          body: { expr: "lit", value: { x: 1 } },
        },
      },
    });
    btn.click();
  });
  await page.waitForTimeout(150); // let the fetch reach the route handler
  expect(seen).toEqual([{ method: "POST", body: '{"x":1}' }]);
});

test("CallEndpoint composes a JSON body from live control values via an obj expr", async ({
  page,
}) => {
  const seen = [];
  await page.route("**/api/order", (route) => {
    seen.push(route.request().postData());
    return route.fulfill({ status: 200, body: "ok" });
  });
  await page.evaluate(() => {
    const root = window.__spaday.mount(document.body, {
      tag: "div",
      slots: {
        default: [
          {
            tag: "input",
            props: { id: { Str: "symbol" }, value: { Str: "AAPL" } },
          },
          {
            tag: "button",
            events: {
              click: {
                kind: "call",
                method: "POST",
                url: "/api/order",
                body: {
                  expr: "obj",
                  fields: {
                    symbol: {
                      expr: "prop",
                      target: { ref: "id", id: "symbol" },
                      name: "value",
                    },
                    qty: { expr: "lit", value: 10 },
                  },
                },
              },
            },
          },
        ],
      },
    });
    root.querySelector("button").click();
  });
  await page.waitForTimeout(150); // let the fetch reach the route handler
  expect(JSON.parse(seen[0])).toEqual({ symbol: "AAPL", qty: 10 }); // obj read the live input value
});

test("CallEndpoint composes a body from the signal store via field exprs", async ({
  page,
}) => {
  // the csp-gateway pattern: a form's two-way-bound state is POSTed via obj({field}) — an action's
  // `field` expr reads the store the tree was mounted with (no DOM ids, no handler)
  const seen = [];
  await page.route("**/api/order", (route) => {
    seen.push(route.request().postData());
    return route.fulfill({ status: 200, body: "ok" });
  });
  await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ symbol: "AAPL", qty: 100 });
    const btn = mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "call",
            method: "POST",
            url: "/api/order",
            body: {
              expr: "obj",
              fields: {
                symbol: { expr: "field", name: "symbol" },
                qty: { expr: "field", name: "qty" },
              },
            },
          },
        },
      },
      store,
    );
    store.set("qty", 250); // the live store value, read at click time
    btn.click();
  });
  await page.waitForTimeout(150);
  expect(JSON.parse(seen[0])).toEqual({ symbol: "AAPL", qty: 250 });
});

test("CallEndpoint composes its URL from signal-store fields", async ({
  page,
}) => {
  const seen = [];
  await page.route("**/send/basket/*", (route) => {
    seen.push(new URL(route.request().url()).pathname);
    return route.fulfill({ status: 200, body: "ok" });
  });
  await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ key: "B" });
    const btn = mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "call",
            method: "POST",
            url: {
              expr: "concat",
              parts: [
                { expr: "lit", value: "/send/basket/" },
                { expr: "field", name: "key" },
              ],
            },
          },
        },
      },
      store,
    );
    btn.click();
  });
  await page.waitForTimeout(150);
  expect(seen).toEqual(["/send/basket/B"]);
});

test("SetField writes a store field (a plain button drives reactive state)", async ({
  page,
}) => {
  const values = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ symbol: "AAPL" });
    const btn = mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "set-field",
            field: "symbol",
            value: { expr: "lit", value: "" },
          },
        },
      },
      store,
    );
    btn.click(); // the "Clear" case: reset a bound field without touching the DOM
    return store.get("symbol");
  });
  expect(values).toBe("");
});

test("ToggleField flips a boolean store field (an icon button theme toggle)", async ({
  page,
}) => {
  const states = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ dark: false });
    const btn = mount(
      document.body,
      {
        tag: "button",
        events: { click: { kind: "toggle-field", field: "dark" } },
      },
      store,
    );
    const seen = [];
    btn.click();
    seen.push(store.get("dark"));
    btn.click();
    seen.push(store.get("dark"));
    return seen;
  });
  expect(states).toEqual([true, false]);
});

test("SetField/ToggleField without a store are safe no-ops", async ({
  page,
}) => {
  const ok = await page.evaluate(() => {
    const btn = window.__spaday.mount(document.body, {
      tag: "button",
      events: {
        click: {
          kind: "seq",
          actions: [
            {
              kind: "set-field",
              field: "x",
              value: { expr: "lit", value: 1 },
            },
            { kind: "toggle-field", field: "y" },
          ],
        },
      },
    });
    btn.click(); // no store mounted — must not throw
    return true;
  });
  expect(ok).toBe(true);
});

test("CallEndpoint result routes the response {status, ok, body} to a store field", async ({
  page,
}) => {
  // the "POST a form and show the outcome" case: a 422 validation error lands in the store
  await page.route("**/api/order", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({ error: "bad qty" }),
    }),
  );
  const outcome = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({});
    const btn = mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "call",
            method: "POST",
            url: "/api/order",
            body: { expr: "lit", value: { qty: -1 } },
            result: "order_result",
          },
        },
      },
      store,
    );
    return new Promise((resolve) => {
      store.subscribe("order_result", (v) => resolve(v));
      btn.click();
    });
  });
  expect(outcome).toEqual({
    status: 422,
    ok: false,
    body: { error: "bad qty" },
  });
});

test("CallEndpoint result carries a non-JSON response as text", async ({
  page,
}) => {
  await page.route("**/api/save", (route) =>
    route.fulfill({ status: 200, body: "saved" }),
  );
  const outcome = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({});
    const btn = mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "call",
            method: "POST",
            url: "/api/save",
            body: null,
            result: "saved",
          },
        },
      },
      store,
    );
    return new Promise((resolve) => {
      store.subscribe("saved", (v) => resolve(v));
      btn.click();
    });
  });
  expect(outcome).toEqual({ status: 200, ok: true, body: "saved" });
});

test("NamedJs invokes a pre-registered handler (the no-eval escape hatch)", async ({
  page,
}) => {
  const ran = await page.evaluate(() => {
    let calls = 0;
    window.__spaday.registerHandler("count", () => (calls += 1));
    const btn = window.__spaday.mount(document.body, {
      tag: "button",
      events: { click: { kind: "js", handler: "count" } },
    });
    btn.click();
    btn.click();
    return calls;
  });
  expect(ran).toBe(2);
});
