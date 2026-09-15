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

  test("binding codecs preserve numeric and typed choice values", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      const store = new window.__spaday.Store({ count: 2, choice: 1 });
      const number = window.__spaday.mount(
        document.body,
        {
          tag: "input",
          props: { type: { Str: "number" }, step: { Str: "any" } },
          bindings: {
            value: { field: "count", mode: "two-way", codec: "number" },
          },
        },
        store,
      );
      const choice = window.__spaday.mount(
        document.body,
        {
          tag: "select",
          bindings: {
            value: { field: "choice", mode: "two-way", codec: "json" },
          },
          slots: {
            default: [
              {
                tag: "option",
                props: { value: { Str: "1" }, textContent: { Str: "One" } },
              },
            ],
          },
        },
        store,
      );
      number.value = "4.5";
      number.dispatchEvent(new Event("input"));
      choice.value = "1";
      choice.dispatchEvent(new Event("change"));
      const values = { count: store.get("count"), choice: store.get("choice") };
      number.value = "";
      number.dispatchEvent(new Event("input"));
      choice.value = "";
      choice.dispatchEvent(new Event("change"));
      return {
        values,
        emptyNumber: store.get("count"),
        emptyChoice: store.get("choice"),
      };
    });
    expect(r).toEqual({
      values: { count: 4.5, choice: 1 },
      emptyNumber: null,
      emptyChoice: null,
    });
  });

  test("a bound options list is reshaped for its concrete control", async ({
    page,
  }) => {
    const items = await page.evaluate(() => {
      customElements.define(
        "x-options",
        class extends HTMLElement {
          items = [];
        },
      );
      const store = new window.__spaday.Store({
        choices: [
          1,
          { value: true, label: "Yes", disabled: true },
          1e-7,
          1e21,
          { value: -0, label: null },
        ],
      });
      const control = window.__spaday.mount(
        document.body,
        {
          tag: "x-options",
          bindings: {
            items: {
              field: "choices",
              mode: "one-way",
              options: {
                value: "key",
                label: "text",
                disabled: "unavailable",
                codec: "json",
              },
            },
          },
        },
        store,
      );
      return control.items;
    });
    expect(items).toEqual([
      { key: "1", text: "1" },
      { key: "true", text: "Yes", unavailable: true },
      { key: "1e-7", text: "1e-7" },
      { key: "1e+21", text: "1e+21" },
      { key: "0", text: "0" },
    ]);
  });

  test("the native select preserves typed and disabled options", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const store = new window.__spaday.Store({
        options: [
          1,
          { value: 2, label: "Two" },
          { value: true, disabled: true },
        ],
        choice: 1,
      });
      const control = window.__spaday.mount(
        document.body,
        {
          tag: "spa-select",
          bindings: {
            options: {
              field: "options",
              mode: "one-way",
              options: { value: "value", label: "label", disabled: "disabled" },
            },
            value: { field: "choice", mode: "two-way" },
          },
        },
        store,
      );
      await customElements.whenDefined("spa-select");
      const select = control.querySelector("select");
      select.value = "1";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return {
        choice: store.get("choice"),
        valueType: typeof store.get("choice"),
        labels: Array.from(select.options).map((option) => option.textContent),
        disabled: select.options[2].disabled,
      };
    });
    expect(result).toEqual({
      choice: 2,
      valueType: "number",
      labels: ["1", "Two", "true"],
      disabled: true,
    });
  });

  test("required native select disables a placeholder set before required", async ({
    page,
  }) => {
    const disabled = await page.evaluate(async () => {
      const control = document.createElement("spa-select");
      control.placeholder = "Pick one";
      control.required = true;
      control.options = ["a"];
      document.body.append(control);
      await customElements.whenDefined("spa-select");
      return control.querySelector("option").disabled;
    });
    expect(disabled).toBe(true);
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

  test("a method binding can read nested overlay state", async ({ page }) => {
    const r = await page.evaluate(() => {
      class WrappedDialog extends HTMLElement {
        dialog = { open: false };

        show() {
          this.dialog.open = true;
        }

        hide() {
          this.dialog.open = false;
          this.dispatchEvent(new Event("toggle"));
        }
      }
      if (!customElements.get("wrapped-dialog"))
        customElements.define("wrapped-dialog", WrappedDialog);
      const store = new window.__spaday.Store({ open: false });
      const el = window.__spaday.mount(
        document.body,
        {
          tag: "wrapped-dialog",
          bindings: {
            open: {
              field: "open",
              mode: "two-way",
              event: "toggle",
              methods: ["show", "hide"],
              state: "dialog.open",
            },
          },
        },
        store,
      );
      store.set("open", true);
      const shown = el.dialog.open;
      store.set("open", true);
      el.hide();
      return { shown, hidden: !el.dialog.open, field: store.get("open") };
    });
    expect(r).toEqual({ shown: true, hidden: true, field: false });
  });

  test("a binding can wait for connection and assigned children", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      class DeferredElement extends HTMLElement {
        current;

        set value(value) {
          if (!this.isConnected || !this.querySelector("span"))
            throw new Error("not ready");
          this.current = value;
        }
      }
      if (!customElements.get("deferred-element"))
        customElements.define("deferred-element", DeferredElement);
      const store = new window.__spaday.Store({ choice: "a" });
      const el = window.__spaday.mount(
        document.body,
        {
          tag: "deferred-element",
          slots: { default: [{ tag: "span" }] },
          bindings: {
            value: { field: "choice", mode: "one-way", defer: true },
          },
        },
        store,
      );
      store.set("choice", "b");
      await new Promise(requestAnimationFrame);
      return { value: el.current, children: el.children.length };
    });
    expect(r).toEqual({ value: "b", children: 1 });
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
    await expect(state).toHaveText(
      "||2|2026-09-14|false|false|basic|1|5|25|false|false",
    );
    await input(page, "name").fill("Ada");
    await expect(state).toHaveText(
      "Ada||2|2026-09-14|false|false|basic|1|5|25|false|false",
    );
    await page.locator("#agree").click();
    await page.locator("#dark").click();
    await expect(state).toHaveText(
      "Ada||2|2026-09-14|true|true|basic|1|5|25|false|false",
    );
    await page.locator("#save").click();
    await expect(state).toHaveText(
      "Ada||2|2026-09-14|true|true|basic|1|5|25|true|false",
    );
    await page.locator("#reset").click();
    await expect(state).toHaveText(
      "||2|2026-09-14|true|true|basic|1|5|25|false|false",
    );
  });

  test("text, number, date, radio and slider values round-trip", async ({
    page,
  }) => {
    await page.goto(url);
    const state = page.locator("#state");
    await page.locator("#notes").fill("Ready");
    await input(page, "count").fill("4");
    await input(page, "date").fill("2026-10-01");
    await page.locator("#priority input").nth(1).click();
    await page.locator("#volume").evaluate((element) => {
      const slider = element;
      slider.value = "8";
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(state).toHaveText(
      "|Ready|4|2026-10-01|false|false|basic|2|8|25|false|false",
    );
    await expect(page.locator("#alert")).toContainText("Portable");
    await expect(page.locator("#progress")).toHaveJSProperty("value", 25);
    await expect(
      page.getByRole("radiogroup", { name: "Priority" }),
    ).toBeVisible();
    const stateBeforeCaptionClick = await state.textContent();
    await page.getByText("Priority", { exact: true }).click();
    await expect(state).toHaveText(stateBeforeCaptionClick);
  });

  test("a select changes the bound field", async ({ page }) => {
    await page.goto(url);
    const select = page.locator("#plan");
    const tag = await select.evaluate((element) => element.localName);
    if (tag === "spa-select")
      await select.locator("select").selectOption({ label: "Plus" });
    else if (tag === "select") await select.selectOption("plus");
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
      "||2|2026-09-14|false|false|basic|1|5|25|false|false",
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
