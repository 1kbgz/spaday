import { test, expect } from "@playwright/test";
import { Store } from "../src/ts/signals";

for (const field of ["channels.0.name", "config.channels.0.name"]) {
  for (const value of ["new", undefined]) {
    test(`reject array traversal at ${field} with ${value}`, () => {
      const channels = [{ id: "a", name: "old" }];
      const config = { channels, enabled: true };
      const store = new Store({ channels, config });
      const seen = [];
      store.subscribe("config", (value) => seen.push(value));
      store.subscribe("channels", (value) => seen.push(value));
      store.subscribe(field, (value) => seen.push(value));
      store.subscribeCollection("channels", "id", (delta) => seen.push(delta));

      expect(() => store.set(field, value)).toThrow(/array/);
      expect(store.get("channels")).toBe(channels);
      expect(store.get("config")).toBe(config);
      expect(channels).toEqual([{ id: "a", name: "old" }]);
      expect(seen).toEqual([]);
    });
  }
}

test("collection writes also reject paths through arrays", () => {
  const channels = [{ id: "a", samples: [] }];
  const store = new Store({ channels });
  expect(() => store.setCollection("channels.0.samples", [1], [])).toThrow(
    /array/,
  );
  expect(store.get("channels")).toBe(channels);
});

test("numeric object keys and array replacement remain supported", () => {
  const store = new Store({ config: { channels: [], labels: { 0: "old" } } });
  const seen = [];
  store.subscribe("config.channels", (value) => seen.push(value));
  store.set("config.labels.0", "new");
  store.set("config.channels", [{ id: "a" }]);
  expect(store.get("config")).toEqual({
    channels: [{ id: "a" }],
    labels: { 0: "new" },
  });
  expect(seen).toEqual([[{ id: "a" }]]);
});
