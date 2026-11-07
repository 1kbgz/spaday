import {
  Client,
  fromValue,
  toValue,
  type BufferHeader,
  wasm as transportsWasm,
} from "@1kbgz/transports";
import wasm from "@1kbgz/transports/dist/pkg/transports_bg.wasm";
import { Store } from "./signals";
import { connectStore } from "./store-sync";

export interface AnyModel {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  save_changes(): void;
  on(event: string, cb: (...args: any[]) => void): void;
  off(event: string, cb: (...args: any[]) => void): void;
  send(
    content: unknown,
    callbacks?: unknown,
    buffers?: ArrayBufferView[],
  ): void;
}

interface NotebookWire {
  model?: number | string | null;
  namespace?: string | null;
  flatten: boolean;
  codec: string;
  ownership: boolean;
  update_interval: number;
  connected?: string | null;
}

let ready: Promise<unknown> | undefined;

/** One comm connection per displayed view; all model selections share its managed client. */
export async function connectWidget(
  store: Store,
  model: AnyModel,
  el: HTMLElement,
) {
  const specs = model.get("_wires") as NotebookWire[];
  ready ??= transportsWasm.default({ module_or_path: wasm }).catch((error) => {
    ready = undefined;
    throw error;
  });
  await ready;
  const { codec, ownership, update_interval } = specs[0];
  const client = new Client(codec, {
    ownership,
    updateInterval: update_interval,
  });
  const view = crypto.randomUUID();
  const wires = specs.map((spec) => ({
    spec,
    link: connectStore(
      store,
      client,
      undefined,
      { fromValue, toValue },
      spec.namespace ?? undefined,
      spec.flatten,
      spec.model ?? undefined,
    ),
  }));
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let disposed = false;
  let started = false;
  const connected = (value: boolean) => {
    for (const { spec } of wires) {
      const field =
        spec.connected ??
        (spec.namespace ? `${spec.namespace}.connected` : undefined);
      if (field) store.set(field, value);
    }
  };
  const sender = (wire: string | Uint8Array) => {
    const frame =
      typeof wire === "string"
        ? transportsWasm.BufferFrame.from_json(wire)
        : transportsWasm.BufferFrame.decode(wire, codec);
    try {
      const buffers = Array.from({ length: frame.count() }, (_, i) =>
        frame.buffer(i),
      );
      model.send(
        {
          wire: buffers.length ? JSON.parse(frame.header) : frame.to_json(),
          view,
        },
        undefined,
        buffers,
      );
    } finally {
      frame.free();
    }
  };
  const open = () =>
    model.send({ ready: true, ownership, heartbeat: true, view });
  const disconnect = () => {
    clearInterval(heartbeat);
    client.detach(sender);
    for (const { link } of wires) link.disconnect();
    connected(false);
  };
  const receive = (
    content: {
      view?: string;
      expired?: boolean;
      heartbeat?: number;
      wire?: string | BufferHeader;
    },
    buffers: ArrayBufferView[] = [],
  ) => {
    if (disposed || !content || content.view !== view) return;
    if (content.expired) {
      disconnect();
      client.attach(sender);
      open();
      return;
    }
    if (typeof content.heartbeat === "number" && content.heartbeat > 0) {
      clearInterval(heartbeat);
      heartbeat = setInterval(
        () => model.send({ heartbeat: true, view }),
        content.heartbeat * 1000,
      );
      connected(true);
    }
    if (typeof content.wire === "string") client.recv(content.wire);
    else if (content.wire) client.recvBuffers(content.wire, buffers);
    if (content.wire) connected(true);
  };
  connected(false);
  return {
    start() {
      model.on("msg:custom", receive);
      client.attach(sender);
      started = true;
      for (const { spec, link } of wires)
        el.dispatchEvent(
          new CustomEvent("spaday:wire-client", {
            detail: { client, link, store, namespace: spec.namespace ?? null },
          }),
        );
      open();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      disconnect();
      model.off("msg:custom", receive);
      for (const { link } of wires) link.dispose();
      if (started) model.send({ closed: true, view });
    },
  };
}
