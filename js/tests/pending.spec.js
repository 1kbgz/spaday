import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

const byId = (id) => ({ ref: "id", id });
const lit = (value) => ({ expr: "lit", value });

test("an Invoke on an element defined later runs once, with the arguments the event fired with", async ({
  page,
}) => {
  const r = await page.evaluate(
    async ({ saver }) => {
      const { mount, Store } = window.__spaday;
      const store = new Store({
        saved: null,
        after: null,
        late: null,
        tab: null,
      });
      const root = mount(
        document.body,
        {
          tag: "div",
          slots: {
            default: [
              { tag: "late-saver", props: { id: { Str: "saver" } } },
              {
                tag: "input",
                props: { "data-tab": { Str: "workspace" } },
                events: {
                  change: {
                    kind: "seq",
                    actions: [
                      {
                        kind: "invoke",
                        target: saver,
                        method: "save",
                        args: [{ expr: "event" }],
                        result: "saved",
                      },
                      {
                        kind: "set-field",
                        field: "after",
                        value: { expr: "field", name: "saved" },
                      },
                      {
                        kind: "set-field",
                        field: "late",
                        value: { expr: "event" },
                      },
                      {
                        kind: "set-field",
                        field: "tab",
                        value: {
                          expr: "event-prop",
                          path: "currentTarget.dataset.tab",
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        store,
      );
      const input = root.querySelector("input");
      input.value = "first";
      input.dispatchEvent(new Event("change"));
      input.value = "second";
      const before = { saved: store.get("saved"), after: store.get("after") };
      await new Promise((resolve) => setTimeout(resolve, 50));
      const calls = [];
      customElements.define(
        "late-saver",
        class extends HTMLElement {
          async save(value) {
            calls.push(value);
            return { value };
          }
        },
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      return {
        before,
        calls,
        saved: store.get("saved"),
        after: store.get("after"),
        late: store.get("late"),
        tab: store.get("tab"),
      };
    },
    { saver: byId("saver") },
  );
  expect(r.before).toEqual({ saved: null, after: null });
  expect(r.calls).toEqual(["first"]);
  expect(r.saved).toEqual({ value: "first" });
  expect(r.after).toEqual({ value: "first" });
  expect(r.late).toBe("first");
  expect(r.tab).toBe("workspace");
});

test("actions on a pending element resume in the order they fired, after its queued props", async ({
  page,
}) => {
  const log = await page.evaluate(
    async ({ target }) => {
      const { mount } = window.__spaday;
      const push = (value) => ({
        kind: "invoke",
        target,
        method: "push",
        args: [{ expr: "lit", value }],
      });
      const root = mount(document.body, {
        tag: "div",
        slots: {
          default: [
            { tag: "late-log", props: { id: { Str: "log" } } },
            { tag: "button", events: { click: push("a") } },
            { tag: "button", events: { click: push("b") } },
            {
              tag: "button",
              events: {
                click: {
                  kind: "set",
                  target,
                  prop: "config",
                  value: { expr: "lit", value: { n: 1 } },
                },
              },
            },
          ],
        },
      });
      for (const button of root.querySelectorAll("button")) button.click();
      const log = [];
      customElements.define(
        "late-log",
        class extends HTMLElement {
          set config(value) {
            log.push(`config:${value.n}`);
          }
          push(value) {
            log.push(value);
          }
        },
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      return log;
    },
    { target: byId("log") },
  );
  expect(log).toEqual(["config:1", "a", "b"]);
});

test("a step that reads a pending element waits; earlier steps and built-in props do not", async ({
  page,
}) => {
  const r = await page.evaluate(
    async ({ reader }) => {
      const { mount, Store } = window.__spaday;
      const store = new Store({
        before: null,
        hidden: null,
        saved: null,
        mode: null,
      });
      const root = mount(
        document.body,
        {
          tag: "div",
          slots: {
            default: [
              {
                tag: "late-reader",
                props: { id: { Str: "reader" }, hidden: { Bool: true } },
              },
              {
                tag: "button",
                props: { id: { Str: "read" } },
                events: {
                  click: {
                    kind: "seq",
                    actions: [
                      {
                        kind: "set-field",
                        field: "before",
                        value: { expr: "lit", value: true },
                      },
                      {
                        kind: "set-field",
                        field: "hidden",
                        value: { expr: "prop", target: reader, name: "hidden" },
                      },
                      {
                        kind: "set-field",
                        field: "saved",
                        value: { expr: "call", target: reader, method: "save" },
                      },
                      {
                        kind: "set-field",
                        field: "mode",
                        value: { expr: "prop", target: reader, name: "mode" },
                      },
                      { kind: "toggle", target: reader, prop: "open" },
                    ],
                  },
                },
              },
              {
                tag: "button",
                props: { id: { Str: "unhide" } },
                events: {
                  click: { kind: "toggle", target: reader, prop: "hidden" },
                },
              },
            ],
          },
        },
        store,
      );
      const el = root.querySelector("late-reader");
      root.querySelector("#read").click();
      root.querySelector("#unhide").click();
      const sameTick = {
        before: store.get("before"),
        hidden: store.get("hidden"),
        saved: store.get("saved"),
        unhidden: !el.hidden,
      };
      customElements.define(
        "late-reader",
        class extends HTMLElement {
          mode = "grid";
          open = false;
          save() {
            return { layout: "tabs" };
          }
        },
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      return {
        sameTick,
        saved: store.get("saved"),
        mode: store.get("mode"),
        open: el.open,
      };
    },
    { reader: byId("reader") },
  );
  expect(r.sameTick).toEqual({
    before: true,
    hidden: true,
    saved: null,
    unhidden: true,
  });
  expect(r.saved).toEqual({ layout: "tabs" });
  expect(r.mode).toBe("grid");
  expect(r.open).toBe(true);
});

test("an element removed while it waited is not called, and its sequence stops", async ({
  page,
}) => {
  const r = await page.evaluate(
    async ({ gone, after }) => {
      const { mount, Store } = window.__spaday;
      const store = new Store({ after: null });
      const root = mount(
        document.body,
        {
          tag: "div",
          slots: {
            default: [
              { tag: "late-gone", props: { id: { Str: "gone" } } },
              {
                tag: "button",
                events: {
                  click: {
                    kind: "seq",
                    actions: [
                      { kind: "invoke", target: gone, method: "run" },
                      { kind: "set-field", field: "after", value: after },
                    ],
                  },
                },
              },
            ],
          },
        },
        store,
      );
      root.querySelector("button").click();
      root.querySelector("late-gone").remove();
      let calls = 0;
      customElements.define(
        "late-gone",
        class extends HTMLElement {
          run() {
            calls += 1;
          }
        },
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { calls, after: store.get("after") };
    },
    { gone: byId("gone"), after: lit(true) },
  );
  expect(r).toEqual({ calls: 0, after: null });
});

test("a tag that is not defined in time drops its waiting actions with one warning", async ({
  page,
}) => {
  const warnings = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.clock.install();
  await page.evaluate(
    ({ never, after }) => {
      const { mount, Store } = window.__spaday;
      const store = (window.__store = new Store({
        saved: "kept",
        after: null,
      }));
      const invoke = {
        kind: "invoke",
        target: never,
        method: "run",
        result: "saved",
      };
      const root = mount(
        document.body,
        {
          tag: "div",
          slots: {
            default: [
              { tag: "late-never", props: { id: { Str: "never" } } },
              { tag: "button", events: { click: invoke } },
              {
                tag: "button",
                events: {
                  click: {
                    kind: "seq",
                    actions: [
                      invoke,
                      { kind: "set-field", field: "after", value: after },
                    ],
                  },
                },
              },
            ],
          },
        },
        store,
      );
      for (const button of root.querySelectorAll("button")) button.click();
    },
    { never: byId("never"), after: lit(true) },
  );
  await page.clock.fastForward(9000);
  expect(warnings).toEqual([]);
  await page.clock.fastForward(1000);
  const r = await page.evaluate(async () => {
    let calls = 0;
    customElements.define(
      "late-never",
      class extends HTMLElement {
        run() {
          calls += 1;
        }
      },
    );
    await customElements.whenDefined("late-never");
    await Promise.resolve();
    return {
      calls,
      saved: window.__store.get("saved"),
      after: window.__store.get("after"),
    };
  });
  expect(warnings).toEqual([
    "spaday: <late-never> was not defined within 10s; the actions waiting on it were dropped",
  ]);
  expect(r).toEqual({ calls: 0, saved: "kept", after: null });
});

test("setDefinitionTimeout changes how long later actions wait", async ({
  page,
}) => {
  const warnings = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  const r = await page.evaluate(async () => {
    const { setDefinitionTimeout } = await import("/dist/esm/index.js");
    const rejected = [0, -1, Number.NaN, Infinity, "200"].map((value) => {
      try {
        setDefinitionTimeout(value);
        return false;
      } catch (error) {
        return error instanceof RangeError;
      }
    });
    setDefinitionTimeout(200);
    const el = window.__spaday.mount(document.body, {
      tag: "late-short",
      events: {
        click: { kind: "invoke", target: { ref: "this" }, method: "run" },
      },
    });
    el.click();
    await new Promise((resolve) => setTimeout(resolve, 350));
    let calls = 0;
    customElements.define(
      "late-short",
      class extends HTMLElement {
        run() {
          calls += 1;
        }
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    return { rejected, calls };
  });
  expect(r.rejected).toEqual([true, true, true, true, true]);
  expect(r.calls).toBe(0);
  expect(warnings).toEqual([
    "spaday: <late-short> was not defined within 0.2s; the actions waiting on it were dropped",
  ]);
});

test("a superseded effect does not run when its element is finally defined", async ({
  page,
}) => {
  const calls = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ query: "a" });
    mount(
      document.body,
      {
        tag: "late-search",
        effects: {
          search: {
            watch: ["query"],
            initial: true,
            action: {
              kind: "invoke",
              target: { ref: "this" },
              method: "search",
              args: [{ expr: "field", name: "query" }],
            },
          },
        },
      },
      store,
    );
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
    await tick();
    store.set("query", "b");
    await tick();
    store.set("query", "c");
    await tick();
    const calls = [];
    customElements.define(
      "late-search",
      class extends HTMLElement {
        search(query) {
          calls.push(query);
        }
      },
    );
    await tick();
    return calls;
  });
  expect(calls).toEqual(["c"]);
});

test("an action the element fires as it upgrades finds its queued props applied", async ({
  page,
}) => {
  const seen = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ seen: null });
    mount(
      document.body,
      {
        tag: "late-ready",
        props: { config: { Map: { layout: { Int: 2 } } } },
        events: {
          ready: {
            kind: "set-field",
            field: "seen",
            value: {
              expr: "call",
              target: { ref: "this" },
              method: "describe",
            },
          },
        },
      },
      store,
    );
    customElements.define(
      "late-ready",
      class extends HTMLElement {
        config = null;
        connectedCallback() {
          this.dispatchEvent(new CustomEvent("ready"));
        }
        describe() {
          return this.config;
        }
      },
    );
    return store.get("seen");
  });
  expect(seen).toEqual({ layout: 2 });
});

test("a detached element created before its definition is upgraded before it is called", async ({
  page,
}) => {
  const pong = await page.evaluate(() => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ pong: null });
    const el = mount(
      document.createElement("div"),
      {
        tag: "late-detached",
        events: {
          click: {
            kind: "invoke",
            target: { ref: "this" },
            method: "ping",
            result: "pong",
          },
        },
      },
      store,
    );
    customElements.define(
      "late-detached",
      class extends HTMLElement {
        ping() {
          return "pong";
        }
      },
    );
    el.dispatchEvent(new Event("click"));
    return store.get("pong");
  });
  expect(pong).toBe("pong");
});

test("a defined element that lacks the method still reports it", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.evaluate(() => {
    customElements.define("early-plain", class extends HTMLElement {});
    const el = window.__spaday.mount(document.body, {
      tag: "early-plain",
      events: {
        click: { kind: "invoke", target: { ref: "this" }, method: "missing" },
      },
    });
    el.click();
  });
  expect(errors).toEqual(["spaday: <early-plain> has no method missing()"]);
});

test("an element whose constructor throws does not requeue its props forever", async ({
  page,
}) => {
  const r = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ after: null });
    const el = mount(
      document.body,
      {
        tag: "late-broken",
        props: { rows: { List: [{ Int: 1 }] } },
        events: {
          click: {
            kind: "seq",
            actions: [
              { kind: "invoke", target: { ref: "this" }, method: "run" },
              {
                kind: "set-field",
                field: "after",
                value: { expr: "lit", value: true },
              },
            ],
          },
        },
      },
      store,
    );
    el.click();
    customElements.define(
      "late-broken",
      class extends HTMLElement {
        constructor() {
          super();
          throw new Error("boom");
        }
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { defined: el.matches(":defined"), after: store.get("after") };
  });
  expect(r).toEqual({ defined: false, after: true });
});
