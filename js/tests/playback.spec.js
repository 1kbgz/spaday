import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";

let child;
let origin;
let output = "";
test.beforeAll(async () => {
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  origin = `http://127.0.0.1:${port}`;
  child = spawn(
    process.env.PYTHON || "python",
    ["-m", "spaday.tests.example_visual_server", "playback", String(port)],
    {
      cwd: fileURLToPath(new URL("../..", import.meta.url)),
      env: process.env,
    },
  );
  child.stdout.on("data", (data) => (output += data));
  child.stderr.on("data", (data) => (output += data));
  await expect
    .poll(
      async () => {
        if (child.exitCode !== null) throw new Error(output);
        try {
          return (await fetch(origin)).ok;
        } catch {
          return false;
        }
      },
      { timeout: 20000 },
    )
    .toBe(true);
});
test.afterAll(async () => {
  if (child?.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
  await exited;
  clearTimeout(timeout);
});

test("binary updates, server commands, reconnect and owner handover use the live Python model", async ({
  page,
  context,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await context.addInitScript(() => {
    document.addEventListener(
      "spaday:wire-client",
      (event) => (window.wire = event.detail),
    );
  });
  await page.goto(origin);
  await expect(page.getByRole("status")).toHaveText("Owner");
  await expect(page.locator("sample-waveform p")).toHaveText(
    "1024 bytes / 256 float32 samples",
  );
  const observer = await context.newPage();
  await observer.goto(origin);
  await expect(observer.getByRole("status")).toHaveText("Observer");
  await expect(observer.locator("#playing")).toBeDisabled();
  const state = async () => (await request.get(`${origin}/state`)).json();
  const initial = await state();
  await page.getByRole("button", { name: "Invert sample" }).click();
  await expect
    .poll(async () => (await state()).digest)
    .not.toBe(initial.digest);
  await expect
    .poll(() =>
      observer
        .locator("sample-waveform")
        .evaluate((el) => Array.from(el.data.slice(0, 16))),
    )
    .toEqual(
      await page
        .locator("sample-waveform")
        .evaluate((el) => Array.from(el.data.slice(0, 16))),
    );
  const inverted = (await state()).digest;
  await page.getByRole("button", { name: "New sample via Python" }).click();
  await expect.poll(async () => (await state()).digest).not.toBe(inverted);
  await page.locator("#bpm").fill("150");
  await expect.poll(async () => (await state()).bpm).toBe(150);
  await page.evaluate(() => window.wire.store.set("bpm", -1));
  await expect(page.locator("#tempo-error")).not.toHaveText("");
  await expect(page.locator("#bpm")).toHaveValue("150");
  await page.getByRole("button", { name: "Play via Python" }).click();
  await expect.poll(async () => (await state()).playing).toBe(true);
  await expect.poll(async () => (await state()).position).toBeGreaterThan(0);
  await page.reload();
  await expect(observer.getByRole("status")).toHaveText("Owner");
  await expect(page.getByRole("status")).toHaveText("Observer");
  await observer.close();
  await expect(page.getByRole("status")).toHaveText("Owner");
  await page.getByRole("button", { name: "Stop via Python" }).click();
  await expect.poll(async () => (await state()).playing).toBe(false);
  await page.getByRole("button", { name: "Reset via Python" }).click();
  await expect.poll(async () => (await state()).position).toBe(0);
  expect(errors).toEqual([]);
});
