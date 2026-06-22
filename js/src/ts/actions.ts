// The browser-side half of the action DSL. The interpreter logic — dispatch on each action and
// evaluate its expressions — lives in the Rust core (compiled into the `js` wasm crate); this module
// is the thin DOM host it calls back into. So behavior authored in Python runs client-side with no
// round-trip and no `eval`, and Python and the browser share one model.
//
// Requires the wasm to be initialized first (see `init` from the package entry).

import { interpret as wasmInterpret } from "../../dist/pkg/spaday";
import { setProp } from "./runtime";
import { assertReady } from "./wasm-ready";

/** The context an action runs in: the DOM event and the element the listener is bound to. */
export interface ActionContext {
  event: Event;
  currentTarget: Element;
}

/** Run one action (the core's plain DSL wire form) against the DOM in the given event context. */
export function interpret(action: unknown, ctx: ActionContext): void {
  assertReady(); // clear error if an action fires before the wasm core is initialized
  wasmInterpret(JSON.stringify(action), host(ctx));
}

function readProp(el: Element, name: string): unknown {
  if (name in el) return (el as unknown as Record<string, unknown>)[name];
  return el.hasAttribute(name) ? el.getAttribute(name) : null;
}

// The DOM primitives the wasm interpreter calls back into (mirrors the `Host` extern in the js crate).
function host(ctx: ActionContext) {
  return {
    currentTarget: () => ctx.currentTarget,
    queryId: (id: string) =>
      (ctx.currentTarget.getRootNode() as ParentNode).querySelector(
        "#" + CSS.escape(id),
      ),
    getProp: (el: Element, name: string) => readProp(el, name),
    setProp: (el: Element, name: string, value: unknown) =>
      setProp(el, name, value),
    eventValue: () => {
      const target = ctx.event.target as Record<string, unknown> | null;
      if (target && typeof target.checked === "boolean") return target.checked;
      if (target && "value" in target) return target.value;
      return (ctx.event as CustomEvent).detail;
    },
    emit: (event: string, detail: unknown) =>
      ctx.currentTarget.dispatchEvent(
        new CustomEvent(event, { detail, bubbles: true }),
      ),
  };
}
