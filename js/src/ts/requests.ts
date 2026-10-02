import { attachController } from "./lifecycle";
import type { Store } from "./signals";

export interface RequestOptions {
  key: string;
  pending?: string;
  watch?: string[];
}

interface ActiveRequest {
  cancel: () => void;
  pending?: string;
}
const requests = new WeakMap<object, Map<string, ActiveRequest>>();

/** Latest wins per Store/key; without a Store the invoking element owns the group. */
export function manageRequest(
  root: Element,
  store: Store | undefined,
  options: RequestOptions,
) {
  const owner = store ?? root;
  let active = requests.get(owner);
  if (!active) requests.set(owner, (active = new Map()));
  const previous = active.get(options.key);
  const controller = new AbortController();
  const unsubscribes: Array<() => void> = [];
  let release = () => {};
  let finished = false;
  let finishing = false;
  const finish = () => {
    if (finished || finishing) return;
    finishing = true;
    const current = active!.get(options.key);
    for (const unsubscribe of unsubscribes) unsubscribe();
    try {
      if (
        options.pending &&
        (current === entry || current?.pending !== options.pending)
      )
        store?.set(options.pending, false);
    } finally {
      if (active!.get(options.key) === entry) active!.delete(options.key);
      finished = true;
      release();
    }
  };
  const cancel = () => {
    if (finished) return;
    controller.abort();
    finish();
  };
  const entry = { cancel, pending: options.pending };
  active.set(options.key, entry);
  release = attachController(root, controller, () => cancel);
  for (const field of options.watch ?? [])
    if (store) unsubscribes.push(store.subscribe(field, cancel));
  previous?.cancel();
  if (!finished && options.pending) store?.set(options.pending, true);
  return { signal: controller.signal, finish };
}
