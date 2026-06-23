import { test, expect } from "@playwright/test";

// The WebAwesome-inclusive widget bundle (dist/cdn/widget.webawesome.js): loading it must statically
// register the wa-* catalog, and the widget must render and upgrade those elements in a notebook with
// no extra script or network — the whole point of bundling WebAwesome into the widget.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/widget-webawesome.html");
  await page.waitForFunction(() => window.__widget);
});

test("statically registers the WebAwesome catalog (no runtime chunk loading)", async ({
  page,
}) => {
  const defined = await page.evaluate(() => ({
    button: !!customElements.get("wa-button"),
    card: !!customElements.get("wa-card"),
    switch_: !!customElements.get("wa-switch"),
  }));
  expect(defined).toEqual({ button: true, card: true, switch_: true });
});

test("mounts and upgrades a wa-* tree in the widget", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { widget, fakeModel } = window.__widget;
    const tree = {
      tag: "wa-button",
      props: { variant: { Str: "brand" }, textContent: { Str: "Go" } },
      events: {
        click: { kind: "toggle", target: { ref: "this" }, prop: "hidden" },
      },
    };
    const model = fakeModel({ _tree: tree });
    const el = document.createElement("div");
    document.body.appendChild(el);
    await widget.initialize();
    await widget.render({ model, el });

    const button = el.querySelector("wa-button");
    await customElements.whenDefined("wa-button");
    const upgraded = !!button.shadowRoot; // WebAwesome controls render into a shadow root
    button.click(); // the action DSL still runs on the upgraded element
    return { upgraded, hidden: button.hidden, label: button.textContent };
  });

  expect(result.upgraded).toBe(true);
  expect(result.label).toBe("Go");
  expect(result.hidden).toBe(true); // the client-side Toggle ran
});
