import { applyPatch, mount, Node } from "./runtime";

interface SnapshotMessage {
  type: "snapshot";
  tree: Node;
}

interface PatchMessage {
  type: "patch";
  patch: Parameters<typeof applyPatch>[1];
}

interface ErrorMessage {
  type: "error";
  message: string;
}

type WorkerMessage = SnapshotMessage | PatchMessage | ErrorMessage;

export interface WorkerLink {
  /** Resolves after the worker's initial Python-authored tree has mounted. */
  ready: Promise<void>;
  /** Stop forwarding intents, detach the worker listener, and remove the mounted root. */
  dispose(): void;
}

/**
 * Mount trees produced by a Python Web Worker and forward declarative `SendPatch` intents to it.
 * Python computes component-tree patches; the browser applies them to the existing DOM.
 */
export function connectWorker(container: Element, worker: Worker): WorkerLink {
  let root: Element | undefined;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const receive = (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    if (message.type === "snapshot") {
      if (root) root.remove();
      root = mount(container, message.tree);
      resolveReady();
    } else if (message.type === "patch") {
      if (!root) throw new Error("worker sent a patch before its snapshot");
      root = applyPatch(root, message.patch);
    } else if (message.type === "error") {
      rejectReady(new Error(message.message));
    }
  };
  const fail = (event: ErrorEvent) => rejectReady(new Error(event.message));
  const forward = (event: Event) => {
    worker.postMessage({
      type: event.type,
      detail: (event as CustomEvent).detail,
    });
  };

  worker.addEventListener("message", receive);
  worker.addEventListener("error", fail);
  container.addEventListener("spaday:patch", forward);
  worker.postMessage({ type: "start" });

  return {
    ready,
    dispose() {
      worker.removeEventListener("message", receive);
      worker.removeEventListener("error", fail);
      container.removeEventListener("spaday:patch", forward);
      root?.remove();
    },
  };
}
