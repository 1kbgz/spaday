import { spawn } from "node:child_process";
import { test, expect, chromium } from "@playwright/test";

async function startServer(codec) {
  let server;
  const origin = await new Promise((resolve, reject) => {
    server = spawn(
      process.env.SPADAY_TEST_PYTHON ?? "python",
      [
        "-u",
        "-c",
        `
import socket, uvicorn
from spaday.examples.awareness import create_app
sock=socket.socket()
sock.bind(("127.0.0.1",0))
print(f"http://127.0.0.1:{sock.getsockname()[1]}",flush=True)
uvicorn.Server(uvicorn.Config(create_app(codec="${codec}"),log_level="error")).run(sockets=[sock])
`,
      ],
      { cwd: "..", stdio: ["ignore", "pipe", "pipe"] },
    );
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`Server exited: ${code}`)));
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
  return { origin, server };
}

async function stopServer(server) {
  if (server && server.exitCode === null)
    await new Promise((resolve) => {
      server.once("exit", resolve);
      server.kill();
    });
}

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`editor and table share one connection over ${codec}`, async ({
    browser,
  }) => {
    let server;
    const contexts = [];
    try {
      const running = await startServer(codec);
      server = running.server;
      const { origin } = running;
      const pages = [],
        errors = [];
      for (const path of ["/", "/bob", "/viewer"]) {
        const context = await browser.newContext();
        contexts.push(context);
        const page = await context.newPage();
        pages.push(page);
        page.on("pageerror", (e) => errors.push(String(e)));
        await page.addInitScript(() => {
          const Socket = WebSocket;
          window.socketCount = 0;
          window.WebSocket = class extends Socket {
            constructor(...args) {
              super(...args);
              socketCount++;
            }
          };
        });
        await page.goto(origin + path);
        await expect
          .poll(() => page.locator("#editor").evaluate((el) => el.doc))
          .toBe("Shared notes\n");
      }
      const [alice, bob, viewer] = pages;
      await expect(bob.locator("#cursors")).toContainText("alice at 0");
      await alice.getByRole("cell", { name: "draft", exact: true }).click();
      await expect(bob.locator("#rows")).toContainText("alice selected draft");
      await alice.locator("#editor .cm-content").click();
      await alice.keyboard.insertText("Alice edit");
      await expect
        .poll(() => bob.locator("#editor").evaluate((el) => el.doc))
        .toContain("Alice edit");
      await expect(bob.locator("#rows")).toContainText("alice selected draft");
      await viewer.getByRole("cell", { name: "review", exact: true }).click();
      await expect(bob.locator("#rows")).toContainText(
        "viewer selected review",
      );
      for (const page of pages)
        expect(await page.evaluate(() => socketCount)).toBe(1);
      await contexts[0].close();
      await expect(bob.locator("#rows")).not.toContainText("alice");
      await expect(bob.locator("#cursors")).not.toContainText("alice");
      await expect(bob.locator("#rows")).toContainText(
        "viewer selected review",
      );
      expect(errors).toEqual([]);
    } finally {
      await Promise.allSettled(contexts.map((c) => c.close()));
      await stopServer(server);
    }
  });
}

test("awareness resumes after a real back/forward-cache restoration", async () => {
  // The default headless shell disables BFCache; use full Chromium with it enabled.
  const browser = await chromium.launch({
    channel: "chromium",
    ignoreDefaultArgs: ["--disable-back-forward-cache"],
  });
  let server;
  try {
    const running = await startServer("json");
    server = running.server;
    const { origin } = running;
    const bob = await browser.newPage();
    const alice = await browser.newPage();
    await alice.addInitScript(() => {
      window.pageShows = [];
      window.addEventListener("pageshow", (event) =>
        window.pageShows.push(event.persisted),
      );
    });
    await bob.goto(origin + "/bob");
    await alice.goto(origin);
    await expect(bob.locator("#cursors")).toContainText("alice at 0");
    await alice.getByRole("cell", { name: "draft", exact: true }).click();
    await expect(bob.locator("#rows")).toHaveText("alice selected draft");
    await alice.evaluate(() => {
      window.retainedPage = "alice";
    });
    await alice.getByRole("link", { name: "viewer", exact: true }).click();
    await expect(bob.locator("#cursors")).toHaveText("viewer at 0");
    await expect(bob.locator("#rows")).toHaveText("");
    await bob.locator("#editor .cm-content").click();
    await bob.keyboard.insertText("While Alice was away");
    await alice.goBack({ waitUntil: "commit" });
    await expect
      .poll(() => alice.evaluate(() => window.pageShows))
      .toEqual([false, true]);
    expect(await alice.evaluate(() => window.retainedPage)).toBe("alice");
    await expect(bob.locator("#cursors li")).toHaveCount(1);
    await expect(bob.locator("#cursors")).toContainText("alice at ");
    await expect(bob.locator("#rows")).toHaveText("alice selected draft");
    await expect
      .poll(() => alice.locator("#editor").evaluate((el) => el.doc))
      .toContain("While Alice was away");
    await alice.getByRole("cell", { name: "review", exact: true }).click();
    await expect(bob.locator("#rows")).toHaveText("alice selected review");
    await alice.goForward({ waitUntil: "commit" });
    await expect
      .poll(() => alice.evaluate(() => window.pageShows))
      .toEqual([false, true]);
    await expect(bob.locator("#cursors li")).toHaveCount(1);
    await expect(bob.locator("#cursors")).toContainText("viewer at ");
    await expect(bob.locator("#rows")).toHaveText("");
  } finally {
    await browser.close();
    await stopServer(server);
  }
});
