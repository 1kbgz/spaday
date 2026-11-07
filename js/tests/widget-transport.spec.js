import { test, expect } from "@playwright/test";
import { widgetKernel } from "./widget-kernel";

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`notebook views round-trip models, buffers, validation, and ownership with ${codec}`, async ({
    page,
  }) => {
    const server = await widgetKernel("../spaday/tests/widget_bridge.py", [
      codec,
    ]);
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
            connectedCallback() {
              const detail = { namespace: "status" };
              this.dispatchEvent(
                new CustomEvent("spaday:wire-request", {
                  detail,
                  bubbles: true,
                  composed: true,
                }),
              );
              this.wire = detail.wire;
              const update = () =>
                (this.dataset.owned = String(
                  Boolean(this.wire.store.get("$owned.status.playing")),
                ));
              this.stop = this.wire.store.subscribe(
                "$owned.status.playing",
                update,
              );
              update();
            }
            disconnectedCallback() {
              this.stop?.();
            }
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
      await expect(page.locator("#owner test-sample")).toHaveAttribute(
        "data-owned",
        "true",
      );
      await expect(page.locator("#observer test-sample")).toHaveAttribute(
        "data-owned",
        "false",
      );
      expect(
        await page.evaluate(async () => {
          const owner = notebook.views[0];
          const sample = owner.el.querySelector("test-sample");
          const nested = document.createElement("div");
          owner.el.append(nested);
          const dispose = await __widget.widget.render({
            model: __widget.fakeModel({ _tree: { tag: "span" } }),
            el: nested,
          });
          const detail = { namespace: "status" };
          nested.firstElementChild.dispatchEvent(
            new CustomEvent("spaday:wire-request", {
              detail,
              bubbles: true,
              composed: true,
            }),
          );
          const isolated =
            sample.wire.client === owner.client && detail.wire === undefined;
          dispose();
          nested.remove();
          return isolated;
        }),
      ).toBe(true);
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
        customElements.define(
          "late-player",
          class extends HTMLElement {
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
              this.stop = wire.client.onCommand((command) => {
                if (command.id !== wire.link.modelId) return;
                wire.store.set("status.playing", command.value.Bool);
                wire.client.ackCommand(command);
                this.dataset.applied = "true";
              });
            }
            disconnectedCallback() {
              this.stop?.();
            }
          },
        );
        const shadowHost = document.createElement("div");
        view.el.append(shadowHost);
        shadowHost
          .attachShadow({ mode: "open" })
          .append(document.createElement("late-player"));
      });
      await expect(page.locator("#observer late-player")).toHaveAttribute(
        "data-applied",
        "true",
      );
      await expect(page.locator("#observer test-sample")).toHaveAttribute(
        "data-owned",
        "true",
      );
      await page.evaluate(() => notebook.views[1].dispose());
      expect(
        await page.evaluate(() =>
          notebook.views.map((view) => view.store.get("$owned.status.playing")),
        ),
      ).toEqual([false, false]);
    } finally {
      await server.call({ op: "close" });
      server.close();
    }
  });
}

for (const invalidation of ["ambiguous", "changed-type"]) {
  test(`clears ownership when model selection becomes ${invalidation}`, async ({
    page,
  }) => {
    await page.goto("/tests/widget.html");
    await page.waitForFunction(() => window.__widget);
    const result = await page.evaluate(async (invalidation) => {
      const model = __widget.fakeModel({
        _tree: { tag: "div" },
        _wires: [
          {
            model: "Status",
            namespace: "status",
            codec: "json",
            flatten: true,
            ownership: true,
            update_interval: 0.05,
          },
        ],
      });
      let view;
      model.send = (content) => {
        if (content.ready) view = content.view;
      };
      const el = document.createElement("div");
      document.body.append(el);
      let wire;
      el.addEventListener(
        "spaday:wire-client",
        (event) => (wire = event.detail),
      );
      const dispose = await __widget.widget.render({ model, el });
      const receive = (frame) =>
        model._emit("msg:custom", { view, wire: JSON.stringify(frame) });
      receive({
        t: "snapshot",
        id: 1,
        type: "Status",
        rev: 0,
        value: { Map: { playing: { Bool: false } } },
      });
      receive({
        t: "ownership",
        id: 1,
        fields: ["playing"],
        owned: true,
        epoch: 1,
      });
      const before = wire.store.get("$owned.status.playing");
      receive({
        t: "snapshot",
        id: invalidation === "ambiguous" ? 2 : 1,
        type: invalidation === "ambiguous" ? "Status" : "Other",
        rev: 1,
        value: { Map: { playing: { Bool: false } } },
      });
      const after = {
        owned: wire.store.get("$owned.status.playing"),
        selected: wire.link.modelId,
        error: wire.link.error,
      };
      dispose();
      return { before, after };
    }, invalidation);
    expect(result.before).toBe(true);
    expect(result.after.selected).toBeUndefined();
    expect(result.after.error).toBeTruthy();
    expect(result.after.owned).toBe(false);
  });
}
