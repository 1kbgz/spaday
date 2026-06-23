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

// Live action listeners per element, so an incremental patch can update them: the diff engine emits
// `SetEvent` when an action is added/changed and `RemoveEvent` when one is removed on an existing node.
const listeners = new WeakMap<Element, Map<string, EventListener>>();

function bindEvent(el: Element, name: string, action: unknown): void {
  let map = listeners.get(el);
  if (!map) listeners.set(el, (map = new Map()));
  const existing = map.get(name);
  if (existing) el.removeEventListener(name, existing); // replace, don't stack
  const handler: EventListener = (event) =>
    interpret(action, { event, currentTarget: el });
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
const VALUE_EVENTS = ["change", "input"]; // a control writes its bound field on these

function readProp(el: Element, name: string): unknown {
  if (name in el) return (el as unknown as Record<string, unknown>)[name];
  return el.hasAttribute(name) ? el.getAttribute(name) : null;
}

function wireBinding(
  el: Element,
  prop: string,
  spec: Binding,
  store: Store,
): void {
  unwireBinding(el, prop); // replace any prior wiring for this prop
  const teardowns: Array<() => void> = [];
  if (spec.compute !== undefined) {
    // computed (derived) binding: recompute the prop from the expression whenever any field it reads
    // changes. One-way by nature — there is nothing to write back.
    const recompute = () => setProp(el, prop, evalExpr(spec.compute, store));
    recompute(); // initial value
    for (const field of exprFields(spec.compute)) {
      teardowns.push(store.subscribe(field, recompute));
    }
  } else if (spec.field !== undefined) {
    if (store.has(spec.field)) setProp(el, prop, store.get(spec.field)); // initial field → prop
    teardowns.push(store.subscribe(spec.field, (v) => setProp(el, prop, v)));
    if (spec.mode === "two-way") {
      const onChange = () => store.set(spec.field!, readProp(el, prop));
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

function build(node: Node, store?: Store): Element {
  const el = document.createElement(node.tag);
  for (const [name, value] of Object.entries(node.props ?? {})) {
    setProp(el, name, untag(value));
  }
  for (const [slot, children] of Object.entries(node.slots ?? {})) {
    for (const child of children) appendInSlot(el, slot, build(child, store));
  }
  for (const [name, action] of Object.entries(node.events ?? {})) {
    bindEvent(el, name, action); // actions ride the wire as the core's DSL form (plain JSON)
  }
  if (store) {
    for (const [prop, spec] of Object.entries(node.bindings ?? {})) {
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
    bindEvent(resolve(root, path), name, action);
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
    childrenInSlot(resolve(root, path), slot)[index].remove();
  } else if ("MoveChild" in op) {
    const { path, slot, from, to } = op.MoveChild;
    const parent = resolve(root, path);
    const moving = childrenInSlot(parent, slot)[from];
    moving.remove();
    insertInSlot(parent, slot, to, moving);
  } else if ("Replace" in op) {
    const target = resolve(root, op.Replace.path);
    const replacement = build(op.Replace.node, store);
    target.replaceWith(replacement);
    if (op.Replace.path.length === 0) return replacement; // the root element itself was swapped
  }
  // SetKey is diff-engine metadata (the key lives in the tree, not on the DOM element).
  return root;
}
