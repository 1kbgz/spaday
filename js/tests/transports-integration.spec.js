import { test, expect } from "@playwright/test";

test("bundled transports supports ephemeral awareness", async ({ page }) => {
  await page.goto("/tests/transports.html");
  await page.waitForFunction(() => window.__integration);

  const result = await page.evaluate(() => {
    const { Client } = window.__integration;
    const client = new Client();
    const sent = [];
    const updates = [];
    client.attach((frame) => sent.push(JSON.parse(frame)));
    client.onAwareness((update) => updates.push(update));

    const published = client.setAwareness(7, {
      selection: { anchor: 2, head: 4 },
    });
    client.recv(
      JSON.stringify({
        t: "awareness",
        id: 7,
        peer: "remote",
        state: { selection: { anchor: 5, head: 5 } },
      }),
    );

    return {
      published,
      sent,
      updates,
      tracked: client.awareness(7).get("remote"),
    };
  });

  expect(result).toEqual({
    published: true,
    sent: [
      {
        t: "awareness",
        id: 7,
        state: { selection: { anchor: 2, head: 4 } },
      },
    ],
    updates: [
      {
        t: "awareness",
        id: 7,
        peer: "remote",
        state: { selection: { anchor: 5, head: 5 } },
      },
    ],
    tracked: { selection: { anchor: 5, head: 5 } },
  });
});

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
          undefined,
          true,
          "Document",
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
    client.attach((frame) => sent.push(frame));
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

test("selected links share a client, route edits, and reject ambiguous types", async ({
  page,
}) => {
  await page.goto("/tests/transports.html");
  await page.waitForFunction(() => window.__integration);
  const result = await page.evaluate(() => {
    const { Client, Store, connectStore, toValue, fromValue } =
      window.__integration;
    const client = new Client();
    const store = new Store();
    const sent = [];
    const send = (frame) => {
      sent.push(JSON.parse(frame));
      return true;
    };
    const a = connectStore(
      store,
      client,
      send,
      { toValue, fromValue },
      "a",
      true,
      7,
    );
    const b = connectStore(
      store,
      client,
      send,
      { toValue, fromValue },
      "b",
      true,
      "Orders",
    );
    const snapshot = (id, type, count) =>
      client.recv(
        JSON.stringify({
          t: "snapshot",
          id,
          type,
          rev: 0,
          value: toValue({ count }),
        }),
      );
    snapshot(9, "Orders", 20);
    snapshot(7, "Counter", 10);
    const initial = [
      a.modelId,
      b.modelId,
      store.get("a.count"),
      store.get("b.count"),
    ];
    store.set("b.count", 21);
    store.set("a.count", 11);
    const late = connectStore(
      store,
      client,
      send,
      { toValue, fromValue },
      "late",
      true,
      9,
    );
    const lateValue = store.get("late.count");
    const named = connectStore(
      store,
      client,
      send,
      { toValue, fromValue },
      "named",
      true,
      "Counter",
    );
    const missing = connectStore(
      store,
      client,
      send,
      { toValue, fromValue },
      "missing",
      true,
      999,
    );
    store.set("missing.count", 5);
    late.dispose();
    store.set("late.count", 99);
    const errors = [];
    document.addEventListener("spaday:wire-error", (event) =>
      errors.push(event.detail),
    );
    snapshot(11, "Orders", 30);
    store.set("b.count", 200);
    store.set("a.count", 12);
    snapshot(7, "Renamed", 12);
    store.set("named.count", 99);
    return {
      changedType: named.error,
      missing: missing.modelId === undefined,
      initial,
      lateValue,
      ids: sent.map((msg) => msg.id),
      error: b.error,
      disabled: b.modelId === undefined,
      errors: errors.length,
      a: store.get("a.count"),
    };
  });
  expect(result.initial).toEqual([7, 9, 10, 20]);
  expect(result.lateValue).toBe(20);
  expect(result.ids).toEqual([9, 7, 7]);
  expect(result.error).toContain("Ambiguous model type");
  expect(result.disabled).toBe(true);
  expect(result.errors).toBe(2);
  expect(result.changedType).toContain("no longer has type");
  expect(result.missing).toBe(true);
  expect(result.a).toBe(12);
});

test("owner bindings are immediate, coalesced, and never leave optimistic proposals", async ({
  page,
}) => {
  await page.goto("/tests/transports.html");
  await page.waitForFunction(() => window.__integration);
  const result = await page.evaluate(async () => {
    const { Client, Store, connectStore, toValue, fromValue } =
      window.__integration;
    const client = new Client("json", { updateInterval: 0.01 });
    const store = new Store();
    const sent = [];
    client.attach((frame) => sent.push(JSON.parse(frame)));
    const link = connectStore(store, client, undefined, { fromValue, toValue });
    client.recv(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        type: "Playback",
        rev: 0,
        value: toValue({
          playing: false,
          clock: { beat: 0 },
          sample: null,
          bpm: 120,
        }),
      }),
    );
    client.recv(
      JSON.stringify({
        t: "ownership",
        id: 1,
        fields: ["playing", "clock"],
        owned: true,
        epoch: 1,
      }),
    );
    store.set("playing", true);
    store.set("clock.beat", 7);
    const immediate = fromValue(client.value(1));
    const beforeSend = sent.length;
    await new Promise((resolve) => setTimeout(resolve, 30));
    const outbound = sent.slice();
    client.recv(
      JSON.stringify({ t: "owned_ack", id: 1, epoch: 1, sequence: 2, rev: 1 }),
    );
    client.recv(
      JSON.stringify({
        t: "ownership",
        id: 1,
        fields: ["playing", "clock"],
        owned: false,
        epoch: 2,
      }),
    );
    client.recv(
      JSON.stringify({
        t: "patch",
        id: 1,
        patch: {
          rev: 2,
          ops: [
            { Set: { path: [{ Key: "playing" }], value: { Bool: false } } },
          ],
        },
      }),
    );
    const afterHandover = store.get("playing");
    const pending = client.pendingProposals();
    link.dispose();
    return { immediate, beforeSend, outbound, afterHandover, pending };
  });
  expect(result.immediate.playing).toBe(true);
  expect(result.immediate.clock.beat).toBe(7);
  expect(result.beforeSend).toBe(0);
  expect(result.outbound).toHaveLength(1);
  expect(result.outbound[0].t).toBe("owned");
  expect(result.outbound[0].patch.ops).toHaveLength(2);
  expect(result.afterHandover).toBe(false);
  expect(result.pending).toEqual([]);
});

test("binary fields stay atomic when flattening a model", async ({ page }) => {
  await page.goto("/tests/transports.html");
  await page.waitForFunction(() => window.__integration);
  const result = await page.evaluate(() => {
    const { Client, Store, connectStore, toValue, fromValue, encodeMessage } =
      window.__integration;
    const client = new Client("msgpack");
    const store = new Store();
    const link = connectStore(store, client, () => {}, { fromValue, toValue });
    const message = JSON.stringify({
      t: "snapshot",
      id: 1,
      type: "Sample",
      rev: 0,
      value: { Map: { sample: { Bytes: "AP8=" } } },
    });
    link.receive(encodeMessage(message, "msgpack"));
    const bytes = store.get("sample");
    const result = {
      typed: bytes instanceof Uint8Array,
      bytes: Array.from(bytes),
      dotted: store.has("sample.0"),
    };
    link.dispose();
    return result;
  });
  expect(result.typed).toBe(true);
  expect(result.bytes).toEqual([0, 255]);
});

for (const codec of ["json", "msgpack", "cbor"]) {
  test(`awareness bindings compose and dispose over ${codec}`, async ({
    page,
  }) => {
    await page.goto("/tests/transports.html");
    await page.waitForFunction(() => window.__integration);
    const result = await page.evaluate((codec) => {
      const {
        Client,
        Store,
        connectStore,
        connectAwareness,
        fromValue,
        toValue,
      } = __integration;
      const client = new Client(codec),
        store = new Store({ cursor: { anchor: 2 }, row: "a" });
      const link = connectStore(
        store,
        client,
        undefined,
        { fromValue, toValue },
        "doc",
        true,
        7,
      );
      const sent = [];
      const sender = (frame) => sent.push(frame);
      client.attach(sender);
      client.recv(
        client.encode({
          t: "snapshot",
          id: 7,
          type: "Doc",
          rev: 0,
          value: toValue({ text: "hello" }),
        }),
      );
      const editor = connectAwareness(store, client, link, {
        editor: { local: "cursor", peers: "cursors" },
      });
      const table = connectAwareness(store, client, link, {
        table: { local: "row", peers: "rows" },
      });
      const receive = (scope, state) =>
        client.recv(
          client.encode({
            t: "scoped_awareness",
            id: 7,
            peer: "bob",
            scope,
            state,
          }),
        );
      receive("editor", { anchor: 4 });
      receive("table", "b");
      const initial = [store.get("cursors"), store.get("rows")];
      editor();
      editor();
      receive("editor", { anchor: 5 });
      receive("table", "c");
      const disposed = [store.get("cursors"), store.get("rows")];
      client.detach(sender);
      const disconnected = store.get("rows");
      const resent = [];
      const replacement = (frame) => resent.push(frame);
      store.set("row", "d");
      client.attach(replacement);
      const decode = (frame) =>
        JSON.parse(
          typeof frame === "string"
            ? frame
            : __integration.decodeMessage(frame, codec),
        );
      const replayed = resent.map(decode);
      window.dispatchEvent(
        new PageTransitionEvent("pagehide", { persisted: true }),
      );
      store.set("row", "e");
      client.detach(replacement);
      resent.length = 0;
      client.attach(replacement);
      const hiddenReplay = resent.length;
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
      const restored = resent.map(decode);
      table();
      link.dispose();
      return {
        initial,
        disposed,
        disconnected,
        replayed,
        hiddenReplay,
        restored,
      };
    }, codec);
    expect(result.initial).toEqual([
      [{ peer: "bob", state: { anchor: 4 } }],
      [{ peer: "bob", state: "b" }],
    ]);
    expect(result.disposed).toEqual([[], [{ peer: "bob", state: "c" }]]);
    expect(result.disconnected).toEqual([]);
    expect(result.replayed).toEqual([
      { t: "scoped_awareness", id: 7, scope: "table", state: "d" },
    ]);
    expect(result.hiddenReplay).toBe(0);
    expect(result.restored).toEqual([
      { t: "scoped_awareness", id: 7, scope: "table", state: "e" },
    ]);
  });
}
