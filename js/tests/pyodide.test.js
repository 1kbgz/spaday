import { expect, test } from "@playwright/test";

const wheel = process.env.SPADAY_PYODIDE_WHEEL;

test("Python worker sends intents and incremental DOM patches", async ({
  page,
}) => {
  test.skip(!wheel, "set SPADAY_PYODIDE_WHEEL to test the browser wheel");
  test.setTimeout(180_000);

  const url = new URL("/examples/pyodide.html", "http://127.0.0.1:3000");
  url.searchParams.set("wheel", wheel);
  await page.goto(url.toString());

  try {
    await expect(page.locator("html")).toHaveAttribute("data-ready", "true", {
      timeout: 150_000,
    });
  } catch (error) {
    throw new Error(
      `${error}\nWorker status: ${await page.locator("#status").textContent()}\n${await page.locator("#error").textContent()}`,
    );
  }
  await expect(page.locator("#count")).toHaveText("0");

  await page.locator("#increment").evaluate((button) => {
    button.dataset.identity = "preserved";
  });
  await page.locator("#increment").click();

  await expect(page.locator("#count")).toHaveText("1");
  await expect(page.locator("#increment")).toHaveAttribute(
    "data-identity",
    "preserved",
  );
});
