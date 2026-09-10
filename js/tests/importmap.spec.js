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
