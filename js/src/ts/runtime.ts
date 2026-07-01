// The browser runtime: turn a spaday component tree into real DOM web components, and apply the
// core's tree patches incrementally (preserving live element instances across updates).
//
// This is the consumer of the diff engine: the server (Python) computes a patch with the shared Rust
// `diff`; the browser applies it here against live DOM, so a `wa-switch`'s internal state survives an
// update instead of being re-created. It renders structure + props and binds the action-DSL event
// handlers, rebinding/detaching them as incremental `SetEvent`/`RemoveEvent` patches arrive.

import { interpret } from "./actions";
import { evalExpr, exprFields, Store } from "./signals";
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
export function mount(container: Element, tree: Node, store?: Store): Element {
  const el = build(tree, store);
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
): Element {
  let current = root;
  for (const op of patch.ops) current = applyOp(current, op, store);
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
): Element {
  const el = container.firstElementChild;
  if (!el) return mount(container, tree, store);
  hydrateNode(el, tree, store);
  return el;
}

function hydrateNode(el: Element, node: Node, store?: Store): void {
  for (const [name, value] of Object.entries(node.props ?? {})) {
    setProp(el, name, untag(value)); // re-affirm props; sets complex/property-only ones the HTML omitted
  }
  if (node.tag === "spa-show") {
    wireShow(el, node, store); // structural children are client-mounted (the HTML rendered none)
  } else {
    for (const [slot, children] of Object.entries(node.slots ?? {})) {
      const existing = childrenInSlot(el, slot);
      children.forEach((child, i) => {
        if (existing[i]) hydrateNode(existing[i], child, store);
        else appendInSlot(el, slot, build(child, store)); // HTML missing this child → build it
      });
    }
  }
  for (const [name, action] of Object.entries(node.events ?? {})) {
    bindEvent(el, name, action, store); // actions ride the wire as the core's DSL form (plain JSON)
  }
  if (store) {
    for (const [prop, spec] of Object.entries(node.bindings ?? {})) {
      if (node.tag === "spa-show" && prop === "when") continue; // structural — handled by wireShow
      wireBinding(el, prop, spec, store);
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
): void {
  let map = listeners.get(el);
  if (!map) listeners.set(el, (map = new Map()));
  const existing = map.get(name);
  if (existing) el.removeEventListener(name, existing); // replace, don't stack
  const handler: EventListener = (event) =>
    interpret(action, { event, currentTarget: el, store }); // store lets an action's `field` expr read state
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
  store: Store,
): void {
  unwireBinding(el, prop); // replace any prior wiring for this prop
  const teardowns: Array<() => void> = [];
  const apply = bindingApply(el, prop);
  if (spec.compute !== undefined) {
    // computed (derived) binding: recompute the prop from the expression whenever any field it reads
    // changes. One-way by nature — there is nothing to write back.
    const recompute = () => apply(evalExpr(spec.compute, store));
    recompute(); // initial value
    for (const field of exprFields(spec.compute)) {
      teardowns.push(store.subscribe(field, recompute));
    }
  } else if (spec.field !== undefined) {
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
function wireShow(el: Element, node: Node, store?: Store): void {
  const cond = node.bindings?.when;
  const childDefs = node.slots?.[DEFAULT_SLOT] ?? [];
  if (!store || !cond) {
    for (const c of childDefs) appendInSlot(el, DEFAULT_SLOT, build(c, store)); // inert: render always
    return;
  }
  const evaluate = (): boolean =>
    cond.compute !== undefined
      ? !!evalExpr(cond.compute, store)
      : !!store.get(cond.field!);
  let mounted: Element[] = [];
  const render = (): void => {
    if (evaluate()) {
      if (mounted.length === 0) {
        for (const c of childDefs) {
          const ce = build(c, store);
          appendInSlot(el, DEFAULT_SLOT, ce);
          mounted.push(ce);
        }
      }
    } else if (mounted.length) {
      for (const ce of mounted) {
        teardownTree(ce);
        ce.remove();
      }
      mounted = [];
    }
  };
  render(); // initial state
  const deps =
    cond.compute !== undefined ? [...exprFields(cond.compute)] : [cond.field!];
  const subs = deps.map((f) => store.subscribe(f, render));
  let map = bindings.get(el); // record teardown so removing the spa-show unsubscribes (via teardownTree)
  if (!map) bindings.set(el, (map = new Map()));
  map.set("when", () => subs.forEach((u) => u()));
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
  }
}

function build(node: Node, store?: Store): Element {
  const el = document.createElement(node.tag);
  for (const [name, value] of Object.entries(node.props ?? {})) {
    setProp(el, name, untag(value));
  }
  if (node.tag === "spa-show") {
    wireShow(el, node, store); // conditionally mounts the node's default-slot children
  } else {
    for (const [slot, children] of Object.entries(node.slots ?? {})) {
      for (const child of children) appendInSlot(el, slot, build(child, store));
    }
  }
  for (const [name, action] of Object.entries(node.events ?? {})) {
    bindEvent(el, name, action, store); // actions ride the wire as the core's DSL form (plain JSON)
  }
  if (store) {
    for (const [prop, spec] of Object.entries(node.bindings ?? {})) {
      if (node.tag === "spa-show" && prop === "when") continue; // structural — handled by wireShow
      wireBinding(el, prop, spec, store);
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

function applyOp(root: Element, op: Op, store?: Store): Element {
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
    bindEvent(resolve(root, path), name, action, store);
  } else if ("RemoveEvent" in op) {
    const { path, name } = op.RemoveEvent;
    unbindEvent(resolve(root, path), name);
  } else if ("SetBinding" in op) {
    const { path, name, binding } = op.SetBinding;
    if (store) wireBinding(resolve(root, path), name, binding, store);
  } else if ("RemoveBinding" in op) {
    const { path, name } = op.RemoveBinding;
    unwireBinding(resolve(root, path), name);
  } else if ("InsertChild" in op) {
    const { path, slot, index, node } = op.InsertChild;
    insertInSlot(resolve(root, path), slot, index, build(node, store));
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
    const replacement = build(op.Replace.node, store);
    target.replaceWith(replacement);
    if (op.Replace.path.length === 0) return replacement; // the root element itself was swapped
  }
  // SetKey is diff-engine metadata (the key lives in the tree, not on the DOM element).
  return root;
}
