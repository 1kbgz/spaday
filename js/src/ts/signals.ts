// A tiny reactive store: named state fields with subscribers — the client-side half of the reactive
// engine. The runtime binds component props to fields (a node's `bindings`, authored via `Component.bind`
// in Python); setting a field notifies every bound prop, and a two-way-bound control writes its field
// back on change. The same store can later be backed by a transports model or the anywidget model so UI
// state and app/server state mirror.

export type Field = string; // a field name, or a dotted path into nested state (e.g. "address.street")
type Subscriber = (value: unknown) => void;

const isObj = (v: unknown): v is Record<string, unknown> =>
  v != null && typeof v === "object" && !Array.isArray(v);

/** Is `a` a strict ancestor path of `b`? e.g. "address" of "address.street". */
const isAncestor = (a: Field, b: Field): boolean => b.startsWith(a + ".");

/** Immutably set a path within `obj`, cloning each level so every parent gets a fresh identity. */
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

export class Store {
  private values: Map<Field, unknown>;
  private subscribers: Map<Field, Set<Subscriber>> = new Map();

  constructor(initial: Record<Field, unknown> = {}) {
    this.values = new Map(Object.entries(initial));
  }

  /** Read a field; a dotted `field` walks into nested objects (undefined if the path breaks). */
  get(field: Field): unknown {
    const [head, ...rest] = field.split(".");
    let v = this.values.get(head);
    for (const p of rest) {
      if (!isObj(v)) return undefined;
      v = v[p];
    }
    return v;
  }

  has(field: Field): boolean {
    const [head, ...rest] = field.split(".");
    if (!this.values.has(head)) return false;
    let v = this.values.get(head);
    for (const p of rest) {
      if (!isObj(v) || !(p in v)) return false;
      v = v[p];
    }
    return true;
  }

  /**
   * Set a field and notify subscribers; a no-op if unchanged. A dotted `field` sets a nested leaf,
   * rebuilding its parents immutably, and notifies the leaf plus its ancestors (whose identity changed)
   * and any subscribed descendant whose value changed.
   */
  set(field: Field, value: unknown): void {
    if (Object.is(this.get(field), value)) return;
    const related = [...this.subscribers.keys()].filter(
      (k) => k === field || isAncestor(k, field) || isAncestor(field, k),
    );
    const before = new Map(related.map((k) => [k, this.get(k)]));
    const parts = field.split(".");
    if (parts.length === 1) {
      this.values.set(field, value);
    } else {
      const head = parts[0];
      const root = isObj(this.values.get(head)) ? this.values.get(head) : {};
      this.values.set(
        head,
        setPath(root as Record<string, unknown>, parts.slice(1), value),
      );
    }
    for (const k of related) {
      const now = this.get(k);
      if (!Object.is(before.get(k), now))
        for (const cb of [...this.subscribers.get(k)!]) cb(now);
    }
  }

  /** Subscribe to a field; returns an unsubscribe function. */
  subscribe(field: Field, cb: Subscriber): () => void {
    let subs = this.subscribers.get(field);
    if (!subs) this.subscribers.set(field, (subs = new Set()));
    subs.add(cb);
    return () => {
      subs!.delete(cb);
    };
  }
}

// A field-expression: serializable data the runtime evaluates against the store to drive a *computed*
// binding (a prop derived from state fields). It shares the action DSL's `{expr: kind, ...}` shape plus
// a `field` reference; only the store-relevant forms are evaluated here.
export function evalExpr(expr: unknown, store: Store): unknown {
  if (!expr || typeof expr !== "object") return expr;
  const e = expr as Record<string, unknown>;
  switch (e.expr) {
    case "lit":
      return e.value;
    case "field":
      return store.get(e.name as string);
    case "not":
      return !evalExpr(e.of, store);
    case "eq":
      return evalExpr(e.a, store) === evalExpr(e.b, store);
    case "all":
      return (e.of as unknown[]).every((x) => !!evalExpr(x, store));
    case "any":
      return (e.of as unknown[]).some((x) => !!evalExpr(x, store));
    case "cond":
      return evalExpr(e.test, store)
        ? evalExpr(e.then, store)
        : evalExpr(e["else"], store);
    case "obj": {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(e.fields as Record<string, unknown>))
        out[k] = evalExpr(v, store);
      return out;
    }
    case "concat":
      return (e.parts as unknown[])
        .map((part) => String(evalExpr(part, store)))
        .join("");
    default:
      return undefined;
  }
}

/** The set of state fields a field-expression reads — the reactive dependencies of a computed binding. */
export function exprFields(
  expr: unknown,
  out: Set<string> = new Set(),
): Set<string> {
  if (!expr || typeof expr !== "object") return out;
  const e = expr as Record<string, unknown>;
  if (e.expr === "field" && typeof e.name === "string") out.add(e.name);
  for (const [key, value] of Object.entries(e)) {
    if (key === "value") continue; // a `lit` payload is data, not a sub-expression
    if (Array.isArray(value)) value.forEach((v) => exprFields(v, out));
    else if (value && typeof value === "object") exprFields(value, out);
  }
  return out;
}
