// The browser runtime: turn a spaday component tree into real DOM web components, and apply the
// core's tree patches incrementally (preserving live element instances across updates).
//
// This is the consumer of the diff engine: the server (Python) computes a patch with the shared Rust
// `diff`; the browser applies it here against live DOM, so a `wa-switch`'s internal state survives an
// update instead of being re-created. It renders structure + props and binds the action-DSL event
// handlers, rebinding/detaching them as incremental `SetEvent`/`RemoveEvent` patches arrive.

import { interpret } from "./actions";
import { evalExpr, exprFields, exprScopes, Scope, Store } from "./signals";
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
export function applyPatch(
  root: Element,
  patch: { ops: Op[] },
  store?: Store,
  scope?: Scope,
): Element {
  let current = root;
  for (const op of patch.ops) current = applyOp(current, op, store, scope);
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
  const handler: EventListener = (event) =>
    interpret(action, { event, currentTarget: el, store, scope });
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
const VALUE_EVENTS = ["change", "input", "wa-tab-show"]; // a control writes its bound field on these (wa-tab-show: a wa-tab-group's active tab changed)

function readProp(el: Element, name: string): unknown {
  if (name in el) return (el as unknown as Record<string, unknown>)[name];
  return el.hasAttribute(name) ? el.getAttribute(name) : null;
}

// The setter a binding drives. Normally a prop on the bound element; a `root-class:NAME` binding instead
// toggles a class on the document root (`<html>`) — page-level theming (e.g. WebAwesome's `wa-dark`) that
// lives outside the component tree. Authored via `Component.bind_root_class`.
function bindingApply(el: Element, prop: string): (value: unknown) => void {
  const ROOT_CLASS = "root-class:";
  if (prop.startsWith(ROOT_CLASS)) {
    const name = prop.slice(ROOT_CLASS.length);
    return (v) => document.documentElement.classList.toggle(name, !!v);
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
    // changes. One-way by nature — there is nothing to write back.
    const recompute = () => apply(evalExpr(spec.compute, store, scope));
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

interface EachInstance {
  element: Element;
  scope: Scope;
}

function eachIdentity(item: unknown, key: string): string {
  const value = new Scope(item).get(key);
  if (typeof value === "string") return `string:${value}`;
  if (typeof value === "number" && Number.isFinite(value))
    return `number:${value}`;
  throw new Error(
    `spa-each key ${JSON.stringify(key)} must exist and contain a string or finite number`,
  );
}

function keyedItems(items: unknown[], key: string): Array<[string, unknown]> {
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
  let frame: number | undefined;
  const evaluate = (): unknown[] => {
    const value = source?.compute
      ? evalExpr(source.compute, store, parentScope)
      : source?.field && store
        ? store.get(source.field)
        : [];
    return Array.isArray(value) ? value : [];
  };
  const reconcile = (): void => {
    frame = undefined;
    const items = keyedItems(evaluate(), itemKey); // validate the full key set before any mutation
    const focused =
      document.activeElement instanceof HTMLElement &&
      el.contains(document.activeElement)
        ? document.activeElement
        : undefined;
    const selection =
      focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement
        ? ([
            focused.selectionStart,
            focused.selectionEnd,
            focused.selectionDirection,
          ] as const)
        : undefined;
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
    instances = next;
  };
  const schedule = (): void => {
    if (frame === undefined) frame = requestAnimationFrame(reconcile);
  };

  reconcile();
  const subs: Array<() => void> = [];
  if (source?.compute !== undefined) {
    if (store)
      for (const field of exprFields(source.compute))
        subs.push(store.subscribe(field, schedule));
    for (const dependency of exprScopes(source.compute, parentScope))
      subs.push(dependency.subscribe(schedule));
  } else if (source?.field && store) {
    subs.push(store.subscribe(source.field, schedule));
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
    (node.tag === "spa-each" && prop === "items")
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

function applyOp(root: Element, op: Op, store?: Store, scope?: Scope): Element {
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
