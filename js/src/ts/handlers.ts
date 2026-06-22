// A registry of named JS handlers for the `NamedJs` action — the action DSL's escape hatch. The app
// pre-registers handlers by name (so there is no arbitrary `eval`); the interpreter invokes them by
// name for the rare case the declarative actions can't express.

export type NamedHandler = (event: Event, currentTarget: Element) => void;

const handlers = new Map<string, NamedHandler>();

/** Register a JS handler that a `NamedJs("name")` action can invoke. */
export function registerHandler(name: string, fn: NamedHandler): void {
  handlers.set(name, fn);
}

export function getHandler(name: string): NamedHandler | undefined {
  return handlers.get(name);
}
