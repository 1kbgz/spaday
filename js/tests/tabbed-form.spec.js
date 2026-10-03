import { spawn } from "node:child_process";
import { test, expect } from "@playwright/test";

let server;
let origin;
test.beforeAll(async () => {
  origin = await new Promise((resolve, reject) => {
    server = spawn(
      process.env.PYTHON || "python",
      [
        "-u",
        "-c",
        `
import socket, uvicorn
from spaday.examples.tabbed_form import app
sock = socket.socket()
sock.bind(("127.0.0.1", 0))
print(f"http://127.0.0.1:{sock.getsockname()[1]}", flush=True)
uvicorn.Server(uvicorn.Config(app, log_level="error")).run(sockets=[sock])
`,
      ],
      { cwd: "..", stdio: ["ignore", "pipe", "pipe"] },
    );
    server.once("error", reject);
    server.once("exit", (code) =>
      reject(new Error(`tabbed form server exited: ${code}`)),
    );
    server.stdout.once("data", (data) => resolve(data.toString().trim()));
    server.stderr.on("data", (data) => process.stderr.write(data));
  });
  await expect
    .poll(async () => {
      try {
        return (await fetch(origin)).status;
      } catch {
        return 0;
      }
    })
    .toBe(200);
});
test.afterAll(async () => {
  if (!server || server.exitCode !== null) return;
  await new Promise((resolve) => {
    server.once("exit", resolve);
    server.kill();
  });
});

test("WebAwesome tabs reveal invalid fields and save/preview use server responses", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin);
  await expect(page.locator("#editor")).toBeVisible();
  await page.locator('wa-tab[panel="contact"]').click();
  await page.locator('[name="email"]').fill("");
  await page.locator('wa-tab[panel="details"]').click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#editor-tabs")).toHaveJSProperty(
    "active",
    "contact",
  );
  await expect(page.locator('[name="email"]')).toBeFocused();
  await page.locator('[name="email"]').fill("grace@example.test");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator("output")).toHaveText("Ada <grace@example.test>");
  const response = page.waitForResponse((url) => url.url().endsWith("/save"));
  await page.getByRole("button", { name: "Save", exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(page.locator("#form-status")).toHaveText("Saved");
  await page.locator('[name="email"]').fill("changed@example.test");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator('[name="email"]')).toHaveValue(
    "grace@example.test",
  );
  await expect(page.locator('[name="name"]')).toHaveValue("Ada");
  expect(errors).toEqual([]);
});

test("keyboard tab selection and submission reveal the invalid panel", async ({
  page,
}) => {
  await page.goto(origin);
  await page.locator('[name="name"]').fill("");
  const details = page.locator('wa-tab[panel="details"]');
  await details.focus();
  await details.press("ArrowRight");
  await expect(page.locator("#editor-tabs")).toHaveJSProperty(
    "active",
    "contact",
  );
  await page.getByRole("button", { name: "Save", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#editor-tabs")).toHaveJSProperty(
    "active",
    "details",
  );
  await expect(page.locator('[name="name"]')).toBeFocused();
  await expect(page.locator("wa-tab-panel:visible")).toHaveCount(1);
});

for (const change of ["edit", "reset", "dispose"]) {
  test(`delayed preview is canceled on ${change} without publishing an old response`, async ({
    page,
  }) => {
    let pending;
    await page.route("**/preview", (route) => {
      pending = route;
    });
    await page.addInitScript(() => {
      document.addEventListener("spaday:ready", (event) => {
        window.session = event.detail;
      });
    });
    await page.goto(origin);
    await page.locator('[name="name"]').fill("Unsaved");
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect.poll(() => !!pending).toBe(true);
    await expect(page.locator("#preview-result")).toHaveText("Loading preview");
    if (change === "edit") await page.locator('[name="name"]').fill("Newer");
    else if (change === "reset")
      await page.getByRole("button", { name: "Reset", exact: true }).click();
    else await page.evaluate(() => window.session.dispose());
    await expect
      .poll(() => page.evaluate(() => window.session.store.get("previewing")))
      .toBe(false);
    await pending.fulfill({ json: { message: "stale response" } });
    if (change !== "dispose") {
      await expect(page.locator("#preview-result")).toHaveText("");
      await expect(
        page.getByRole("button", { name: "Preview", exact: true }),
      ).toBeEnabled();
    }
    expect(
      await page.evaluate(() => window.session.store.get("preview")),
    ).toBeUndefined();
  });
}

test("failed preview restores the button and presents an error", async ({
  page,
}) => {
  await page.route("**/preview", (route) => route.abort());
  await page.goto(origin);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator("#preview-result")).toHaveText("Preview failed");
  await expect(
    page.getByRole("button", { name: "Preview", exact: true }),
  ).toBeEnabled();
});

test("status polling pauses when hidden, skips overlap, and cleans up on disposal", async ({
  page,
}) => {
  const requests = [];
  await page.route("**/health", (route) => {
    requests.push(route);
  });
  await page.addInitScript(() => {
    document.addEventListener("spaday:ready", (event) => {
      window.session = event.detail;
    });
    window.hidden = false;
    Object.defineProperty(document, "hidden", { get: () => window.hidden });
  });
  await page.clock.install();
  await page.goto(origin);
  await expect.poll(() => requests.length).toBe(1);
  await page.evaluate(() => {
    window.clearedIntervals = 0;
    window.removedVisibilityListeners = 0;
    const clear = window.clearInterval;
    window.clearInterval = (id) => {
      window.clearedIntervals++;
      clear(id);
    };
    const remove = document.removeEventListener;
    document.removeEventListener = function (type, ...args) {
      if (type === "visibilitychange") window.removedVisibilityListeners++;
      return remove.call(this, type, ...args);
    };
  });
  const status = page.locator("#server-status");
  await expect(status).toHaveAttribute("aria-busy", "true");
  await expect(status.getByRole("button")).toBeDisabled();
  await page.clock.runFor(15000);
  expect(requests.length).toBe(1);
  await requests[0].abort();
  await expect(status.getByRole("status")).toHaveText("Server check failed");
  await expect(status.getByRole("button")).toBeEnabled();
  await page.evaluate(() => {
    window.hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(15000);
  expect(requests.length).toBe(1);
  await page.evaluate(() => {
    window.hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => requests.length).toBe(2);
  await requests[1].fulfill({ json: { message: "Server reachable" } });
  await expect(status.getByRole("status")).toHaveText("Server reachable");
  await expect(status).toHaveAttribute("aria-busy", "false");
  // Repeated ready notifications must not attach another polling interval.
  await page.evaluate(() =>
    document.dispatchEvent(
      new CustomEvent("spaday:ready", { detail: window.session }),
    ),
  );
  await page.clock.runFor(0);
  expect(await page.evaluate(() => window.session.store.get("checking"))).toBe(
    false,
  );
  expect(requests.length).toBe(2);
  await page.clock.runFor(5000);
  await expect.poll(() => requests.length).toBe(3);
  const cleared = await page.evaluate(() => window.clearedIntervals);
  await page.evaluate(() => window.session.dispose());
  expect(await page.evaluate(() => window.clearedIntervals)).toBe(cleared + 1);
  expect(await page.evaluate(() => window.removedVisibilityListeners)).toBe(1);
  await requests[2].fulfill({ json: { message: "detached response" } });
  await page.clock.runFor(15000);
  expect(requests.length).toBe(3);
  expect(
    await page.evaluate(() => ({
      checking: window.session.store.get("checking"),
      message: window.session.store.get("health").body.message,
    })),
  ).toEqual({ checking: false, message: "Server reachable" });
});

test("reset without edits restores every field", async ({ page }) => {
  await page.goto(origin);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator('[name="name"]')).toHaveValue("Ada");
  await expect(page.locator('[name="email"]')).toHaveValue("ada@example.test");
});

test("programmatic validation reveals the other tab without dropping hidden values", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin);
  await expect(page.locator("#editor")).toBeVisible();
  await page.locator('[name="name"]').fill("");
  await page.locator('wa-tab[panel="contact"]').click();
  await page.locator("#editor").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#editor-tabs")).toHaveJSProperty(
    "active",
    "details",
  );
  await expect(page.locator('[name="name"]')).toBeFocused();
  await page.locator('[name="name"]').fill("Grace");
  const payload = await page
    .locator("#editor")
    .evaluate((form) => Object.fromEntries(new FormData(form)));
  expect(payload).toEqual({ name: "Grace", email: "ada@example.test" });
  await expect(page.locator("wa-tab-panel:visible")).toHaveCount(1);
  expect(errors).toEqual([]);
});
