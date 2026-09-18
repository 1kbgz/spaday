import { test, expect } from "@playwright/test";

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`managed sends abandon edits while disconnected with ${codec}`, async ({
    page,
  }) => {
    await page.goto("/tests/transports.html");
    await page.waitForFunction(() => window.__integration);

    const result = await page.evaluate(async (codec) => {
      const { Client, Store, connectStore, encodeMessage, fromValue, toValue } =
        window.__integration;
      const client = new Client(codec);
      const store = new Store();
      const link = connectStore(store, client, undefined, {
        fromValue,
        toValue,
      });
      const message = JSON.stringify({
        t: "snapshot",
        id: 1,
        type: "Editor",
        rev: 0,
        value: toValue({ doc: "A" }),
      });
      link.receive(codec === "json" ? message : encodeMessage(message, codec));

      store.set("doc", "offline");
      await Promise.resolve();
      return {
        doc: store.get("doc"),
        pending: client.pendingProposals(),
      };
    }, codec);

    expect(result).toEqual({ doc: "A", pending: [] });
  });

  test(`proposal reconciliation uses the transports client with ${codec}`, async ({
    page,
  }) => {
    await page.goto("/tests/transports.html");
    await page.waitForFunction(() => window.__integration);

    const result = await page.evaluate(async (codec) => {
      const {
        Client,
        Store,
        connectStore,
        decodeMessage,
        encodeMessage,
        fromValue,
        toValue,
      } = window.__integration;
      const client = new Client(codec);
      const store = new Store();
      const sent = [];
      const encode = (message) =>
        codec === "json"
          ? JSON.stringify(message)
          : encodeMessage(JSON.stringify(message), codec);
      const decode = (frame) =>
        JSON.parse(
          typeof frame === "string" ? frame : decodeMessage(frame, codec),
        );
      const link = connectStore(
        store,
        client,
        (frame) => sent.push(decode(frame)),
        { fromValue, toValue },
      );

      link.receive(
        encode({
          t: "snapshot",
          id: 1,
          type: "Editor",
          rev: 0,
          value: toValue({ doc: "A", status: "idle", tags: ["a"] }),
        }),
      );
      store.set("doc", "B");
      store.set("doc", "C");
      const [first, second] = sent.map((message) => message.proposal);

      link.receive(
        encode({
          t: "patch",
          id: 1,
          patch: {
            rev: 1,
            ops: [
              {
                Set: {
                  path: [{ Key: "doc" }],
                  value: toValue("B"),
                },
              },
            ],
          },
          proposal: first,
        }),
      );
      const afterOlder = store.get("doc");
      link.receive(
        encode({
          t: "patch",
          id: 1,
          patch: {
            rev: 2,
            ops: [
              {
                Set: {
                  path: [{ Key: "status" }],
                  value: toValue("saving"),
                },
              },
            ],
          },
        }),
      );
      link.receive(
        encode({
          t: "patch",
          id: 1,
          patch: {
            rev: 3,
            ops: [
              {
                Set: {
                  path: [{ Key: "doc" }],
                  value: toValue("C!"),
                },
              },
            ],
          },
          proposal: second,
        }),
      );
      store.set("doc", "D");
      store.set("doc", "C!");
      const third = sent[2];
      const fourth = sent[3];
      link.receive(
        encode({
          t: "reject",
          id: 1,
          rev: 3,
          error: "invalid",
          proposal: third.proposal,
        }),
      );
      const afterReject = store.get("doc");
      link.receive(
        encode({
          t: "ack",
          id: 1,
          rev: 3,
          proposal: fourth.proposal,
        }),
      );
      store.set("tags", ["a", "b"]);
      const listProposal = sent[4].proposal;
      link.receive(
        encode({
          t: "patch",
          id: 1,
          patch: {
            rev: 4,
            ops: [
              {
                Insert: {
                  path: [{ Key: "tags" }],
                  index: 1,
                  value: toValue("b"),
                },
              },
            ],
          },
          proposal: listProposal,
        }),
      );
      link.receive(
        encode({
          t: "batch",
          msgs: [
            {
              t: "patch",
              id: 1,
              patch: {
                rev: 5,
                ops: [
                  {
                    Set: {
                      path: [{ Key: "status" }],
                      value: toValue("done"),
                    },
                  },
                ],
              },
            },
          ],
        }),
      );

      return {
        afterOlder,
        final: store.get("doc"),
        status: store.get("status"),
        tags: store.get("tags"),
        returnOp: fourth.patch.ops[0],
        afterReject,
        pending: client.pendingProposals(),
      };
    }, codec);

    expect(result).toEqual({
      afterOlder: "C",
      final: "C!",
      status: "done",
      tags: ["a", "b"],
      returnOp: {
        Set: { path: [{ Key: "doc" }], value: { Str: "C!" } },
      },
      afterReject: "C!",
      pending: [],
    });
  });

  test(`manual failed sends abandon transports proposals with ${codec}`, async ({
    page,
  }) => {
    await page.goto("/tests/transports.html");
    await page.waitForFunction(() => window.__integration);

    const result = await page.evaluate(async (codec) => {
      const { Client, Store, connectStore, encodeMessage, fromValue, toValue } =
        window.__integration;
      const client = new Client(codec);
      const store = new Store();
      const link = connectStore(store, client, () => false, {
        fromValue,
        toValue,
      });
      const message = JSON.stringify({
        t: "snapshot",
        id: 1,
        type: "Editor",
        rev: 0,
        value: toValue({ doc: "A" }),
      });
      link.receive(codec === "json" ? message : encodeMessage(message, codec));

      store.set("doc", "offline");
      await Promise.resolve();
      return {
        doc: store.get("doc"),
        pending: client.pendingProposals(),
      };
    }, codec);

    expect(result).toEqual({ doc: "A", pending: [] });
  });
}
