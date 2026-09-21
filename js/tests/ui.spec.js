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

  test("outbound encoding and scaling are independent from inbound decoding", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      customElements.define(
        "x-string-number",
        class extends HTMLElement {
          current = "";
          input = { value: "" };
          set value(value) {
            if (typeof value !== "string") throw new Error("expected string");
            this.current = value;
          }
        },
      );
      customElements.define(
        "x-scaled-number",
        class extends HTMLElement {
          value = 0;
        },
      );
      const store = new window.__spaday.Store({ count: 2, progress: 25 });
      const number = window.__spaday.mount(
        document.body,
        {
          tag: "x-string-number",
          bindings: {
            value: {
              field: "count",
              mode: "two-way",
              event: "x-change",
              state: "input.value",
              codec: "number",
              encode: "string",
            },
          },
        },
        store,
      );
      const progress = window.__spaday.mount(
        document.body,
        {
          tag: "x-scaled-number",
          bindings: {
            value: {
              field: "progress",
              mode: "two-way",
              codec: "number",
              scale: 2,
            },
          },
        },
        store,
      );
      const initialProgress = progress.value;
      number.input.value = "4";
      number.dispatchEvent(new Event("x-change"));
      progress.value = 80;
      progress.dispatchEvent(new Event("input"));
      return {
        numberValue: number.current,
        count: store.get("count"),
        initialProgress,
        progress: store.get("progress"),
      };
    });
    expect(r).toEqual({
      numberValue: "4",
      count: 4,
      initialProgress: 50,
      progress: 40,
    });
  });

  test("string encoding preserves JavaScript conversion on live updates", async ({
    page,
  }) => {
    const values = await page.evaluate(() => {
      const store = new window.__spaday.Store({ value: ["a", null, true] });
      const input = window.__spaday.mount(
        document.body,
        {
          tag: "input",
          bindings: { value: { field: "value", encode: "string" } },
        },
        store,
      );
      const list = input.value;
      store.set("value", { a: 1 });
      const object = input.value;
      store.set("value", 1e21);
      return { list, object, number: input.value };
    });
    expect(values).toEqual({
      list: "a,,true",
      object: "[object Object]",
      number: "1e+21",
    });
  });

  test("a parent binding can drive and read child-owned selection", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      customElements.define(
        "x-radio",
        class extends HTMLElement {
          value = "";
          checked = false;
        },
      );
      const store = new window.__spaday.Store({ choice: 2 });
      const group = window.__spaday.mount(
        document.body,
        {
          tag: "div",
          bindings: {
            value: {
              field: "choice",
              mode: "two-way",
              event: "x-change",
              state: "selectedItem.value",
              codec: "json",
              selection: {
                tag: "x-radio",
                value: "value",
                selected: "checked",
              },
            },
          },
          slots: {
            default: [
              { tag: "x-radio", props: { value: { Str: "1" } } },
              { tag: "x-radio", props: { value: { Str: "2" } } },
            ],
          },
        },
        store,
      );
      const radios = Array.from(group.children);
      const initialChecked = radios.map((radio) => radio.checked);
      group.selectedItem = radios[0];
      group.dispatchEvent(new Event("x-change"));
      return {
        initialChecked,
        checked: radios.map((radio) => radio.checked),
        choice: store.get("choice"),
      };
    });
    expect(r).toEqual({
      initialChecked: [false, true],
      checked: [true, false],
      choice: 1,
    });
  });

  test("scaled child selection matches and decodes the selected value", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      customElements.define(
        "x-scaled-radio",
        class extends HTMLElement {
          value = "";
          checked = false;
        },
      );
      const store = new window.__spaday.Store({ choice: 2 });
      const group = window.__spaday.mount(
        document.body,
        {
          tag: "div",
          bindings: {
            value: {
              field: "choice",
              mode: "two-way",
              event: "x-change",
              state: "selectedItem.value",
              codec: "number",
              encode: "string",
              scale: 50,
              selection: {
                tag: "x-scaled-radio",
                value: "value",
                selected: "checked",
              },
            },
          },
          slots: {
            default: [
              { tag: "x-scaled-radio", props: { value: { Str: "50" } } },
              { tag: "x-scaled-radio", props: { value: { Str: "100" } } },
            ],
          },
        },
        store,
      );
      const radios = Array.from(group.children);
      const initiallyChecked = radios.map((radio) => radio.checked);
      group.selectedItem = radios[0];
      group.dispatchEvent(new Event("x-change"));
      return { initiallyChecked, choice: store.get("choice") };
    });
    expect(r).toEqual({ initiallyChecked: [false, true], choice: 1 });
  });

  test("bound property options use the same scale as the value binding", async ({
    page,
  }) => {
    const r = await page.evaluate(() => {
      customElements.define(
        "x-scaled-options",
        class extends HTMLElement {
          items = [];
        },
      );
      const store = new window.__spaday.Store({
        choices: [{ value: 1, label: "One" }],
      });
      const select = window.__spaday.mount(
        document.body,
        {
          tag: "x-scaled-options",
          bindings: {
            items: {
              field: "choices",
              options: { value: "key", label: "text", encode: "string" },
              scale: 50,
            },
          },
        },
        store,
      );
      const initial = select.items;
      store.set("choices", [{ value: 2, label: "Two" }]);
      return { initial, updated: select.items };
    });
    expect(r).toEqual({
      initial: [{ key: "50", text: "One" }],
      updated: [{ key: "100", text: "Two" }],
    });
  });

  test("property options can wait until connection", async ({ page }) => {
    const r = await page.evaluate(async () => {
      customElements.define(
        "x-connected-options",
        class extends HTMLElement {
          current = [];
          set items(value) {
            if (!this.isConnected) throw new Error("not connected");
            this.current = value;
          }
        },
      );
      const el = window.__spaday.mount(document.body, {
        tag: "x-connected-options",
        bindings: {
          items: {
            compute: { expr: "lit", value: [{ value: "a" }] },
            mode: "one-way",
            defer: true,
          },
        },
      });
      await new Promise(requestAnimationFrame);
      return el.current;
    });
    expect(r).toEqual([{ value: "a" }]);
  });

  test("a storeless field computation remains inert", async ({ page }) => {
    const title = await page.evaluate(() => {
      const el = window.__spaday.mount(document.body, {
        tag: "div",
        props: { title: { Str: "initial" } },
        bindings: {
          title: {
            compute: { expr: "field", name: "missing" },
            mode: "one-way",
          },
        },
      });
      return el.title;
    });
    expect(title).toBe("initial");
  });

  test("storeless literal bindings wire during hydration and incremental patches", async ({
    page,
  }) => {
    const result = await page.evaluate(() => {
      const { applyPatch, hydrate, mount } = window.__spaday;
      const container = document.createElement("div");
      container.innerHTML = '<div title="initial"></div>';
      const adopted = hydrate(container, {
        tag: "div",
        bindings: {
          title: {
            compute: { expr: "lit", value: "hydrated" },
            mode: "one-way",
          },
        },
      });
      const patched = mount(document.createElement("div"), {
        tag: "div",
        props: { title: { Str: "initial" } },
      });
      applyPatch(patched, {
        ops: [
          {
            SetBinding: {
              path: [],
              name: "title",
              binding: {
                compute: { expr: "lit", value: "patched" },
                mode: "one-way",
              },
            },
          },
        ],
      });
      return { hydrated: adopted.title, patched: patched.title };
    });
    expect(result).toEqual({ hydrated: "hydrated", patched: "patched" });
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

  test("an initial method binding waits until the element is connected", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      class ConnectedDialog extends HTMLElement {
        dialog = { open: false };

        show() {
          if (!this.isConnected) throw new Error("not connected");
          this.dialog.open = true;
        }

        hide() {
          this.dialog.open = false;
        }
      }
      if (!customElements.get("connected-dialog"))
        customElements.define("connected-dialog", ConnectedDialog);
      const el = window.__spaday.mount(
        document.body,
        {
          tag: "connected-dialog",
          bindings: {
            open: {
              compute: { expr: "lit", value: true },
              mode: "one-way",
              methods: ["show", "hide"],
              state: "dialog.open",
            },
          },
        },
        new window.__spaday.Store({}),
      );
      await new Promise(requestAnimationFrame);
      return { connected: el.isConnected, open: el.dialog.open };
    });
    expect(r).toEqual({ connected: true, open: true });
  });

  test("method updates stay synchronous after connection", async ({ page }) => {
    const r = await page.evaluate(async () => {
      const store = new window.__spaday.Store({ open: false });
      const el = window.__spaday.mount(
        document.body,
        {
          tag: "dialog",
          bindings: {
            open: {
              field: "open",
              mode: "one-way",
              methods: ["showModal", "close"],
            },
          },
        },
        store,
      );
      store.set("open", true);
      const opened = el.open;
      await Promise.resolve();
      const stayedOpen = el.open;
      store.set("open", false);
      return { opened, stayedOpen, closed: !el.open };
    });
    expect(r).toEqual({ opened: true, stayedOpen: true, closed: true });
  });

  test("an initial method binding waits for deferred attachment", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      const container = document.createElement("div");
      const el = window.__spaday.mount(
        container,
        {
          tag: "dialog",
          bindings: {
            open: {
              compute: { expr: "lit", value: true },
              mode: "one-way",
              methods: ["showModal", "close"],
            },
          },
        },
        new window.__spaday.Store({}),
      );
      await new Promise(requestAnimationFrame);
      const before = el.open;
      document.body.append(container);
      await new Promise(requestAnimationFrame);
      return { before, connected: el.isConnected, after: el.open };
    });
    expect(r).toEqual({ before: false, connected: true, after: true });
  });

  test("a method binding follows deferred attachment inside an existing shadow root", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      const host = document.createElement("div");
      document.body.append(host);
      const shadow = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      const el = window.__spaday.mount(
        container,
        {
          tag: "dialog",
          bindings: {
            open: {
              compute: { expr: "lit", value: true },
              mode: "one-way",
              methods: ["showModal", "close"],
            },
          },
        },
        new window.__spaday.Store({}),
      );
      await new Promise(requestAnimationFrame);
      const before = el.open;
      shadow.append(container);
      await new Promise((resolve, reject) => {
        const deadline = performance.now() + 2000;
        const check = () => {
          if (el.open) resolve();
          else if (performance.now() >= deadline)
            reject(new Error("shadow-root dialog did not open"));
          else setTimeout(check, 10);
        };
        check();
      });
      return { before, connected: el.isConnected, after: el.open };
    });
    expect(r).toEqual({ before: false, connected: true, after: true });
  });

  test("a pending method binding coalesces updates and skips an unchanged false state", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      class CountedOverlay extends HTMLElement {
        open = false;
        opened = 0;
        closed = 0;

        show() {
          this.opened += 1;
          this.open = true;
        }

        hide() {
          this.closed += 1;
          this.open = false;
        }
      }
      if (!customElements.get("counted-overlay"))
        customElements.define("counted-overlay", CountedOverlay);
      const container = document.createElement("div");
      const store = new window.__spaday.Store({ open: true });
      const el = window.__spaday.mount(
        container,
        {
          tag: "counted-overlay",
          bindings: {
            open: {
              field: "open",
              mode: "one-way",
              methods: ["show", "hide"],
            },
          },
        },
        store,
      );
      await new Promise(requestAnimationFrame);
      store.set("open", false);
      document.body.append(container);
      await new Promise(requestAnimationFrame);
      return { open: el.open, opened: el.opened, closed: el.closed };
    });
    expect(r).toEqual({ open: false, opened: 0, closed: 0 });
  });

  test("removing a binding cancels its pending connection work", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      const disconnect = MutationObserver.prototype.disconnect;
      const clearTimer = window.clearTimeout;
      let disconnects = 0;
      let clearedTimers = 0;
      MutationObserver.prototype.disconnect = function () {
        disconnects += 1;
        return disconnect.call(this);
      };
      window.clearTimeout = function (id) {
        clearedTimers += 1;
        return clearTimer.call(window, id);
      };
      class RemovedOverlay extends HTMLElement {
        open = false;
        opened = 0;

        show() {
          this.opened += 1;
          this.open = true;
        }

        hide() {
          this.open = false;
        }
      }
      if (!customElements.get("removed-overlay"))
        customElements.define("removed-overlay", RemovedOverlay);
      const container = document.createElement("div");
      const store = new window.__spaday.Store({ open: true });
      const el = window.__spaday.mount(
        container,
        {
          tag: "removed-overlay",
          bindings: {
            open: {
              field: "open",
              mode: "one-way",
              methods: ["show", "hide"],
            },
          },
        },
        store,
      );
      try {
        await new Promise(requestAnimationFrame);
        window.__spaday.applyPatch(
          el,
          { ops: [{ RemoveBinding: { path: [], name: "open" } }] },
          store,
        );
        const teardown = { disconnects, clearedTimers };
        document.body.append(container);
        await new Promise(requestAnimationFrame);
        return { open: el.open, opened: el.opened, teardown };
      } finally {
        MutationObserver.prototype.disconnect = disconnect;
        window.clearTimeout = clearTimer;
      }
    });
    expect(r).toEqual({
      open: false,
      opened: 0,
      teardown: { disconnects: 1, clearedTimers: 1 },
    });
  });

  test("connection polling backs off and resets for new pending work", async ({
    page,
  }) => {
    const r = await page.evaluate(async () => {
      const setTimer = window.setTimeout;
      const clearTimer = window.clearTimeout;
      const callbacks = new Map();
      const delays = [];
      const cleared = [];
      let nextTimer = 1;
      window.setTimeout = (callback, delay = 0) => {
        const id = nextTimer++;
        callbacks.set(id, callback);
        delays.push(delay);
        return id;
      };
      window.clearTimeout = (id) => {
        cleared.push(id);
        callbacks.delete(id);
      };
      class BackoffOverlay extends HTMLElement {
        open = false;

        show() {
          this.open = true;
        }

        hide() {
          this.open = false;
        }
      }
      if (!customElements.get("backoff-overlay"))
        customElements.define("backoff-overlay", BackoffOverlay);
      const mountPending = () => {
        const container = document.createElement("div");
        const store = new window.__spaday.Store({ open: true });
        const el = window.__spaday.mount(
          container,
          {
            tag: "backoff-overlay",
            bindings: {
              open: {
                field: "open",
                mode: "one-way",
                methods: ["show", "hide"],
              },
            },
          },
          store,
        );
        return { el, store };
      };
      const runTimer = () => {
        const entry = callbacks.entries().next().value;
        callbacks.delete(entry[0]);
        entry[1]();
      };
      const first = mountPending();
      try {
        await new Promise(requestAnimationFrame);
        runTimer();
        runTimer();
        document.body.append(document.createElement("span"));
        await new Promise(requestAnimationFrame);
        runTimer();
        runTimer();
        runTimer();
        runTimer();
        runTimer();
        const second = mountPending();
        await new Promise(requestAnimationFrame);
        window.__spaday.applyPatch(
          first.el,
          { ops: [{ RemoveBinding: { path: [], name: "open" } }] },
          first.store,
        );
        window.__spaday.applyPatch(
          second.el,
          { ops: [{ RemoveBinding: { path: [], name: "open" } }] },
          second.store,
        );
        return { delays, cleared: cleared.length };
      } finally {
        window.setTimeout = setTimer;
        window.clearTimeout = clearTimer;
      }
    });
    expect(r).toEqual({
      delays: [50, 100, 200, 400, 800, 1000, 1000, 1000, 50],
      cleared: 2,
    });
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
    await expect(page.locator("#progress")).toHaveJSProperty("max", 50);
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
    await expect(page.locator("#email")).toHaveAttribute("data-invalid", "");
    await page.locator("#reset").click();
    await expect(page.locator("#email")).not.toHaveAttribute(
      "data-invalid",
      /.*/,
    );
    await expect(page.getByText("Required")).toHaveCount(0);
    await page.locator("#validate").click();
    await expect(page.locator("#email")).toHaveAttribute("data-invalid", "");
    await expect(page.getByText("Required")).toBeVisible();
    await expect(page.locator("#never")).toHaveJSProperty("disabled", true);
    await expect(page.locator("#save")).toHaveText("Save");
    expect(await page.locator("[data-ui-fallback]").count()).toBe(0);
  });
});
