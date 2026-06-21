import { test, expect } from "@playwright/test";

// The Phase 4.1 shell primitives (spa-app/nav/body/gutter/main/footer/stack/row/toolbar). They are real
// custom elements defined on import of the runtime — each a shadow root with one default slot and
// encapsulated layout CSS — so layout is authored by composing them, not by hand-writing div markup.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(
    () => window.__spaday && window.customElements.get("spa-app"),
  );
});

test("a shell element attaches a shadow root + default slot and projects its children", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const el = window.__spaday.mount(document.body, {
      tag: "spa-stack",
      slots: {
        default: [
          { tag: "span", props: { textContent: { Str: "a" } } },
          { tag: "span", props: { textContent: { Str: "b" } } },
        ],
      },
    });
    const slot = el.shadowRoot && el.shadowRoot.querySelector("slot");
    return {
      hasShadow: !!el.shadowRoot,
      hasSlot: !!slot,
      projected: slot ? slot.assignedElements().length : 0,
    };
  });
  expect(r).toEqual({ hasShadow: true, hasSlot: true, projected: 2 });
});

test("layout primitives carry their own encapsulated layout CSS", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const styleOf = (tag) => {
      const el = window.__spaday.mount(document.body, { tag });
      const cs = getComputedStyle(el); // requires being in the document — mounted into body
      return {
        display: cs.display,
        flexDirection: cs.flexDirection,
        alignItems: cs.alignItems,
      };
    };
    return { app: styleOf("spa-app"), row: styleOf("spa-row") };
  });
  expect(r.app.display).toBe("flex");
  expect(r.app.flexDirection).toBe("column"); // App stacks vertically
  expect(r.row.display).toBe("flex");
  expect(r.row.alignItems).toBe("center"); // Row centers its items
});

test("shell containers carry the slotted wa-button display fix", async ({
  page,
}) => {
  // WebAwesome's wa-button is inline-block; without this it blockifies to `block` as a flex item and
  // its internal base part overflows the host. Guard that the fix rule stays in the shadow style.
  const hasFix = await page.evaluate(() => {
    const el = window.__spaday.mount(document.body, { tag: "spa-row" });
    return el.shadowRoot
      .querySelector("style")
      .textContent.includes("::slotted(wa-button)");
  });
  expect(hasFix).toBe(true);
});
