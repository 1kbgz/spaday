// The seam between spaday and transports — and the one place either layer meets the other.
//
// spaday owns the UI: a component tree, reactive `bindings`, and the signal `Store` they read/write
// (see signals.ts). It knows nothing about the wire. transports owns the wire: it mirrors an
// authoritative model and exposes a `Client` to read/edit it. It knows nothing about UI.
//
// `connectStore` marries them WITHOUT importing transports: it speaks to the client through the small
// `ModelClient` interface below — spaday's entire view of "the wire" is these four methods — and
// converts between the wire's tagged values and plain JS via an injected `ValueCodec` (transports'
// `fromValue`/`toValue`). So the boundary is enforced in the types: bind a `Store` to a transports
// model and inbound patches flow model → fields → bound props, while a two-way control's change becomes
// a server-authoritative `edit`. Swap in any object satisfying `ModelClient` and spaday is none the wiser.

import { Store } from "./signals";

/** Spaday's whole view of a transports `Client`: receive a frame, find the model, read it, edit it. */
export interface ModelClient {
  recv(data: string | Uint8Array): void;
  ids(): number[];
  value(id: number): unknown; // the model as a tagged core Value
  edit(id: number, value: unknown): string; // an encoded edit frame to send back
}

/** Convert between tagged core Values and plain JS fields (transports' `fromValue` / `toValue`). */
export interface ValueCodec {
  fromValue(value: unknown): Record<string, unknown> | null;
  toValue(plain: unknown): unknown;
}

export interface StoreLink {
  /** Feed an inbound wire frame; the mirrored model's fields flow into the store (and bound props). */
  receive(data: string | Uint8Array): void;
  /** Stop pushing store changes to the wire. */
  dispose(): void;
}

/**
 * Bidirectionally sync a `Store` with a transports-mirrored model. Top-level model fields map by name
 * to store fields: inbound frames pull them into the store; a store field change (e.g. from a two-way
 * control) is pushed back as a `client.edit`, sent via `send`. Edits are server-authoritative — the
 * change takes effect when the server echoes it back through `receive`.
 */
export function connectStore(
  store: Store,
  client: ModelClient,
  send: (frame: string) => void,
  codec: ValueCodec,
): StoreLink {
  let id: number | undefined;
  let inbound = false; // true while applying a received frame, so we don't echo it straight back out
  const wired = new Set<string>();
  const unsubs: Array<() => void> = [];

  return {
    receive(data) {
      client.recv(data);
      if (id === undefined) id = client.ids()[0];
      if (id === undefined) return; // no model yet (snapshot not received)
      const model = codec.fromValue(client.value(id));
      if (!model) return;
      inbound = true;
      for (const [field, value] of Object.entries(model)) {
        store.set(field, value); // model → store (→ any bound props)
        if (!wired.has(field)) {
          wired.add(field);
          unsubs.push(
            store.subscribe(field, (v) => {
              if (inbound || id === undefined) return; // ignore echoes of an inbound update
              const current = codec.fromValue(client.value(id)) ?? {};
              send(client.edit(id, codec.toValue({ ...current, [field]: v })));
            }),
          );
        }
      }
      inbound = false;
    },
    dispose() {
      for (const unsub of unsubs) unsub();
    },
  };
}
