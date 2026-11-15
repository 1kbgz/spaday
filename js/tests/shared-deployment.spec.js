import { test, expect } from "@playwright/test";
import { widgetKernel } from "./widget-kernel";

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`shared deployment recovers across worker processes over ${codec}`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const cluster = await widgetKernel(
      "../spaday/tests/shared_deployment_bridge.py",
      [codec],
    );
    const command = async (op, worker) => {
      const result = await cluster.call({ op, worker });
      if (result.error) throw new Error(result.error);
      return result.url;
    };
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);
    const [alice, bob, viewer] = await Promise.all(
      contexts.map((context) => context.newPage()),
    );
    try {
      const a = await command("start", "a");
      const b = await command("start", "b");
      await Promise.all([
        alice.goto(`${a}/alice`),
        bob.goto(`${b}/bob`),
        viewer.goto(`${b}/viewer`),
      ]);
      for (const page of [alice, bob, viewer])
        await expect(page.locator("#title")).toHaveValue("Shared board");
      await Promise.all([
        alice.locator("#title").fill("Alice title"),
        bob.locator("#owner").fill("Bob owner"),
      ]);
      for (const page of [alice, bob, viewer]) {
        await expect(page.locator("#title")).toHaveValue("Alice title");
        await expect(page.locator("#owner")).toHaveValue("Bob owner");
      }
      await alice.locator("#note").fill("Private Alice note");
      await expect(bob.locator("#note")).toHaveValue("");
      await expect(viewer.locator("#note")).toHaveValue("");
      await viewer.locator("#title").evaluate((input) => {
        input.readOnly = false;
      });
      await viewer.locator("#title").fill("Denied");
      await expect(viewer.locator("#title")).toHaveValue("Alice title");
      await expect(viewer.locator("#error")).not.toBeEmpty();

      await contexts[0].setOffline(true);
      await alice.locator("#title").fill("Offline title");
      await bob.locator("#owner").fill("Online owner");
      await contexts[0].setOffline(false);
      await expect(bob.locator("#title")).toHaveValue("Offline title");
      await expect(alice.locator("#owner")).toHaveValue("Online owner");

      // Restart the non-broker worker while browsers reconnect to its original port.
      await command("stop", "b");
      await command("start", "b");
      await expect(bob.locator("#title")).toHaveValue("Offline title");
      await bob.locator("#owner").fill("After restart");
      await expect(alice.locator("#owner")).toHaveValue("After restart");

      // The dedicated broker survives producer-worker loss; another worker takes over.
      await command("stop", "a");
      const before = Number(await bob.locator("#slot").textContent());
      await expect
        .poll(async () => Number(await bob.locator("#slot").textContent()), {
          timeout: 15000,
        })
        .toBeGreaterThan(before);
      await command("stop", "b");
      await command("start", "b");
      await bob.reload();
      await expect(bob.locator("#title")).toHaveValue("Offline title");
      await expect(bob.locator("#owner")).toHaveValue("After restart");
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
      cluster.close();
    }
  });
}
