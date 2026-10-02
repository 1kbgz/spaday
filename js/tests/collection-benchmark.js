import * as transports from "/node_modules/@1kbgz/transports/dist/esm/index.js";

await transports.wasm.default({
  module_or_path: "/node_modules/@1kbgz/transports/dist/pkg/transports_bg.wasm",
});

let state;
let scopeWrites = 0;
class WireLabel extends HTMLElement {
  set label(value) {
    scopeWrites += 1;
    this.textContent = value;
  }
}
customElements.define("wire-label", WireLabel);
const nextFrame = () => new Promise(requestAnimationFrame);

export async function prepare(config) {
  if (state) {
    state.link.dispose();
    state.socket.close();
  }
  document.body.replaceChildren();
  const { Store, mount, connectStore } = window.__spaday;
  const store = new Store({ rows: [] });
  const client = new transports.Client(config.codec);
  const socket = new WebSocket(config.url);
  socket.binaryType = "arraybuffer";
  const link = connectStore(
    store,
    client,
    (frame) => socket.send(frame),
    transports,
  );
  state = { config, store, client, socket, link, received: 0, receiveMs: 0 };
  await new Promise((resolve, reject) => {
    socket.onerror = () =>
      reject(new Error("collection benchmark WebSocket failed"));
    socket.onclose = () => reject(new Error("closed before snapshot"));
    socket.onopen = () => socket.send(JSON.stringify(config));
    socket.onmessage = ({ data }) => {
      try {
        client.recv(typeof data === "string" ? data : new Uint8Array(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
  });
  state.root = mount(
    document.body,
    {
      tag: "spa-each",
      props: { itemKey: { Str: "id" } },
      bindings: { items: { field: "rows", mode: "one-way" } },
      slots: {
        default: [
          {
            tag: "section",
            bindings: {
              "data-id": {
                compute: { expr: "item", path: "id" },
                mode: "one-way",
              },
            },
            slots: {
              default: [
                {
                  tag: "wire-label",
                  bindings: {
                    label: {
                      compute: { expr: "item", path: "label" },
                      mode: "one-way",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    store,
  );
  state.original = new Map(
    [...state.root.children].map((row) => [row.dataset.id, row]),
  );
  state.input = document.createElement("input");
  state.root.firstElementChild.append(state.input);
  state.input.value = "unsaved input";
  state.input.focus({ preventScroll: true });
  state.input.setSelectionRange(2, 5);
  const ticks = [];
  for (let i = 0; i < 6; i++) ticks.push(await nextFrame());
  const intervals = ticks
    .slice(1)
    .map((time, i) => time - ticks[i])
    .sort((a, b) => a - b);
  state.frameInterval = intervals[Math.floor(intervals.length / 2)];
}

export async function update() {
  let domMutations = 0;
  const mutations = new MutationObserver((records) => {
    domMutations += records.length;
  });
  mutations.observe(state.root, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const longTasks = [];
  const observer = new PerformanceObserver((list) =>
    longTasks.push(...list.getEntries()),
  );
  observer.observe({ type: "longtask" });
  const gaps = [];
  let last = await nextFrame();
  let frame;
  const tick = (now) => {
    gaps.push(now - last);
    last = now;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  scopeWrites = 0;
  const started = performance.now();
  const server = await new Promise((resolve, reject) => {
    state.socket.onerror = () =>
      reject(new Error("collection benchmark WebSocket failed"));
    state.socket.onclose = () =>
      reject(new Error("closed before patches completed"));
    state.socket.onmessage = ({ data }) => {
      try {
        if (typeof data === "string" && data.startsWith('{"benchmark":')) {
          resolve(JSON.parse(data).benchmark);
          return;
        }
        const before = performance.now();
        state.client.recv(
          typeof data === "string" ? data : new Uint8Array(data),
        );
        state.receiveMs += performance.now() - before;
        state.received += 1;
      } catch (error) {
        reject(error);
      }
    };
    state.socket.send("update");
  });
  await nextFrame();
  await nextFrame();
  const duration = performance.now() - started;
  cancelAnimationFrame(frame);
  domMutations += mutations.takeRecords().length;
  mutations.disconnect();
  longTasks.push(...observer.takeRecords());
  observer.disconnect();
  const rows = [...state.root.children];
  const expected = state.store.get("rows");
  const mirror = transports.fromValue(
    state.client.value(state.client.ids()[0]),
  ).rows;
  const { size, workload } = state.config;
  const correctRows = expected.every((row, index) => {
    const id =
      workload === "insert"
        ? index === 0
          ? size
          : index - 1
        : workload === "reorder"
          ? size - index - 1
          : workload.startsWith("move")
            ? index === 0
              ? size - 1
              : index - 1
            : index;
    const label =
      workload === "insert" && index === 0
        ? "inserted"
        : workload === "move-update" && index === 0
          ? "moved"
          : ["update", "burst", "batch-burst"].includes(workload) &&
              id === Math.floor(size / 2)
            ? `updated-${workload === "update" ? 0 : 9}`
            : `row-${id}`;
    return row.id === id && row.label === label;
  });
  const result = {
    ...server,
    roundtrip_render_ms: duration,
    client_receive_apply_ms: state.receiveMs,
    received_frames: state.received,
    scope_writes: scopeWrites,
    dom_mutations: domMutations,
    long_tasks: longTasks.length,
    long_task_ms: longTasks.reduce((sum, task) => sum + task.duration, 0),
    frame_interval_ms: state.frameInterval,
    max_frame_gap_ms: Math.max(0, ...gaps),
    estimated_missed_frames: gaps.reduce(
      (sum, gap) =>
        sum + Math.max(0, Math.round(gap / state.frameInterval) - 1),
      0,
    ),
    rows: rows.length,
    dom_nodes: document.getElementsByTagName("*").length,
    heap_used_bytes: performance.memory?.usedJSHeapSize ?? null,
    values_match:
      correctRows &&
      expected.length === rows.length &&
      JSON.stringify(expected) === JSON.stringify(mirror) &&
      rows.every(
        (row, i) =>
          row.dataset.id === String(expected[i].id) &&
          row.firstElementChild.textContent === expected[i].label,
      ),
    retained_identity: rows.every(
      (row) =>
        !state.original.has(row.dataset.id) ||
        state.original.get(row.dataset.id) === row,
    ),
    input_preserved:
      state.input.isConnected && state.input.value === "unsaved input",
    focus_preserved: document.activeElement === state.input,
    selection_preserved:
      state.input.selectionStart === 2 && state.input.selectionEnd === 5,
  };
  state.socket.send("done");
  state.socket.close();
  return result;
}
