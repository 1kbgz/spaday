import { test, expect } from "@playwright/test";

// The spaday ↔ transports seam (connectStore): bind a Store to a transports model through a fake Client
// (recv/ids/value/edit) with an identity codec. This exercises spaday's adapter — the mapping of model
// fields ↔ store fields ↔ bound props, and the echo guard — without transports itself, which is exactly
// the point: the adapter's whole view of the wire is the ModelClient interface.

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
