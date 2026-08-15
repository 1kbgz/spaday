// A tiny reactive store: named state fields with subscribers — the client-side half of the reactive
// engine. The runtime binds component props to fields (a node's `bindings`, authored via `Component.bind`
// in Python); setting a field notifies every bound prop, and a two-way-bound control writes its field
// back on change. The same store can later be backed by a transports model or the anywidget model so UI
// state and app/server state mirror.

export type Field = string; // a field name, or a dotted path into nested state (e.g. "address.street")
type Subscriber = (value: unknown) => void;
type SubscriberIndex = {
  field?: Field;
  children: Map<string, SubscriberIndex>;
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  v != null && typeof v === "object" && !Array.isArray(v);

function readPath(value: unknown, path: string): unknown {
  if (!path) return value;
  let current = value;
  for (const part of path.split(".")) {
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isSafeInteger(index) || index < 0 || index >= current.length)
        return undefined;
      current = current[index];
    } else if (isObj(current) && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/** A reactive lexical item scope. Named lookup chooses the nearest matching current/ancestor scope. */
export class Scope {
  private subscribers = new Set<() => void>();

  constructor(
    private value: unknown,
    readonly name?: string,
    readonly parent?: Scope,
  ) {}

  get(path = ""): unknown {
    return readPath(this.value, path);
  }

  resolve(name: string): Scope | undefined {
    for (let scope: Scope | undefined = this; scope; scope = scope.parent) {
      if (scope.name === name) return scope;
    }
    return undefined;
  }

  set(value: unknown): void {
    if (Object.is(this.value, value)) return;
    this.value = value;
    for (const subscriber of [...this.subscribers]) subscriber();
  }

  subscribe(subscriber: () => void): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }
}

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
  private subscriberIndex: SubscriberIndex = { children: new Map() };

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

  private index(field: Field): void {
    let node = this.subscriberIndex;
    for (const part of field.split(".")) {
      let child = node.children.get(part);
      if (!child) {
        child = { children: new Map() };
        node.children.set(part, child);
      }
      node = child;
    }
    node.field = field;
  }

  private unindex(field: Field): void {
    const chain: Array<[SubscriberIndex, string, SubscriberIndex]> = [];
    let node = this.subscriberIndex;
    for (const part of field.split(".")) {
      const child = node.children.get(part);
      if (!child) return;
      chain.push([node, part, child]);
      node = child;
    }
    delete node.field;
    for (let i = chain.length - 1; i >= 0; i -= 1) {
      const [parent, part, child] = chain[i];
      if (child.field || child.children.size) break;
      parent.children.delete(part);
    }
  }

  private related(field: Field): Field[] {
    const related: Field[] = [];
    let node = this.subscriberIndex;
    for (const part of field.split(".")) {
      const child = node.children.get(part);
      if (!child) return related;
      node = child;
      if (node.field) related.push(node.field);
    }
    const descendants = [...node.children.values()];
    while (descendants.length) {
      const child = descendants.pop()!;
      if (child.field) related.push(child.field);
      descendants.push(...child.children.values());
    }
    return related;
  }

  /**
   * Set a field and notify subscribers; a no-op if unchanged. A dotted `field` sets a nested leaf,
   * rebuilding its parents immutably, and notifies the leaf plus its ancestors (whose identity changed)
   * and any subscribed descendant whose value changed.
   */
  set(field: Field, value: unknown): void {
    if (Object.is(this.get(field), value)) return;
    const related = this.related(field);
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
      const subscribers = this.subscribers.get(k);
      if (!Object.is(before.get(k), now) && subscribers)
        for (const cb of [...subscribers]) cb(now);
    }
  }

  /** Subscribe to a field; returns an unsubscribe function. */
  subscribe(field: Field, cb: Subscriber): () => void {
    let subs = this.subscribers.get(field);
    if (!subs) {
      this.subscribers.set(field, (subs = new Set()));
      this.index(field);
    }
    subs.add(cb);
    return () => {
      subs!.delete(cb);
      if (!subs!.size && this.subscribers.get(field) === subs) {
        this.subscribers.delete(field);
        this.unindex(field);
      }
    };
  }
}

// A field-expression: serializable data the runtime evaluates against the store to drive a *computed*
// binding (a prop derived from state fields). It shares the action DSL's `{expr: kind, ...}` shape plus
// a `field` reference; only the store-relevant forms are evaluated here.
export function evalExpr(expr: unknown, store?: Store, scope?: Scope): unknown {
  if (!expr || typeof expr !== "object") return expr;
  const e = expr as Record<string, unknown>;
  switch (e.expr) {
    case "lit":
      return e.value;
    case "field":
      return store?.get(e.name as string);
    case "item":
      return scope?.get(e.path as string);
    case "scope":
      return scope?.resolve(e.name as string)?.get(e.path as string);
    case "not":
      return !evalExpr(e.of, store, scope);
    case "eq":
      return Object.is(
        evalExpr(e.a, store, scope),
        evalExpr(e.b, store, scope),
      );
    case "all":
      return (e.of as unknown[]).every((x) => !!evalExpr(x, store, scope));
    case "any":
      return (e.of as unknown[]).some((x) => !!evalExpr(x, store, scope));
    case "cond":
      return evalExpr(e.test, store, scope)
        ? evalExpr(e.then, store, scope)
        : evalExpr(e["else"], store, scope);
    case "obj": {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(e.fields as Record<string, unknown>))
        out[k] = evalExpr(v, store, scope);
      return out;
    }
    case "concat":
      return (e.parts as unknown[])
        .map((part) => String(evalExpr(part, store, scope)))
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

/** The reactive item scopes an expression reads. Missing named scopes have no dependency. */
export function exprScopes(
  expr: unknown,
  scope?: Scope,
  out: Set<Scope> = new Set(),
): Set<Scope> {
  if (!expr || typeof expr !== "object") return out;
  const e = expr as Record<string, unknown>;
  if (e.expr === "item" && scope) out.add(scope);
  if (e.expr === "scope" && scope && typeof e.name === "string") {
    const named = scope.resolve(e.name);
    if (named) out.add(named);
  }
  for (const [key, value] of Object.entries(e)) {
    if (key === "value") continue;
    if (Array.isArray(value))
      value.forEach((nested) => exprScopes(nested, scope, out));
    else if (value && typeof value === "object") exprScopes(value, scope, out);
  }
  return out;
}
