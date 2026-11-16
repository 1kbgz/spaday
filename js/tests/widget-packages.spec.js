import { test, expect } from "@playwright/test";
import { widgetKernel } from "./widget-kernel";

for (const late of [false, true]) {
  test(`loads WebAwesome from Python comm buffers once for five offline widgets (${late ? "late" : "initial"})`, async ({
    page,
  }) => {
    const kernel = await widgetKernel(
      "../spaday/tests/widget_packages_bridge.py",
      late ? ["--late"] : [],
    );
    try {
      const { result } = await kernel.call({ op: "describe" });
      await page.exposeFunction("kernelMessage", (content) =>
        kernel.call({ op: "receive", content }),
      );
      await page.goto("/tests/widget.html");
      await page.waitForFunction(() => window.__widget);
      await page.context().setOffline(true);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const requests = [];
      page.on("request", (request) => {
        if (/^https?:/.test(request.url())) requests.push(request.url());
      });
      await page.evaluate(async (description) => {
        const { widget, fakeModel } = window.__widget;
        window.assetRequests = 0;
        window.packageEvents = [];
        window.models = [];
        const displays = [];
        for (let i = 0; i < 5; i++) {
          const model = fakeModel({ ...description });
          models.push(model);
          model.send = async (content) => {
            if (content.type === "spaday:assets") assetRequests++;
            if (content.type === "spaday:packages") packageEvents.push(content);
            const response = await window.kernelMessage(content);
            for (const { content: reply, buffers } of response.messages)
              model._emit(
                "msg:custom",
                reply,
                buffers.map((b) =>
                  Uint8Array.from(atob(b), (c) => c.charCodeAt(0)),
                ),
              );
          };
          const el = document.createElement("div");
          document.body.append(el);
          displays.push(widget.render({ model, el }));
        }
        window.displays = await Promise.all(displays);
      }, result);
      if (late) {
        await expect(page.locator("wa-input")).toHaveCount(0);
        const { result: addition } = await kernel.call({ op: "add" });
        await page.evaluate((addition) => {
          for (const model of models) {
            model.set("_packages", addition._packages);
            model.set("_tree", addition._tree);
          }
        }, addition);
      }
      await page.waitForFunction(
        () => packageEvents.filter((e) => e.status === "ready").length === 5,
      );
      expect(await page.evaluate(() => assetRequests)).toBe(1);
      await expect(page.locator("wa-input input")).toHaveCount(5);
      for (const input of await page.locator("wa-input input").all())
        await expect(input).toHaveValue("Ada");
      expect(await page.locator("link[data-spaday-package]").count()).toBe(1);
      expect(errors).toEqual([]);
      expect(requests).toEqual([]);
      await page.evaluate(() => displays.forEach((dispose) => dispose()));
    } finally {
      await kernel.call({ op: "close" });
      kernel.close();
    }
  });
}

test("loads cyclic modules, computed imports, and relative stylesheet assets offline", async ({
  page,
}) => {
  await page.goto("/tests/widget.html");
  await page.waitForFunction(() => window.__widget);
  await page.context().setOffline(true);
  const result = await page.evaluate(async () => {
    const sources = {
      "index.js": `import { read } from './a.js'; export const initial = read(); const path = './lazy.js'; const lazy = await import(path); globalThis.packageProbe = {initial, lazy: lazy.value, asset: import.meta.resolve('./dot.svg')}; customElements.define('package-probe', class extends HTMLElement {});`,
      "a.js": `import { b } from './b.js'; export function read() { return b; } export const a = 1;`,
      "b.js": `import { a } from './a.js'; export const b = 2; export function readA() { return a; }`,
      "lazy.js": `export const value = 3;`,
      "style.css": `@import './nested/theme.css'; package-probe { --picture: url('./dot.svg'); background-image: var(--picture); }`,
      "nested/theme.css": `package-probe { display: block; width: 19px; height: 21px; }`,
      "dot.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`,
    };
    const files = [];
    const chunks = [];
    let offset = 0;
    for (const [path, source] of Object.entries(sources)) {
      const bytes = new TextEncoder().encode(source);
      chunks.push(...bytes);
      files.push({
        path,
        offset,
        length: bytes.length,
        type: path.endsWith(".js")
          ? "text/javascript"
          : path.endsWith(".css")
            ? "text/css"
            : "image/svg+xml",
      });
      offset += bytes.length;
    }
    const spec = {
      name: "probe",
      id: "probe1",
      tags: ["package-probe"],
      imports: [["probe", "a.js"]],
      provides: [],
      assets: [
        ["css", "style.css"],
        ["js", "index.js"],
      ],
    };
    const model = __widget.fakeModel({
      _tree: { tag: "package-probe" },
      _packages: [spec],
    });
    model.send = (content) =>
      content.type === "spaday:assets" &&
      queueMicrotask(() =>
        model._emit(
          "msg:custom",
          { type: "spaday:assets", request: content.request, files },
          [new Uint8Array(chunks)],
        ),
      );
    const host = document.createElement("div");
    document.body.append(host);
    await __widget.widget.render({ model, el: host });
    const laterSource = new TextEncoder().encode(
      `import {read} from 'probe'; globalThis.laterProbe = read();`,
    );
    const later = __widget.fakeModel({
      _tree: { tag: "div" },
      _packages: [
        {
          name: "later",
          id: "later1",
          tags: [],
          imports: [],
          provides: [],
          assets: [["js", "index.js"]],
        },
      ],
    });
    later.send = (content) =>
      content.type === "spaday:assets" &&
      queueMicrotask(() =>
        later._emit(
          "msg:custom",
          {
            type: "spaday:assets",
            request: content.request,
            files: [
              {
                path: "index.js",
                offset: 0,
                length: laterSource.length,
                type: "text/javascript",
              },
            ],
          },
          [laterSource],
        ),
      );
    await __widget.widget.render({
      model: later,
      el: document.createElement("div"),
    });
    const image = await fetch(packageProbe.asset);
    return {
      ...packageProbe,
      image: await image.text(),
      width: getComputedStyle(host.firstElementChild).width,
      background: getComputedStyle(host.firstElementChild).backgroundImage,
      later: laterProbe,
    };
  });
  expect(result.initial).toBe(2);
  expect(result.lazy).toBe(3);
  expect(result.image).toContain("<svg");
  expect(result.width).toBe("19px");
  expect(result.background).toMatch(/^url\("blob:/);
  expect(result.later).toBe(2);
});

test("rejects changed packages and conflicting versions before registering elements", async ({
  page,
}) => {
  await page.goto("/tests/widget.html");
  await page.waitForFunction(() => window.__widget);
  const errors = await page.evaluate(async () => {
    const load = async (name, id, version) => {
      const spec = {
        name,
        id,
        provides: [["test-library", version]],
        imports: [],
        tags: [],
        assets: [],
      };
      const model = __widget.fakeModel({
        _tree: { tag: "div" },
        _packages: [spec],
      });
      model.send = (c) =>
        c.type === "spaday:assets" &&
        queueMicrotask(() =>
          model._emit(
            "msg:custom",
            { type: "spaday:assets", request: c.request, files: [] },
            [new Uint8Array()],
          ),
        );
      try {
        await __widget.widget.render({
          model,
          el: document.createElement("div"),
        });
        return null;
      } catch (error) {
        return error.message;
      }
    };
    return [
      await load("first", "one", "1.0.0"),
      await load("first", "two", "1.0.0"),
      await load("second", "three", "2.0.0"),
    ];
  });
  expect(errors[0]).toBeNull();
  expect(errors[1]).toContain("changed after loading");
  expect(errors[2]).toContain("conflicting versions");
});

async function packageHarness(page) {
  await page.goto("/tests/widget.html");
  await page.waitForFunction(() => window.__widget);
  await page.context().setOffline(true);
  await page.evaluate(() => {
    window.packageModel = (spec, sources) => {
      const files = [];
      const chunks = [];
      for (const [path, source] of Object.entries(sources)) {
        const bytes = new TextEncoder().encode(source);
        files.push({
          path,
          offset: chunks.length,
          length: bytes.length,
          type: path.endsWith(".js")
            ? "text/javascript"
            : path.endsWith(".css")
              ? "text/css"
              : "image/svg+xml",
        });
        chunks.push(...bytes);
      }
      const model = __widget.fakeModel({
        _tree: { tag: "div" },
        _packages: [{ tags: [], imports: [], provides: [], ...spec }],
      });
      model.send = (content) =>
        content.type === "spaday:assets" &&
        queueMicrotask(() =>
          model._emit(
            "msg:custom",
            {
              type: "spaday:assets",
              request: content.request,
              files,
            },
            [new Uint8Array(chunks)],
          ),
        );
      return model;
    };
    window.loadPackage = (model) =>
      __widget.widget.render({ model, el: document.createElement("div") });
    window.dynamicWidget = async () => {
      const model = __widget.fakeModel({
        _tree: { tag: "div", props: { textContent: { Str: "Original" } } },
        _packages: [],
      });
      const requests = [];
      const statuses = [];
      const replies = new Map();
      model.send = (content) => {
        if (content.type === "spaday:assets") requests.push(content);
        if (content.type === "spaday:packages") statuses.push(content);
      };
      const host = document.createElement("div");
      document.body.append(host);
      const dispose = await __widget.widget.render({ model, el: host });
      return {
        model,
        host,
        dispose,
        requests,
        statuses,
        add(name, source, options = {}) {
          const assetModel = packageModel(
            { name, id: name, assets: [["js", "index.js"]], ...options },
            { "index.js": source },
          );
          assetModel._emit = (...args) => model._emit(...args);
          const [spec] = assetModel.get("_packages");
          replies.set(spec.id, assetModel.send);
          model.set("_packages", [...model.get("_packages"), spec]);
        },
        reply(index = 0, error) {
          const request = requests[index];
          if (error) model._emit("msg:custom", { ...request, error });
          else replies.get(request.package)(request);
        },
      };
    };
  });
}

test("late packages gate all views and coalesce overlapping tree updates", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    window.secondHost = document.createElement("div");
    document.body.append(secondHost);
    window.secondDispose = await __widget.widget.render({
      model: late.model,
      el: secondHost,
    });
    late.add(
      "first",
      "globalThis.firstExecutions = (globalThis.firstExecutions ?? 0) + 1;",
    );
    late.model.set("_tree", {
      tag: "late-probe",
      props: { value: { Str: "Intermediate" } },
    });
  });
  await page.waitForFunction(() => late.requests.length === 1);
  await expect(page.locator("late-probe")).toHaveCount(0);
  await page.evaluate(() => {
    late.add(
      "second",
      `customElements.define('late-probe', class extends HTMLElement {
      set value(value) { this.textContent = value; }
    });`,
    );
    late.model.set("_tree", {
      tag: "late-probe",
      props: { value: { Str: "Latest" } },
    });
    late.reply();
  });
  await page.waitForFunction(() => late.requests.length === 2);
  await expect(page.locator("late-probe")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      late.statuses.filter((s) => s.status === "ready"),
    ),
  ).toEqual([]);
  await page.evaluate(() => late.reply(1));
  await expect(page.locator("late-probe")).toHaveText(["Latest", "Latest"]);
  await page.waitForFunction(
    () => late.statuses.filter((s) => s.status === "ready").length === 2,
  );
  const result = await page.evaluate(async () => {
    const ready = late.statuses.filter((s) => s.status === "ready");
    const other = __widget.fakeModel({
      _tree: { tag: "late-probe", props: { value: { Str: "Other widget" } } },
      _packages: late.model.get("_packages"),
    });
    const host = document.createElement("div");
    const dispose = await __widget.widget.render({ model: other, el: host });
    const result = {
      ready,
      executions: firstExecutions,
      requests: other._sent.filter((c) => c.type === "spaday:assets"),
      text: host.textContent,
    };
    // Duplicate descriptors must reuse the page registry without executing or transferring again.
    late.model.set("_packages", [...late.model.get("_packages")]);
    dispose();
    return result;
  });
  expect(new Set(result.ready.map((s) => s.view)).size).toBe(2);
  expect(result.ready.map((s) => s.packages)).toEqual([
    ["first", "second"],
    ["first", "second"],
  ]);
  expect(result.executions).toBe(1);
  expect(result.requests).toEqual([]);
  expect(result.text).toBe("Other widget");
  await page.waitForFunction(
    () => late.statuses.filter((s) => s.status === "ready").length === 4,
  );
  expect(await page.evaluate(() => late.requests.length)).toBe(2);
  await page.evaluate(() => {
    late.dispose();
    secondDispose();
  });
});

test("late transfer failures keep the old tree and retry explicitly", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    late.add(
      "retry",
      "globalThis.retryExecutions = (globalThis.retryExecutions ?? 0) + 1;",
    );
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "Updated" } },
    });
  });
  await page.waitForFunction(() => late.requests.length === 1);
  await page.evaluate(() => late.reply(0, "Transfer interrupted"));
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "error");
  expect(
    await page.evaluate(() => ({
      text: late.host.textContent,
      error: late.statuses.at(-1).error,
    })),
  ).toEqual({ text: "Original", error: "Error: Transfer interrupted" });
  await page.evaluate(() => {
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "Latest" } },
    });
    late.model._emit("msg:custom", { type: "spaday:packages:retry" });
  });
  await page.waitForFunction(() => late.requests.length === 2);
  expect(await page.evaluate(() => late.host.textContent)).toBe("Original");
  await page.evaluate(() => late.reply(1));
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "ready");
  expect(
    await page.evaluate(() => [late.host.textContent, retryExecutions]),
  ).toEqual(["Latest", 1]);
  await page.evaluate(() => late.dispose());
});

test("a combined trait update cannot mount the tree before its package change event", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.batchedState = { _tree: { tag: "div" }, _packages: [] };
    window.batchedModel = __widget.fakeModel(batchedState);
    window.batchedHost = document.createElement("div");
    window.batchedDispose = await __widget.widget.render({
      model: batchedModel,
      el: batchedHost,
    });
    const assets = packageModel(
      { name: "batched", id: "batched", assets: [["js", "index.js"]] },
      {
        "index.js":
          "customElements.define('batched-probe', class extends HTMLElement { set value(value) { this.textContent = value; } });",
      },
    );
    assets._emit = (...args) => batchedModel._emit(...args);
    batchedModel.send = assets.send;
    // Backbone updates attributes together, then emits individual change events.
    batchedState._packages = assets.get("_packages");
    batchedState._tree = {
      tag: "batched-probe",
      props: { value: { Str: "Ready" } },
    };
    batchedModel._emit("change:_tree");
  });
  expect(
    await page.evaluate(
      () => batchedHost.querySelector("batched-probe") !== null,
    ),
  ).toBe(false);
  await page.evaluate(() => batchedModel._emit("change:_packages"));
  await page.waitForFunction(() => batchedHost.textContent === "Ready");
  await page.evaluate(() => batchedDispose());
});

test("execution failures require reload and do not reexecute on retry", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    late.add(
      "broken",
      "globalThis.brokenExecutions = (globalThis.brokenExecutions ?? 0) + 1; throw new Error('Broken module');",
    );
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "Updated" } },
    });
  });
  await page.waitForFunction(() => late.requests.length === 1);
  await page.evaluate(() => late.reply());
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "error");
  expect(await page.evaluate(() => late.statuses.at(-1).error)).toContain(
    "reload the document: Broken module",
  );
  await page.evaluate(() =>
    late.model._emit("msg:custom", { type: "spaday:packages:retry" }),
  );
  await page.waitForFunction(
    () => late.statuses.filter((s) => s.status === "error").length === 2,
  );
  expect(
    await page.evaluate(() => [
      late.requests.length,
      brokenExecutions,
      late.host.textContent,
    ]),
  ).toEqual([1, 1, "Original"]);
  await page.evaluate(() => late.dispose());
});

test("a later dependency can recover a preparation failure", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    late.add(
      "consumer",
      'import { value } from "library"; globalThis.importedValue = value;',
    );
  });
  await page.waitForFunction(() => late.requests.length === 1);
  await page.evaluate(() => late.reply());
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "error");
  expect(await page.evaluate(() => late.statuses.at(-1).error)).toContain(
    "no import mapping for library",
  );
  await page.evaluate(() =>
    late.add("provider", "export const value = 42;", {
      imports: [["library", "index.js"]],
    }),
  );
  await page.waitForFunction(() => late.requests.length === 2);
  await page.evaluate(() => late.reply(1));
  await page.waitForFunction(() => late.requests.length === 3);
  await page.evaluate(() => late.reply(2));
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "ready");
  expect(await page.evaluate(() => importedValue)).toBe(42);
  await page.evaluate(() => late.dispose());
});

test("a late package conflict reports an error before transfer or tree changes", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    const selected = packageModel(
      {
        name: "selected",
        id: "selected",
        assets: [],
        provides: [["library", "1.0.0"]],
      },
      {},
    );
    await loadPackage(selected);
    window.late = await dynamicWidget();
    late.add("conflict", "throw new Error('Must not execute');", {
      provides: [["library", "2.0.0"]],
    });
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "Updated" } },
    });
  });
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "error");
  expect(await page.evaluate(() => late.statuses.at(-1).error)).toContain(
    "conflicting versions",
  );
  expect(
    await page.evaluate(() => [late.requests.length, late.host.textContent]),
  ).toEqual([0, "Original"]);
  await page.evaluate(() => late.dispose());
});

test("destroy during initial loading rejects render and ignores a late reply", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    late.dispose();
    late.add("destroyed", "globalThis.destroyedExecuted = true;");
    window.renderResult = __widget.widget
      .render({ model: late.model, el: late.host })
      .catch((error) => error.message);
  });
  await page.waitForFunction(() => late.requests.length === 1);
  expect(
    await page.evaluate(async () => {
      late.model._emit("destroy");
      late.reply();
      return await renderResult;
    }),
  ).toContain("Widget closed");
  expect(
    await page.evaluate(() => [
      late.host.childElementCount,
      globalThis.destroyedExecuted ?? false,
      late.statuses.map((s) => s.status),
    ]),
  ).toEqual([0, false, ["loading"]]);
});

test("disposing a loading view cancels its transfer and lets another view load", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    window.secondHost = document.createElement("div");
    window.secondDispose = await __widget.widget.render({
      model: late.model,
      el: secondHost,
    });
    late.add(
      "disposal",
      "globalThis.disposalExecutions = (globalThis.disposalExecutions ?? 0) + 1;",
    );
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "Updated" } },
    });
  });
  await page.waitForFunction(() => late.requests.length === 1);
  await page.evaluate(() => late.dispose());
  await page.waitForFunction(() => late.requests.length === 2);
  await page.evaluate(() => {
    late.reply();
    late.reply(1);
  });
  await page.waitForFunction(() => late.statuses.at(-1)?.status === "ready");
  expect(
    await page.evaluate(() => [
      late.host.childElementCount,
      secondHost.textContent,
      disposalExecutions,
      late.statuses.filter((s) => s.status === "ready").length,
    ]),
  ).toEqual([0, "Updated", 1, 1]);
  await page.evaluate(() => {
    late.model._emit("destroy");
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "After close" } },
    });
  });
  expect(await page.evaluate(() => secondHost.childElementCount)).toBe(0);
});

test("initial render waits for packages added during its first transfer", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    window.late = await dynamicWidget();
    late.dispose();
    late.add("initial", "globalThis.initialExecuted = true;");
    window.initialRender = __widget.widget.render({
      model: late.model,
      el: late.host,
    });
  });
  await page.waitForFunction(() => late.requests.length === 1);
  await page.evaluate(() => {
    late.add("during-initial", "globalThis.secondExecuted = true;");
    late.model.set("_tree", {
      tag: "div",
      props: { textContent: { Str: "Latest" } },
    });
    late.reply();
  });
  await page.waitForFunction(() => late.requests.length === 2);
  expect(await page.evaluate(() => late.host.childElementCount)).toBe(0);
  await page.evaluate(() => late.reply(1));
  expect(
    await page.evaluate(async () => {
      const dispose = await initialRender;
      const result = [
        late.host.textContent,
        initialExecuted,
        secondExecuted,
        late.statuses.at(-1).status,
      ];
      dispose();
      return result;
    }),
  ).toEqual(["Latest", true, true, "ready"]);
});

test("resolves CSS asset queries and preserves SVG fragments", async ({
  page,
}) => {
  await packageHarness(page);
  const result = await page.evaluate(async () => {
    const model = packageModel(
      { name: "css-suffix", id: "css-suffix", assets: [["css", "style.css"]] },
      {
        "style.css":
          '@import "./nested.css?v=2"; .icon { filter: url("./icons.svg#glow"); background-image: url("./icons.svg?v=2"); } @font-face {font-family: test; src: url("./font.woff2?v=2")}',
        "nested.css": ".icon { color: red; }",
        "icons.svg":
          '<svg xmlns="http://www.w3.org/2000/svg"><filter id="glow"/></svg>',
        "font.woff2": "font",
      },
    );
    const dispose = await loadPackage(model);
    const link = document.querySelector(
      'link[data-spaday-package="css-suffix"]',
    );
    const css = await (await fetch(link.href)).text();
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) =>
      match[1].replaceAll('"', ""),
    );
    const bodies = await Promise.all(
      urls.map(async (url) => (await fetch(url)).text()),
    );
    dispose();
    return { css, urls, bodies };
  });
  expect(result.urls).toHaveLength(3);
  expect(result.urls[0]).toMatch(/^blob:.*#glow$/);
  expect(result.bodies[0]).toContain('<filter id="glow"');
  expect(result.bodies[1]).toContain("<svg");
  expect(result.bodies[2]).toBe("font");
  expect(result.css).not.toContain("?v=2");
});

test("prepares only reachable modules and defers optional dependencies until imported", async ({
  page,
}) => {
  await packageHarness(page);
  await page.evaluate(async () => {
    const model = packageModel(
      { name: "lazy", id: "lazy", assets: [["js", "index.js"]] },
      {
        "index.js":
          "globalThis.loadOptional = path => import(path); globalThis.metaResolve = path => import.meta.resolve(path);",
        "optional.js": 'import "missing-library";',
        "unused.css":
          '.unused { background: url("https://example.com/missing.png") }',
        "child.js":
          'import { value } from "./cycle.js"; export const answer = value; export function read() { return value; }',
        "cycle.js":
          'import { read } from "./child.js"; export const value = 42; export const check = () => read();',
      },
    );
    window.disposeLazy = await loadPackage(model);
  });
  expect(
    await page.evaluate(
      async () =>
        (await loadOptional(new URL(metaResolve("./child.js")))).answer,
    ),
  ).toBe(42);
  expect(
    await page.evaluate(() =>
      loadOptional("./optional.js").catch((error) => error.message),
    ),
  ).toContain("no import mapping for missing-library");
  // A failed optional graph must not invalidate a graph already loaded successfully.
  expect(
    await page.evaluate(async () => (await loadOptional("./child.js")).answer),
  ).toBe(42);
  await page.evaluate(() => disposeLazy());
});

for (const firstVersion of [undefined, "2.0.0"]) {
  test(`requires both import owners to declare matching versions (${firstVersion ?? "unversioned"})`, async ({
    page,
  }) => {
    await packageHarness(page);
    const result = await page.evaluate(async (firstVersion) => {
      const first = packageModel(
        {
          name: "first",
          id: "first",
          imports: [["shared", "lib.js"]],
          provides: firstVersion ? [["shared", firstVersion]] : [],
          assets: [],
        },
        {
          "lib.js": `export const version = ${JSON.stringify(firstVersion ?? "1.0.0")};`,
        },
      );
      await loadPackage(first);
      const second = packageModel(
        {
          name: "second",
          id: "second",
          imports: [["shared", "lib.js"]],
          provides: [["shared", "2.0.0"]],
          assets: [["js", "index.js"]],
        },
        {
          "lib.js": 'export const version = "2.0.0";',
          "index.js":
            'import {version} from "shared"; globalThis.selectedVersion = version;',
        },
      );
      try {
        await loadPackage(second);
        return { version: selectedVersion };
      } catch (error) {
        return { error: error.message };
      }
    }, firstVersion);
    if (firstVersion) expect(result).toEqual({ version: "2.0.0" });
    else expect(result.error).toContain("conflicting imports for shared");
  });
}
