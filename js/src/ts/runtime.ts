// The browser runtime: turn a spaday component tree into real DOM web components, and apply the
// core's tree patches incrementally (preserving live element instances across updates).
//
// This is the consumer of the diff engine: the server (Python) computes a patch with the shared Rust
// `diff`; the browser applies it here against live DOM, so a `wa-switch`'s internal state survives an
// update instead of being re-created. Event handlers are bound later (with the action DSL); this
// layer renders structure and props.

import { interpret } from "./actions";
import { untag, Value } from "./value";

export interface Node {
  tag: string;
  key?: string;
  props?: Record<string, Value>;
  slots?: Record<string, Node[]>;
  events?: Record<string, unknown>;
}

interface PathSeg {
  slot: string;
  index: number;
}
type Path = PathSeg[];

const DEFAULT_SLOT = "default";

/** Build the DOM for a tree and append it to `container`; returns the root element. */
export function mount(container: Element, tree: Node): Element {
  const el = build(tree);
  container.appendChild(el);
  return el;
}

/**
 * Apply a tree patch (from the core `diff`) to a mounted root, mutating the DOM in place. Returns the
 * current root — a root-level `Replace` swaps the element, so callers must keep the returned value
 * (the original `root` reference would be left detached).
 */
export function applyPatch(root: Element, patch: { ops: Op[] }): Element {
  let current = root;
  for (const op of patch.ops) current = applyOp(current, op);
  return current;
}

function build(node: Node): Element {
  const el = document.createElement(node.tag);
  for (const [name, value] of Object.entries(node.props ?? {})) {
    setProp(el, name, untag(value));
  }
  for (const [slot, children] of Object.entries(node.slots ?? {})) {
    for (const child of children) appendInSlot(el, slot, build(child));
  }
  for (const [name, action] of Object.entries(node.events ?? {})) {
    const a = untag(action as Value);
    el.addEventListener(name, (event) =>
      interpret(a, { event, currentTarget: el }),
    );
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

function applyOp(root: Element, op: Op): Element {
  if ("SetProp" in op) {
    setProp(
      resolve(root, op.SetProp.path),
      op.SetProp.name,
      untag(op.SetProp.value),
    );
  } else if ("RemoveProp" in op) {
    removeProp(resolve(root, op.RemoveProp.path), op.RemoveProp.name);
  } else if ("InsertChild" in op) {
    const { path, slot, index, node } = op.InsertChild;
    insertInSlot(resolve(root, path), slot, index, build(node));
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
    const replacement = build(op.Replace.node);
    target.replaceWith(replacement);
    if (op.Replace.path.length === 0) return replacement; // the root element itself was swapped
  }
  // SetEvent / RemoveEvent / SetKey: events bind with the action DSL; keys are diff-engine metadata.
  return root;
}
