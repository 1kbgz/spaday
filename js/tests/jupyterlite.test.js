import fs from "fs";
import { test, expect } from "@playwright/test";

const built = fs.existsSync("dist/lite/repl/index.html");
// the repo version (bumpversion keeps package.json in sync): asserting it proves the lite site
// serves the freshly built wheel, not a stale one — without hardcoding a version that rots on bump
const { version } = JSON.parse(fs.readFileSync("./package.json", "utf8"));

test("JupyterLite pyodide kernel installs the wheel and renders the widget", async ({
  page,
}) => {
  test.skip(
    !built,
    "run `make jupyterlite` first (site copied to js/dist/lite)",
  );
  test.setTimeout(300_000);

  const url = new URL("/dist/lite/repl/index.html", "http://127.0.0.1:3000");
  url.searchParams.set("kernel", "python");
  url.searchParams.append("code", "%pip install -q spaday anywidget");
  url.searchParams.append(
    "code",
    [
      "import spaday",
      "from spaday.examples.widget import demo as widget_demo",
      "from spaday.examples.devices import demo as devices_demo",
      "actions = widget_demo()",
      "devices = devices_demo()",
      "print('lite-ok', spaday.__version__)",
    ].join("\n"),
  );
  // Each expression displays one real packaged example through the widget frontend.
  url.searchParams.append("code", "actions");
  url.searchParams.append("code", "devices");
  await page.goto(url.toString());
  await expect(page.getByText(`lite-ok ${version}`)).toBeVisible({
    timeout: 240_000,
  });
  await expect(page.getByRole("button", { name: "Toggle panel" })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText("Living room", { exact: true })).toBeVisible();
});

test("published Pyodide worker example uses the site's wheel", async ({
  page,
}) => {
  const example = "dist/lite/js/examples/pyodide.html";
  test.skip(!fs.existsSync(example), "run `make jupyterlite` first");
  test.setTimeout(180_000);

  await page.goto(new URL(`/${example}`, "http://127.0.0.1:3000").toString());
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true", {
    timeout: 150_000,
  });
  await expect(page.locator("#count")).toHaveText("0");
  await page.getByRole("button", { name: "Increment in Python" }).click();
  await expect(page.locator("#count")).toHaveText("1");
});

test("standalone gallery runs core examples in Pyodide", async ({ page }) => {
  const example = "dist/lite/js/examples/standalone.html";
  test.skip(!fs.existsSync(example), "run `make jupyterlite` first");
  test.setTimeout(600_000);

  const cases = [
    ["webawesome-forms", "Account settings"],
    ["webawesome-navigation", "Workspace overview"],
    ["webawesome-feedback", "Operations status"],
    ["webawesome-content", "Atlas product update"],
    ["webawesome-observers", "Browser utility components"],
    ["data-dashboard", "Trading dashboard"],
    ["reactive", "Reactive controls over transports — bindings, no glue"],
  ];

  for (const [name, visibleText] of cases) {
    const url = new URL(`/${example}`, "http://127.0.0.1:3000");
    url.searchParams.set("example", name);
    await page.goto(url.toString());
    try {
      await page.waitForFunction(
        () =>
          document.documentElement.dataset.ready === "true" ||
          document.querySelector("#demo-status")?.textContent ===
            "Unable to start",
        undefined,
        { timeout: 180_000 },
      );
      await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
    } catch (error) {
      throw new Error(
        `${name}: ${error}\nStatus: ${await page.locator("#demo-status").textContent()}\n${await page.locator("#demo-error").textContent()}`,
      );
    }
    await expect(page.getByText(visibleText, { exact: true })).toBeVisible();
    if (name === "reactive") {
      const before = Number(
        await page.locator("html").getAttribute("data-transport-messages"),
      );
      await page.locator('input[type="text"]').fill("browser round-trip");
      await expect(
        page.getByText("browser round-trip", { exact: true }),
      ).toBeVisible();
      await expect
        .poll(async () =>
          Number(
            await page.locator("html").getAttribute("data-transport-messages"),
          ),
        )
        .toBeGreaterThan(before);
    }
  }
});
