import { test, expect } from "@playwright/test";

// The spaday ↔ transports seam (connectStore): bind a Store to a transports model through a fake Client
// (recv/onChange/ids/value/edit) with an identity codec. This exercises spaday's adapter — the mapping
// of model fields ↔ store fields ↔ bound props, and the echo guard — without transports itself, which
// is exactly the point: the adapter's whole view of the wire is the ModelClient interface.

// In-page: a transports-Client-shaped fake holding a plain model (recv merges an inbound frame, value
// returns it, edit records the outbound frame), plus an identity codec since the fake stores plain JS.
const FAKE = () => {
  const client = {
    model: {},
    sent: [],
    recv(d) {
      Object.assign(this.model, JSON.parse(d));
    },
    ids() {
      return Object.keys(this.model).length ? [1] : [];
    },
    value() {
      return this.model;
    },
    edit(_id, v) {
      const frame = JSON.stringify(v);
      this.sent.push(frame);
      return frame;
    },
  };
  return { client, codec: { fromValue: (v) => v, toValue: (v) => v } };
};

const PATCH_FAKE = () => {
  const client = {
    model: {},
    valueCalls: 0,
    recv(data) {
      const change = JSON.parse(data);
      if (change.t === "snapshot") this.model = change.value;
      return change;
    },
    ids() {
      return [1];
    },
    value() {
      this.valueCalls += 1;
      return this.model;
    },
    edit(_id, value) {
      return JSON.stringify(value);
    },
  };
  const codec = {
    fromCalls: 0,
    fromValue(value) {
      this.fromCalls += 1;
      return value;
    },
    toValue: (value) => value,
  };
  return { client, codec };
};

const LISTENER_FAKE = () => {
  const listeners = [];
  const client = {
    model: {},
    valueCalls: 0,
    recv(data) {
      const change = JSON.parse(data);
      if (change.t === "snapshot") this.model = change.value;
      if (change.t !== "snapshot" && change.t !== "patch") return undefined;
      if (change.stale) return undefined;
      for (const listener of [...listeners]) listener(change);
      return change;
    },
    onChange(listener) {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    },
    emit(change) {
      for (const listener of [...listeners]) listener(change);
    },
    ids() {
      return [1];
    },
    value() {
      this.valueCalls += 1;
      return this.model;
    },
    edit(_id, value) {
      return JSON.stringify(value);
    },
  };
  const codec = {
    fromCalls: 0,
    fromValue(value) {
      this.fromCalls += 1;
      return value;
    },
    toValue: (value) => value,
  };
  return { client, codec };
};

const PROPOSAL_FAKE = () => {
  const changes = [];
  const acks = [];
  const rejects = [];
  const abandons = [];
  const client = {
    model: {},
    sent: [],
    abandoned: [],
    recv(data) {
      const message = JSON.parse(data);
      if (message.t !== "snapshot") return undefined;
      this.model = message.value;
      const change = { t: "snapshot", id: message.id };
      for (const listener of [...changes]) listener(change);
      return change;
    },
    onChange(listener) {
      changes.push(listener);
      return () => changes.splice(changes.indexOf(listener), 1);
    },
    onAck(listener) {
      acks.push(listener);
      return () => acks.splice(acks.indexOf(listener), 1);
    },
    onReject(listener) {
      rejects.push(listener);
      return () => rejects.splice(rejects.indexOf(listener), 1);
    },
    onAbandon(listener) {
      abandons.push(listener);
      return () => abandons.splice(abandons.indexOf(listener), 1);
    },
    ids() {
      return [1];
    },
    value() {
      return this.model;
    },
    edit() {
      throw new Error("proposal-aware clients use editOps");
    },
    editOps(id, ops, proposal) {
      const frame = JSON.stringify({
        t: "patch",
        id,
        patch: { rev: 0, ops },
        proposal,
      });
      this.sent.push(JSON.parse(frame));
      return frame;
    },
    proposeOps(id, ops, proposal) {
      this.editOps(id, ops, proposal);
      return true;
    },
    abandonProposal(proposal) {
      this.abandoned.push(proposal);
      return true;
    },
    accept(proposal, field, value) {
      this.model = { ...this.model, [field]: value };
      const change = {
        t: "patch",
        id: 1,
        patch: {
          rev: 1,
          ops: [{ Set: { path: [{ Key: field }], value } }],
        },
        proposal,
      };
      for (const listener of [...changes]) listener(change);
      for (const listener of [...acks]) listener(change);
    },
    acceptOps(proposal, value, ops) {
      this.model = value;
      const change = {
        t: "patch",
        id: 1,
        patch: { rev: 1, ops },
        proposal,
      };
      for (const listener of [...changes]) listener(change);
      for (const listener of [...acks]) listener(change);
    },
    ack(proposal) {
      for (const listener of [...acks])
        listener({ t: "ack", id: 1, rev: 1, proposal });
    },
    remote(field, value) {
      this.model = { ...this.model, [field]: value };
      const change = {
        t: "patch",
        id: 1,
        patch: {
          rev: 1,
          ops: [{ Set: { path: [{ Key: field }], value } }],
        },
      };
      for (const listener of [...changes]) listener(change);
    },
    remoteNested(parent, child, value) {
      this.model = {
        ...this.model,
        [parent]: { ...this.model[parent], [child]: value },
      };
      const change = {
        t: "patch",
        id: 1,
        patch: {
          rev: 1,
          ops: [
            {
              Set: {
                path: [{ Key: parent }, { Key: child }],
                value,
              },
            },
          ],
        },
      };
      for (const listener of [...changes]) listener(change);
    },
    reject(proposal) {
      for (const listener of [...rejects])
        listener({ t: "reject", id: 1, rev: 0, error: "invalid", proposal });
    },
    abandon(proposals) {
      for (const listener of [...abandons]) listener(proposals);
    },
  };
  return { client, codec: { fromValue: (v) => v, toValue: (v) => v } };
};

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("inbound: a received model field flows to a bound prop", async ({
  page,
}) => {
  const text = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: { textContent: { field: "label", mode: "one-way" } },
      },
      store,
    );
    const link = connectStore(store, client, () => {}, codec);
    link.receive(JSON.stringify({ label: "hello" })); // server pushes the model
    return root.textContent;
  }, FAKE.toString());
  expect(text).toBe("hello");
});

test("outbound: a two-way control change is sent as a server-authoritative edit", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const input = mount(
      document.createElement("div"),
      {
        tag: "input",
        props: { type: { Str: "checkbox" } },
        bindings: { checked: { field: "on", mode: "two-way" } },
      },
      store,
    );
    const link = connectStore(store, client, (f) => client.sent.push(f), codec);
    link.receive(JSON.stringify({ on: false })); // seed + wire
    input.checked = true;
    input.dispatchEvent(new Event("change")); // two-way: control → field → edit
    return {
      sent: client.sent.map((f) => JSON.parse(f)),
      modelStillFalse: client.model.on,
    };
  }, FAKE.toString());
  expect(result.sent).toContainEqual({ on: true }); // the control's change went out as an edit
  expect(result.modelStillFalse).toBe(false); // edits are server-authoritative: model unchanged until echo
});

test("an older accepted edit cannot overwrite newer local input", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));
    const observed = [];
    store.subscribe("doc", (value) => observed.push(value));

    store.set("doc", "B");
    store.set("doc", "C");
    const [first, second] = client.sent.map((message) => message.proposal);
    client.accept(first, "doc", "B");
    const afterOlder = store.get("doc");
    client.remote("status", "saved");
    const afterRemote = store.get("doc");
    client.accept(second, "doc", "C!");

    return {
      afterOlder,
      afterRemote,
      final: store.get("doc"),
      status: store.get("status"),
      observed,
    };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({
    afterOlder: "C",
    afterRemote: "C",
    final: "C!",
    status: "saved",
    observed: ["B", "C", "C!"],
  });
});

test("returning to the confirmed value sends an explicit Set proposal", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("doc", "B");
    store.set("doc", "A");
    const [first, second] = client.sent;
    client.accept(first.proposal, "doc", "B");
    const afterOlder = store.get("doc");
    client.accept(second.proposal, "doc", "A");

    return {
      secondOp: second.patch.ops[0],
      afterOlder,
      final: store.get("doc"),
    };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({
    secondOp: { Set: { path: [{ Key: "doc" }], value: "A" } },
    afterOlder: "A",
    final: "A",
  });
});

test("rejected and abandoned proposals restore only unshadowed input", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));
    const rejections = [];
    const onReject = (event) => rejections.push(event.detail);
    document.addEventListener("spaday:reject", onReject);

    store.set("doc", "B");
    store.set("doc", "C");
    const [first, second] = client.sent.map((message) => message.proposal);
    client.reject(first);
    const afterOlderReject = store.get("doc");
    const errorAfterOlderReject = store.get("$errors.doc");
    client.reject(second);
    const afterLatestReject = store.get("doc");
    const errorAfterLatestReject = store.get("$errors.doc");

    store.set("doc", "D");
    const errorAfterNewEdit = store.get("$errors.doc");
    const third = client.sent[2].proposal;
    client.abandon([third]);
    document.removeEventListener("spaday:reject", onReject);

    return {
      afterOlderReject,
      errorAfterOlderReject,
      afterLatestReject,
      errorAfterLatestReject,
      errorAfterNewEdit,
      afterAbandon: store.get("doc"),
      rejections: rejections.map((rejection) => ({
        ...rejection,
        proposal: rejection.proposal === first ? "first" : "second",
      })),
    };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({
    afterOlderReject: "C",
    errorAfterOlderReject: "",
    afterLatestReject: "A",
    errorAfterLatestReject: "invalid",
    errorAfterNewEdit: "",
    afterAbandon: "A",
    rejections: [
      {
        id: 1,
        model: undefined,
        field: "doc",
        error: "invalid",
        proposal: "first",
        rev: 0,
      },
      {
        id: 1,
        model: undefined,
        field: "doc",
        error: "invalid",
        proposal: "second",
        rev: 0,
      },
    ],
  });
});

test("disconnect and failed sends discard optimistic input", async ({
  page,
}) => {
  const result = await page.evaluate(async (makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    let canSend = false;
    const link = connectStore(store, client, () => canSend, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));
    const observed = [];
    store.subscribe("doc", (value) => observed.push([value, store.get("doc")]));

    store.set("doc", "dropped");
    await Promise.resolve();
    const afterDroppedSend = store.get("doc");
    const afterDroppedNotifications = observed.slice();
    canSend = true;
    store.set("doc", "pending");
    link.disconnect();
    store.set("doc", "after-close");
    await Promise.resolve();

    return {
      afterDroppedSend,
      afterDroppedNotifications,
      afterDisconnect: store.get("doc"),
      proposals: client.sent.length,
      abandoned: client.abandoned.length,
    };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({
    afterDroppedSend: "A",
    afterDroppedNotifications: [
      ["dropped", "dropped"],
      ["A", "A"],
    ],
    afterDisconnect: "A",
    proposals: 2,
    abandoned: 2,
  });
});

test("a replacement snapshot abandons proposals from a lost send", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => undefined, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("doc", "lost");
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "C" } }));
    return {
      doc: store.get("doc"),
      abandoned: client.abandoned,
      proposals: client.sent.length,
    };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({
    doc: "C",
    abandoned: [expect.any(String)],
    proposals: 1,
  });
});

test("dispose abandons proposals owned by the store link", async ({ page }) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("doc", "B");
    link.dispose();
    return client.abandoned;
  }, PROPOSAL_FAKE.toString());

  expect(result).toHaveLength(1);
});

test("a rejection without a proposal id clears optimistic input", async ({
  page,
}) => {
  const value = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("doc", "optimistic");
    client.reject();
    return store.get("doc");
  }, PROPOSAL_FAKE.toString());

  expect(value).toBe("A");
});

test("namespaced rejections publish the bound field and reactive error", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const events = [];
    const onReject = (event) => events.push(event.detail);
    document.addEventListener("spaday:reject", onReject);
    const link = connectStore(store, client, () => true, codec, "editor");
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("editor.doc", "invalid");
    client.reject(client.sent[0].proposal);
    document.removeEventListener("spaday:reject", onReject);
    return { error: store.get("$errors.editor.doc"), event: events[0] };
  }, PROPOSAL_FAKE.toString());

  expect(result.error).toBe("invalid");
  expect(result.event).toMatchObject({
    id: 1,
    model: "editor",
    field: "editor.doc",
    error: "invalid",
    rev: 0,
  });
});

test("an acknowledgement without a patch restores the authoritative value", async ({
  page,
}) => {
  const value = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("doc", "optimistic");
    client.ack(client.sent[0].proposal);
    return store.get("doc");
  }, PROPOSAL_FAKE.toString());

  expect(value).toBe("A");
});

test("settling one field does not reset unrelated collections", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: { doc: "A", rows: [{ id: 1, name: "one" }] },
      }),
    );
    const collectionChanges = [];
    store.subscribeCollection("rows", "id", (change) =>
      collectionChanges.push(change),
    );

    store.set("doc", "optimistic");
    client.ack(client.sent[0].proposal);
    return { doc: store.get("doc"), collectionChanges };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({ doc: "A", collectionChanges: [] });
});

test("a managed proposal sends without a separate callback", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, undefined, codec);
    link.receive(JSON.stringify({ t: "snapshot", id: 1, value: { doc: "A" } }));

    store.set("doc", "B");
    const proposal = client.sent[0].proposal;
    client.accept(proposal, "doc", "B!");
    return { sent: client.sent.length, value: store.get("doc") };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({ sent: 1, value: "B!" });
});

test("an accepted list proposal applies index operations to the authoritative mirror", async ({
  page,
}) => {
  const value = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(
      JSON.stringify({ t: "snapshot", id: 1, value: { tags: ["a"] } }),
    );

    store.set("tags", ["a", "b", "c"]);
    client.acceptOps(client.sent[0].proposal, { tags: ["a", "b", "c"] }, [
      { Insert: { path: [{ Key: "tags" }], index: 1, value: "b" } },
      { Insert: { path: [{ Key: "tags" }], index: 2, value: "c" } },
    ]);
    return store.get("tags");
  }, PROPOSAL_FAKE.toString());

  expect(value).toEqual(["a", "b", "c"]);
});

test("a pending nested edit does not hide remote sibling updates", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: { profile: { name: "A", status: "idle" } },
      }),
    );

    store.set("profile.name", "B");
    const proposal = client.sent[0];
    client.remoteNested("profile", "status", "saving");
    const pending = store.get("profile");
    client.reject(proposal.proposal);

    return {
      op: proposal.patch.ops[0],
      pending,
      rejected: store.get("profile"),
      sent: client.sent.length,
    };
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual({
    op: {
      Set: {
        path: [{ Key: "profile" }, { Key: "name" }],
        value: "B",
      },
    },
    pending: { name: "B", status: "saving" },
    rejected: { name: "A", status: "saving" },
    sent: 1,
  });
});

test("replacing a nested object sends one atomic proposal", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: { profile: { name: "A", status: "idle" } },
      }),
    );

    store.set("profile", { name: "B", status: "saving", role: "admin" });
    return client.sent;
  }, PROPOSAL_FAKE.toString());

  expect(result).toHaveLength(1);
  expect(result[0].patch.ops).toEqual([
    {
      Set: {
        path: [{ Key: "profile" }],
        value: { name: "B", status: "saving", role: "admin" },
      },
    },
  ]);
});

test("rejecting an object replacement removes optimistic keys", async ({
  page,
}) => {
  const value = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: { profile: { name: "A", status: "idle" } },
      }),
    );

    store.set("profile", { name: "B", status: "saving", role: "admin" });
    client.reject(client.sent[0].proposal);
    return store.get("profile");
  }, PROPOSAL_FAKE.toString());

  expect(value).toEqual({ name: "A", status: "idle" });
});

test("a scalar becoming an object wires only its leaf fields", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec);
    link.receive(
      JSON.stringify({ t: "snapshot", id: 1, value: { profile: null } }),
    );

    client.remote("profile", { name: "A" });
    store.set("profile.name", "B");
    return client.sent.map((message) => message.patch.ops[0]);
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual([
    {
      Set: {
        path: [{ Key: "profile" }, { Key: "name" }],
        value: "B",
      },
    },
  ]);
});

test("inbound updates a two-way control, and applying an inbound frame does not echo back out", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const input = mount(
      document.createElement("div"),
      {
        tag: "input",
        props: { type: { Str: "checkbox" } },
        bindings: { checked: { field: "on", mode: "two-way" } },
      },
      store,
    );
    const out = [];
    const link = connectStore(store, client, (f) => out.push(f), codec);
    link.receive(JSON.stringify({ on: false }));
    link.receive(JSON.stringify({ on: true })); // a server echo / push
    return { checked: input.checked, echoes: out.length };
  }, FAKE.toString());
  expect(result.checked).toBe(true); // the inbound value reached the bound control
  expect(result.echoes).toBe(0); // echo guard: inbound updates are not sent straight back out
});

test("inbound patch updates only its changed store branch", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: {
          profile: { name: "old", active: true },
          rows: [{ id: 1 }, { id: 2 }],
        },
      }),
    );
    const rows = store.get("rows");
    let rowNotifications = 0;
    store.subscribe("rows", () => {
      rowNotifications += 1;
    });
    client.valueCalls = 0;
    codec.fromCalls = 0;

    link.receive(
      JSON.stringify({
        t: "patch",
        id: 1,
        patch: {
          rev: 1,
          ops: [
            {
              Set: {
                path: [{ Key: "profile" }, { Key: "name" }],
                value: "new",
              },
            },
          ],
        },
      }),
    );
    return {
      name: store.get("profile.name"),
      rowsPreserved: store.get("rows") === rows,
      rowNotifications,
      valueCalls: client.valueCalls,
      decodedValues: codec.fromCalls,
    };
  }, PATCH_FAKE.toString());

  expect(result).toEqual({
    name: "new",
    rowsPreserved: true,
    rowNotifications: 0,
    valueCalls: 0,
    decodedValues: 1,
  });
});

test("inbound patch applies list insertion, removal, and moves without a model read", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: { rows: [1, 2], status: "ready" },
      }),
    );
    client.valueCalls = 0;
    codec.fromCalls = 0;
    link.receive(
      JSON.stringify({
        t: "patch",
        id: 1,
        patch: {
          rev: 1,
          ops: [
            {
              Insert: {
                path: [{ Key: "rows" }],
                index: 1,
                value: 5,
              },
            },
            { RemoveAt: { path: [{ Key: "rows" }], index: 0 } },
            { Move: { path: [{ Key: "rows" }], from: 0, to: 1 } },
            { Remove: { path: [{ Key: "status" }] } },
          ],
        },
      }),
    );
    return {
      rows: store.get("rows"),
      status: store.get("status") ?? null,
      valueCalls: client.valueCalls,
      decodedValues: codec.fromCalls,
    };
  }, PATCH_FAKE.toString());

  expect(result).toEqual({
    rows: [2, 5],
    status: null,
    valueCalls: 0,
    decodedValues: 1,
  });
});

test("inbound list patches reach Each as keyed collection deltas", async ({
  page,
}) => {
  const result = await page.evaluate(async (makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    class SyncProbe extends HTMLElement {
      set label(value) {
        this.updates = (this.updates ?? 0) + 1;
        this.textContent = value;
      }
    }
    if (!customElements.get("sync-probe"))
      customElements.define("sync-probe", SyncProbe);
    const store = new Store({ rows: [] });
    const root = mount(
      document.body,
      {
        tag: "spa-each",
        props: { itemKey: { Str: "id" } },
        bindings: { items: { field: "rows", mode: "one-way" } },
        slots: {
          default: [
            {
              tag: "sync-probe",
              bindings: {
                label: {
                  compute: { expr: "item", path: "name" },
                  mode: "one-way",
                },
              },
            },
          ],
        },
      },
      store,
    );
    const link = connectStore(store, client, () => {}, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: {
          rows: [
            { id: 1, name: "A" },
            { id: 2, name: "B" },
          ],
        },
      }),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const retained = root.children[1];
    client.valueCalls = 0;
    codec.fromCalls = 0;

    link.receive(
      JSON.stringify({
        t: "patch",
        id: 1,
        patch: {
          rev: 1,
          ops: [
            {
              Set: {
                path: [{ Key: "rows" }, { Index: 1 }, { Key: "name" }],
                value: "Bee",
              },
            },
            {
              Insert: {
                path: [{ Key: "rows" }],
                index: 2,
                value: { id: 3, name: "C" },
              },
            },
            {
              Reorder: {
                path: [{ Key: "rows" }],
                order: [1, 0, 2],
              },
            },
            { RemoveAt: { path: [{ Key: "rows" }], index: 1 } },
          ],
        },
      }),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const inserted = root.children[1];
    link.receive(
      JSON.stringify({
        t: "patch",
        id: 1,
        patch: {
          rev: 2,
          ops: [
            {
              Insert: {
                path: [{ Key: "rows" }],
                index: 0,
                value: { id: 3, name: "See" },
              },
            },
            { RemoveAt: { path: [{ Key: "rows" }], index: 2 } },
          ],
        },
      }),
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      rows: store.get("rows"),
      values: [...root.children].map((element) => element.textContent),
      retained: root.children[1] === retained,
      changedMoveRetained: root.children[0] === inserted,
      valueCalls: client.valueCalls,
      decodedValues: codec.fromCalls,
    };
  }, PATCH_FAKE.toString());

  expect(result).toEqual({
    rows: [
      { id: 3, name: "See" },
      { id: 2, name: "Bee" },
    ],
    values: ["See", "Bee"],
    retained: true,
    changedMoveRetained: true,
    valueCalls: 0,
    decodedValues: 3,
  });
});

test("onChange drives accepted updates and ignores non-change frames", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => {}, codec);
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        rev: 0,
        value: { profile: { name: "old" }, rows: [1, 2] },
      }),
    );
    const rows = store.get("rows");
    let notifications = 0;
    store.subscribe("profile.name", () => {
      notifications += 1;
    });
    client.valueCalls = 0;
    codec.fromCalls = 0;

    link.receive(JSON.stringify({ t: "reject", id: 1, rev: 0, error: "bad" }));
    link.receive(JSON.stringify({ t: "presence", id: 1 }));
    link.receive(
      JSON.stringify({
        t: "patch",
        id: 1,
        stale: true,
        patch: { rev: 0, ops: [] },
      }),
    );
    client.emit({
      t: "patch",
      id: 1,
      patch: {
        rev: 1,
        ops: [
          {
            Set: {
              path: [{ Key: "profile" }, { Key: "name" }],
              value: "new",
            },
          },
        ],
      },
    });
    link.dispose();
    client.emit({
      t: "patch",
      id: 1,
      patch: {
        rev: 2,
        ops: [
          {
            Set: {
              path: [{ Key: "profile" }, { Key: "name" }],
              value: "disposed",
            },
          },
        ],
      },
    });
    return {
      name: store.get("profile.name"),
      rowsPreserved: store.get("rows") === rows,
      notifications,
      valueCalls: client.valueCalls,
      decodedValues: codec.fromCalls,
    };
  }, LISTENER_FAKE.toString());

  expect(result).toEqual({
    name: "new",
    rowsPreserved: true,
    notifications: 1,
    valueCalls: 0,
    decodedValues: 1,
  });
});

for (const [name, invalidOp] of [
  ["fractional move", { Move: { path: [{ Key: "rows" }], from: 0.5, to: 0 } }],
  ["invalid reorder", { Reorder: { path: [{ Key: "rows" }], order: [0, 0] } }],
]) {
  test(`${name} falls back atomically to the client snapshot`, async ({
    page,
  }) => {
    const result = await page.evaluate(
      ({ makeFake, invalidOp }) => {
        const { client, codec } = eval(`(${makeFake})()`);
        const { Store, connectStore } = window.__spaday;
        const store = new Store();
        const link = connectStore(
          store,
          client,
          () => {},
          codec,
          undefined,
          false,
        );
        link.receive(
          JSON.stringify({
            t: "snapshot",
            id: 1,
            value: { profile: { name: "old" }, rows: [1] },
          }),
        );
        let profileNotifications = 0;
        store.subscribe("profile", () => {
          profileNotifications += 1;
        });
        client.model = { profile: { name: "server" }, rows: [9] };
        client.valueCalls = 0;
        link.receive(
          JSON.stringify({
            t: "patch",
            id: 1,
            patch: {
              rev: 1,
              ops: [
                {
                  Set: {
                    path: [{ Key: "profile" }, { Key: "name" }],
                    value: "transient",
                  },
                },
                invalidOp,
              ],
            },
          }),
        );
        return {
          profile: store.get("profile"),
          rows: store.get("rows"),
          profileNotifications,
          valueCalls: client.valueCalls,
        };
      },
      { makeFake: PATCH_FAKE.toString(), invalidOp },
    );

    expect(result).toEqual({
      profile: { name: "server" },
      rows: [9],
      profileNotifications: 1,
      valueCalls: 1,
    });
  });
}

test("inbound: a nested sub-model field flows to a dotted-path binding", async ({
  page,
}) => {
  const text = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: { textContent: { field: "address.street", mode: "one-way" } },
      },
      store,
    );
    const link = connectStore(store, client, () => {}, codec);
    link.receive(JSON.stringify({ address: { street: "Main", city: "NYC" } }));
    return root.textContent;
  }, FAKE.toString());
  expect(text).toBe("Main"); // the sub-model flattened to a dotted field and reached the bound prop
});

test("outbound: editing a nested control sends a deep-set edit preserving siblings", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const input = mount(
      document.createElement("div"),
      {
        tag: "input",
        bindings: { value: { field: "address.street", mode: "two-way" } },
      },
      store,
    );
    const sent = [];
    const link = connectStore(store, client, (f) => sent.push(f), codec);
    link.receive(JSON.stringify({ address: { street: "Main", city: "NYC" } }));
    input.value = "Oak";
    input.dispatchEvent(new Event("change")); // two-way: nested control → deep-set edit
    return { sent: sent.map((f) => JSON.parse(f)) };
  }, FAKE.toString());
  // the whole model goes out with only the nested leaf changed — the sibling city is preserved
  expect(result.sent).toContainEqual({
    address: { street: "Oak", city: "NYC" },
  });
});

test("namespace: inbound mirrors under the prefix, leaving the bare field untouched", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const root = mount(
      document.createElement("div"),
      {
        tag: "span",
        bindings: { textContent: { field: "g.type", mode: "one-way" } },
      },
      store,
    );
    const link = connectStore(store, client, () => {}, codec, "g");
    link.receive(JSON.stringify({ type: "area" }));
    return {
      text: root.textContent,
      ns: store.get("g.type"),
      bare: store.get("type"),
    };
  }, FAKE.toString());
  expect(result.text).toBe("area"); // the namespaced field reached the bound prop
  expect(result.ns).toBe("area"); // mirrored under the prefix
  expect(result.bare).toBeUndefined(); // the bare model field name is never written
});

test("namespace: the outbound edit carries the bare model field, not the prefixed key", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { mount, Store, connectStore } = window.__spaday;
    const store = new Store();
    const input = mount(
      document.createElement("div"),
      {
        tag: "input",
        props: { type: { Str: "checkbox" } },
        bindings: { checked: { field: "g.live", mode: "two-way" } },
      },
      store,
    );
    const sent = [];
    const link = connectStore(store, client, (f) => sent.push(f), codec, "g");
    link.receive(JSON.stringify({ live: false }));
    input.checked = true;
    input.dispatchEvent(new Event("change")); // two-way: g.live → edit
    return { sent: sent.map((f) => JSON.parse(f)) };
  }, FAKE.toString());
  expect(result.sent).toContainEqual({ live: true }); // bare field — the "g." prefix is stripped
});

test("namespace: two models on one Store don't echo across namespaces", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const a = eval(`(${makeFake})()`);
    const b = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const sentA = [];
    const sentB = [];
    const linkA = connectStore(
      store,
      a.client,
      (f) => sentA.push(f),
      a.codec,
      "g",
    );
    const linkB = connectStore(
      store,
      b.client,
      (f) => sentB.push(f),
      b.codec,
      "s",
    );
    linkA.receive(JSON.stringify({ type: "line" })); // each model seeds its own namespace
    linkB.receive(JSON.stringify({ type: "area" }));
    sentA.length = 0;
    sentB.length = 0;
    store.set("g.type", "histogram"); // a change in the "g" namespace only
    return { a: sentA.length, b: sentB.length };
  }, FAKE.toString());
  expect(result.a).toBe(1); // only the "g" model's connectStore sent an edit
  expect(result.b).toBe(0); // the "s" model is untouched — no cross-namespace echo
});

test("namespace: replacing the namespace sends each changed model field", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const link = connectStore(store, client, () => true, codec, "editor");
    link.receive(
      JSON.stringify({
        t: "snapshot",
        id: 1,
        value: { title: "A", status: "idle" },
      }),
    );

    store.set("editor", { title: "B", status: "saving" });
    return client.sent.map((message) => message.patch.ops[0]);
  }, PROPOSAL_FAKE.toString());

  expect(result).toEqual(
    expect.arrayContaining([
      { Set: { path: [{ Key: "title" }], value: "B" } },
      { Set: { path: [{ Key: "status" }], value: "saving" } },
    ]),
  );
  expect(result).toHaveLength(2);
});

test("flatten=false keeps an opaque map field whole — one field, one edit", async ({
  page,
}) => {
  const result = await page.evaluate((makeFake) => {
    const { client, codec } = eval(`(${makeFake})()`);
    const { Store, connectStore } = window.__spaday;
    const store = new Store();
    const sent = [];
    // a chart-shaped model: `data` is a time-keyed map that must stay opaque, not flatten to data.<key>
    const link = connectStore(
      store,
      client,
      (f) => sent.push(f),
      codec,
      "g",
      false,
    );
    link.receive(JSON.stringify({ data: { a: 1, b: 2 } }));
    const whole = store.get("g.data"); // mirrored whole (not split into g.data.a / g.data.b leaves)
    store.set("g.data", {}); // replacing the whole field (e.g. a chart "Clear")
    return { whole, sent: sent.map((f) => JSON.parse(f)) };
  }, FAKE.toString());
  expect(result.whole).toEqual({ a: 1, b: 2 }); // the map is one field
  expect(result.sent).toContainEqual({ data: {} }); // ONE edit replacing the whole field (not per-key)
});
