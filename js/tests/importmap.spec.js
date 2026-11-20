import { expect, test } from "@playwright/test";

/* The Python side emits the import map; these check the browser behavior that emission relies on.
 * `bootstrap` puts the map ahead of every module script — including the component packages' own —
 * because a map that arrives after the first module load is ignored, and ignored silently. */

const VENDOR = 'export const marker = "the-one-copy";';

async function serveVendor(page) {
  await page.route("**/components/demo/vendor/engine.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: VENDOR }),
  );
  // setContent keeps the current URL, and an `about:blank` page has no base for a root-relative
  // specifier to resolve against, so land on the test origin first
  await page.goto("/tests/runtime.html");
}

test("a bare specifier resolves through the emitted map", async ({ page }) => {
  await serveVendor(page);
  await page.setContent(`
    <script type="importmap">
    {"imports": {"@demo/engine": "/components/demo/vendor/engine.js"}}
    </script>
    <script type="module">
      import { marker } from "@demo/engine";
      window.resolved = marker;
    </script>
  `);
  await expect
    .poll(() => page.evaluate(() => window.resolved))
    .toBe("the-one-copy");
});

test("a trailing-slash specifier resolves a subtree", async ({ page }) => {
  await serveVendor(page);
  await page.setContent(`
    <script type="importmap">
    {"imports": {"@demo/": "/components/demo/vendor/"}}
    </script>
    <script type="module">
      import { marker } from "@demo/engine.js";
      window.resolved = marker;
    </script>
  `);
  await expect
    .poll(() => page.evaluate(() => window.resolved))
    .toBe("the-one-copy");
});

test("a map placed after a module script is ignored", async ({ page }) => {
  // this is why bootstrap emits the map first: get the order wrong and nothing reports it
  await serveVendor(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`
    <script type="module">
      import { marker } from "@demo/engine";
      window.resolved = marker;
    </script>
    <script type="importmap">
    {"imports": {"@demo/engine": "/components/demo/vendor/engine.js"}}
    </script>
  `);
  await expect.poll(() => errors.length).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.resolved)).toBeUndefined();
});

test("two libraries importing one specifier get the same module instance", async ({
  page,
}) => {
  // the point of the feature: one copy of an engine that registers global element names
  await serveVendor(page);
  await page.setContent(`
    <script type="importmap">
    {"imports": {"@demo/engine": "/components/demo/vendor/engine.js"}}
    </script>
    <script type="module">
      const a = await import("@demo/engine");
      const b = await import("/components/demo/vendor/engine.js");
      window.sameInstance = a === b;
    </script>
  `);
  await expect.poll(() => page.evaluate(() => window.sameInstance)).toBe(true);
});

test("a bundle evaluates an expression with the page's own runtime", async ({
  page,
}) => {
  await page.goto("/tests/runtime.html");
  await page.setContent(`
    <script type="importmap">
    {"imports": {"@1kbgz/spaday": "/dist/esm/index.js"}}
    </script>
    <script type="module">
      import * as runtime from "/dist/esm/index.js";
      import * as imported from "@1kbgz/spaday";
      import { evalExpr, Scope, Store } from "@1kbgz/spaday";
      const item = (path) => ({ expr: "item", path });
      const expr = {
        expr: "obj",
        fields: {
          commands: {
            expr: "cond",
            test: {
              expr: "all",
              of: [
                { expr: "eq", a: item("table"), b: { expr: "lit", value: "orders" } },
                { expr: "not", of: item("hit.row_path.0") },
              ],
            },
            then: { expr: "arr", of: [{ expr: "field", name: "command" }] },
            else: { expr: "arr", of: [] },
          },
        },
      };
      const store = new Store({ command: "open" });
      const schema = (context) => evalExpr(expr, store, new Scope(context));
      window.result = {
        sameInstance: runtime === imported,
        leaf: schema({ table: "orders", hit: { row_path: [] } }),
        group: schema({ table: "orders", hit: { row_path: ["east"] } }),
        other: schema({ table: "trades", hit: { row_path: [] } }),
        event: evalExpr({ expr: "event" }) === undefined,
      };
    </script>
  `);
  await expect
    .poll(() => page.evaluate(() => window.result))
    .toEqual({
      sameInstance: true,
      leaf: { commands: ["open"] },
      group: { commands: [] },
      other: { commands: [] },
      event: true,
    });
});
