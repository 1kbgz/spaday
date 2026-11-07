import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

async function kernel(codec) {
  const child = spawn(process.env.SPADAY_TEST_PYTHON ?? "python", [
    "../spaday/tests/widget_bridge.py",
    codec,
  ]);
  const pending = [];
  let errors = "";
  child.stderr.on("data", (chunk) => {
    errors += chunk;
  });
  createInterface({ input: child.stdout }).on("line", (line) => {
    const next = pending.shift();
    try {
      next?.resolve(JSON.parse(line));
    } catch (e) {
      next?.reject(e);
    }
  });
  child.on("exit", () => {
    for (const call of pending.splice(0))
      call.reject(new Error(errors || "Kernel exited"));
  });
  return {
    call(request) {
      return new Promise((resolve, reject) => {
        pending.push({ resolve, reject });
        child.stdin.write(JSON.stringify(request) + "\n");
      });
    },
    close() {
      child.stdin.end();
    },
  };
}

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`notebook views round-trip models, buffers, validation, and ownership with ${codec}`, async ({
    page,
  }) => {
    const server = await kernel(codec);
    try {
      const { result: description } = await server.call({ op: "describe" });
      await page.exposeFunction("kernelMessage", (request) =>
        server.call(request),
      );
      await page.goto("/tests/widget.html");
      await page.waitForFunction(() => window.__widget);
      await page.evaluate(async (description) => {
        customElements.define(
          "test-sample",
          class extends HTMLElement {
            data = null;
          },
        );
        const { widget, fakeModel } = window.__widget;
        const model = fakeModel(description);
        const captured = [];
        let queue = Promise.resolve();
        const deliver = (response) => {
          captured.push(...response.messages);
          for (const { content, buffers } of response.messages)
            model._emit(
              "msg:custom",
              content,
              buffers.map((bytes) => new Uint8Array(bytes)),
            );
        };
        model.send = (content, _, buffers = []) => {
          queue = queue
            .then(() =>
              window.kernelMessage({
                op: "receive",
                content,
                buffers: buffers.map((b) =>
                  Array.from(
                    new Uint8Array(b.buffer, b.byteOffset, b.byteLength),
                  ),
                ),
              }),
            )
            .then(deliver);
        };
        const views = [];
        for (const id of ["owner", "observer"]) {
          const el = document.createElement("div");
          el.id = id;
          document.body.appendChild(el);
          const view = { el, commands: [], links: [] };
          el.addEventListener("spaday:wire-client", ({ detail }) => {
            view.client = detail.client;
            view.store = detail.store;
            view.links.push(detail.link);
            if (detail.namespace === "status")
              detail.client.onCommand((command) => view.commands.push(command));
          });
          view.dispose = await widget.render({ model, el });
          views.push(view);
        }
        window.notebook = { model, views, captured, deliver, description };
      }, description);
      await expect(page.locator("#owner #bpm")).toHaveValue("120");
      await expect(page.locator("#observer #bpm")).toHaveValue("120");
      await expect
        .poll(() =>
          page.evaluate(() => notebook.views.map((v) => v.commands.length)),
        )
        .toEqual([1, 0]);
      expect(
        await page.evaluate(() =>
          notebook.views.map((v) =>
            v.client.owns(notebook.description.status_id, "playing"),
          ),
        ),
      ).toEqual([true, false]);
      expect(
        await page.evaluate(() => [
          ...document.querySelector("#owner test-sample").data,
        ]),
      ).toEqual([112, 99, 109]);
      expect(
        await page.evaluate(() =>
          notebook.captured.some((m) => m.buffers.length),
        ),
      ).toBe(true);

      await page.locator("#owner #bpm").fill("144");
      await page.locator("#owner #bpm").dispatchEvent("change");
      await expect(page.locator("#observer #bpm")).toHaveValue("144");
      expect((await server.call({ op: "state" })).result.bpm).toBe(144);
      await page.locator("#owner #bpm").fill("-1");
      await page.locator("#owner #bpm").dispatchEvent("change");
      await expect(page.locator("#owner #bpm")).toHaveValue("144");
      expect((await server.call({ op: "state" })).result.bpm).toBe(144);

      await page.locator("#owner #reset").click();
      await expect(page.locator("#observer #bpm")).toHaveValue("120");
      expect((await server.call({ op: "state" })).result.bpm).toBe(120);

      const immediate = await page.evaluate(() => {
        document.querySelector("#owner #play").click();
        return document.querySelector("#owner #playing").textContent;
      });
      expect(immediate).toBe("true");
      await expect(page.locator("#observer #playing")).toHaveText("true");
      expect((await server.call({ op: "state" })).result.playing).toBe(true);

      await page.evaluate(
        (response) => notebook.deliver(response),
        await server.call({ op: "mutate", sample: [0, 255, 42] }),
      );
      expect(
        await page.evaluate(() =>
          notebook.views.map((v) => [
            ...v.el.querySelector("test-sample").data,
          ]),
        ),
      ).toEqual([
        [0, 255, 42],
        [0, 255, 42],
      ]);
      await page.evaluate(() =>
        notebook.views[0].store.set("config.sample", new Uint8Array([9, 8])),
      );
      await expect
        .poll(async () => (await server.call({ op: "state" })).result.sample)
        .toEqual([9, 8]);

      await page.evaluate(() => notebook.views[0].dispose());
      await expect
        .poll(() => page.evaluate(() => notebook.views[1].commands.length))
        .toBe(1);
      expect(
        await page.evaluate(() =>
          notebook.views.map((v) =>
            v.client.owns(notebook.description.status_id, "playing"),
          ),
        ),
      ).toEqual([false, true]);
      await page.evaluate(() => {
        const view = notebook.views[1];
        view.store.set("status.playing", true);
        view.client.ackCommand(view.commands[0]);
      });
      await page.evaluate(() => notebook.views[1].dispose());
    } finally {
      await server.call({ op: "close" });
      server.close();
    }
  });
}
