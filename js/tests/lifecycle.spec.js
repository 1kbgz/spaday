import { execFileSync } from "node:child_process";
import { test, expect } from "@playwright/test";

function markup(options = {}) {
  return execFileSync(
    process.env.PYTHON || "python",
    [
      "-c",
      `
import json, sys
from spaday import Lifecycle, element
from spaday.bootstrap import bootstrap
options = json.loads(sys.argv[1])
enabled = options.pop("lifecycle", True)
lifecycle = Lifecycle(elements=options.pop("elements", []), timeout=options.pop("timeout", 10000)) if enabled else None
tree = options.pop("tree", "inline")
print(bootstrap(tree=tree, page=element("spa-column", element("optional-unknown")), store={"draft": "saved"}, nonce="test", layout="source", lifecycle=lifecycle, **options))
`,
      JSON.stringify(options),
    ],
    { cwd: "..", encoding: "utf8" },
  );
}

async function serve(page, html, failure) {
  await page.addInitScript(() => {
    window.lifecycleEvents = [];
    window.violations = [];
    for (const state of ["mounted", "ready", "error"])
      document.addEventListener(`spaday:${state}`, (event) => {
        window.lifecycleEvents.push({
          state,
          root: event.detail.root?.localName,
          error: event.detail.error?.message,
        });
        window.rootDetail = event.detail;
      });
    document.addEventListener("securitypolicyviolation", (event) =>
      window.violations.push(event.violatedDirective),
    );
  });
  await page.route("**/js/dist/**", async (route) => {
    if (failure === "wasm" && route.request().url().endsWith(".wasm"))
      return route.abort();
    const response = await route.fetch({
      url: route.request().url().replace("/js/dist/", "/dist/"),
    });
    await route.fulfill({ response });
  });
  await page.route("**/lifecycle-page", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: html,
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; script-src 'nonce-test' 'strict-dynamic' 'wasm-unsafe-eval'; style-src 'nonce-test'; connect-src 'self'",
      },
    }),
  );
  await page.goto("/lifecycle-page", { waitUntil: "domcontentloaded" });
}

for (const tree of ["inline", "json"]) {
  test(`bootstrap reports mounted and ready with strict CSP (${tree})`, async ({
    page,
  }) => {
    await page.route("**/tree.json", (route) =>
      route.fulfill({
        json: {
          tag: "spa-column",
          slots: { default: [{ tag: "optional-unknown" }] },
        },
      }),
    );
    await serve(page, markup({ tree }));
    await expect
      .poll(() =>
        page.evaluate(() => window.lifecycleEvents.map((event) => event.state)),
      )
      .toEqual(["mounted", "ready"]);
    expect(await page.evaluate(() => window.violations)).toEqual([]);
    expect(await page.evaluate(() => window.rootDetail.root.inert)).toBe(false);
    await page.evaluate(() => {
      window.rootDetail.dispose();
      window.rootDetail.dispose();
    });
    await expect(page.locator("spa-column")).toHaveCount(0);
  });
}

for (const failure of ["target", "component", "module", "wasm", "css"]) {
  test(`bootstrap reports ${failure} failure without hiding host fallback`, async ({
    page,
  }) => {
    const options = { head: '<p id="fallback">Unavailable</p>', timeout: 300 };
    if (failure === "target") options.target = "#missing";
    if (failure === "component") options.elements = ["required-missing"];
    if (failure === "module") options.scripts = ["/missing.js"];
    if (failure === "css") options.stylesheets = ["/missing.css"];
    await serve(page, markup(options), failure);
    await expect
      .poll(() => page.evaluate(() => window.lifecycleEvents.at(-1)?.state))
      .toBe("error");
    await expect(page.locator("#fallback")).toBeVisible();
    await expect(page.locator("spa-column")).toHaveCount(0);
    expect(
      await page.evaluate(() =>
        window.lifecycleEvents.some((event) => event.state === "ready"),
      ),
    ).toBe(false);
    expect(await page.evaluate(() => window.violations)).toEqual([]);
  });
}

test("root controllers initialize once, dispose on replacement, and unregister refresh", async ({
  page,
}) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
  const result = await page.evaluate(async () => {
    const {
      mount,
      applyPatch,
      unmount,
      attachController,
      trackRoot,
      refreshRoots,
    } = await import("/dist/esm/index.js");
    let setups = 0,
      cleanups = 0,
      calls = 0;
    const setup = () => {
      setups++;
      const handler = () => calls++;
      document.addEventListener("probe", handler);
      return () => {
        cleanups++;
        document.removeEventListener("probe", handler);
      };
    };
    const a = mount(document.body, { tag: "div" });
    const b = mount(document.body, { tag: "div" });
    const first = attachController(a, "editor", setup);
    const same = first === attachController(a, "editor", setup);
    attachController(b, "editor", setup);
    document.dispatchEvent(new Event("probe"));
    const next = applyPatch(a, {
      ops: [{ Replace: { path: [], node: { tag: "section" } } }],
    });
    document.dispatchEvent(new Event("probe"));
    attachController(next, "editor", setup);
    trackRoot(next, { tag: "section" }, "/must-not-fetch");
    unmount(next);
    unmount(b);
    unmount(b);
    await refreshRoots();
    document.dispatchEvent(new Event("probe"));
    return { same, setups, cleanups, calls };
  });
  expect(result).toEqual({ same: true, setups: 3, cleanups: 3, calls: 3 });
});

test("delayed required CSS blocks readiness and is released with its root", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route("**/delayed.css", async (route) => {
    requested = true;
    await gate;
    await route.fulfill({
      contentType: "text/css",
      body: "spa-column { color: rgb(1, 2, 3); }",
    });
  });
  await serve(page, markup({ stylesheets: ["/delayed.css"] }));
  await expect.poll(() => requested).toBe(true);
  expect(await page.evaluate(() => window.lifecycleEvents)).toEqual([]);
  release();
  await expect
    .poll(() =>
      page.evaluate(() => window.lifecycleEvents.map((event) => event.state)),
    )
    .toEqual(["mounted", "ready"]);
  await expect(page.locator("spa-column")).toHaveCSS("color", "rgb(1, 2, 3)");
  expect(await page.evaluate(() => window.violations)).toEqual([]);
  await page.evaluate(() => window.rootDetail.dispose());
  await expect(page.locator('link[href="/delayed.css"]')).toHaveCount(0);
});

test("readiness cancels on disposal and tracked roots survive repeated replacements", async ({
  page,
}) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
  const result = await page.evaluate(async () => {
    const { mount, trackRoot, refreshRoots, unmount, whenReady } =
      await import("/dist/esm/index.js");
    const initial = { tag: "div" };
    const root = mount(document.body, initial);
    const readiness = whenReady(root, ["never-defined"], 10000).catch(
      (error) => error.message,
    );
    trackRoot(root, initial, "/replacement");
    trackRoot(root, initial, "/replacement");
    let count = 0;
    window.fetch = async () =>
      new Response(
        JSON.stringify({ tag: ++count === 1 ? "section" : "article" }),
      );
    await refreshRoots();
    await refreshRoots();
    const replacement = document.querySelector("article");
    const replaced = !!replacement;
    unmount(replacement);
    await refreshRoots();
    return { error: await readiness, count, replaced };
  });
  expect(result).toEqual({
    error: "spaday: root disposed before readiness",
    count: 2,
    replaced: true,
  });
});

test("bootstrap resources and current-root disposer survive replacement", async ({
  page,
}) => {
  let generation = 0;
  await page.route("**/tree.json", (route) =>
    route.fulfill({ json: { tag: ++generation === 1 ? "div" : "section" } }),
  );
  await page.route("**/theme.css", (route) =>
    route.fulfill({
      contentType: "text/css",
      body: "section { color: rgb(1, 2, 3) }",
    }),
  );
  await serve(
    page,
    markup({
      tree: "json",
      stylesheets: ["/theme.css"],
      persist: { draft: "lifecycle-draft" },
      url: { draft: "draft" },
    }),
  );
  await page.waitForFunction(
    () => window.lifecycleEvents.at(-1)?.state === "ready",
  );
  await page.evaluate(async () => {
    window.firstDetail = window.rootDetail;
  });
  await page.evaluate(async () =>
    (await import("/js/dist/esm/index.js")).refreshRoots(),
  );
  await expect
    .poll(() => page.evaluate(() => window.lifecycleEvents.map((x) => x.state)))
    .toEqual(["mounted", "ready", "mounted", "ready"]);
  await expect(page.locator("section")).toHaveCSS("color", "rgb(1, 2, 3)");
  expect(
    await page.evaluate(
      () => window.firstDetail.root === document.querySelector("section"),
    ),
  ).toBe(true);
  await page.evaluate(() => window.firstDetail.store.set("draft", "retained"));
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("lifecycle-draft")),
    ),
  ).toBe("retained");
  expect(
    await page.evaluate(() => new URL(location.href).searchParams.get("draft")),
  ).toBe("retained");
  await page.evaluate(() => window.firstDetail.dispose());
  await expect(page.locator("section")).toHaveCount(0);
  await expect(page.locator('link[href="/theme.css"]')).toHaveCount(0);
});

for (const fragment of [false, true])
  test(`lifecycle preserves CSS precedence and nonce hiding (fragment=${fragment})`, async ({
    page,
  }) => {
    await page.route("**/theme.css", (route) =>
      route.fulfill({
        contentType: "text/css",
        body: "spa-column { color: rgb(1, 2, 3) }",
      }),
    );
    for (const lifecycle of [false, true]) {
      const html = markup({
        fragment,
        lifecycle,
        stylesheets: ["/theme.css"],
        styles: ["spa-column { color: rgb(9, 8, 7) }"],
      });
      await serve(
        page,
        fragment ? `<!doctype html><html><body>${html}</body></html>` : html,
      );
      await expect(page.locator("spa-column")).toHaveCSS(
        "color",
        "rgb(9, 8, 7)",
      );
      expect(await page.locator("meta[content=test]").count()).toBe(0);
      expect(
        await page
          .locator("script[nonce]")
          .first()
          .evaluate((el) => ({
            hidden: el.getAttribute("nonce"),
            nonce: el.nonce,
          })),
      ).toEqual({ hidden: "", nonce: "test" });
      expect(await page.evaluate(() => window.violations)).toEqual([]);
    }
  });

test("disposing from mounted is silent and cannot resurrect a root", async ({
  page,
}) => {
  await page.addInitScript(() =>
    document.addEventListener("spaday:mounted", (event) =>
      event.detail.dispose(),
    ),
  );
  await serve(page, markup());
  await expect
    .poll(() => page.evaluate(() => window.lifecycleEvents.length))
    .toBe(1);
  await page.evaluate(async () => {
    await (await import("/js/dist/esm/index.js")).refreshRoots();
  });
  expect(
    await page.evaluate(() => window.lifecycleEvents.map((x) => x.state)),
  ).toEqual(["mounted"]);
  await expect(page.locator("spa-column")).toHaveCount(0);
});

test("worker snapshots and disposal release element controllers", async ({
  page,
}) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
  expect(
    await page.evaluate(async () => {
      const { connectWorker, attachController } =
        await import("/dist/esm/index.js");
      class WorkerStub extends EventTarget {
        postMessage() {}
      }
      const worker = new WorkerStub();
      const container = document.createElement("div");
      document.body.append(container);
      const link = connectWorker(container, worker);
      let disposed = 0;
      for (let i = 0; i < 2; i++) {
        worker.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "snapshot", tree: { tag: "div" } },
          }),
        );
        attachController(
          container.firstElementChild,
          "probe",
          () => () => disposed++,
        );
      }
      await link.ready;
      link.dispose();
      link.dispose();
      return disposed;
    }),
  ).toBe(2);
});

test("two fragments retain independent roots and owned styles", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.fragments = {};
    document.addEventListener(
      "spaday:ready",
      (event) => (window.fragments[event.detail.target] = event.detail),
    );
  });
  await page.route("**/fragment-*.css", (route) =>
    route.fulfill({
      contentType: "text/css",
      body: "spa-column { display: block }",
    }),
  );
  const html =
    '<!doctype html><html><body><div id="a"></div><div id="b"></div>' +
    markup({ fragment: true, target: "#a", stylesheets: ["/fragment-a.css"] }) +
    markup({ fragment: true, target: "#b", stylesheets: ["/fragment-b.css"] }) +
    "</body></html>";
  await serve(page, html);
  await expect
    .poll(() => page.evaluate(() => Object.keys(window.fragments).length))
    .toBe(2);
  await page.evaluate(() => window.fragments["#a"].dispose());
  await expect(page.locator("#a spa-column")).toHaveCount(0);
  await expect(page.locator("#b spa-column")).toHaveCount(1);
  await expect(page.locator('link[href="/fragment-a.css"]')).toHaveCount(0);
  await expect(page.locator('link[href="/fragment-b.css"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.violations)).toEqual([]);
});

test("reused fragment markup owns separate stylesheet anchors", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.fragments = [];
    document.addEventListener("spaday:ready", (event) =>
      window.fragments.push(event.detail),
    );
  });
  await page.route("**/shared.css", (route) =>
    route.fulfill({
      contentType: "text/css",
      body: "spa-column { display: block }",
    }),
  );
  const fragment = markup({
    fragment: true,
    target: "#host",
    stylesheets: ["/shared.css"],
  });
  await serve(
    page,
    `<!doctype html><html><body><div id="host"></div>${fragment}${fragment}</body></html>`,
  );
  await expect.poll(() => page.evaluate(() => window.fragments.length)).toBe(2);
  await expect(page.locator('link[href="/shared.css"]')).toHaveCount(2);
  await page.evaluate(() => window.fragments[0].dispose());
  await expect(page.locator("#host spa-column")).toHaveCount(1);
  await expect(page.locator('link[href="/shared.css"]')).toHaveCount(1);
  await page.evaluate(() => window.fragments[1].dispose());
  await expect(page.locator("#host spa-column")).toHaveCount(0);
  await expect(page.locator('link[href="/shared.css"]')).toHaveCount(0);
});

for (const wire of ["transports", { url: "/ws", namespace: "model" }]) {
  for (const reconnect of [false, true]) {
    test(`root replacement preserves the transports connection until explicit disposal (${typeof wire}, reconnect=${reconnect})`, async ({
      page,
    }) => {
      let generation = 0,
        opened = 0,
        closed = 0;
      let serverSocket;
      await page.route("**/js/node_modules/**", async (route) => {
        const response = await route.fetch({
          url: route
            .request()
            .url()
            .replace("/js/node_modules/", "/node_modules/"),
        });
        await route.fulfill({ response });
      });
      await page.routeWebSocket(/\/ws(?:\?|$)/, (socket) => {
        opened++;
        serverSocket = socket;
        socket.onClose(() => closed++);
      });
      await page.route("**/tree.json", (route) =>
        route.fulfill({
          json: { tag: ++generation === 1 ? "div" : "section" },
        }),
      );
      await serve(
        page,
        markup({
          tree: "json",
          ...(typeof wire === "string"
            ? { wire, reconnect }
            : { wire: { ...wire, reconnect } }),
        }),
      );
      await page.waitForFunction(
        () => window.lifecycleEvents.at(-1)?.state === "ready",
      );
      await expect.poll(() => opened).toBe(1);
      await page.evaluate(async () =>
        (await import("/js/dist/esm/index.js")).refreshRoots(),
      );
      await expect(page.locator("section")).toHaveCount(1);
      expect(closed).toBe(0);
      if (reconnect) {
        await serverSocket.close();
        await expect.poll(() => opened).toBe(2);
        await expect.poll(() => closed).toBe(1);
      }
      await page.evaluate(() => window.rootDetail.dispose());
      await expect.poll(() => closed).toBe(reconnect ? 2 : 1);
      await page.waitForTimeout(1200);
      expect(opened).toBe(reconnect ? 2 : 1);
    });
  }
}

test("replacement during mounted readies only the current root", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let replaced = false;
    document.addEventListener("spaday:mounted", async (event) => {
      if (replaced) return;
      replaced = true;
      const { applyPatch } = await import("/js/dist/esm/index.js");
      applyPatch(event.detail.root, {
        ops: [{ Replace: { path: [], node: { tag: "section" } } }],
      });
      customElements.define("required-editor", class extends HTMLElement {});
    });
  });
  await serve(page, markup({ elements: ["required-editor"] }));
  await expect
    .poll(() => page.evaluate(() => window.lifecycleEvents.at(-1)))
    .toMatchObject({ state: "ready", root: "section" });
  expect(
    await page.evaluate(() =>
      window.lifecycleEvents
        .filter((x) => x.state === "ready")
        .map((x) => x.root),
    ),
  ).toEqual(["section"]);
  await page.evaluate(() => window.rootDetail.dispose());
  await expect(page.locator("section")).toHaveCount(0);
});
