// The seam between spaday and transports — and the one place either layer meets the other.
//
// spaday owns the UI: a component tree, reactive `bindings`, and the signal `Store` they read/write
// (see signals.ts). It knows nothing about the wire. transports owns the wire: it mirrors an
// authoritative model and exposes a `Client` to read/edit it. It knows nothing about UI.
//
// `connectStore` marries them WITHOUT importing transports: it speaks to the client through the small
// `ModelClient` interface below — spaday's entire view of "the wire" — and
// converts between the wire's tagged values and plain JS via an injected `ValueCodec` (transports'
// `fromValue`/`toValue`). So the boundary is enforced in the types: bind a `Store` to a transports
// model and inbound patches flow model → fields → bound props, while a two-way control's change becomes
// a server-authoritative `edit`. Swap in any object satisfying `ModelClient` and spaday is none the wiser.

import {
  type CollectionDelta,
  type CollectionKey,
  type CollectionPathSegment,
  Store,
} from "./signals";

/** Spaday's whole view of a transports `Client`: receive a frame, find the model, read it, edit it. */
type PathSeg = { Key: string } | { Index: number };
type PatchOp =
  | { Set: { path: PathSeg[]; value: unknown } }
  | { Remove: { path: PathSeg[] } }
  | { Insert: { path: PathSeg[]; index: number; value: unknown } }
  | { RemoveAt: { path: PathSeg[]; index: number } }
  | { Move: { path: PathSeg[]; from: number; to: number } }
  | { Reorder: { path: PathSeg[]; order: number[] } };
type ReceiveChange =
  | { t: "snapshot"; id: number }
  | { t: "patch"; id: number; patch: { rev: number; ops: PatchOp[] } };

export interface ModelClient {
  recv(data: string | Uint8Array): ReceiveChange | undefined | void;
  /** Accepted-change listener provided by current transports clients. Optional for older clients. */
  onChange?(listener: (change: ReceiveChange) => void): () => void;
  ids(): number[];
  value(id: number): unknown; // the model as a tagged core Value
  edit(id: number, value: unknown): string; // an encoded edit frame to send back
}

/** Convert between tagged core Values and plain JS fields (transports' `fromValue` / `toValue`). */
export interface ValueCodec {
  fromValue(value: unknown): unknown;
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

function updatePath(
  value: unknown,
  path: PathSeg[],
  update: (current: unknown) => unknown,
): unknown {
  if (!path.length) return update(value);
  const [segment, ...rest] = path;
  if ("Key" in segment) {
    if (!isObj(value)) throw new Error("patch path expected an object");
    if (rest.length && !(segment.Key in value))
      throw new Error(
        `patch path key ${JSON.stringify(segment.Key)} not found`,
      );
    return {
      ...value,
      [segment.Key]: updatePath(value[segment.Key], rest, update),
    };
  }
  if (!Array.isArray(value)) throw new Error("patch path expected an array");
  if (
    !Number.isSafeInteger(segment.Index) ||
    segment.Index < 0 ||
    segment.Index >= value.length
  )
    throw new Error(
      `patch path index ${segment.Index} out of bounds (len ${value.length})`,
    );
  const next = [...value];
  next[segment.Index] = updatePath(next[segment.Index], rest, update);
  return next;
}

function applyPlainOp(
  current: unknown,
  path: PathSeg[],
  op: PatchOp,
  codec: ValueCodec,
): unknown {
  if ("Set" in op)
    return updatePath(current, path, () => codec.fromValue(op.Set.value));
  if ("Remove" in op) {
    if (!path.length) return undefined;
    const segment = path[path.length - 1];
    if (!segment || !("Key" in segment))
      throw new Error("remove path must end in an object key");
    return updatePath(current, path.slice(0, -1), (container) => {
      if (!isObj(container)) throw new Error("remove path expected an object");
      const next = { ...container };
      delete next[segment.Key];
      return next;
    });
  }
  if ("Insert" in op) {
    return updatePath(current, path, (container) => {
      if (!Array.isArray(container))
        throw new Error("insert path expected an array");
      if (
        !Number.isSafeInteger(op.Insert.index) ||
        op.Insert.index < 0 ||
        op.Insert.index > container.length
      )
        throw new Error(
          `insert index ${op.Insert.index} out of bounds (len ${container.length})`,
        );
      const next = [...container];
      next.splice(op.Insert.index, 0, codec.fromValue(op.Insert.value));
      return next;
    });
  }
  if ("Move" in op) {
    return updatePath(current, path, (container) => {
      if (!Array.isArray(container))
        throw new Error("move path expected an array");
      if (
        !Number.isSafeInteger(op.Move.from) ||
        op.Move.from < 0 ||
        op.Move.from >= container.length
      )
        throw new Error(
          `move source ${op.Move.from} out of bounds (len ${container.length})`,
        );
      if (
        !Number.isSafeInteger(op.Move.to) ||
        op.Move.to < 0 ||
        op.Move.to >= container.length
      )
        throw new Error(
          `move destination ${op.Move.to} out of bounds (len ${container.length})`,
        );
      const next = [...container];
      const [item] = next.splice(op.Move.from, 1);
      next.splice(op.Move.to, 0, item);
      return next;
    });
  }
  if ("Reorder" in op) {
    return updatePath(current, path, (container) => {
      if (!Array.isArray(container))
        throw new Error("reorder path expected an array");
      if (
        op.Reorder.order.length !== container.length ||
        op.Reorder.order.some(
          (index) =>
            !Number.isSafeInteger(index) ||
            index < 0 ||
            index >= container.length,
        ) ||
        new Set(op.Reorder.order).size !== container.length
      )
        throw new Error("reorder order must be a complete array permutation");
      return op.Reorder.order.map((index) => container[index]);
    });
  }
  return updatePath(current, path, (container) => {
    if (!Array.isArray(container))
      throw new Error("remove path expected an array");
    if (
      !Number.isSafeInteger(op.RemoveAt.index) ||
      op.RemoveAt.index < 0 ||
      op.RemoveAt.index >= container.length
    )
      throw new Error(
        `remove index ${op.RemoveAt.index} out of bounds (len ${container.length})`,
      );
    const next = [...container];
    next.splice(op.RemoveAt.index, 1);
    return next;
  });
}

function readSegments(value: unknown, path: readonly PathSeg[]): unknown {
  let current = value;
  for (const segment of path) {
    if ("Key" in segment) {
      if (!isObj(current)) return undefined;
      current = current[segment.Key];
    } else {
      if (!Array.isArray(current)) return undefined;
      current = current[segment.Index];
    }
  }
  return current;
}

function readCollectionKey(
  item: unknown,
  field: string,
): CollectionKey | undefined {
  let current = item;
  for (const part of field.split(".")) {
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isSafeInteger(index) || index < 0 || index >= current.length)
        return undefined;
      current = current[index];
    } else if (isObj(current)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ||
    (typeof current === "number" && Number.isFinite(current))
    ? current
    : undefined;
}

function collectionDeltasMatch(
  current: readonly unknown[],
  next: readonly unknown[],
  deltas: readonly CollectionDelta[],
  itemKey: string,
): boolean {
  const identity = (item: unknown): string | undefined => {
    const key = readCollectionKey(item, itemKey);
    return key === undefined ? undefined : `${typeof key}:${key}`;
  };
  const order = current.map(identity);
  const target = next.map(identity);
  if (
    order.includes(undefined) ||
    target.includes(undefined) ||
    new Set(order).size !== order.length ||
    new Set(target).size !== target.length
  )
    return false;
  for (const delta of deltas) {
    if (delta.kind === "reset") return false;
    if (delta.kind === "reorder") {
      const reordered = delta.keys.map((key) => `${typeof key}:${key}`);
      const currentKeys = new Set(order);
      if (
        reordered.length !== order.length ||
        new Set(reordered).size !== reordered.length ||
        reordered.some((key) => !currentKeys.has(key))
      )
        return false;
      order.splice(0, order.length, ...reordered);
      continue;
    }
    const key = `${typeof delta.key}:${delta.key}`;
    const index = order.indexOf(key);
    if (delta.kind === "insert") {
      if (
        index !== -1 ||
        !Number.isSafeInteger(delta.index) ||
        delta.index < 0 ||
        delta.index > order.length ||
        identity(delta.item) !== key
      )
        return false;
      order.splice(delta.index, 0, key);
    } else if (delta.kind === "update") {
      if (index === -1) return false;
    } else if (delta.kind === "move") {
      if (
        index === -1 ||
        !Number.isSafeInteger(delta.index) ||
        delta.index < 0 ||
        delta.index >= order.length
      )
        return false;
      order.splice(index, 1);
      order.splice(delta.index, 0, key);
    } else {
      if (index === -1) return false;
      order.splice(index, 1);
    }
  }
  return (
    order.length === target.length &&
    order.every((key, index) => key === target[index])
  );
}

function collectionPath(path: readonly PathSeg[]): CollectionPathSegment[] {
  return path.map((segment) =>
    "Key" in segment ? segment.Key : segment.Index,
  );
}

function collectionDelta(
  current: unknown,
  next: unknown,
  path: PathSeg[],
  op: PatchOp,
  itemKey: string,
): CollectionDelta | undefined {
  if (!Array.isArray(current) || !Array.isArray(next)) return undefined;
  if ("Insert" in op && path.length === 0) {
    const item = next[op.Insert.index];
    const key = readCollectionKey(item, itemKey);
    return key === undefined
      ? undefined
      : { kind: "insert", key, index: op.Insert.index, item };
  }
  if ("RemoveAt" in op && path.length === 0) {
    const key = readCollectionKey(current[op.RemoveAt.index], itemKey);
    return key === undefined ? undefined : { kind: "remove", key };
  }
  if ("Move" in op && path.length === 0) {
    const key = readCollectionKey(current[op.Move.from], itemKey);
    return key === undefined ||
      !Object.is(key, readCollectionKey(next[op.Move.to], itemKey))
      ? undefined
      : { kind: "move", key, index: op.Move.to };
  }
  if ("Reorder" in op && path.length === 0) {
    const keys = next.map((item) => readCollectionKey(item, itemKey));
    return keys.includes(undefined)
      ? undefined
      : { kind: "reorder", keys: keys as CollectionKey[] };
  }
  const [row, ...itemPath] = path;
  if (!row || !("Index" in row)) return undefined;
  const oldItem = current[row.Index];
  const newItem = next[row.Index];
  const key = readCollectionKey(oldItem, itemKey);
  if (key === undefined || !Object.is(key, readCollectionKey(newItem, itemKey)))
    return undefined;

  let changedPath = itemPath;
  if ("Remove" in op) changedPath = itemPath.slice(0, -1);
  return {
    kind: "update",
    key,
    path: collectionPath(changedPath),
    value: readSegments(newItem, changedPath),
  };
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
 *
 * Current transports clients expose accepted snapshots and patches through `onChange`; `connectStore`
 * subscribes automatically, including when the client owns the connection. With an older client,
 * `StoreLink.receive` falls back to the value mirrored by `recv`.
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

  const wireField = (field: string) => {
    const key = namespace ? `${namespace}.${field}` : field;
    if (wired.has(key)) return;
    wired.add(key);
    unsubs.push(
      store.subscribe(key, (value) => {
        if (inbound || id === undefined) return;
        const decoded = codec.fromValue(client.value(id));
        const current = isObj(decoded) ? decoded : {};
        send(
          client.edit(
            id,
            codec.toValue(setPath(current, field.split("."), value)),
          ),
        );
      }),
    );
  };

  const receiveSnapshot = () => {
    if (id === undefined) return;
    const decoded = codec.fromValue(client.value(id));
    if (!isObj(decoded)) return;
    const entries = flatten ? leaves(decoded) : Object.entries(decoded);
    for (const [field, value] of entries) {
      const key = namespace ? `${namespace}.${field}` : field;
      store.set(key, value);
      wireField(field.split(".")[0]);
    }
  };

  const receivePatch = (change: Extract<ReceiveChange, { t: "patch" }>) => {
    const staged = new Map<
      string,
      {
        field: string;
        value: unknown;
        deltas?: CollectionDelta[];
      }
    >();
    try {
      for (const op of change.patch.ops) {
        const body =
          "Set" in op
            ? op.Set
            : "Remove" in op
              ? op.Remove
              : "Insert" in op
                ? op.Insert
                : "RemoveAt" in op
                  ? op.RemoveAt
                  : "Move" in op
                    ? op.Move
                    : op.Reorder;
        const [head, ...rest] = body.path;
        if (!head) {
          receiveSnapshot();
          return;
        }
        if (!("Key" in head))
          throw new Error("model patch path must start with a map key");
        const field = head.Key;
        const key = namespace ? `${namespace}.${field}` : field;
        const current = staged.has(key)
          ? staged.get(key)!.value
          : store.get(key);
        const value = applyPlainOp(current, rest, op, codec);
        const itemKey = store.collectionKey(key);
        let deltas = staged.has(key)
          ? staged.get(key)!.deltas
          : itemKey
            ? []
            : undefined;
        if (deltas && itemKey) {
          const delta = collectionDelta(current, value, rest, op, itemKey);
          if (delta) deltas.push(delta);
          else deltas = undefined;
        }
        staged.set(key, {
          field,
          value,
          deltas,
        });
      }
    } catch {
      receiveSnapshot();
      return;
    }
    for (const [key, update] of staged) {
      const itemKey = store.collectionKey(key);
      const current = store.get(key);
      if (
        update.deltas &&
        itemKey &&
        Array.isArray(update.value) &&
        Array.isArray(current) &&
        collectionDeltasMatch(current, update.value, update.deltas, itemKey)
      )
        store.setCollection(key, update.value, update.deltas);
      else store.set(key, update.value);
      wireField(update.field);
    }
  };

  const accept = (change: ReceiveChange) => {
    if (id === undefined) id = change.id;
    if (change.id !== id) return;
    inbound = true;
    try {
      if (change.t === "patch") receivePatch(change);
      else receiveSnapshot();
    } finally {
      inbound = false;
    }
  };

  const listensForChanges = client.onChange !== undefined;
  if (client.onChange) unsubs.push(client.onChange(accept));

  return {
    receive(data) {
      const change = client.recv(data);
      // Current transports clients deliver only accepted snapshots/patches through onChange. A stale
      // patch, reject, or future message type therefore does no store work. Older clients have no
      // listener API, so retain their recv-return/full-snapshot compatibility paths below.
      if (listensForChanges) return;
      if (change) {
        accept(change);
        return;
      }
      if (id === undefined) id = client.ids()[0];
      if (id === undefined) return; // no model yet (snapshot not received)
      inbound = true;
      try {
        receiveSnapshot();
      } finally {
        inbound = false;
      }
    },
    dispose() {
      for (const unsub of unsubs) unsub();
    },
  };
}
