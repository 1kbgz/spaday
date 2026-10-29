import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

for (const layout of ["source", "installed"]) {
  for (const lifecycle of ["plain", "managed"]) {
    test(`immutable gzip assets: ${layout}, ${lifecycle}`, async ({ page }) => {
      const child = spawn(
        process.env.PYTHON || "python",
        ["-m", "spaday.tests.asset_server", layout, lifecycle],
        { cwd: fileURLToPath(new URL("../..", import.meta.url)) },
      );
      let output = "";
      let error = "";
      child.stdout.on("data", (chunk) => (output += chunk));
      child.stderr.on("data", (chunk) => (error += chunk));
      try {
        await expect
          .poll(() => {
            if (child.exitCode !== null) throw new Error(error);
            return output.trim();
          })
          .toMatch(/^http:/);
        const url = output.trim();
        const errors = [];
        const assets = [];
        page.on("pageerror", (err) => errors.push(err.message));
        page.on("response", (response) => {
          if (response.url().includes("/_v/")) assets.push(response);
        });
        await page.goto(url);
        await expect(page.locator("asset-probe")).toHaveText("Peer loaded");
        await expect(page.locator("span")).toHaveText("Wire connected");
        await expect(page.locator("asset-probe")).toHaveCSS(
          "color",
          "rgb(12, 34, 56)",
        );
        const wasm = assets.filter((r) => r.url().endsWith(".wasm"));
        expect(wasm).toHaveLength(2);
        for (const response of wasm) {
          expect(response.status()).toBe(200);
          expect(response.headers()["content-encoding"]).toBe("gzip");
          expect(response.headers()["cache-control"]).toContain("immutable");
        }
        expect(assets.some((r) => r.url().endsWith("/pkg/helper.js"))).toBe(
          true,
        );
        expect(assets.some((r) => r.url().endsWith("/pkg/theme.css"))).toBe(
          true,
        );
        await page.goto(`${url}?second`);
        await expect(page.locator("asset-probe")).toHaveText("Peer loaded");
        await expect(page.locator("span")).toHaveText("Wire connected");
        const cached = await page.evaluate(() =>
          performance
            .getEntriesByType("resource")
            .filter((r) => r.name.includes("/_v/"))
            .map((r) => ({ name: r.name, bytes: r.transferSize })),
        );
        expect(cached.length).toBeGreaterThan(4);
        expect(cached.filter((r) => r.bytes !== 0)).toEqual([]);
        expect(errors).toEqual([]);
      } finally {
        if (child.exitCode === null) {
          const exited = once(child, "exit");
          child.kill("SIGTERM");
          await exited;
        }
      }
    });
  }
}
