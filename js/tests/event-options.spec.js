import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

for (const hydrated of [false, true]) {
  test(`listener options capture, patch, and remove (hydrate=${hydrated})`, async ({
    page,
  }) => {
    const result = await page.evaluate(async (hydrated) => {
      const { mount, hydrate, applyPatch, diff, registerHandler } =
        await import("/dist/esm/index.js");
      let calls = 0;
      registerHandler("count", () => calls++);
      let tree = {
        tag: "form",
        events: { invalid: { kind: "js", handler: "count" } },
        slots: {
          default: [{ tag: "input", props: { required: { Bool: true } } }],
        },
      };
      let form;
      if (hydrated) {
        document.body.innerHTML = "<form><input required></form>";
        form = hydrate(document.body, tree);
      } else form = mount(document.body, tree);
      const check = () => {
        form.checkValidity();
        return calls;
      };
      const patch = (next) => {
        form = applyPatch(
          form,
          JSON.parse(diff(JSON.stringify(tree), JSON.stringify(next))),
        );
        tree = next;
      };
      const seen = [check()];
      patch({
        ...tree,
        event_options: { invalid: { capture: true, once: true } },
      });
      seen.push(check(), check());
      patch({ ...tree, event_options: { invalid: { capture: true } } });
      seen.push(check(), check());
      patch({ ...tree, event_options: {} });
      seen.push(check());
      patch({ ...tree, event_options: { invalid: { capture: true } } });
      patch({ ...tree, events: {}, event_options: {} });
      seen.push(check());
      return seen;
    }, hydrated);
    expect(result).toEqual([0, 1, 1, 2, 3, 3, 3]);
  });
}

test("passive context menus and shadow event boundaries retain native semantics", async ({
  page,
}) => {
  expect(
    await page.evaluate(async () => {
      const { mount, registerHandler } = await import("/dist/esm/index.js");
      let calls = 0;
      registerHandler("count", () => calls++);
      const root = mount(document.body, {
        tag: "div",
        events: {
          focus: { kind: "js", handler: "count" },
          contextmenu: { kind: "js", handler: "count" },
        },
        event_options: {
          focus: { capture: true },
          contextmenu: { passive: true },
        },
      });
      const child = document.createElement("div");
      root.append(child);
      const inner = document.createElement("input");
      child.attachShadow({ mode: "open" }).append(inner);
      inner.dispatchEvent(new Event("focus", { composed: false }));
      const isolated = calls;
      inner.dispatchEvent(new Event("focus", { composed: true }));
      const composed = calls;
      const event = new Event("contextmenu", { cancelable: true });
      root.dispatchEvent(event);
      return { isolated, composed, prevented: event.defaultPrevented };
    }),
  ).toEqual({ isolated: 0, composed: 1, prevented: false });
});

test("predeclared listener options apply when a later patch adds the action", async ({
  page,
}) => {
  const calls = await page.evaluate(async () => {
    const { mount, applyPatch, registerHandler } =
      await import("/dist/esm/index.js");
    let calls = 0;
    registerHandler("count", () => calls++);
    const root = mount(document.body, {
      tag: "form",
      event_options: { invalid: { capture: true } },
      slots: {
        default: [{ tag: "input", props: { required: { Bool: true } } }],
      },
    });
    applyPatch(root, {
      ops: [
        {
          SetEvent: {
            path: [],
            name: "invalid",
            action: { kind: "js", handler: "count" },
          },
        },
      ],
    });
    root.checkValidity();
    return calls;
  });
  expect(calls).toBe(1);
});
