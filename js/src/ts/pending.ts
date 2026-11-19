import { setProp } from "./runtime";

let definitionTimeout = 10000;

/**
 * Set how long, in milliseconds, an action waits for its element to be defined before it is
 * dropped (10000 by default). Page-wide. Applies to waits that start after the call.
 */
export function setDefinitionTimeout(ms: number): void {
  if (!Number.isFinite(ms) || ms <= 0 || ms > 2147483647)
    throw new RangeError(
      "spaday: definition timeout must be positive and at most 2147483647ms",
    );
  definitionTimeout = ms;
}

interface Waiter {
  el: Element;
  connected: boolean;
  settle: (usable: boolean) => void;
}

interface Awaiting {
  props: WeakRef<Element>[];
  waiters: Set<Waiter>;
}

/* Props written to a custom element before its class has upgraded it, re-applied once it has.
 *
 * Until then the element has none of its class's properties, so setProp would fall back to an
 * attribute: an object stringifies to "[object Object]", and an element that never reads its
 * attributes loses even a primitive. A bundle that defines its elements after the page mounts (one
 * that awaits at the top level, or loads lazily) hits exactly that. So the last value written under
 * each name is kept and set through the property when the tag is defined. A primitive still goes to
 * the attribute at once, which keeps a never-defined tag working as a styling hook; an object waits.
 * Elements are tracked per tag through WeakRefs, so a tag that is never defined holds no element. */
const deferredProps = new WeakMap<Element, Map<string, unknown>>();
const awaiting = new Map<string, Awaiting>();
const warned = new Set<string>();

function awaitTag(tag: string): Awaiting {
  const existing = awaiting.get(tag);
  if (existing) return existing;
  const entry: Awaiting = { props: [], waiters: new Set() };
  awaiting.set(tag, entry);
  void customElements.whenDefined(tag).then(() => flush(tag));
  return entry;
}

function flush(tag: string): number {
  const entry = awaiting.get(tag);
  if (!entry) return 0;
  awaiting.delete(tag);
  for (const ref of entry.props) {
    const target = ref.deref();
    const pending = target && deferredProps.get(target);
    if (!target || !pending) continue;
    try {
      customElements.upgrade(target); // the definition upgrades only elements in the document
      if (!target.matches(":defined")) continue;
      for (const [prop, value] of pending) setProp(target, prop, value);
    } catch (error) {
      console.error(`spaday: <${tag}> rejected a deferred prop`, error);
    } finally {
      deferredProps.delete(target);
    }
  }
  const waiters = [...entry.waiters];
  for (const waiter of waiters) {
    if (!waiter.el.matches(":defined")) customElements.upgrade(waiter.el);
    waiter.settle(
      waiter.el.matches(":defined") &&
        (!waiter.connected || waiter.el.isConnected),
    );
  }
  return waiters.length;
}

export function deferProp(el: Element, name: string, value: unknown): void {
  const props = deferredProps.get(el);
  if (props) {
    props.set(name, value);
    return;
  }
  deferredProps.set(el, new Map([[name, value]]));
  awaitTag(el.localName).props.push(new WeakRef(el));
}

/** Primitive fallback attributes remain readable before definition, including removed booleans. */
export function hasAttributeValue(el: Element, name: string): boolean {
  if (el.hasAttribute(name)) return true;
  const props = deferredProps.get(el);
  if (!props?.has(name)) return false;
  const value = props.get(name);
  return value === null || typeof value !== "object";
}

/** Drop a deferred prop: the write it was holding has been withdrawn. */
export function forgetProp(el: Element, name: string): void {
  deferredProps.get(el)?.delete(name);
}

/**
 * Whether `el` can be called and read now. `undefined` means it can. Otherwise the promise resolves
 * once its tag is defined: `true` to go ahead, `false` when the wait was abandoned (the element was
 * removed, `signal` aborted, or the tag was not defined in time).
 */
export function whenUsable(
  el: Element,
  signal?: AbortSignal,
): Promise<boolean> | undefined {
  const tag = el.localName;
  if (!tag.includes("-")) return undefined;
  if (customElements.get(tag)) {
    const ahead = flush(tag);
    if (!el.matches(":defined")) customElements.upgrade(el);
    if (!el.matches(":defined")) return Promise.resolve(false);
    return ahead ? Promise.resolve(true) : undefined;
  }
  if (el.matches(":defined")) return undefined;
  if (signal?.aborted) return Promise.resolve(false);
  const { waiters } = awaitTag(tag);
  const limit = definitionTimeout;
  return new Promise<boolean>((resolve) => {
    const settle = (usable: boolean) => {
      if (!waiters.delete(waiter)) return;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abandon);
      resolve(usable);
    };
    const abandon = () => settle(false);
    const waiter: Waiter = { el, connected: el.isConnected, settle };
    const timer = setTimeout(() => {
      if (!warned.has(tag)) {
        warned.add(tag);
        console.warn(
          `spaday: <${tag}> was not defined within ${limit / 1000}s; ` +
            "the actions waiting on it were dropped",
        );
      }
      settle(false);
    }, limit);
    signal?.addEventListener("abort", abandon);
    waiters.add(waiter);
  });
}
