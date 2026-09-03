// The browser runtime: turn a spaday component tree into real DOM web components, and apply the
// core's tree patches incrementally (preserving live element instances across updates).
//
// This is the consumer of the diff engine: the server (Python) computes a patch with the shared Rust
// `diff`; the browser applies it here against live DOM, so a `wa-switch`'s internal state survives an
// update instead of being re-created. It renders structure + props and binds the action-DSL event
// handlers, rebinding/detaching them as incremental `SetEvent`/`RemoveEvent` patches arrive.

import { interpret } from "./actions";
import {
  type CollectionDelta,
  type CollectionPathSegment,
  evalExpr,
  exprFields,
  exprScopes,
  Scope,
  Store,
} from "./signals";
import { untag, Value } from "./value";

export interface Binding {
  field?: string;
  compute?: unknown;
  mode: string;
}

export interface Node {
  tag: string;
  key?: string;
  props?: Record<string, Value>;
  slots?: Record<string, Node[]>;
  events?: Record<string, unknown>;
  bindings?: Record<string, Binding>;
}

interface PathSeg {
  slot: string;
  index: number;
}
type Path = PathSeg[];

const DEFAULT_SLOT = "default";

/**
 * Build the DOM for a tree and append it to `container`; returns the root element. Pass a `store` to
 * activate the tree's reactive `bindings` (prop ↔ state field); without one, bindings are inert.
 */
export function mount(
  container: Element,
  tree: Node,
  store?: Store,
  scope?: Scope,
): Element {
  const el = build(tree, store, scope);
  container.appendChild(el);
  return el;
}

/**
 * Apply a tree patch (from the core `diff`) to a mounted root, mutating the DOM in place. Returns the
 * current root — a root-level `Replace` swaps the element, so callers must keep the returned value
 * (the original `root` reference would be left detached).
 */
// Mounted roots that can be refreshed from their tree URL (registered by the bootstrap; a page
// normally has one). `refreshRoots` re-fetches, diffs against the tree as-mounted (via the core),
// and applies the patch in place — "server state changed, re-render" without a live wire.
interface TrackedRoot {
  root: Element;
  node: Node;
  src: string;
  store?: Store;
}
const trackedRoots: TrackedRoot[] = [];

export function trackRoot(
  root: Element,
  node: Node,
  src: string,
  store?: Store,
): void {
  trackedRoots.push({ root, node, src, store });
}

export async function refreshRoots(url?: string): Promise<void> {
  const { diff } = await import("../../dist/pkg/spaday");
  lazyCache.clear(); // server state changed: cached lazy bodies are stale
  for (const tracked of trackedRoots) {
    const source = url ?? tracked.src;
    if (!source) continue;
    const response = await fetch(source);
    if (!response.ok)
      throw new Error(`refresh: ${source} responded ${response.status}`);
    const next = (await response.json()) as Node;
    const patch = JSON.parse(
      diff(JSON.stringify(tracked.node), JSON.stringify(next)),
    ) as { ops: Op[] };
    tracked.root = applyPatch(tracked.root, patch, tracked.store);
    tracked.node = next;
    // mounted lazy bodies live at their own URLs, which the tree diff can't see — refetch
    // them (the reloader swaps the body only if the payload actually changed)
    for (const el of tracked.root.querySelectorAll("spa-lazy"))
      lazyReloaders.get(el)?.();
    if (tracked.root.tagName.toLowerCase() === "spa-lazy")
      lazyReloaders.get(tracked.root)?.();
  }
}

export function applyPatch(
  root: Element,
  patch: { ops: Op[] },
  store?: Store,
  scope?: Scope,
): Element {
  let current = root;
  const refreshed = new Set<Element>();
  for (const op of patch.ops)
    current = applyOp(current, op, store, scope, refreshed);
  // structural elements whose stored definitions changed re-wire once, after all ops landed
  for (const el of refreshed)
    if (el.isConnected) refreshStructural(el, store, scope);
  return current;
}

/**
 * Hydrate server-rendered HTML (see Python `spaday.render_html`): adopt the existing DOM under
 * `container` for `tree` instead of rebuilding it — attach event handlers + reactive bindings and
 * (re)set props (so complex props the HTML couldn't carry, like a chart's data, are applied), reusing
 * the live elements. Returns the root. Falls back to a full `mount` if nothing was pre-rendered.
 */
export function hydrate(
  container: Element,
  tree: Node,
  store?: Store,
  scope?: Scope,
): Element {
  const el = container.firstElementChild;
  if (!el) return mount(container, tree, store, scope);
  hydrateNode(el, tree, store, scope);
  return el;
}

function hydrateNode(
  el: Element,
  node: Node,
  store?: Store,
  scope?: Scope,
): void {
  for (const [name, value] of Object.entries(node.props ?? {})) {
    setProp(el, name, untag(value)); // re-affirm props; sets complex/property-only ones the HTML omitted
  }
  if (node.tag === "spa-show") {
    wireShow(el, node, store, scope); // structural children are client-mounted (the HTML rendered none)
  } else if (node.tag === "spa-each") {
    wireEach(el, node, store, scope);
  } else if (node.tag === "spa-switch") {
    wireSwitch(el, node, store, scope);
  } else if (node.tag === "spa-lazy") {
    wireLazy(el, node, store, scope);
  } else {
    for (const [slot, children] of Object.entries(node.slots ?? {})) {
      const existing = childrenInSlot(el, slot);
      children.forEach((child, i) => {
        if (existing[i]) hydrateNode(existing[i], child, store, scope);
        else appendInSlot(el, slot, build(child, store, scope)); // HTML missing this child → build it
      });
    }
  }
  for (const [name, action] of Object.entries(node.events ?? {})) {
    bindEvent(el, name, action, store, scope); // actions ride the wire as the core's DSL form (plain JSON)
  }
  if (store || scope) {
    for (const [prop, spec] of Object.entries(node.bindings ?? {})) {
      if (isStructuralBinding(node, prop)) continue;
      wireBinding(el, prop, spec, store, scope);
    }
  }
}

// Live action listeners per element, so an incremental patch can update them: the diff engine emits
// `SetEvent` when an action is added/changed and `RemoveEvent` when one is removed on an existing node.
const listeners = new WeakMap<Element, Map<string, EventListener>>();

function bindEvent(
  el: Element,
  name: string,
  action: unknown,
  store?: Store,
  scope?: Scope,
): void {
  let map = listeners.get(el);
  if (!map) listeners.set(el, (map = new Map()));
  const existing = map.get(name);
  if (existing) el.removeEventListener(name, existing); // replace, don't stack
  const handler: EventListener = (event) => {
    // A bound context menu replaces the native one; suppression is scoped to exactly the
    // elements that carry a `contextmenu` action.
    if (name === "contextmenu") event.preventDefault();
    interpret(action, { event, currentTarget: el, store, scope });
  };
  el.addEventListener(name, handler);
  map.set(name, handler);
}

function unbindEvent(el: Element, name: string): void {
  const map = listeners.get(el);
  const handler = map?.get(name);
  if (handler) {
    el.removeEventListener(name, handler);
    map!.delete(name);
  }
}

// Live binding teardowns per element/prop, so an incremental patch can rewire or detach them. A binding
// subscribes the prop to its state field; a two-way binding also writes the field when the control changes.
const bindings = new WeakMap<Element, Map<string, () => void>>();
const structuralNodes = new WeakMap<Element, Node>();
// `refreshRoots` re-fetches lazy bodies too (server state changed): each spa-lazy registers a
// reloader that refetches its src and swaps the mounted body only when the payload changed.
const lazyReloaders = new WeakMap<Element, () => void>();
const VALUE_EVENTS = ["change", "input", "wa-tab-show"]; // a control writes its bound field on these (wa-tab-show: a wa-tab-group's active tab changed)

function readProp(el: Element, name: string): unknown {
  if (name in el) return (el as unknown as Record<string, unknown>)[name];
  return el.hasAttribute(name) ? el.getAttribute(name) : null;
}

// The setter a binding drives. Normally a prop on the bound element; a `root-class:NAME` or
// `root-attr:NAME` binding instead writes the document root (`<html>`) — page-level theming (e.g.
// WebAwesome's `wa-dark`, or a `:root[data-density='comfortable']` token set) that lives outside the
// component tree. Authored via `Component.bind_root_class` / `bind_root_attr`. A class is a boolean, so
// it coerces; an attribute keeps its value, and is written as an attribute even when the name shadows a
// property of `<html>` (`title`, `lang`, `dir`, …).
function bindingApply(el: Element, prop: string): (value: unknown) => void {
  const ROOT_CLASS = "root-class:";
  const ROOT_ATTR = "root-attr:";
  if (prop.startsWith(ROOT_CLASS)) {
    const name = prop.slice(ROOT_CLASS.length);
    return (v) => document.documentElement.classList.toggle(name, !!v);
  }
  if (prop.startsWith(ROOT_ATTR)) {
    const name = prop.slice(ROOT_ATTR.length);
    return (v) => setAttr(document.documentElement, name, v);
  }
  return (v) => setProp(el, prop, v);
}

function wireBinding(
  el: Element,
  prop: string,
  spec: Binding,
  store?: Store,
  scope?: Scope,
): void {
  unwireBinding(el, prop); // replace any prior wiring for this prop
  const teardowns: Array<() => void> = [];
  const apply = bindingApply(el, prop);
  if (spec.compute !== undefined) {
    // computed (derived) binding: recompute the prop from the expression whenever any field it reads
    // changes. One-way by nature — there is nothing to write back. One settled state change can notify
    // several of the fields the expression reads (an object write notifies the field and each changed
    // sub-path); skip the write when the recomputed value is unchanged, so effectful props (e.g. a
    // toast queue's message) see one write per real change, not one per notification.
    let last: unknown;
    let wrote = false;
    const recompute = () => {
      const value = evalExpr(spec.compute, store, scope);
      if (wrote && Object.is(value, last)) return;
      last = value;
      wrote = true;
      apply(value);
    };
    recompute(); // initial value
    if (store)
      for (const field of exprFields(spec.compute)) {
        teardowns.push(store.subscribe(field, recompute));
      }
    for (const dependency of exprScopes(spec.compute, scope))
      teardowns.push(dependency.subscribe(recompute));
  } else if (spec.field !== undefined && store) {
    if (store.has(spec.field)) apply(store.get(spec.field)); // initial field → prop
    teardowns.push(store.subscribe(spec.field, (v) => apply(v)));
    if (spec.mode === "two-way") {
      const onChange = () => {
        // Don't propagate an invalid value (e.g. a non-numeric or out-of-range entry in a constrained
        // control): the store/server keep the last good value and the control shows its own invalid
        // state. Server-side validation (transports) is still the authority; this just avoids the
        // doomed round-trip. Controls without constraint validation always pass.
        const v = el as unknown as { checkValidity?: () => boolean };
        if (typeof v.checkValidity === "function" && !v.checkValidity()) return;
        store.set(spec.field!, readProp(el, prop));
      };
      for (const ev of VALUE_EVENTS) el.addEventListener(ev, onChange);
      teardowns.push(() => {
        for (const ev of VALUE_EVENTS) el.removeEventListener(ev, onChange);
      });
    }
  }
  let map = bindings.get(el);
  if (!map) bindings.set(el, (map = new Map()));
  map.set(prop, () => teardowns.forEach((t) => t()));
}

function unwireBinding(el: Element, prop: string): void {
  const map = bindings.get(el);
  const teardown = map?.get(prop);
  if (teardown) {
    teardown();
    map!.delete(prop);
  }
}

// `spa-show`: a structural binding. Its default-slot children are MOUNTED when the `when` condition is
// truthy and TORN DOWN + removed (not merely hidden) when it is falsy — reactive creation/removal of real
// elements. The wrapper itself stays put (authored `display:contents`), so sibling paths don't shift as
// children come and go.
function wireShow(el: Element, node: Node, store?: Store, scope?: Scope): void {
  structuralNodes.set(el, node);
  const cond = node.bindings?.when;
  const childDefs = node.slots?.[DEFAULT_SLOT] ?? [];
  let mounted: Element[] = [];
  const clear = (): void => {
    for (const child of mounted) {
      teardownTree(child);
      child.remove();
    }
    mounted = [];
  };
  const inert =
    !cond || (cond.compute === undefined ? !store : !store && !scope);
  if (inert) {
    for (const child of childDefs) {
      const built = build(child, store, scope);
      appendInSlot(el, DEFAULT_SLOT, built);
      mounted.push(built);
    }
    let map = bindings.get(el);
    if (!map) bindings.set(el, (map = new Map()));
    map.set("when", clear);
    return;
  }
  const evaluate = (): boolean =>
    cond.compute !== undefined
      ? !!evalExpr(cond.compute, store, scope)
      : !!store!.get(cond.field!);
  const render = (): void => {
    if (evaluate()) {
      if (mounted.length === 0) {
        for (const c of childDefs) {
          const ce = build(c, store, scope);
          appendInSlot(el, DEFAULT_SLOT, ce);
          mounted.push(ce);
        }
      }
    } else if (mounted.length) clear();
  };
  render(); // initial state
  const deps =
    cond.compute !== undefined ? [...exprFields(cond.compute)] : [cond.field!];
  const subs = store ? deps.map((f) => store.subscribe(f, render)) : [];
  if (cond.compute !== undefined)
    for (const dependency of exprScopes(cond.compute, scope))
      subs.push(dependency.subscribe(render));
  let map = bindings.get(el); // record teardown so removing the spa-show unsubscribes (via teardownTree)
  if (!map) bindings.set(el, (map = new Map()));
  map.set("when", () => {
    for (const unsubscribe of subs) unsubscribe();
    clear();
  });
}

// `spa-switch`: routing on one value — exactly one case's subtree is mounted at a time. Cases are
// named slots keyed by the matched value ("default" is the fallback), so a change tears down one
// branch and mounts one branch: O(1) per switch, versus N `spa-show` predicates.
function wireSwitch(
  el: Element,
  node: Node,
  store?: Store,
  scope?: Scope,
): void {
  structuralNodes.set(el, node);
  const on = node.bindings?.on;
  let mounted: Element[] = [];
  let currentKey: string | null = null;
  const clear = (): void => {
    for (const child of mounted) {
      teardownTree(child);
      child.remove();
    }
    mounted = [];
  };
  const evaluate = (): string => {
    const value =
      on?.compute !== undefined
        ? evalExpr(on.compute, store, scope)
        : on?.field !== undefined
          ? store?.get(on.field)
          : undefined;
    return value == null ? "" : String(value);
  };
  const render = (): void => {
    const value = evaluate();
    const key = node.slots?.[value] !== undefined ? value : DEFAULT_SLOT;
    if (key === currentKey) return;
    clear();
    currentKey = key;
    for (const child of node.slots?.[key] ?? []) {
      const built = build(child, store, scope);
      el.appendChild(built);
      mounted.push(built);
    }
  };
  render(); // initial case
  const subs: (() => void)[] = [];
  if (on?.compute !== undefined) {
    if (store)
      for (const f of exprFields(on.compute))
        subs.push(store.subscribe(f, render));
    for (const dependency of exprScopes(on.compute, scope))
      subs.push(dependency.subscribe(render));
  } else if (on?.field !== undefined && store) {
    subs.push(store.subscribe(on.field, render));
  }
  let map = bindings.get(el);
  if (!map) bindings.set(el, (map = new Map()));
  map.set("on", () => {
    for (const unsubscribe of subs) unsubscribe();
    clear();
  });
}

// One shared cache per page: a deferred subtree is fetched once and reused by every `spa-lazy`
// with the same src (and across remounts, e.g. a Switch flipping away and back).
const lazyCache = new Map<string, Promise<Node>>();

// `spa-lazy`: a subtree deferred to a URL. The initial tree carries only this placeholder node;
// the body (a serialized component, e.g. Python `tree_json(element(...))`) is fetched when the
// node first activates — immediately on mount, or when an optional `when` condition first turns
// truthy — then built and mounted like any other subtree. Slot children act as the placeholder
// and are replaced when the fetch lands.
function wireLazy(el: Element, node: Node, store?: Store, scope?: Scope): void {
  structuralNodes.set(el, node);
  const src = untag(node.props?.src ?? { Str: "" }) as string;
  const cond = node.bindings?.when;
  let mounted: Element[] = [];
  let loaded = false;
  let disposed = false;
  let lastBodyJson: string | null = null;
  const clear = (): void => {
    for (const child of mounted) {
      teardownTree(child);
      child.remove();
    }
    mounted = [];
  };
  // placeholder children until the fetch lands
  for (const child of node.slots?.[DEFAULT_SLOT] ?? []) {
    const built = build(child, store, scope);
    el.appendChild(built);
    mounted.push(built);
  }
  const activate = (): void => {
    if (loaded || !src) return;
    loaded = true;
    let promise = lazyCache.get(src);
    if (!promise) {
      promise = fetch(src).then((response) => {
        if (!response.ok)
          throw new Error(`spa-lazy: ${src} responded ${response.status}`);
        return response.json() as Promise<Node>;
      });
      lazyCache.set(src, promise);
    }
    promise
      .then((body) => {
        if (disposed) return;
        const json = JSON.stringify(body);
        if (json === lastBodyJson) return; // a reload with an unchanged payload is a no-op
        lastBodyJson = json;
        clear();
        const built = build(body, store, scope);
        el.appendChild(built);
        mounted.push(built);
      })
      .catch((error) => {
        lazyCache.delete(src); // a failed fetch may be retried by a later activation
        loaded = false;
        console.error("spa-lazy: failed to load", src, error);
      });
  };
  // `refreshRoots` refetches an already-loaded body (its cache entry was just invalidated)
  lazyReloaders.set(el, () => {
    if (disposed || !loaded) return;
    loaded = false;
    activate();
  });
  const subs: (() => void)[] = [];
  if (!cond) {
    activate();
  } else {
    const evaluate = (): boolean =>
      cond.compute !== undefined
        ? !!evalExpr(cond.compute, store, scope)
        : !!store?.get(cond.field!);
    const check = (): void => {
      if (evaluate()) activate();
    };
    check();
    if (cond.compute !== undefined) {
      if (store)
        for (const f of exprFields(cond.compute))
          subs.push(store.subscribe(f, check));
      for (const dependency of exprScopes(cond.compute, scope))
        subs.push(dependency.subscribe(check));
    } else if (cond.field !== undefined && store) {
      subs.push(store.subscribe(cond.field, check));
    }
  }
  let map = bindings.get(el);
  if (!map) bindings.set(el, (map = new Map()));
  map.set("when", () => {
    disposed = true;
    for (const unsubscribe of subs) unsubscribe();
    clear();
  });
}

interface EachInstance {
  element: Element;
  scope: Scope;
}

function eachKeyIdentity(value: unknown, key: string): string {
  if (typeof value === "string") return `string:${value}`;
  if (typeof value === "number" && Number.isFinite(value))
    return `number:${value}`;
  throw new Error(
    `spa-each key ${JSON.stringify(key)} must exist and contain a string or finite number`,
  );
}

function eachIdentity(item: unknown, key: string): string {
  return eachKeyIdentity(new Scope(item).get(key), key);
}

function keyedItems(
  items: readonly unknown[],
  key: string,
): Array<[string, unknown]> {
  const seen = new Set<string>();
  return items.map((item) => {
    const identity = eachIdentity(item, key);
    if (seen.has(identity))
      throw new Error(
        `spa-each key ${JSON.stringify(key)} contains duplicate value ${JSON.stringify(new Scope(item).get(key))}`,
      );
    seen.add(identity);
    return [identity, item];
  });
}

function collectionIndex(index: number, length: number, insert = false): void {
  const maximum = insert ? length : length - 1;
  if (!Number.isSafeInteger(index) || index < 0 || index > maximum)
    throw new Error(
      `spa-each collection index ${index} is outside 0..${maximum}`,
    );
}

function updateCollectionPath(
  current: unknown,
  path: readonly CollectionPathSegment[],
  value: unknown,
): unknown {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    if (
      !Array.isArray(current) ||
      !Number.isSafeInteger(head) ||
      head < 0 ||
      head >= current.length
    )
      throw new Error(
        `spa-each collection update has invalid path segment ${head}`,
      );
    const next = [...current];
    next[head] = updateCollectionPath(next[head], rest, value);
    return next;
  }
  if (current == null || typeof current !== "object" || Array.isArray(current))
    throw new Error(
      `spa-each collection update has invalid path segment ${JSON.stringify(head)}`,
    );
  const next = { ...(current as Record<string, unknown>) };
  next[head] = rest.length
    ? updateCollectionPath(next[head], rest, value)
    : value;
  return next;
}

type PreparedEachDelta =
  | { kind: "reset"; items: Array<[string, unknown]> }
  | { kind: "insert"; identity: string; index: number; item: unknown }
  | { kind: "update"; identity: string; item: unknown }
  | { kind: "move"; identity: string; index: number }
  | { kind: "reorder"; order: string[] }
  | { kind: "remove"; identity: string };

function prepareEachDeltas(
  deltas: readonly CollectionDelta[],
  itemKey: string,
  order: readonly string[],
  instances: ReadonlyMap<string, EachInstance>,
): PreparedEachDelta[] {
  let nextOrder: string[] | undefined;
  let values = new Map<string, unknown>();
  const currentOrder = (): string[] => (nextOrder ??= [...order]);
  const currentValue = (identity: string): unknown =>
    values.has(identity)
      ? values.get(identity)
      : instances.get(identity)?.scope.get();
  const prepared: PreparedEachDelta[] = [];
  for (const delta of deltas) {
    if (delta.kind === "reset") {
      const items = keyedItems(delta.items, itemKey);
      nextOrder = items.map(([identity]) => identity);
      values = new Map(items);
      prepared.push({ kind: "reset", items });
      continue;
    }
    if (delta.kind === "reorder") {
      const sequence = currentOrder();
      const reordered = delta.keys.map((key) => eachKeyIdentity(key, itemKey));
      const identities = new Set(reordered);
      if (
        reordered.length !== sequence.length ||
        identities.size !== reordered.length ||
        sequence.some((identity) => !identities.has(identity))
      )
        throw new Error(
          "spa-each collection reorder must contain every current key exactly once",
        );
      nextOrder = reordered;
      prepared.push({ kind: "reorder", order: [...reordered] });
      continue;
    }
    const identity = eachKeyIdentity(delta.key, itemKey);
    const exists = nextOrder
      ? nextOrder.includes(identity)
      : instances.has(identity);
    if (delta.kind === "insert") {
      const sequence = currentOrder();
      collectionIndex(delta.index, sequence.length, true);
      if (exists)
        throw new Error(
          `spa-each collection insert contains duplicate key ${JSON.stringify(delta.key)}`,
        );
      if (eachIdentity(delta.item, itemKey) !== identity)
        throw new Error(
          `spa-each collection insert key ${JSON.stringify(delta.key)} does not match its item`,
        );
      sequence.splice(delta.index, 0, identity);
      values.set(identity, delta.item);
      prepared.push({
        kind: "insert",
        identity,
        index: delta.index,
        item: delta.item,
      });
      continue;
    }
    if (!exists)
      throw new Error(
        `spa-each collection ${delta.kind} references unknown key ${JSON.stringify(delta.key)}`,
      );
    if (delta.kind === "update") {
      const item = updateCollectionPath(
        currentValue(identity),
        delta.path,
        delta.value,
      );
      if (eachIdentity(item, itemKey) !== identity)
        throw new Error("spa-each collection update cannot change an item key");
      values.set(identity, item);
      prepared.push({ kind: "update", identity, item });
    } else if (delta.kind === "move") {
      const sequence = currentOrder();
      collectionIndex(delta.index, sequence.length);
      const index = sequence.indexOf(identity);
      sequence.splice(index, 1);
      sequence.splice(delta.index, 0, identity);
      prepared.push({ kind: "move", identity, index: delta.index });
    } else {
      const sequence = currentOrder();
      const index = sequence.indexOf(identity);
      sequence.splice(index, 1);
      values.delete(identity);
      prepared.push({ kind: "remove", identity });
    }
  }
  return prepared;
}

function preserveEachFocus(el: Element, mutate: () => void): void {
  const focused =
    document.activeElement instanceof HTMLElement &&
    el.contains(document.activeElement)
      ? document.activeElement
      : undefined;
  let selection:
    | readonly [number, number, SelectionDirection | null]
    | undefined;
  if (
    (focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement) &&
    focused.selectionStart !== null &&
    focused.selectionEnd !== null
  )
    selection = [
      focused.selectionStart,
      focused.selectionEnd,
      focused.selectionDirection,
    ];
  mutate();
  if (focused) {
    focused.focus({ preventScroll: true });
    if (
      selection &&
      (focused instanceof HTMLInputElement ||
        focused instanceof HTMLTextAreaElement)
    )
      focused.setSelectionRange(
        selection[0],
        selection[1],
        selection[2] ?? undefined,
      );
  }
}

// `spa-each`: a client-owned keyed reconciler. The serialized default child is a template definition,
// not live DOM. Item replacements update a reactive Scope; moves retain the existing root element.
function wireEach(
  el: Element,
  node: Node,
  store?: Store,
  parentScope?: Scope,
): void {
  structuralNodes.set(el, node);
  const source = node.bindings?.items;
  const template = node.slots?.[DEFAULT_SLOT] ?? [];
  const itemKey = String(untag(node.props?.itemKey!));
  const scopeValue = node.props?.scopeName
    ? untag(node.props.scopeName)
    : undefined;
  const scopeName = scopeValue == null ? undefined : String(scopeValue);
  if (template.length !== 1)
    throw new Error("spa-each requires exactly one component template");

  let instances = new Map<string, EachInstance>();
  let order: string[] = [];
  let frame: number | undefined;
  let pendingDeltas: CollectionDelta[] | undefined;
  const evaluate = (): unknown[] => {
    const value = source?.compute
      ? evalExpr(source.compute, store, parentScope)
      : source?.field && store
        ? store.get(source.field)
        : [];
    return Array.isArray(value) ? value : [];
  };
  const reconcileItems = (items: Array<[string, unknown]>): void => {
    const stale = new Map(instances);
    const next = new Map<string, EachInstance>();
    for (const [index, [identity, item]] of items.entries()) {
      let instance = instances.get(identity);
      if (instance) {
        instance.scope.set(item);
      } else {
        const itemScope = new Scope(item, scopeName, parentScope);
        instance = {
          element: build(template[0], store, itemScope),
          scope: itemScope,
        };
      }
      const current = el.children[index];
      if (current !== instance.element) {
        const movable = el as Element & {
          moveBefore?: (node: Element, child: Element | null) => void;
        };
        if (
          instance.element.parentElement === el &&
          typeof movable.moveBefore === "function"
        )
          movable.moveBefore(instance.element, current ?? null);
        else el.insertBefore(instance.element, current ?? null);
      }
      stale.delete(identity);
      next.set(identity, instance);
    }
    for (const instance of stale.values()) {
      teardownTree(instance.element);
      instance.element.remove();
    }
    instances = next;
    order = items.map(([identity]) => identity);
  };
  const placeAt = (
    instance: EachInstance,
    index: number,
    previousIndex?: number,
  ): void => {
    if (previousIndex === index) return;
    const current =
      el.children[
        previousIndex !== undefined && previousIndex < index ? index + 1 : index
      ] ?? null;
    const movable = el as Element & {
      moveBefore?: (node: Element, child: Element | null) => void;
    };
    if (
      instance.element.parentElement === el &&
      typeof movable.moveBefore === "function"
    )
      movable.moveBefore(instance.element, current);
    else el.insertBefore(instance.element, current);
  };
  const applyDeltas = (deltas: readonly CollectionDelta[]): void => {
    const prepared = prepareEachDeltas(deltas, itemKey, order, instances);
    preserveEachFocus(el, () => {
      for (const delta of prepared) {
        if (delta.kind === "reset") {
          reconcileItems(delta.items);
        } else if (delta.kind === "insert") {
          const itemScope = new Scope(delta.item, scopeName, parentScope);
          const instance = {
            element: build(template[0], store, itemScope),
            scope: itemScope,
          };
          instances.set(delta.identity, instance);
          order.splice(delta.index, 0, delta.identity);
          placeAt(instance, delta.index);
        } else if (delta.kind === "update") {
          instances.get(delta.identity)!.scope.set(delta.item);
        } else if (delta.kind === "move") {
          const index = order.indexOf(delta.identity);
          order.splice(index, 1);
          order.splice(delta.index, 0, delta.identity);
          placeAt(instances.get(delta.identity)!, delta.index, index);
        } else if (delta.kind === "reorder") {
          for (const [index, identity] of delta.order.entries())
            placeAt(instances.get(identity)!, index);
          order = [...delta.order];
        } else {
          const instance = instances.get(delta.identity)!;
          teardownTree(instance.element);
          instance.element.remove();
          instances.delete(delta.identity);
          order.splice(order.indexOf(delta.identity), 1);
        }
      }
    });
  };
  const flush = (): void => {
    frame = undefined;
    const deltas = pendingDeltas;
    pendingDeltas = undefined;
    if (deltas) applyDeltas(deltas);
    else
      preserveEachFocus(el, () =>
        reconcileItems(keyedItems(evaluate(), itemKey)),
      );
  };
  const schedule = (): void => {
    if (frame === undefined) frame = requestAnimationFrame(flush);
  };
  const scheduleReconcile = (): void => {
    pendingDeltas = undefined;
    schedule();
  };
  const scheduleDelta = (delta: CollectionDelta): void => {
    if (delta.kind === "reset") pendingDeltas = [delta];
    else (pendingDeltas ??= []).push(delta);
    schedule();
  };

  reconcileItems(keyedItems(evaluate(), itemKey));
  const subs: Array<() => void> = [];
  if (source?.compute !== undefined) {
    if (store)
      for (const field of exprFields(source.compute))
        subs.push(store.subscribe(field, scheduleReconcile));
    for (const dependency of exprScopes(source.compute, parentScope))
      subs.push(dependency.subscribe(scheduleReconcile));
  } else if (source?.field && store) {
    subs.push(store.subscribeCollection(source.field, itemKey, scheduleDelta));
  }
  let map = bindings.get(el);
  if (!map) bindings.set(el, (map = new Map()));
  map.set("items", () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    for (const unsubscribe of subs) unsubscribe();
    for (const instance of instances.values()) {
      teardownTree(instance.element);
      instance.element.remove();
    }
    instances.clear();
  });
}

function isStructuralBinding(node: Node, prop: string): boolean {
  return (
    (node.tag === "spa-show" && prop === "when") ||
    (node.tag === "spa-each" && prop === "items") ||
    (node.tag === "spa-switch" && prop === "on") ||
    (node.tag === "spa-lazy" && prop === "when")
  );
}

function rewireStructuralBinding(
  el: Element,
  name: string,
  binding: Binding | undefined,
  store?: Store,
  scope?: Scope,
): boolean {
  const node = structuralNodes.get(el);
  if (!node || !isStructuralBinding(node, name)) return false;
  const nextBindings = { ...node.bindings };
  if (binding) nextBindings[name] = binding;
  else delete nextBindings[name];
  const next = { ...node, bindings: nextBindings };
  unwireBinding(el, name);
  if (next.tag === "spa-show") wireShow(el, next, store, scope);
  else wireEach(el, next, store, scope);
  return true;
}

// Tear down the reactive bindings (store subscriptions) registered across an element subtree, so removing
// it doesn't leak subscriptions that keep detached elements alive. DOM event listeners are released when
// the element itself is garbage-collected.
function teardownTree(el: Element): void {
  for (const e of [el, ...el.querySelectorAll("*")]) {
    const map = bindings.get(e);
    if (map) {
      for (const teardown of map.values()) teardown();
      bindings.delete(e);
    }
    structuralNodes.delete(e);
  }
}

function build(node: Node, store?: Store, scope?: Scope): Element {
  const el = document.createElement(node.tag);
  for (const [name, value] of Object.entries(node.props ?? {})) {
    setProp(el, name, untag(value));
  }
  if (node.tag === "spa-show") {
    wireShow(el, node, store, scope); // conditionally mounts the node's default-slot children
  } else if (node.tag === "spa-each") {
    wireEach(el, node, store, scope);
  } else if (node.tag === "spa-switch") {
    wireSwitch(el, node, store, scope);
  } else if (node.tag === "spa-lazy") {
    wireLazy(el, node, store, scope);
  } else {
    for (const [slot, children] of Object.entries(node.slots ?? {})) {
      for (const child of children)
        appendInSlot(el, slot, build(child, store, scope));
    }
  }
  for (const [name, action] of Object.entries(node.events ?? {})) {
    bindEvent(el, name, action, store, scope); // actions ride the wire as the core's DSL form (plain JSON)
  }
  if (store || scope) {
    for (const [prop, spec] of Object.entries(node.bindings ?? {})) {
      if (isStructuralBinding(node, prop)) continue;
      wireBinding(el, prop, spec, store, scope);
    }
  }
  return el;
}

/** Set a prop the way the element expects: a DOM property when it has one, else an HTML attribute. */
export function setProp(el: Element, name: string, value: unknown): void {
  if (name in el) {
    (el as unknown as Record<string, unknown>)[name] = value;
    return;
  }
  setAttr(el, name, value);
}

/** Write `value` as an attribute: `false`/`null`/`undefined` remove it, `true` gives the bare form. */
function setAttr(el: Element, name: string, value: unknown): void {
  if (value === false || value === null || value === undefined) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, value === true ? "" : String(value));
  }
}

function removeProp(el: Element, name: string): void {
  if (name in el) {
    setProp(el, name, undefined);
  }
  el.removeAttribute(name);
}

function slotOf(child: Element): string {
  return child.getAttribute("slot") ?? DEFAULT_SLOT;
}

/** The child elements of `el` that belong to `slot`, in DOM order. */
function childrenInSlot(el: Element, slot: string): Element[] {
  return Array.from(el.children).filter((c) => slotOf(c) === slot);
}

function appendInSlot(parent: Element, slot: string, child: Element): void {
  if (slot !== DEFAULT_SLOT) child.setAttribute("slot", slot);
  insertInSlot(parent, slot, childrenInSlot(parent, slot).length, child);
}

function insertInSlot(
  parent: Element,
  slot: string,
  index: number,
  child: Element,
): void {
  if (slot !== DEFAULT_SLOT) child.setAttribute("slot", slot);
  const siblings = childrenInSlot(parent, slot);
  if (index < siblings.length) {
    parent.insertBefore(child, siblings[index]);
  } else if (siblings.length > 0) {
    parent.insertBefore(child, siblings[siblings.length - 1].nextSibling);
  } else {
    parent.appendChild(child);
  }
}

type Op =
  | { SetProp: { path: Path; name: string; value: Value } }
  | { RemoveProp: { path: Path; name: string } }
  | { SetEvent: { path: Path; name: string; action: unknown } }
  | { RemoveEvent: { path: Path; name: string } }
  | { SetBinding: { path: Path; name: string; binding: Binding } }
  | { RemoveBinding: { path: Path; name: string } }
  | { SetKey: { path: Path; key: string | null } }
  | { InsertChild: { path: Path; slot: string; index: number; node: Node } }
  | { RemoveChild: { path: Path; slot: string; index: number } }
  | { MoveChild: { path: Path; slot: string; from: number; to: number } }
  | { Replace: { path: Path; node: Node } };

function resolve(root: Element, path: Path): Element {
  let el = root;
  for (const seg of path) el = childrenInSlot(el, seg.slot)[seg.index];
  return el;
}

const STRUCTURAL_BINDING: Record<string, string> = {
  "spa-show": "when",
  "spa-each": "items",
  "spa-switch": "on",
  "spa-lazy": "when",
};

/** Re-wire a structural element from its (mutated) stored definition. A structural element's
 * subtrees live in its wiring closures, not the DOM, so a tree patch that changes anything at or
 * below its slots updates the definition and re-wires — the mounted branch rebuilds from the new
 * definition, and non-mounted branches (a Switch's other cases) pick it up on their next mount. */
function refreshStructural(el: Element, store?: Store, scope?: Scope): void {
  const node = structuralNodes.get(el);
  const name = node && STRUCTURAL_BINDING[node.tag];
  if (!node || !name) return;
  unwireBinding(el, name); // tears down the mounted branch and its subscriptions
  if (node.tag === "spa-show") wireShow(el, node, store, scope);
  else if (node.tag === "spa-switch") wireSwitch(el, node, store, scope);
  else if (node.tag === "spa-lazy") wireLazy(el, node, store, scope);
  else wireEach(el, node, store, scope);
}

function opPath(op: Op): Path {
  return (Object.values(op)[0] as { path: Path }).path;
}

/** Walk `path` from `root`; if it enters a structural element's slots (or is a child op targeting
 * one), the definition owns that subtree — return the element and the remaining path within it. */
function structuralBoundary(
  root: Element,
  op: Op,
): { el: Element; node: Node; rest: Path } | null {
  const path = opPath(op);
  let el: Element = root;
  for (let i = 0; i < path.length; i++) {
    const node = structuralNodes.get(el);
    if (node) return { el, node, rest: path.slice(i) };
    el = childrenInSlot(el, path[i].slot)[path[i].index];
    if (!el) return null;
  }
  // a child op's payload addresses the resolved element's slots; for a structural element those
  // are definition slots, not DOM children
  if ("InsertChild" in op || "RemoveChild" in op || "MoveChild" in op) {
    const node = structuralNodes.get(el);
    if (node) return { el, node, rest: [] };
  }
  return null;
}

/** Apply one patch op to a serialized definition subtree instead of the DOM. */
function applyOpToDefinition(node: Node, rest: Path, op: Op): void {
  const parentDepth = "Replace" in op ? rest.length - 1 : rest.length;
  for (let i = 0; i < parentDepth; i++)
    node = node.slots![rest[i].slot]![rest[i].index]; // paths come from a diff of this very tree
  if ("SetProp" in op) (node.props ??= {})[op.SetProp.name] = op.SetProp.value;
  else if ("RemoveProp" in op) delete node.props?.[op.RemoveProp.name];
  else if ("SetEvent" in op)
    (node.events ??= {})[op.SetEvent.name] = op.SetEvent.action;
  else if ("RemoveEvent" in op) delete node.events?.[op.RemoveEvent.name];
  else if ("SetBinding" in op)
    (node.bindings ??= {})[op.SetBinding.name] = op.SetBinding.binding;
  else if ("RemoveBinding" in op) delete node.bindings?.[op.RemoveBinding.name];
  else if ("SetKey" in op) {
    if (op.SetKey.key === null) delete node.key;
    else node.key = op.SetKey.key;
  } else if ("InsertChild" in op)
    ((node.slots ??= {})[op.InsertChild.slot] ??= []).splice(
      op.InsertChild.index,
      0,
      op.InsertChild.node,
    );
  else if ("RemoveChild" in op)
    node.slots?.[op.RemoveChild.slot]?.splice(op.RemoveChild.index, 1);
  else if ("MoveChild" in op) {
    const children = node.slots?.[op.MoveChild.slot];
    if (children) {
      const [moving] = children.splice(op.MoveChild.from, 1);
      children.splice(op.MoveChild.to, 0, moving);
    }
  } else if ("Replace" in op) {
    const last = rest[rest.length - 1];
    node.slots![last.slot]![last.index] = op.Replace.node;
  }
}

function applyOp(
  root: Element,
  op: Op,
  store?: Store,
  scope?: Scope,
  refreshed?: Set<Element>,
): Element {
  const boundary = structuralBoundary(root, op);
  if (boundary) {
    applyOpToDefinition(boundary.node, boundary.rest, op);
    refreshed?.add(boundary.el);
    return root;
  }
  if ("SetProp" in op) {
    setProp(
      resolve(root, op.SetProp.path),
      op.SetProp.name,
      untag(op.SetProp.value),
    );
  } else if ("RemoveProp" in op) {
    removeProp(resolve(root, op.RemoveProp.path), op.RemoveProp.name);
  } else if ("SetEvent" in op) {
    const { path, name, action } = op.SetEvent;
    bindEvent(resolve(root, path), name, action, store, scope);
  } else if ("RemoveEvent" in op) {
    const { path, name } = op.RemoveEvent;
    unbindEvent(resolve(root, path), name);
  } else if ("SetBinding" in op) {
    const { path, name, binding } = op.SetBinding;
    const el = resolve(root, path);
    if (!rewireStructuralBinding(el, name, binding, store, scope))
      if (store || scope) wireBinding(el, name, binding, store, scope);
  } else if ("RemoveBinding" in op) {
    const { path, name } = op.RemoveBinding;
    const el = resolve(root, path);
    if (!rewireStructuralBinding(el, name, undefined, store, scope))
      unwireBinding(el, name);
  } else if ("InsertChild" in op) {
    const { path, slot, index, node } = op.InsertChild;
    insertInSlot(resolve(root, path), slot, index, build(node, store, scope));
  } else if ("RemoveChild" in op) {
    const { path, slot, index } = op.RemoveChild;
    const child = childrenInSlot(resolve(root, path), slot)[index];
    teardownTree(child); // release the subtree's store subscriptions before detaching it
    child.remove();
  } else if ("MoveChild" in op) {
    const { path, slot, from, to } = op.MoveChild;
    const parent = resolve(root, path);
    const moving = childrenInSlot(parent, slot)[from];
    moving.remove();
    insertInSlot(parent, slot, to, moving);
  } else if ("Replace" in op) {
    const target = resolve(root, op.Replace.path);
    teardownTree(target); // release the replaced subtree's store subscriptions
    const replacement = build(op.Replace.node, store, scope);
    target.replaceWith(replacement);
    if (op.Replace.path.length === 0) return replacement; // the root element itself was swapped
  }
  // SetKey is diff-engine metadata (the key lives in the tree, not on the DOM element).
  return root;
}
