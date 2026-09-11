import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";

/* The generic controls (spaday.ui): the runtime features their designs rely on, and the
 * conformance page rendered by the native baseline. A design-system package runs the same page
 * (`python -m spaday.ui.conformance PORT --package <name>`) against its own design.
 */

const REPO = fileURLToPath(new URL("../..", import.meta.url));

test.describe("binding features for designs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/runtime.html");
    await page.waitForFunction(() => window.__spaday);
  });

  test("a two-way binding can name the event it writes back on", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      const store = new window.__spaday.Store({ name: "" });
      const el = window.__spaday.mount(
        document.body,
        {
          tag: "input",
          bindings: {
            value: { field: "name", mode: "two-way", event: "x-changed" },
          },
        },
        store,
      );
      el.value = "typed";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      const afterInput = store.get("name");
      el.dispatchEvent(new Event("x-changed", { bubbles: true }));
      return { afterInput, afterCustom: store.get("name") };
    });
    expect(r).toEqual({ afterInput: "", afterCustom: "typed" });
  });

  test("a binding can drive an overlay by its method pair and follow its own close", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      const store = new window.__spaday.Store({ open: false });
      const el = window.__spaday.mount(
        document.body,
        {
          tag: "dialog",
          bindings: {
            open: {
              field: "open",
              mode: "two-way",
              event: "close",
              methods: ["showModal", "close"],
            },
          },
        },
        store,
      );
      const states = [el.open];
      store.set("open", true);
      states.push(el.open);
      store.set("open", true); // showModal() on an open dialog would throw; the runtime skips it
      states.push(el.open);
      store.set("open", false);
      states.push(el.open);
      el.showModal();
      el.close(); // the element closing itself writes the field back
      return { states, field: store.get("open") };
    });
    expect(r).toEqual({ states: [false, true, true, false], field: false });
  });
});

test.describe("the conformance page with the native baseline", () => {
  let child;
  let url;

  test.beforeAll(async () => {
    const port = await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.on("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const { port } = server.address();
        server.close(() => resolve(port));
      });
    });
    url = `http://127.0.0.1:${port}`;
    child = spawn(
      process.env.PYTHON || "python",
      ["-m", "spaday.ui.conformance", String(port)],
      { cwd: REPO, stdio: "ignore" },
    );
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      try {
        if ((await fetch(url)).ok) return;
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    throw new Error("the conformance server did not start");
  });

  test.afterAll(() => child?.kill());

  // a control's text input: the host itself, or the input a design's element wraps
  const input = (page, id) =>
    page
      .locator(`#${id}`)
      .locator("input")
      .or(page.locator(`#${id}`))
      .last();

  test("every control round-trips through the store", async ({ page }) => {
    await page.goto(url);
    const state = page.locator("#state");
    await expect(state).toHaveText("|false|false|basic|false|false");
    await input(page, "name").fill("Ada");
    await expect(state).toHaveText("Ada|false|false|basic|false|false");
    await page.locator("#agree").click();
    await page.locator("#dark").click();
    await expect(state).toHaveText("Ada|true|true|basic|false|false");
    await page.locator("#save").click();
    await expect(state).toHaveText("Ada|true|true|basic|true|false");
    await page.locator("#reset").click();
    await expect(state).toHaveText("|true|true|basic|false|false");
  });

  test("a select changes the bound field", async ({ page }) => {
    await page.goto(url);
    const select = page.locator("#plan");
    if ((await select.evaluate((el) => el.localName)) === "select")
      await select.selectOption("plus");
    else {
      await select.click();
      await page.getByRole("option", { name: "Plus" }).click();
    }
    await expect(page.locator("#state")).toContainText("|plus|");
  });

  test("the dialog opens from state, closes from a button and reports its own close", async ({
    page,
  }) => {
    await page.goto(url);
    const dialog = page.locator("#dialog");
    await expect(dialog).toHaveJSProperty("open", false);
    await page.locator("#open").click();
    await expect(dialog).toHaveJSProperty("open", true);
    await expect(dialog).toContainText("Confirm");
    await page.locator("#close").click();
    await expect(dialog).toHaveJSProperty("open", false);
    await page.locator("#open").click();
    await expect(dialog).toHaveJSProperty("open", true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveJSProperty("open", false);
    await expect(page.locator("#state")).toHaveText(
      "|false|false|basic|false|false",
    );
  });

  test("labels, help, errors and disabled state render", async ({ page }) => {
    await page.goto(url);
    await expect(page.getByText("Your name")).toBeVisible();
    await expect(page.getByText("Required")).toBeVisible();
    await expect(page.locator("#never")).toHaveJSProperty("disabled", true);
    await expect(page.locator("#save")).toHaveText("Save");
    expect(await page.locator("[data-ui-fallback]").count()).toBe(0);
  });
});
