import type { Client } from "@1kbgz/transports";
import type { Store } from "./signals";
import type { StoreLink } from "./store-sync";

/** The managed connection and model selection belonging to one widget root. */
export interface WireContext {
  client: Client;
  link: StoreLink;
  store: Store;
  namespace: string | null;
}

interface WireRequest {
  namespace?: string | null;
  wire?: WireContext;
}

/** Request a wire from the closest widget root, including through a shadow root.
 * Without a namespace, the host must have exactly one wire. Call from connectedCallback;
 * the client exists before initial snapshots, so subscribe to link.onModel for its model ID.
 */
export function requestWire(
  element: Element,
  namespace?: string | null,
): WireContext | undefined {
  const detail: WireRequest = { namespace };
  element.dispatchEvent(
    new CustomEvent("spaday:wire-request", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
  return detail.wire;
}

export function provideWires(
  root: HTMLElement,
  wires: WireContext[],
): () => void {
  const receive = (event: Event) => {
    // A nested widget owns its requests even when it has no matching namespace.
    event.stopPropagation();
    const detail = (event as CustomEvent<WireRequest>).detail;
    if (!detail || typeof detail !== "object") return;
    detail.wire =
      detail.namespace === undefined
        ? wires.length === 1
          ? wires[0]
          : undefined
        : wires.find((wire) => wire.namespace === detail.namespace);
  };
  root.addEventListener("spaday:wire-request", receive);
  return () => root.removeEventListener("spaday:wire-request", receive);
}
