import { spawn } from "node:child_process";
import { test, expect } from "@playwright/test";

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`table and tree edits preserve parent identity over ${codec}`, async ({
    browser,
  }) => {
    let server;
    const contexts = [];
    try {
      const origin = await new Promise((resolve, reject) => {
        server = spawn(
          process.env.SPADAY_TEST_PYTHON ?? "python",
          [
            "-u",
            "-c",
            `
import socket, uvicorn
from spaday.examples.collection_editor import create_app
sock = socket.socket()
sock.bind(("127.0.0.1", 0))
print(f"http://127.0.0.1:{sock.getsockname()[1]}", flush=True)
uvicorn.Server(uvicorn.Config(create_app(codec="${codec}"), log_level="error")).run(sockets=[sock])
`,
          ],
          { cwd: "..", stdio: ["ignore", "pipe", "pipe"] },
        );
        server.once("error", reject);
        server.once("exit", (code) =>
          reject(new Error(`Collection editor exited: ${code}`)),
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
      const pages = [];
      for (const path of ["/", "/bob", "/viewer"]) {
        const context = await browser.newContext();
        contexts.push(context);
        const page = await context.newPage();
        pages.push(page);
        if (path === "/")
          await page.addInitScript(() => {
            const Socket = WebSocket;
            window.pilotSockets = [];
            window.WebSocket = class extends Socket {
              constructor(...args) {
                super(...args);
                pilotSockets.push(this);
              }
            };
          });
        await page.goto(origin + path);
        await expect(page.locator("#table-work-a input").first()).toHaveValue(
          "Draft",
        );
      }
      const [alice, bob, viewer] = pages;
      const cell = (page, row, name) =>
        page.locator(`#${row}`).getByRole("textbox", { name, exact: true });
      const state = (page) =>
        page.locator("#state").evaluate((el) => JSON.parse(el.textContent));
      await alice.locator("#table-work-a").evaluate((row) => {
        window.originalRow = row;
        window.oldInput = row.querySelector("input");
      });

      await cell(alice, "table-work-a", "Label").fill("Work edit");
      await cell(bob, "tree-home-a", "Label").fill("Home edit");
      await cell(bob, "tree-work-a", "Note").fill("Remote note");
      await cell(alice, "tree-work-a", "Group owner").fill("Shared owner");
      for (const page of pages) {
        await expect(cell(page, "table-work-a", "Label")).toHaveValue(
          "Work edit",
        );
        await expect(cell(page, "tree-home-a", "Label")).toHaveValue(
          "Home edit",
        );
        await expect(cell(page, "table-work-a", "Note")).toHaveValue(
          "Remote note",
        );
        await expect(cell(page, "table-work-b", "Group owner")).toHaveValue(
          "Shared owner",
        );
        await expect(cell(page, "table-home-b", "Group owner")).toHaveValue(
          "Bob",
        );
      }
      expect(
        await alice
          .locator("#table-work-a")
          .evaluate((row) => row === originalRow),
      ).toBe(true);

      await cell(viewer, "tree-work-a", "Note").fill("Forbidden");
      await expect(viewer.locator("#edit-error")).not.toBeEmpty();
      await expect(cell(viewer, "tree-work-a", "Note")).toHaveValue(
        "Remote note",
      );
      await viewer
        .locator("#tree-work-a")
        .getByRole("button", { name: "Delete" })
        .click();
      await expect(viewer.locator("#delete-result")).toHaveText(
        "Read-only view",
      );
      await expect(alice.locator("#table-work-a")).toBeAttached();

      await contexts[0].setOffline(true);
      // Browser offline emulation leaves existing WebSockets open; close the live connection too.
      await alice.evaluate(() =>
        pilotSockets.forEach((socket) => socket.close()),
      );
      await expect(alice.locator("#connected")).toHaveText("false");
      await cell(alice, "table-work-a", "Label").fill("Offline edit");
      await cell(bob, "tree-work-a", "Note").fill("During disconnect");
      await contexts[0].setOffline(false);
      await expect(alice.locator("#connected")).toHaveText("true");
      for (const page of pages) {
        await expect(cell(page, "table-work-a", "Label")).toHaveValue(
          "Offline edit",
        );
        await expect(cell(page, "tree-work-a", "Note")).toHaveValue(
          "During disconnect",
        );
      }

      const deletion = bob.waitForResponse((r) =>
        r.url().endsWith("/api/bob/delete"),
      );
      await bob
        .locator("#tree-work-a")
        .getByRole("button", { name: "Delete" })
        .click();
      expect((await deletion).status()).toBe(200);
      for (const page of pages) {
        await expect(page.locator("#table-work-a")).toHaveCount(0);
        await expect(page.locator("#tree-work-a")).toHaveCount(0);
        await expect(cell(page, "table-home-a", "Label")).toHaveValue(
          "Home edit",
        );
      }
      await alice.evaluate(() => {
        oldInput.value = "Late edit";
        oldInput.dispatchEvent(new Event("input"));
      });
      const result = await state(bob);
      expect(result.find((g) => g.id === "work").rows.map((r) => r.id)).toEqual(
        ["b"],
      );
      await expect.poll(() => state(alice)).toEqual(result);
      await expect.poll(() => state(viewer)).toEqual(result);
      expect(
        (
          await bob.request.post(origin + "/api/bob/delete", {
            data: { group: "work", record: "a" },
          })
        ).status(),
      ).toBe(404);
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
      if (server && server.exitCode === null)
        await new Promise((resolve) => {
          server.once("exit", resolve);
          server.kill();
        });
    }
  });
}
