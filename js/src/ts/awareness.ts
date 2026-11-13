import type { Client } from "@1kbgz/transports";
import type { Store } from "./signals";
import type { StoreLink } from "./store-sync";

export interface AwarenessBinding {
  /** Local store field to publish; null/undefined withdraws this scope. */
  local?: string | null;
  /** Store field receiving an array of {peer, state}, excluding this connection. */
  peers?: string | null;
}

/** Bind ephemeral state through an existing model link. Presentation belongs to the application. */
export function connectAwareness(
  store: Store,
  client: Client,
  link: StoreLink,
  bindings: Record<string, AwarenessBinding>,
): () => void {
  let id: number | undefined;
  let suspended = false;
  let disposed = false;
  const entries = Object.entries(bindings);
  const render = (changedScope?: string) => {
    for (const [scope, binding] of entries) {
      if (
        !binding.peers ||
        (changedScope !== undefined && changedScope !== scope)
      )
        continue;
      store.set(
        binding.peers,
        id === undefined
          ? []
          : [...client.awareness(id, { scope })].map(([peer, state]) => ({
              peer,
              state,
            })),
      );
    }
  };
  const publish = (scope: string, binding: AwarenessBinding) => {
    if (!disposed && !suspended && id !== undefined && binding.local)
      client.setAwareness(id, store.get(binding.local) ?? null, { scope });
  };
  const withdraw = () => {
    if (id !== undefined)
      for (const [scope, binding] of entries)
        if (binding.local) client.setAwareness(id, null, { scope });
  };
  const stops = entries.flatMap(([scope, binding]) => [
    client.onAwareness(
      (update) => {
        if (update.id === id) render(scope);
      },
      { scope },
    ),
    ...(binding.local
      ? [store.subscribe(binding.local, () => publish(scope, binding))]
      : []),
  ]);
  stops.push(
    link.onModel((model) => {
      if (model !== id) withdraw();
      id = model;
      for (const [scope, binding] of entries) publish(scope, binding);
      render();
    }),
  );
  stops.push(
    client.onChange(() => {
      if (link.error) {
        withdraw();
        id = undefined;
        render();
      }
    }),
  );
  stops.push(client.onDisconnect(() => render()));
  const hide = () => {
    suspended = true;
    withdraw();
  };
  const show = () => {
    suspended = false;
    for (const [scope, binding] of entries) publish(scope, binding);
  };
  window.addEventListener("pagehide", hide);
  window.addEventListener("pageshow", show);
  render();
  return () => {
    if (disposed) return;
    disposed = true;
    stops.forEach((stop) => stop());
    window.removeEventListener("pagehide", hide);
    window.removeEventListener("pageshow", show);
    withdraw();
    id = undefined;
    render();
  };
}
