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
    const rejected = [0, -1, Number.NaN, Infinity, "200", 2147483648].map(
      (value) => {
        try {
          setDefinitionTimeout(value);
          return false;
        } catch (error) {
          return error instanceof RangeError;
        }
      },
    );
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
  expect(r.rejected).toEqual([true, true, true, true, true, true]);
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
  expect(r).toEqual({ defined: false, after: null });
});

test("an unused conditional branch must not block or drop the action", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    (await import("/dist/esm/index.js")).setDefinitionTimeout(25);
    const store = new Store({ result: "unchanged", after: false });
    const root = mount(
      document.body,
      {
        tag: "div",
        slots: {
          default: [
            { tag: "pending-unused", props: { id: { Str: "unused" } } },
            {
              tag: "button",
              events: {
                click: {
                  kind: "seq",
                  actions: [
                    {
                      kind: "set-field",
                      field: "result",
                      value: {
                        expr: "cond",
                        test: { expr: "lit", value: false },
                        then: {
                          expr: "prop",
                          target: { ref: "id", id: "unused" },
                          name: "value",
                        },
                        else: { expr: "lit", value: "fallback" },
                      },
                    },
                    {
                      kind: "set-field",
                      field: "after",
                      value: { expr: "lit", value: true },
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
    root.querySelector("button").click();
    await new Promise((r) => setTimeout(r, 70));
    return { result: store.get("result"), after: store.get("after") };
  });
  expect(result).toEqual({ result: "fallback", after: true });
});

test("upgrade events must read earlier queued properties", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ seen: "unchanged" });
    const el = mount(
      document.body,
      {
        tag: "pending-prop",
        props: { config: { Map: { n: { Int: 7 } } } },
        events: {
          ready: {
            kind: "set-field",
            field: "seen",
            value: { expr: "prop", target: { ref: "this" }, name: "config" },
          },
        },
      },
      store,
    );
    customElements.define(
      "pending-prop",
      class extends HTMLElement {
        config = null;
        connectedCallback() {
          this.dispatchEvent(new CustomEvent("ready"));
        }
      },
    );
    await new Promise((r) => setTimeout(r, 10));
    return { seen: store.get("seen"), config: el.config };
  });
  expect(result).toEqual({ seen: { n: 7 }, config: { n: 7 } });
});

test("calls to one target keep their order when the first has a pending argument", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount } = window.__spaday;
    const root = mount(document.body, {
      tag: "div",
      slots: {
        default: [
          { tag: "pending-destination", props: { id: { Str: "destination" } } },
          { tag: "pending-source", props: { id: { Str: "source" } } },
          {
            tag: "button",
            props: { id: { Str: "first" } },
            events: {
              click: {
                kind: "invoke",
                target: { ref: "id", id: "destination" },
                method: "record",
                args: [
                  {
                    expr: "prop",
                    target: { ref: "id", id: "source" },
                    name: "value",
                  },
                ],
              },
            },
          },
          {
            tag: "button",
            props: { id: { Str: "second" } },
            events: {
              click: {
                kind: "invoke",
                target: { ref: "id", id: "destination" },
                method: "record",
                args: [{ expr: "lit", value: "second" }],
              },
            },
          },
        ],
      },
    });
    root.querySelector("#first").click();
    root.querySelector("#second").click();
    const log = [];
    customElements.define(
      "pending-destination",
      class extends HTMLElement {
        record(value) {
          log.push(value);
        }
      },
    );
    await new Promise((r) => setTimeout(r, 10));
    customElements.define(
      "pending-source",
      class extends HTMLElement {
        value = "first";
      },
    );
    await new Promise((r) => setTimeout(r, 10));
    return log;
  });
  expect(result).toEqual(["first", "second"]);
});

test("an upgrade event write must not be overwritten by an earlier queued prop before Invoke", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ seen: null });
    const el = mount(
      document.body,
      {
        tag: "pending-ready-write",
        props: { config: { Str: "old" } },
        events: {
          ready: {
            kind: "seq",
            actions: [
              {
                kind: "set",
                target: { ref: "this" },
                prop: "config",
                value: { expr: "lit", value: "new" },
              },
              {
                kind: "invoke",
                target: { ref: "this" },
                method: "read",
                result: "seen",
              },
            ],
          },
        },
      },
      store,
    );
    customElements.define(
      "pending-ready-write",
      class extends HTMLElement {
        config = null;
        connectedCallback() {
          this.dispatchEvent(new CustomEvent("ready"));
        }
        read() {
          return this.config;
        }
      },
    );
    await new Promise((r) => setTimeout(r, 10));
    return { seen: store.get("seen"), config: el.config };
  });
  expect(result.seen).toBe("new");
});

test("a removed action owner must not invoke a surviving target after definition", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store } = window.__spaday;
    const store = new Store({ after: false });
    const root = mount(
      document.body,
      {
        tag: "div",
        slots: {
          default: [
            { tag: "pending-outside", props: { id: { Str: "target" } } },
            {
              tag: "button",
              events: {
                click: {
                  kind: "seq",
                  actions: [
                    {
                      kind: "invoke",
                      target: { ref: "id", id: "target" },
                      method: "run",
                    },
                    {
                      kind: "set-field",
                      field: "after",
                      value: { expr: "lit", value: true },
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
    const button = root.querySelector("button");
    button.click();
    window.__spaday.applyPatch(root, {
      ops: [{ RemoveChild: { path: [], slot: "default", index: 1 } }],
    });
    let calls = 0;
    customElements.define(
      "pending-outside",
      class extends HTMLElement {
        run() {
          calls++;
        }
      },
    );
    await new Promise((r) => setTimeout(r, 10));
    return { calls, after: store.get("after"), connected: button.isConnected };
  });
  expect(result).toEqual({ calls: 0, after: false, connected: false });
});

for (const [operator, first, expected] of [
  ["all", false, false],
  ["any", true, true],
]) {
  test(`${operator} skips unused pending reads and method calls`, async ({
    page,
  }) => {
    const result = await page.evaluate(
      ({ operator, first }) => {
        const { mount, Store } = window.__spaday;
        const store = new Store({ result: null });
        let calls = 0;
        customElements.define(
          "pending-short-circuit",
          class extends HTMLElement {
            run() {
              calls++;
              return true;
            }
          },
        );
        const root = mount(
          document.body,
          {
            tag: "div",
            slots: {
              default: [
                { tag: "pending-never", props: { id: { Str: "never" } } },
                {
                  tag: "pending-short-circuit",
                  props: { id: { Str: "counter" } },
                },
                {
                  tag: "button",
                  events: {
                    click: {
                      kind: "set-field",
                      field: "result",
                      value: {
                        expr: operator,
                        of: [
                          { expr: "lit", value: first },
                          {
                            expr: "prop",
                            target: { ref: "id", id: "never" },
                            name: "value",
                          },
                          {
                            expr: "call",
                            target: { ref: "id", id: "counter" },
                            method: "run",
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
          store,
        );
        root.querySelector("button").click();
        return { value: store.get("result"), calls };
      },
      { operator, first },
    );
    expect(result).toEqual({ value: expected, calls: 0 });
  });
}

for (const removeTarget of [false, true]) {
  test(`a timed-out argument releases its invocation queue${removeTarget ? " without calling a removed target" : ""}`, async ({
    page,
  }) => {
    const result = await page.evaluate(async (removeTarget) => {
      const { mount, Store } = window.__spaday;
      (await import("/dist/esm/index.js")).setDefinitionTimeout(30);
      const store = new Store({ after: false });
      const calls = [];
      customElements.define(
        "pending-queue-target",
        class extends HTMLElement {
          run(value) {
            calls.push(value);
          }
        },
      );
      const invoke = (args) => ({
        kind: "invoke",
        target: { ref: "id", id: "target" },
        method: "run",
        args,
      });
      const root = mount(
        document.body,
        {
          tag: "div",
          slots: {
            default: [
              { tag: "pending-queue-target", props: { id: { Str: "target" } } },
              { tag: "pending-queue-source", props: { id: { Str: "source" } } },
              {
                tag: "button",
                props: { id: { Str: "first" } },
                events: {
                  click: invoke([
                    {
                      expr: "prop",
                      target: { ref: "id", id: "source" },
                      name: "value",
                    },
                  ]),
                },
              },
              {
                tag: "button",
                props: { id: { Str: "second" } },
                events: {
                  click: {
                    kind: "seq",
                    actions: [
                      invoke([{ expr: "lit", value: "second" }]),
                      {
                        kind: "set-field",
                        field: "after",
                        value: { expr: "lit", value: true },
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
      root.querySelector("#first").click();
      root.querySelector("#second").click();
      if (removeTarget) root.querySelector("#target").remove();
      await new Promise((resolve) => setTimeout(resolve, 80));
      return { calls, after: store.get("after") };
    }, removeTarget);
    expect(result).toEqual(
      removeTarget
        ? { calls: [], after: false }
        : { calls: ["second"], after: true },
    );
  });
}

test("queued invocations start in order without waiting for earlier method promises", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount } = window.__spaday;
    const calls = [];
    let finish;
    customElements.define(
      "pending-async-target",
      class extends HTMLElement {
        run(value) {
          calls.push(value);
          return new Promise((resolve) => {
            finish = resolve;
          });
        }
      },
    );
    const root = mount(document.body, {
      tag: "pending-async-target",
      events: {
        click: {
          kind: "invoke",
          target: { ref: "this" },
          method: "run",
          args: [{ expr: "event" }],
        },
      },
    });
    root.dispatchEvent(new CustomEvent("click", { detail: "first" }));
    root.dispatchEvent(new CustomEvent("click", { detail: "second" }));
    const immediate = [...calls];
    finish();
    return immediate;
  });
  expect(result).toEqual(["first", "second"]);
});

test("a deferred setter can replace a later queued property", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount } = window.__spaday;
    const root = mount(document.body, {
      tag: "pending-setter",
      props: { first: { Str: "start" }, second: { Str: "old" } },
      events: {
        ready: {
          kind: "set",
          target: { ref: "this" },
          prop: "second",
          value: { expr: "lit", value: "new" },
        },
      },
    });
    customElements.define(
      "pending-setter",
      class extends HTMLElement {
        second = "default";
        set first(value) {
          this.dispatchEvent(new CustomEvent("ready"));
        }
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    return root.second;
  });
  expect(result).toBe("new");
});

test("an upgrade event can replace a queued attribute fallback", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount } = window.__spaday;
    const root = mount(document.body, {
      tag: "pending-attribute",
      props: { config: { Str: "old" } },
      events: {
        ready: {
          kind: "set",
          target: { ref: "this" },
          prop: "config",
          value: { expr: "lit", value: "new" },
        },
      },
    });
    customElements.define(
      "pending-attribute",
      class extends HTMLElement {
        connectedCallback() {
          this.dispatchEvent(new CustomEvent("ready"));
        }
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    return root.getAttribute("config");
  });
  expect(result).toBe("new");
});

for (const expression of ["call", "prop", "event-closest"]) {
  test(`a throwing ${expression} argument releases its invocation queue`, async ({
    page,
  }) => {
    const result = await page.evaluate((expression) => {
      const { mount, interpret } = window.__spaday;
      const calls = [];
      customElements.define(
        "pending-throwing-argument",
        class extends HTMLElement {
          fail() {
            throw Error("broken method");
          }
          get value() {
            throw Error("broken getter");
          }
          record(value) {
            calls.push(value);
          }
        },
      );
      const el = mount(document.body, { tag: "pending-throwing-argument" });
      const ctx = { event: new Event("click"), currentTarget: el };
      const invoke = (args) => ({
        kind: "invoke",
        target: { ref: "this" },
        method: "record",
        args,
      });
      const argument =
        expression === "call"
          ? { expr: "call", target: { ref: "this" }, method: "fail" }
          : expression === "prop"
            ? { expr: "prop", target: { ref: "this" }, name: "value" }
            : { expr: "event-closest", selector: "[", path: "" };
      el.addEventListener(
        "click",
        (event) => interpret(invoke([argument]), { ...ctx, event }),
        { once: true },
      );
      el.click();
      interpret(invoke([{ expr: "lit", value: "second" }]), ctx);
      return calls;
    }, expression);
    expect(result).toEqual(["second"]);
  });
}

test("attribute fallbacks on undefined styling tags remain synchronous", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { mount, interpret, Store } = window.__spaday;
    const store = new Store({ state: null });
    const el = mount(document.body, {
      tag: "pending-styling",
      props: { "data-state": { Str: "open" }, open: { Str: "yes" } },
    });
    const ctx = { event: new Event("click"), currentTarget: el, store };
    interpret(
      {
        kind: "set-field",
        field: "state",
        value: { expr: "prop", target: { ref: "this" }, name: "data-state" },
      },
      ctx,
    );
    const toggle = { kind: "toggle", target: { ref: "this" }, prop: "open" };
    interpret(toggle, ctx);
    const closed = !el.hasAttribute("open");
    interpret(toggle, ctx);
    return {
      state: store.get("state"),
      closed,
      opened: el.hasAttribute("open"),
    };
  });
  expect(result).toEqual({ state: "open", closed: true, opened: true });
});

test("an explicit attribute write supersedes its pending property fallback", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, interpret } = window.__spaday;
    const el = mount(document.body, {
      tag: "pending-explicit-attribute",
      props: { label: { Str: "old" } },
    });
    interpret(
      {
        kind: "set",
        target: { ref: "this" },
        prop: "attr:label",
        value: { expr: "lit", value: "new" },
      },
      { event: new Event("click"), currentTarget: el },
    );
    customElements.define(
      "pending-explicit-attribute",
      class extends HTMLElement {},
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    return el.getAttribute("label");
  });
  expect(result).toBe("new");
});

for (const operation of ["RemoveChild", "RemoveEvent", "SetEvent"]) {
  test(`${operation} cancels pending arguments and releases another owner's invocation`, async ({
    page,
  }) => {
    await page.evaluate((operation) => {
      const { mount, Store, applyPatch } = window.__spaday;
      const store = new Store({ after: false });
      window.pendingOwnerStore = store;
      customElements.define(
        "pending-owner-target",
        class extends HTMLElement {
          run() {
            store.set("after", true);
          }
        },
      );
      const action = {
        kind: "invoke",
        target: { ref: "id", id: "target" },
        method: "run",
      };
      const root = mount(
        document.body,
        {
          tag: "div",
          slots: {
            default: [
              { tag: "pending-owner-target", props: { id: { Str: "target" } } },
              { tag: "pending-owner-source", props: { id: { Str: "source" } } },
              {
                tag: "button",
                props: { id: { Str: "first" } },
                events: {
                  click: {
                    ...action,
                    args: [
                      {
                        expr: "prop",
                        target: { ref: "id", id: "source" },
                        name: "value",
                      },
                    ],
                  },
                },
              },
              {
                tag: "button",
                props: { id: { Str: "second" } },
                events: { click: action },
              },
            ],
          },
        },
        store,
      );
      root.querySelector("#first").click();
      root.querySelector("#second").click();
      const change =
        operation === "RemoveChild"
          ? { RemoveChild: { path: [], slot: "default", index: 2 } }
          : operation === "RemoveEvent"
            ? {
                RemoveEvent: {
                  path: [{ slot: "default", index: 2 }],
                  name: "click",
                },
              }
            : {
                SetEvent: {
                  path: [{ slot: "default", index: 2 }],
                  name: "click",
                  action: {
                    kind: "set-field",
                    field: "changed",
                    value: { expr: "lit", value: true },
                  },
                },
              };
      applyPatch(root, { ops: [change] });
    }, operation);
    await expect
      .poll(() => page.evaluate(() => window.pendingOwnerStore.get("after")), {
        timeout: 1000,
      })
      .toBe(true);
  });
}

test("an invocation resumed behind another can invoke reentrantly in the same tick", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, interpret } = window.__spaday;
    const log = [];
    const action = (value) => ({
      kind: "invoke",
      target: { ref: "this" },
      method: "run",
      args: [{ expr: "lit", value }],
    });
    customElements.define(
      "pending-reentrant-target",
      class extends HTMLElement {
        run(value) {
          log.push(value);
          if (value === "second") {
            interpret(action("nested"), {
              event: new Event("click"),
              currentTarget: this,
            });
            log.push("second-end");
          }
        }
      },
    );
    const root = mount(document.body, {
      tag: "div",
      slots: {
        default: [
          { tag: "pending-reentrant-target" },
          { tag: "pending-reentrant-source", props: { id: { Str: "source" } } },
        ],
      },
    });
    const el = root.firstElementChild;
    const ctx = { event: new Event("click"), currentTarget: el };
    interpret(
      {
        ...action("first"),
        args: [
          { expr: "prop", target: { ref: "id", id: "source" }, name: "value" },
        ],
      },
      ctx,
    );
    interpret(action("second"), ctx);
    customElements.define(
      "pending-reentrant-source",
      class extends HTMLElement {
        value = "first";
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    return log;
  });
  expect(result).toEqual(["first", "second", "nested", "second-end"]);
});
