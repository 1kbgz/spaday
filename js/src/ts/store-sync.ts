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

const isObj = (v: unknown): v is Record<string, unknown> =>
  v != null && typeof v === "object" && !Array.isArray(v);

/** Flatten a model to [dotted-path, leaf] pairs — recursing plain objects (sub-models), not arrays. */
function* leaves(
  obj: Record<string, unknown>,
  prefix = "",
): Generator<[string, unknown]> {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isObj(v)) yield* leaves(v, path);
    else yield [path, v];
  }
}

/** Immutably set a dotted path within a plain model, cloning each level. */
function setPath(
  obj: Record<string, unknown>,
  parts: string[],
  value: unknown,
): Record<string, unknown> {
  const [head, ...rest] = parts;
  const clone = { ...obj };
  clone[head] = rest.length
    ? setPath(isObj(clone[head]) ? clone[head] : {}, rest, value)
    : value;
  return clone;
}

/**
 * Bidirectionally sync a `Store` with a transports-mirrored model. Model fields map by name to store
 * fields — and a nested sub-model flattens to dotted `parent.child` fields: inbound frames pull them
 * into the store; a store field change (e.g. from a two-way control) is pushed back as a `client.edit`,
 * sent via `send`. Edits are server-authoritative — it takes effect when the server echoes it back.
 *
 * Pass a `namespace` to mirror under `${namespace}.<field>` so several models can share one `Store`
 * without their field names colliding (e.g. two `Chart` models on one page); the outbound edit still
 * carries the bare model field. Call it once per model, each with its own `client` and namespace.
 *
 * `flatten` (default true) recurses nested sub-models into dotted `parent.child` fields — what a generated
 * form binds to. Set it false when a top-level field is an **opaque map/dict** (a chart's time-keyed
 * `data`, a Perspective layout): the field is mirrored whole, so replacing it is one store set + one edit
 * (not one per key), and `compute`/`bind` read the whole value.
 */
export function connectStore(
  store: Store,
  client: ModelClient,
  send: (frame: string) => void,
  codec: ValueCodec,
  namespace?: string, // prefix every store field with `${namespace}.` — lets several models share one Store
  flatten = true, // recurse nested sub-models to dotted fields; set false to keep an opaque map/dict whole
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
      // flatten=true recurses sub-models to dotted leaves (a form's `schedule.start`); flatten=false
      // keeps each top-level field whole, so an opaque map (a chart's time-keyed `data`) is one field.
      const entries = flatten ? leaves(model) : Object.entries(model);
      for (const [field, value] of entries) {
        // store under the namespace (so models on one Store don't collide), but the outbound edit must
        // carry the BARE model field — keep the loop-local `field` for it, never slice the namespaced key.
        const key = namespace ? `${namespace}.${field}` : field;
        store.set(key, value); // model → store (→ any bound props); nested → a dotted field
        if (!wired.has(key)) {
          wired.add(key);
          unsubs.push(
            store.subscribe(key, (v) => {
              if (inbound || id === undefined) return; // ignore echoes of an inbound update
              const current = codec.fromValue(client.value(id)) ?? {};
              send(
                client.edit(
                  id,
                  codec.toValue(setPath(current, field.split("."), v)),
                ),
              );
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
