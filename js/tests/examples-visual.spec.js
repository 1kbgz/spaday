import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const EXAMPLES_DIR = path.join(REPO, "spaday", "examples");
const EXAMPLES = [
  { name: "__main__", selector: "spa-app" },
  { name: "cluster", selector: "lightweight-chart" },
  { name: "data_dashboard", selector: "spa-app" },
  { name: "devices", selector: "wa-card" },
  { name: "embed", path: "/spaday/", selector: "spa-app" },
  { name: "form", selector: "wa-input" },
  { name: "fragment", selector: "#spaday-root wa-button" },
  { name: "gateway", selector: "perspective-panel" },
  { name: "reactive", selector: "spa-main" },
  { name: "ssr", selector: "spa-app" },
  { name: "webawesome_content", selector: "wa-card" },
  { name: "webawesome_feedback", selector: "wa-callout" },
  { name: "webawesome_forms", selector: "wa-input" },
  { name: "webawesome_navigation", selector: "wa-page" },
  { name: "webawesome_observers", selector: "spa-app" },
  { name: "widget", selector: "wa-card" },
];

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function startExample(name) {
  const port = await freePort();
  const front = await freePort();
  const back = await freePort();
  const child = spawn(
    process.env.PYTHON || "python",
    ["-m", "spaday.tests.example_visual_server", name, String(port)],
    {
      cwd: REPO,
      env: {
        ...process.env,
        SPADAY_CLUSTER_FRONT: `tcp://127.0.0.1:${front}`,
        SPADAY_CLUSTER_BACK: `tcp://127.0.0.1:${back}`,
      },
    },
  );
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));

  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`${name} exited before startup:\n${output}`);
    try {
      const response = await fetch(origin);
      if (response.ok) return { origin, process: child, output: () => output };
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill("SIGKILL");
  throw new Error(`${name} did not start:\n${output}`);
}

async function stopExample(server) {
  if (server.process.exitCode !== null) return;
  server.process.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.process.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.process.exitCode === null) server.process.kill("SIGKILL");
}

function exampleFiles() {
  return fs
    .readdirSync(EXAMPLES_DIR)
    .filter((name) => name.endsWith(".py") && name !== "__init__.py")
    .map((name) => name.slice(0, -3))
    .sort();
}

test.describe("example visual smoke tests", () => {
  test.describe.configure({ mode: "serial" });

  test("cover every Python example", () => {
    expect(EXAMPLES.map(({ name }) => name).sort()).toEqual(exampleFiles());
  });

  for (const example of EXAMPLES) {
    test(`${example.name} paints visible content`, async ({ page }) => {
      test.setTimeout(60_000);
      const server = await startExample(example.name);
      try {
        await page.goto(`${server.origin}${example.path || "/"}`);
        const marker = page.locator(example.selector).first();
        await expect(marker).toBeVisible({ timeout: 20_000 });
        await expect
          .poll(() => page.locator("body").innerText(), { timeout: 20_000 })
          .not.toHaveLength(0);

        const box = await marker.boundingBox();
        expect(box?.width).toBeGreaterThan(0);
        expect(box?.height).toBeGreaterThan(0);
        const screenshot = await page.screenshot({ animations: "disabled" });
        expect(screenshot.byteLength).toBeGreaterThan(1_000);

        if (example.name === "ssr") {
          const colors = await marker.evaluate((element) => {
            const style = getComputedStyle(element);
            return { color: style.color, background: style.backgroundColor };
          });
          expect(colors.color).toBe("rgb(226, 232, 240)");
          expect(colors.background).toBe("rgb(15, 23, 42)");
        }

        if (example.name === "cluster") {
          await page.waitForFunction(
            () => document.querySelector("lightweight-chart")?.data.length,
          );
          await page.waitForTimeout(100);
          const before = await marker.evaluate(async (element) => {
            const scale = element.chart.timeScale();
            scale.setVisibleLogicalRange({ from: 10, to: 30 });
            await new Promise((resolve) => requestAnimationFrame(resolve));
            return scale.getVisibleLogicalRange();
          });
          await page.waitForTimeout(1_200);
          const after = await marker.evaluate((element) =>
            element.chart.timeScale().getVisibleLogicalRange(),
          );
          expect(after.from).toBeCloseTo(before.from);
          expect(after.to).toBeCloseTo(before.to);
        }
      } catch (error) {
        throw new Error(
          `${example.name} visual smoke failed:\n${server.output()}\n${error.stack}`,
        );
      } finally {
        await stopExample(server);
      }
    });
  }
});
