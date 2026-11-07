import { test, expect } from "@playwright/test";
import { widgetKernel } from "./widget-kernel";

test("loads WebAwesome from Python comm buffers once for five offline widgets", async ({
  page,
}) => {
  const kernel = await widgetKernel(
    "../spaday/tests/widget_packages_bridge.py",
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
    const count = await page.evaluate(async (description) => {
      const { widget, fakeModel } = window.__widget;
      let requests = 0;
      const displays = [];
      for (let i = 0; i < 5; i++) {
        const model = fakeModel(description);
        model.send = async (content) => {
          requests++;
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
      return requests;
    }, result);
    expect(count).toBe(1);
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
