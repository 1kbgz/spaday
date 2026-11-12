import { test, expect } from "@playwright/test";
import { widgetKernel } from "./widget-kernel";

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`structural bindings merge through a Python Hub over ${codec}`, async ({
    page,
  }) => {
    const server = await widgetKernel(
      "../spaday/tests/structural_crdt_bridge.py",
      [codec],
    );
    try {
      const { result } = await server.call({ op: "describe" });
      await page.exposeFunction("hubMessage", (request) =>
        server.call(request),
      );
      await page.goto("/tests/runtime.html");
      await page.waitForFunction(() => window.__spaday);
      await page.evaluate(
        async ({ description, codec }) => {
          const transport =
            await import("/node_modules/@1kbgz/transports/dist/esm/index.js");
          await transport.wasm.default({
            module_or_path:
              "/node_modules/@1kbgz/transports/dist/pkg/transports_bg.wasm",
          });
          const { Store, connectStore, mount } = __spaday;
          const views = {};
          const deliver = ({ messages }) => {
            for (const [name, frames] of Object.entries(messages)) {
              for (const frame of frames)
                views[name].client.recv(
                  Array.isArray(frame) ? new Uint8Array(frame) : frame,
                );
            }
          };
          for (const name of ["alice", "bob", "viewer"]) {
            const client = new transport.Client(codec);
            const mutations = [];
            const propose = client.proposeCrdt.bind(client);
            client.proposeCrdt = (id, edits) => {
              mutations.push(...structuredClone(edits));
              return propose(id, edits);
            };
            const store = new Store();
            store.set("unrelated", "keep");
            store.set("board.localUi", "keep");
            const queue = [];
            const send = (wire) =>
              queue.push(typeof wire === "string" ? wire : [...wire]);
            client.attach(send);
            const link = connectStore(
              store,
              client,
              undefined,
              transport,
              "board",
              true,
              description.model,
            );
            const host = document.createElement("section");
            host.id = name;
            document.body.append(host);
            mount(host, description.tree, store);
            views[name] = { client, store, link, queue, send, mutations };
            deliver(await hubMessage({ op: "open", view: name }));
          }
          window.board = { views, deliver, model: description.model };
          window.flushBoard = async (names = Object.keys(views)) => {
            for (const name of names) {
              const view = views[name];
              while (view.queue.length)
                deliver(
                  await hubMessage({
                    op: "receive",
                    view: name,
                    wire: view.queue.shift(),
                  }),
                );
            }
          };
        },
        { description: result, codec },
      );
      await expect(page.locator("#alice #title")).toHaveValue("Shared board");
      await expect(page.locator("#alice #row-a .row-label")).toHaveValue(
        "Draft",
      );
      await page.evaluate(
        () => (window.originalRow = document.querySelector("#alice #row-a")),
      );
      const editRows = async (user, value) => {
        await page.locator(`#${user} #rows`).fill(JSON.stringify(value));
        await page.locator(`#${user} #rows`).dispatchEvent("change");
      };
      await page.locator("#alice #row-a .row-label").fill("Edited");
      await page.locator("#bob #row-a .row-done").check();
      const edits = await page.evaluate(() => [
        ...board.views.alice.mutations,
        ...board.views.bob.mutations,
      ]);
      expect(edits).toHaveLength(2);
      expect(edits.map((edit) => edit.kind)).toEqual([
        "register_set",
        "register_set",
      ]);
      expect(edits.map((edit) => edit.path.map((part) => part.kind))).toEqual([
        ["key", "member", "key"],
        ["key", "member", "key"],
      ]);
      expect(edits.map((edit) => edit.path.at(-1).key)).toEqual([
        "label",
        "done",
      ]);
      await page.locator("#alice #title").fill("Both clients");
      await page.locator("#alice #title").dispatchEvent("change");
      await page.locator("#bob #owner").fill("Bob");
      await page.locator("#bob #owner").dispatchEvent("change");
      await page.evaluate(() => flushBoard());
      const merged = (await server.call({ op: "state" })).result;
      expect(merged.rows.find((row) => row.id === "a")).toEqual({
        id: "a",
        label: "Edited",
        done: true,
      });
      expect(merged.settings).toEqual({ title: "Both clients", owner: "Bob" });
      expect(
        await page.evaluate(
          () => document.querySelector("#alice #row-a") === originalRow,
        ),
      ).toBe(true);
      await expect(page.locator("#viewer #rows")).toHaveValue(
        JSON.stringify(merged.rows),
      );
      await editRows("alice", [merged.rows[0], merged.rows[0]]);
      await expect(page.locator("#alice #rows-error")).toContainText(
        "duplicate",
      );
      await expect(page.locator("#alice #rows")).toHaveValue(
        JSON.stringify(merged.rows),
      );
      await editRows("alice", [...merged.rows].reverse());
      await expect(page.locator("#alice #rows")).toHaveValue(
        JSON.stringify(merged.rows),
      );
      await expect(page.locator("#alice #rows-error")).toHaveText("");
      expect(await page.evaluate(() => board.views.alice.queue.length)).toBe(0);
      await page.locator("#alice #settings").fill("[]");
      await page.locator("#alice #settings").dispatchEvent("change");
      await expect(page.locator("#alice #settings-error")).not.toBeEmpty();
      await expect(page.locator("#alice #settings")).toHaveValue(
        JSON.stringify(merged.settings),
      );
      await page
        .locator("#viewer #settings")
        .fill(JSON.stringify({ ...merged.settings, injected: "reject this" }));
      await page.locator("#viewer #settings").dispatchEvent("change");
      await page.evaluate(() => flushBoard());
      await expect(page.locator("#viewer #settings")).toHaveValue(
        JSON.stringify(merged.settings),
      );
      await page.locator("#viewer #title").fill("Denied title");
      await page.evaluate(() => flushBoard());
      await expect(page.locator("#viewer #title")).toHaveValue("Both clients");
      await expect(page.locator("#viewer #settings-error")).not.toBeEmpty();
      await page.locator("#viewer #title").fill("Retry title");
      await expect(page.locator("#viewer #settings-error")).toBeEmpty();
      await page.evaluate(() => flushBoard());
      await expect(page.locator("#viewer #title")).toHaveValue("Both clients");
      expect(
        await page.evaluate(
          () => typeof board.views.viewer.store.get("$errors.board.settings"),
        ),
      ).toBe("string");
      await page.locator("#viewer #row-a .row-label").fill("Rejected edit");
      await page.evaluate(() => flushBoard());
      await expect(page.locator("#viewer #row-a .row-label")).toHaveValue(
        "Edited",
      );
      await expect(page.locator("#viewer #rows-error")).not.toBeEmpty();
      await expect(page.locator("#alice #rows-error")).toBeEmpty();
      await editRows("viewer", []);
      await page.evaluate(() => flushBoard());
      await expect(page.locator("#viewer #rows")).toHaveValue(
        JSON.stringify(merged.rows),
      );
      await page.evaluate(async () => {
        const view = board.views.alice;
        view.client.detach(view.send);
        await hubMessage({ op: "disconnect", view: "alice" });
      });
      await page.locator("#bob #settings").fill("{}");
      await page.locator("#bob #settings").dispatchEvent("change");
      await page.evaluate(() => flushBoard());
      await expect(page.locator("#viewer #settings")).toHaveValue("{}");
      await editRows("alice", [
        merged.rows[0],
        { id: "c", label: "Offline", done: false },
      ]);
      await page.locator("#alice #row-a .row-label").fill("Offline edit");
      expect(
        await page.evaluate(() =>
          board.views.alice.client.pendingCrdtOps(board.model),
        ),
      ).toBeGreaterThan(0);
      await page.evaluate(async () => {
        board.deliver(await hubMessage({ op: "open", view: "alice" }));
        board.views.alice.client.attach(board.views.alice.send);
        await flushBoard();
      });
      const final = (await server.call({ op: "state" })).result;
      expect(final.rows.map((row) => row.id)).toEqual(["a", "c"]);
      expect(final.rows.find((row) => row.id === "a").label).toBe(
        "Offline edit",
      );
      await expect(page.locator("#bob #row-a .row-label")).toHaveValue(
        "Offline edit",
      );
      await expect(page.locator("#alice #settings")).toHaveValue("{}");
      expect(
        await page.evaluate(() =>
          Object.values(board.views).map(({ store }) => [
            store.get("unrelated"),
            store.get("board.localUi"),
          ]),
        ),
      ).toEqual([
        ["keep", "keep"],
        ["keep", "keep"],
        ["keep", "keep"],
      ]);
      await expect(page.locator("#bob #rows")).toHaveValue(
        JSON.stringify(final.rows),
      );
      expect(
        await page.evaluate(() =>
          board.views.alice.client.pendingCrdtOps(board.model),
        ),
      ).toBe(0);
      await page
        .locator("#alice #row-a .row-label")
        .fill("Concurrent with removal");
      await editRows(
        "bob",
        final.rows.filter((row) => row.id !== "a"),
      );
      await page.evaluate(() => flushBoard(["bob", "alice", "viewer"]));
      expect(
        (await server.call({ op: "state" })).result.rows.map((row) => row.id),
      ).toEqual(["c"]);
      for (const user of ["alice", "bob", "viewer"])
        await expect(page.locator(`#${user} #row-a`)).toHaveCount(0);
      await page.evaluate(() => {
        for (const view of Object.values(board.views)) {
          view.link.dispose();
          view.client.detach(view.send);
        }
      });
    } finally {
      await server.call({ op: "close" });
      server.close();
    }
  });
}
