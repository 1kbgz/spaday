// A tiny reactive store: named state fields with subscribers — the client-side half of the reactive
// engine. The runtime binds component props to fields (a node's `bindings`, authored via `Component.bind`
// in Python); setting a field notifies every bound prop, and a two-way-bound control writes its field
// back on change. The same store can later be backed by a transports model or the anywidget model so UI
// state and app/server state mirror (Phase 2.4).

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
