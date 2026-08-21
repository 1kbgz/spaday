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
      "from spaday import Widget, element",
      "from spaday.components.shell import Stack",
      // "hello " + "spaday" keeps the rendered text out of the echoed source, so the
      // visibility assertion below can only be satisfied by the widget's live DOM
      'w = Widget(Stack(element("h1").text("hello " + "spaday")))',
      "print('lite-ok', spaday.__version__)",
    ].join("\n"),
  );
  // displaying the widget must render the tree as live elements, not the text/plain repr —
  // this is what breaks when the lite build lacks the ipywidgets/anywidget frontends
  url.searchParams.append("code", "w");
  await page.goto(url.toString());
  await expect(page.getByText(`lite-ok ${version}`)).toBeVisible({
    timeout: 240_000,
  });
  await expect(page.locator("h1", { hasText: "hello spaday" })).toBeVisible({
    timeout: 60_000,
  });
});
