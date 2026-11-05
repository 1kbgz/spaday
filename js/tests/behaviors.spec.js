import { execFileSync } from "node:child_process";
import { test, expect } from "@playwright/test";

const lit = (value) => ({ expr: "lit", value });
const field = (name) => ({ expr: "field", name });

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

for (const managed of [false, true]) {
  test(`store effects cancel stale responses and later actions (managed=${managed})`, async ({
    page,
  }) => {
    await page.evaluate((managed) => {
      const { Store, mount } = window.__spaday;
      const store = (window.store = new Store({ path: "first" }));
      window.pending = [];
      // Deliberately ignore abort: even an already-arriving response must not commit stale data.
      window.fetch = (url, options) =>
        new Promise((resolve) =>
          window.pending.push({ url, options, resolve }),
        );
      window.root = mount(
        document.body,
        {
          tag: "div",
          effects: {
            load: {
              watch: ["path"],
              initial: true,
              action: {
                kind: "seq",
                actions: [
                  {
                    kind: "call",
                    method: "GET",
                    url: { expr: "field", name: "path" },
                    result: "response",
                    ...(managed
                      ? { request: { key: "load", pending: "loading" } }
                      : {}),
                  },
                  {
                    kind: "set-field",
                    field: "completed",
                    value: { expr: "field", name: "response.body" },
                  },
                ],
              },
            },
          },
        },
        store,
      );
    }, managed);
    await expect.poll(() => page.evaluate(() => window.pending.length)).toBe(1);
    await page.evaluate(() => {
      window.store.set("path", "second");
      window.store.set("path", "third");
    });
    await expect.poll(() => page.evaluate(() => window.pending.length)).toBe(2);
    expect(
      await page.evaluate(() =>
        window.pending.map((p) => [p.url, p.options.signal.aborted]),
      ),
    ).toEqual([
      ["first", true],
      ["third", false],
    ]);
    await page.evaluate(() => window.pending[1].resolve(new Response('"new"')));
    await expect
      .poll(() => page.evaluate(() => window.store.get("completed")))
      .toBe("new");
    await page.evaluate(() =>
      window.pending[0].resolve(new Response('"stale"')),
    );
    expect(await page.evaluate(() => window.store.get("completed"))).toBe(
      "new",
    );
    await page.evaluate(() => window.store.set("path", "removed"));
    await expect.poll(() => page.evaluate(() => window.pending.length)).toBe(3);
    await page.evaluate(() => window.root.remove());
    await expect
      .poll(() => page.evaluate(() => window.pending[2].options.signal.aborted))
      .toBe(true);
    await page.evaluate(() => {
      window.pending[2].resolve(new Response('"removed"'));
      window.store.set("path", "after");
    });
    expect(
      await page.evaluate(() => [
        window.pending.length,
        window.store.get("completed"),
      ]),
    ).toEqual([3, "new"]);
    if (managed)
      expect(await page.evaluate(() => window.store.get("loading"))).toBe(
        false,
      );
  });
}

test("effect cancellation suppresses asynchronous Invoke results and the rest of its sequence", async ({
  page,
}) => {
  await page.evaluate(() => {
    const { Store, mount } = window.__spaday;
    window.store = new Store({ path: "one" });
    window.calls = [];
    customElements.define(
      "effect-panel",
      class extends HTMLElement {
        open(value) {
          return new Promise((resolve) =>
            window.calls.push({ value, resolve }),
          );
        }
      },
    );
    window.root = mount(
      document.body,
      {
        tag: "effect-panel",
        effects: {
          open: {
            watch: ["path"],
            initial: true,
            action: {
              kind: "seq",
              actions: [
                {
                  kind: "invoke",
                  target: { ref: "this" },
                  method: "open",
                  args: [{ expr: "field", name: "path" }],
                  result: "opened",
                },
                {
                  kind: "set-field",
                  field: "done",
                  value: { expr: "field", name: "opened" },
                },
              ],
            },
          },
        },
      },
      window.store,
    );
  });
  await expect.poll(() => page.evaluate(() => window.calls.length)).toBe(1);
  await page.evaluate(() => window.store.set("path", "two"));
  await expect.poll(() => page.evaluate(() => window.calls.length)).toBe(2);
  await page.evaluate(() => window.calls[0].resolve("stale"));
  expect(await page.evaluate(() => window.store.get("opened"))).toBeUndefined();
  await page.evaluate(() => window.calls[1].resolve("two"));
  await expect
    .poll(() => page.evaluate(() => window.store.get("done")))
    .toBe("two");
});

test("hydration, same-turn changes, keyed moves, effect replacement and removal", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { Store, hydrate, applyPatch, registerHandler } = window.__spaday;
    const { diff } = await import("/dist/esm/index.js");
    const store = new Store({ path: "initial" });
    const calls = [];
    registerHandler("record", () => calls.push(store.get("path")));
    const child = {
      tag: "div",
      key: "a",
      effects: {
        log: {
          watch: ["path"],
          initial: false,
          action: { kind: "js", handler: "record" },
        },
      },
    };
    const other = { tag: "span", key: "b" };
    let tree = { tag: "section", slots: { default: [child, other] } };
    document.body.innerHTML = "<section><div></div><span></span></section>";
    const root = hydrate(document.body, tree, store);
    const original = root.firstElementChild;
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
    store.set("path", "same-turn");
    await tick();
    const patch = (next) => {
      applyPatch(
        root,
        JSON.parse(diff(JSON.stringify(tree), JSON.stringify(next))),
        store,
      );
      tree = next;
    };
    patch({ ...tree, slots: { default: [other, child] } });
    await tick();
    store.set("path", "moved");
    await tick();
    const changed = structuredClone(child);
    changed.effects.log = {
      watch: ["other"],
      initial: true,
      action: { kind: "js", handler: "record" },
    };
    patch({ ...tree, slots: { default: [other, changed] } });
    await tick();
    store.set("path", "ignored");
    await tick();
    patch({ ...tree, slots: { default: [other, { tag: "div", key: "a" }] } });
    store.set("other", "ignored");
    await tick();
    return { calls, same: root.lastElementChild === original };
  });
  expect(result).toEqual({
    calls: ["same-turn", "moved", "moved"],
    same: true,
  });
});

test("inactive readiness does not block logs and recovers after data or component timeouts", async ({
  page,
}) => {
  await page.evaluate(
    (spec) => {
      const { Store, mount } = window.__spaday;
      window.store = new Store({ data: false, workspace: false, error: null });
      window.root = mount(
        document.body,
        {
          tag: "section",
          readiness: spec,
          slots: {
            default: [
              { tag: "workspace-view" },
              {
                tag: "button",
                props: { id: { Str: "logs" } },
                events: {
                  click: {
                    kind: "set-field",
                    field: "logs",
                    value: { expr: "lit", value: true },
                  },
                },
              },
            ],
          },
        },
        window.store,
      );
    },
    {
      when: field("data"),
      active: field("workspace"),
      error: field("error"),
      result: "view",
      elements: ["workspace-view"],
      timeout: 40,
    },
  );
  await expect
    .poll(() => page.evaluate(() => window.store.get("view.status")))
    .toBe("idle");
  await page.locator("#logs").click();
  expect(await page.evaluate(() => window.store.get("logs"))).toBe(true);
  await page.evaluate(() => window.store.set("workspace", true));
  await expect
    .poll(() => page.evaluate(() => window.store.get("view.status")))
    .toBe("error");
  await page.evaluate(() => {
    window.store.set("data", true);
    customElements.define(
      "workspace-view",
      class extends HTMLElement {
        constructor() {
          super();
          this.updateComplete = new Promise(
            (resolve) => (window.finishComponent = resolve),
          );
        }
      },
    );
  });
  expect(await page.evaluate(() => window.store.get("view.status"))).toBe(
    "error",
  );
  await page.evaluate(() => window.finishComponent());
  await expect
    .poll(() => page.evaluate(() => window.store.get("view")))
    .toEqual({ status: "ready", error: null });
  await page.evaluate(() => window.store.set("error", "Data unavailable"));
  expect(await page.evaluate(() => window.store.get("view"))).toEqual({
    status: "error",
    error: "Data unavailable",
  });
  await page.evaluate(() => window.store.set("error", null));
  expect(await page.evaluate(() => window.store.get("view.status"))).toBe(
    "ready",
  );
  await page.evaluate(() => window.store.set("data", false));
  expect(await page.evaluate(() => window.store.get("view.status"))).toBe(
    "loading",
  );
  await expect
    .poll(() => page.evaluate(() => window.store.get("view.status")))
    .toBe("error");
  await page.evaluate(() => window.store.set("data", true));
  expect(await page.evaluate(() => window.store.get("view.status"))).toBe(
    "ready",
  );
  await page.evaluate(() => {
    window.root.remove();
  });
  await page.evaluate(() => window.store.set("data", false));
  expect(await page.evaluate(() => window.store.get("view.status"))).toBe(
    "ready",
  );
});

test("readiness patch replacement and removal dispose subscriptions and timers", async ({
  page,
}) => {
  await page.evaluate(
    (readiness) => {
      const { Store, mount } = window.__spaday;
      window.store = new Store({ ready: false });
      window.root = mount(
        document.body,
        { tag: "div", readiness },
        window.store,
      );
    },
    {
      when: field("ready"),
      active: lit(true),
      error: lit(null),
      result: "old",
      elements: [],
      timeout: 100,
    },
  );
  await expect
    .poll(() => page.evaluate(() => window.store.get("old.status")))
    .toBe("loading");
  await page.evaluate(
    (readiness) =>
      window.__spaday.applyPatch(
        window.root,
        { ops: [{ SetReadiness: { path: [], readiness } }] },
        window.store,
      ),
    {
      when: field("ready"),
      active: lit(true),
      error: lit(null),
      result: "new",
      elements: [],
      timeout: 30,
    },
  );
  await expect
    .poll(() => page.evaluate(() => window.store.get("new.status")))
    .toBe("error");
  await page.evaluate(() =>
    window.__spaday.applyPatch(
      window.root,
      { ops: [{ SetReadiness: { path: [], readiness: null } }] },
      window.store,
    ),
  );
  await page.evaluate(() => window.store.set("ready", true));
  expect(
    await page.evaluate(() => [
      window.store.get("old.status"),
      window.store.get("new.status"),
    ]),
  ).toEqual(["loading", "error"]);
});

test("Python-authored save then copy reports clipboard success and failure", async ({
  page,
}) => {
  const tree = JSON.parse(
    execFileSync(
      process.env.PYTHON || "python",
      [
        "-c",
        `
from spaday import Button, CallEndpoint, CopyToClipboard, If, Sequence, SetField, field
from spaday.ui import resolve, NATIVE
import json
button = Button(label="Share").on("click", Sequence(
    CallEndpoint("POST", "/share", result="saved"),
    If(field("saved.ok"), CopyToClipboard(field("saved.body.url"), result="copied")),
    SetField("finished", True),
))
print(json.dumps(resolve(button.to_node(), NATIVE)))
`,
      ],
      { cwd: "..", encoding: "utf8" },
    ),
  );
  await page.route("**/share", (route) =>
    route.fulfill({ json: { url: "https://example.test/shared/1" } }),
  );
  await page.evaluate((tree) => {
    const { mount, Store } = window.__spaday;
    window.copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value) => window.copied.push(value) },
    });
    window.store = new Store();
    window.root = mount(document.body, tree, window.store);
  }, tree);
  await page.getByRole("button", { name: "Share" }).click();
  await expect
    .poll(() => page.evaluate(() => window.store.get("copied")))
    .toEqual({ ok: true, error: null });
  expect(
    await page.evaluate(() => [window.copied, window.store.get("finished")]),
  ).toEqual([["https://example.test/shared/1"], true]);
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw new DOMException("Permission denied", "NotAllowedError");
    };
    window.store.set("finished", false);
  });
  await page.getByRole("button", { name: "Share" }).click();
  await expect
    .poll(() => page.evaluate(() => window.store.get("copied.ok")))
    .toBe(false);
  expect(await page.evaluate(() => window.store.get("copied.error"))).toContain(
    "Permission denied",
  );
  expect(await page.evaluate(() => window.store.get("finished"))).toBe(true);
});

test("URL changes start effects and shadow reparenting still disposes them", async ({
  page,
}) => {
  await page.evaluate(() => {
    const { mount, Store, bindUrl, registerHandler } = window.__spaday;
    window.store = new Store({ log_path: "initial" });
    bindUrl(window.store, { log_path: "file" });
    window.calls = [];
    registerHandler("load-file", () =>
      window.calls.push(window.store.get("log_path")),
    );
    const hosts = [
      document.createElement("div"),
      document.createElement("div"),
    ];
    document.body.append(...hosts);
    const containers = hosts.map((host) => {
      const container = document.createElement("div");
      host.attachShadow({ mode: "open" }).append(container);
      return container;
    });
    window.destination = containers[1];
    window.root = mount(
      containers[0],
      {
        tag: "section",
        effects: {
          load: {
            watch: ["log_path"],
            initial: true,
            action: { kind: "js", handler: "load-file" },
          },
        },
      },
      window.store,
    );
  });
  await expect
    .poll(() => page.evaluate(() => window.calls))
    .toEqual(["initial"]);
  await page.evaluate(() => {
    window.destination.append(window.root);
    history.pushState(null, "", "?file=selected");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect
    .poll(() => page.evaluate(() => window.calls))
    .toEqual(["initial", "selected"]);
  await page.evaluate(() => window.root.remove());
  await page.evaluate(() => window.store.set("log_path", "removed"));
  expect(await page.evaluate(() => window.calls)).toEqual([
    "initial",
    "selected",
  ]);
});

test("effects in keyed instances keep lexical scope and cancel removed instances", async ({
  page,
}) => {
  await page.evaluate(() => {
    const { Store, mount } = window.__spaday;
    window.store = new Store({ rows: [{ id: "a" }, { id: "b" }], reload: 0 });
    window.events = [];
    document.addEventListener("loaded-item", (event) =>
      window.events.push(event.detail),
    );
    window.root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "div",
              effects: {
                load: {
                  watch: ["reload"],
                  initial: true,
                  action: {
                    kind: "emit",
                    event: "loaded-item",
                    detail: { expr: "item", path: "id" },
                  },
                },
              },
            },
          ],
        },
      },
      window.store,
    );
  });
  await expect
    .poll(() => page.evaluate(() => window.events))
    .toEqual(["a", "b"]);
  await page.evaluate(() => window.store.set("rows", [{ id: "b" }]));
  await expect
    .poll(() => page.evaluate(() => window.root.children.length))
    .toBe(1);
  await page.evaluate(() => window.store.set("reload", 1));
  await expect
    .poll(() => page.evaluate(() => window.events))
    .toEqual(["a", "b", "b"]);
});

test("removing a mount before initial execution releases subscriptions", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mount, Store, registerHandler } = window.__spaday;
    const store = new Store({ path: "initial" });
    const subscribe = store.subscribe.bind(store);
    let subscriptions = 0;
    store.subscribe = (...args) => {
      subscriptions++;
      const stop = subscribe(...args);
      return () => {
        subscriptions--;
        stop();
      };
    };
    let calls = 0;
    registerHandler("count", () => calls++);
    const root = mount(
      document.body,
      {
        tag: "div",
        effects: {
          load: {
            watch: ["path"],
            initial: true,
            action: { kind: "js", handler: "count" },
          },
        },
      },
      store,
    );
    root.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    store.set("path", "removed");
    return { calls, subscriptions };
  });
  expect(result).toEqual({ calls: 0, subscriptions: 0 });
});

test("clipboard action writes a real browser clipboard after a save request", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.route("**/save-link", (route) =>
    route.fulfill({ json: { url: "https://example.test/layout/42" } }),
  );
  await page.evaluate(() => {
    const { Store, mount } = window.__spaday;
    window.store = new Store();
    mount(
      document.body,
      {
        tag: "button",
        props: { textContent: { Str: "Save link" } },
        events: {
          click: {
            kind: "seq",
            actions: [
              {
                kind: "call",
                method: "POST",
                url: "/save-link",
                result: "saved",
              },
              {
                kind: "clipboard",
                value: { expr: "field", name: "saved.body.url" },
                result: "copied",
              },
            ],
          },
        },
      },
      window.store,
    );
  });
  await page.getByRole("button", { name: "Save link" }).click();
  await expect
    .poll(() => page.evaluate(() => window.store.get("copied.ok")))
    .toBe(true);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "https://example.test/layout/42",
  );
});

test("obsolete effect refreshes cannot replace a tree with stale server state", async ({
  page,
}) => {
  await page.evaluate(() => {
    const { mount, Store, trackRoot } = window.__spaday;
    window.store = new Store({ path: "first" });
    const tree = (window.tree = {
      tag: "section",
      effects: {
        reload: {
          watch: ["path"],
          initial: true,
          action: { kind: "refresh" },
        },
      },
    });
    window.requests = [];
    window.fetch = (url, options) =>
      new Promise((resolve) => window.requests.push({ options, resolve }));
    window.root = mount(document.body, tree, window.store);
    trackRoot(window.root, tree, "/tree", window.store);
  });
  await expect.poll(() => page.evaluate(() => window.requests.length)).toBe(1);
  await page.evaluate(() => window.store.set("path", "second"));
  await expect.poll(() => page.evaluate(() => window.requests.length)).toBe(2);
  expect(
    await page.evaluate(() => window.requests[0].options.signal.aborted),
  ).toBe(true);
  await page.evaluate(() =>
    window.requests[1].resolve(
      new Response(
        JSON.stringify({
          ...window.tree,
          props: { title: { Str: "current" } },
        }),
      ),
    ),
  );
  await expect(page.locator("section")).toHaveAttribute("title", "current");
  await page.evaluate(() =>
    window.requests[0].resolve(
      new Response(
        JSON.stringify({ ...window.tree, props: { title: { Str: "stale" } } }),
      ),
    ),
  );
  await expect(page.locator("section")).toHaveAttribute("title", "current");
});

test("minimal JavaScript readiness shares Python defaults and works without a store", async ({
  page,
}) => {
  const expected = JSON.parse(
    execFileSync(
      process.env.PYTHON || "python",
      [
        "-c",
        `
import json
from spaday import element
print(json.dumps(element("section").ready(True).to_node()["readiness"]))
`,
      ],
      { cwd: "..", encoding: "utf8" },
    ),
  );
  const normalized = await page.evaluate(async () => {
    const { validateReadiness } = await import("/dist/esm/index.js");
    const readiness = { when: { expr: "lit", value: true } };
    window.states = [];
    document.addEventListener("spaday:readiness", (event) =>
      window.states.push(event.detail),
    );
    window.__spaday.mount(document.body, { tag: "section", readiness });
    return validateReadiness(readiness);
  });
  expect(normalized).toEqual(expected);
  await expect
    .poll(() => page.evaluate(() => window.states))
    .toEqual([
      { status: "loading", error: null },
      { status: "ready", error: null },
    ]);
});

test("Python ready and prop expressions react with optional readiness results", async ({
  page,
}) => {
  const tree = JSON.parse(
    execFileSync(
      process.env.PYTHON || "python",
      [
        "-c",
        `
from spaday import Button, element, field, not_
from spaday.ui import resolve, NATIVE
import json
view = element("section", Button(label="Save").prop("disabled", not_(field("loaded")))).ready(field("loaded"))
print(json.dumps(resolve(view.to_node(), NATIVE)))
`,
      ],
      { cwd: "..", encoding: "utf8" },
    ),
  );
  await page.evaluate((tree) => {
    const { mount, Store } = window.__spaday;
    window.store = new Store({ loaded: false });
    window.states = [];
    document.addEventListener("spaday:readiness", (event) =>
      window.states.push(event.detail),
    );
    window.root = mount(document.body, tree, window.store);
  }, tree);
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await expect
    .poll(() => page.evaluate(() => window.states.at(-1).status))
    .toBe("loading");
  await page.evaluate(() => window.store.set("loaded", true));
  await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  await expect
    .poll(() => page.evaluate(() => window.states.at(-1).status))
    .toBe("ready");
  await page.evaluate(() => window.store.set("loaded", false));
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  await expect
    .poll(() => page.evaluate(() => window.states.at(-1).status))
    .toBe("loading");
});
