import { test, expect } from "@playwright/test";

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`CRDT store bindings converge through transports with ${codec}`, async ({
    page,
  }) => {
    await page.goto("/tests/transports.html");
    await page.waitForFunction(() => window.__integration);

    const result = await page.evaluate((codec) => {
      const {
        Client,
        CrdtDocument,
        CrdtSpec,
        Store,
        connectStore,
        decodeMessage,
        encodeMessage,
        fromValue,
        toValue,
      } = window.__integration;
      const encode = (message) =>
        codec === "json"
          ? JSON.stringify(message)
          : encodeMessage(JSON.stringify(message), codec);
      const decode = (frame) =>
        JSON.parse(
          typeof frame === "string" ? frame : decodeMessage(frame, codec),
        );
      const spec = new CrdtSpec({
        kind: "map",
        fields: {
          doc: { kind: "sequence", materialization: "string" },
          title: { kind: "register" },
        },
      });
      const server = new CrdtDocument(
        spec,
        { doc: "a🙂b", title: "Draft" },
        "server",
      );
      const snapshot = encode({
        t: "crdt_snapshot",
        id: 1,
        type: "Document",
        rev: 0,
        value: toValue(server.value),
        spec: spec.toObject(),
        state: server.state,
      });
      const valueCodec = { fromValue, toValue };
      const makePeer = () => {
        const client = new Client(codec);
        const store = new Store();
        const sent = [];
        const link = connectStore(
          store,
          client,
          (frame) => sent.push(frame),
          valueCodec,
        );
        link.receive(snapshot);
        return { client, store, sent, link };
      };
      const alice = makePeer();
      const bob = makePeer();

      alice.store.set("doc", "Xaλb!", {
        unit: "utf16",
        ranges: [
          { from: 0, to: 0, insert: "X" },
          { from: 1, to: 3, insert: "λ" },
          { from: 4, to: 4, insert: "!" },
        ],
      });
      bob.store.set("doc", "Ya🙂b", {
        unit: "utf16",
        ranges: [{ from: 0, to: 0, insert: "Y" }],
      });
      const aliceEdit = decode(alice.sent.shift());
      const bobEdit = decode(bob.sent.shift());
      server.apply(aliceEdit.ops);
      server.apply(bobEdit.ops);

      alice.store.set("title", "Alice title");
      bob.store.set("title", "Bob title");
      const aliceTitle = decode(alice.sent.shift());
      const bobTitle = decode(bob.sent.shift());
      server.apply(aliceTitle.ops);
      server.apply(bobTitle.ops);

      const receive = (peer, message) => peer.link.receive(encode(message));
      receive(alice, { t: "crdt", id: 1, rev: 1, ops: aliceEdit.ops });
      receive(alice, { t: "crdt", id: 1, rev: 2, ops: bobEdit.ops });
      receive(alice, { t: "crdt", id: 1, rev: 3, ops: aliceTitle.ops });
      receive(alice, { t: "crdt", id: 1, rev: 4, ops: bobTitle.ops });
      receive(bob, { t: "crdt", id: 1, rev: 4, ops: bobTitle.ops });
      receive(bob, { t: "crdt", id: 1, rev: 3, ops: aliceTitle.ops });
      receive(bob, { t: "crdt", id: 1, rev: 2, ops: bobEdit.ops });
      receive(bob, { t: "crdt", id: 1, rev: 1, ops: aliceEdit.ops });

      return {
        server: server.value,
        alice: {
          doc: alice.store.get("doc"),
          title: alice.store.get("title"),
          pending: alice.client.pendingCrdtOps(1),
          sent: alice.sent.length,
        },
        bob: {
          doc: bob.store.get("doc"),
          title: bob.store.get("title"),
          pending: bob.client.pendingCrdtOps(1),
          sent: bob.sent.length,
        },
        aliceOperations: aliceEdit.ops.map((operation) => operation.kind),
        bobOperations: bobEdit.ops.map((operation) => operation.kind),
        registerOperations: [aliceTitle.ops[0].kind, bobTitle.ops[0].kind],
      };
    }, codec);

    expect(["XYaλb!", "YXaλb!"]).toContain(result.server.doc);
    expect(["Alice title", "Bob title"]).toContain(result.server.title);
    expect(result.alice).toEqual({
      ...result.server,
      pending: 0,
      sent: 0,
    });
    expect(result.bob).toEqual({ ...result.server, pending: 0, sent: 0 });
    expect(result.aliceOperations).toEqual([
      "sequence_insert",
      "sequence_delete",
      "sequence_insert",
      "sequence_insert",
    ]);
    expect(result.bobOperations).toEqual(["sequence_insert"]);
    expect(result.registerOperations).toEqual(["register_set", "register_set"]);
  });
}

test("a managed CRDT client flushes an offline store edit on reconnect", async ({
  page,
}) => {
  await page.goto("/tests/transports.html");
  await page.waitForFunction(() => window.__integration);

  const result = await page.evaluate(() => {
    const {
      Client,
      CrdtDocument,
      CrdtSpec,
      Store,
      connectStore,
      fromValue,
      toValue,
    } = window.__integration;
    const spec = new CrdtSpec({
      kind: "map",
      fields: { doc: { kind: "sequence", materialization: "string" } },
    });
    const server = new CrdtDocument(spec, { doc: "base" }, "server");
    const snapshot = JSON.stringify({
      t: "crdt_snapshot",
      id: 1,
      type: "Document",
      rev: 0,
      value: toValue(server.value),
      spec: spec.toObject(),
      state: server.state,
    });
    const client = new Client();
    const store = new Store();
    const link = connectStore(store, client, undefined, {
      fromValue,
      toValue,
    });
    link.receive(snapshot);

    store.set("doc", "base🙂", {
      unit: "utf16",
      ranges: [{ from: 4, to: 4, insert: "🙂" }],
    });
    const offline = {
      doc: store.get("doc"),
      pending: client.pendingCrdtOps(1),
    };
    const sent = [];
    client.opened((frame) => sent.push(frame));
    const edit = JSON.parse(sent[0]);
    server.apply(edit.ops);
    link.receive(JSON.stringify({ t: "crdt", id: 1, rev: 1, ops: edit.ops }));

    return {
      offline,
      flushed: sent.length,
      server: server.value,
      store: store.get("doc"),
      pending: client.pendingCrdtOps(1),
    };
  });

  expect(result).toEqual({
    offline: { doc: "base🙂", pending: 1 },
    flushed: 1,
    server: { doc: "base🙂" },
    store: "base🙂",
    pending: 0,
  });
});

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
