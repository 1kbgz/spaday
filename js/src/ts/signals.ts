// A tiny reactive store: named state fields with subscribers — the client-side half of the reactive
// engine. The runtime binds component props to fields (a node's `bindings`, authored via `Component.bind`
// in Python); setting a field notifies every bound prop, and a two-way-bound control writes its field
// back on change. The same store can later be backed by a transports model or the anywidget model so UI
// state and app/server state mirror.

export type Field = string;
type Subscriber = (value: unknown) => void;

export class Store {
  private values: Map<Field, unknown>;
  private subscribers: Map<Field, Set<Subscriber>> = new Map();

  constructor(initial: Record<Field, unknown> = {}) {
    this.values = new Map(Object.entries(initial));
  }

  get(field: Field): unknown {
    return this.values.get(field);
  }

  has(field: Field): boolean {
    return this.values.has(field);
  }

  /** Set a field and notify its subscribers; a no-op if the value is unchanged. */
  set(field: Field, value: unknown): void {
    if (Object.is(this.values.get(field), value)) return;
    this.values.set(field, value);
    const subs = this.subscribers.get(field);
    if (subs) for (const cb of [...subs]) cb(value);
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
