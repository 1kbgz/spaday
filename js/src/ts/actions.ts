// The action-DSL interpreter: declarative actions (authored in Python, carried as serialized data)
// executed in the browser on DOM events — no per-interaction round-trip to Python. Behavior is data,
// not code: the interpreter dispatches on each action's `kind` and evaluates expressions structurally;
// there is no `eval`, so actions are safe to ship to untrusted, multi-tenant clients.
//
// The Rust core currently carries actions opaquely; moving these types + this interpreter into the
// shared core (wasm) so Python and the browser evaluate with one implementation is the next step.

import { setProp } from "./runtime";

/* eslint-disable @typescript-eslint/no-explicit-any -- actions are dynamic, untagged JSON data */
type Json = any;

/** The context an action runs in: the DOM event and the element the listener is bound to. */
export interface ActionContext {
  event: Event;
  currentTarget: Element;
}

function resolveRef(ref: Json, ctx: ActionContext): Element | null {
  if (!ref || typeof ref !== "object") return null;
  if (ref.ref === "this") return ctx.currentTarget;
  if (ref.ref === "id") {
    const root = ctx.currentTarget.getRootNode() as ParentNode;
    return root.querySelector("#" + CSS.escape(ref.id));
  }
  return null;
}

function readProp(el: Element, name: string): unknown {
  if (name in el) return (el as unknown as Record<string, unknown>)[name];
  return el.hasAttribute(name) ? el.getAttribute(name) : null;
}

function evalExpr(expr: Json, ctx: ActionContext): unknown {
  if (expr == null || typeof expr !== "object") return expr; // a bare literal
  switch (expr.expr) {
    case "lit":
      return expr.value;
    case "event": {
      const target = ctx.event.target as Record<string, unknown> | null;
      if (target && typeof target.checked === "boolean") return target.checked;
      if (target && "value" in target) return target.value;
      return (ctx.event as CustomEvent).detail;
    }
    case "not":
      return !evalExpr(expr.of, ctx);
    default:
      return undefined;
  }
}

/** Execute one action (already untagged) against the DOM in the given event context. */
export function interpret(action: Json, ctx: ActionContext): void {
  if (!action || typeof action !== "object") return;
  switch (action.kind) {
    case "set": {
      const el = resolveRef(action.target, ctx);
      if (el) setProp(el, action.prop, evalExpr(action.value, ctx));
      break;
    }
    case "toggle": {
      const el = resolveRef(action.target, ctx);
      if (el) setProp(el, action.prop, !readProp(el, action.prop));
      break;
    }
    case "seq":
      for (const sub of action.actions ?? []) interpret(sub, ctx);
      break;
    case "emit":
      ctx.currentTarget.dispatchEvent(
        new CustomEvent(action.event, {
          detail:
            action.detail != null ? evalExpr(action.detail, ctx) : undefined,
          bubbles: true,
        }),
      );
      break;
    default:
      break;
  }
}
