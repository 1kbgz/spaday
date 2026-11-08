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

test("JupyterLite notebook views use transports ownership and binary comm buffers", async ({
  page,
}) => {
  test.skip(!built, "run `make jupyterlite` first");
  test.setTimeout(300_000);
  await page.addInitScript(() => {
    customElements.define(
      "notebook-probe",
      class extends HTMLElement {
        set data(value) {
          this.dataset.bytes = value ? Array.from(value).join(",") : "";
        }
        connectedCallback() {
          const detail = { namespace: "status" };
          this.dispatchEvent(
            new CustomEvent("spaday:wire-request", {
              detail,
              bubbles: true,
              composed: true,
            }),
          );
          const wire = detail.wire;
          const update = () =>
            (this.dataset.owned = String(
              Boolean(wire.store.get("$owned.status.playing")),
            ));
          this.stops = [
            wire.store.subscribe("$owned.status.playing", update),
            wire.client.onCommand((command) => {
              if (command.id !== wire.link.modelId) return;
              this.dataset.commands = String(
                Number(this.dataset.commands || 0) + 1,
              );
              wire.store.set("status.playing", command.value.Bool);
              wire.client.ackCommand(command);
            }),
          ];
          update();
        }
        disconnectedCallback() {
          this.stops?.forEach((stop) => stop());
        }
      },
    );
  });
  const url = new URL("/dist/lite/repl/index.html", "http://127.0.0.1:3000");
  url.searchParams.set("kernel", "python");
  url.searchParams.append(
    "code",
    "%pip install -q spaday anywidget transports==0.12.2",
  );
  url.searchParams.append(
    "code",
    [
      "from pydantic import BaseModel, Field",
      "from transports import Session",
      "from spaday import Widget, Wire, SetField, element",
      "from IPython.display import display",
      "class Config(BaseModel):",
      "    bpm: int = Field(120, ge=1)",
      "    sample: bytes = b'pcm'",
      "class Status(BaseModel):",
      "    playing: bool = Field(False, json_schema_extra={'owner': 'client'})",
      "config, status, session = Config(), Status(), Session()",
      "cid, sid = session.host(config), session.host(status)",
      "session.command(sid, 'playing', True)",
      "tree = element('section', element('input', type='number').bind('value', 'config.bpm', mode='two-way'), element('button').text('Play session').on('click', SetField('status.playing', True)), element('output').bind('textContent', 'status.playing'), element('notebook-probe').bind('data', 'config.sample'))",
      "w = Widget(tree, session=session, wires=[Wire(model=cid, namespace='config'), Wire(model=sid, namespace='status')])",
      "display(w)",
      "display(w)",
    ].join("\n"),
  );
  await page.goto(url.toString());
  const probes = page.locator("notebook-probe");
  await expect(probes).toHaveCount(2, { timeout: 240_000 });
  await expect(probes.nth(0)).toHaveAttribute("data-owned", "true");
  await expect(probes.nth(1)).toHaveAttribute("data-owned", "false");
  await expect(probes.nth(0)).toHaveAttribute("data-commands", "1");
  await expect(probes.nth(1)).not.toHaveAttribute("data-commands");
  await expect(probes.nth(0)).toHaveAttribute("data-bytes", "112,99,109");
  const inputs = page.locator("section input[type=number]");
  await inputs.nth(0).fill("145");
  await inputs.nth(0).dispatchEvent("change");
  await expect(inputs.nth(1)).toHaveValue("145");
  await inputs.nth(0).fill("-1");
  await inputs.nth(0).dispatchEvent("change");
  await expect(inputs.nth(0)).toHaveValue("145");
  await page
    .getByRole("button", { name: "Play session", exact: true })
    .first()
    .click();
  await expect(page.locator("section output").nth(1)).toHaveText("true");
});

test("JupyterLite loads WebAwesome packages for five widgets without network access", async ({
  page,
}) => {
  test.skip(!built, "run make jupyterlite first");
  test.setTimeout(300_000);
  const url = new URL("/dist/lite/repl/index.html", "http://127.0.0.1:3000");
  url.searchParams.set("kernel", "python");
  url.searchParams.append(
    "code",
    "%pip install -q spaday anywidget spaday-webawesome",
  );
  url.searchParams.append(
    "code",
    [
      "from spaday import Widget, element, ui",
      "from IPython.display import display",
      "warm = Widget(element('div', 'Notebook ready', id='notebook-ready'))",
      "display(warm)",
    ].join("\n"),
  );
  await page.goto(url.toString());
  await expect(page.locator("#notebook-ready")).toBeVisible({
    timeout: 240_000,
  });
  const requests = [];
  page.on("request", (request) => {
    // JupyterLite's virtual filesystem uses its service worker's local drive API.
    if (/^https?:/.test(request.url()) && !request.url().endsWith("/api/drive"))
      requests.push(request.url());
  });
  await page.context().setOffline(true);
  const prompt = page.locator(".jp-CodeConsole-promptCell .cm-content");
  await prompt.click();
  await page.keyboard.insertText(
    "widgets = [Widget(element('div', element('wa-input').bind('value', 'name', mode='two-way'), element('wa-button', 'Save')), packages=['webawesome'], state={'name': 'Ada'}) for _ in range(5)]; [display(widget) for widget in widgets]",
  );
  await page.keyboard.press("Shift+Enter");
  await expect(page.locator("wa-input input")).toHaveCount(5, {
    timeout: 60_000,
  });
  for (const input of await page.locator("wa-input input").all())
    await expect(input).toHaveValue("Ada");
  expect(await page.locator("link[data-spaday-package]").count()).toBe(1);
  expect(requests).toEqual([]);
});
