// The browser-side half of the action DSL. The interpreter logic — dispatch on each action and
// evaluate its expressions — lives in the Rust core (compiled into the `js` wasm crate); this module
// is the thin DOM host it calls back into. So behavior authored in Python runs client-side with no
// round-trip and no `eval`, and Python and the browser share one model.
//
// Requires the wasm to be initialized first (see `init` from the package entry).

import { interpret as wasmInterpret } from "../../dist/pkg/spaday";
import { getHandler } from "./handlers";
import { setProp } from "./runtime";
import type { Store } from "./signals";
import { assertReady } from "./wasm-ready";

/** The context an action runs in: the DOM event, the listener's element, and the mounted signal store
 *  (when the tree was mounted with one) — so an action's `field` expr can read reactive state. */
export interface ActionContext {
  event: Event;
  currentTarget: Element;
  store?: Store;
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
    // a reactive state field from the mounted signal store (undefined if the tree has no store)
    getField: (name: string) => ctx.store?.get(name),
    // write a reactive state field (SetField/ToggleField) — a no-op if the tree has no store
    setField: (name: string, value: unknown) => ctx.store?.set(name, value),
    emit: (event: string, detail: unknown) =>
      ctx.currentTarget.dispatchEvent(
        new CustomEvent(event, { detail, bubbles: true }),
      ),
    // SendPatch is surfaced as a bubbling intent the app routes to its wire (e.g. a transports edit).
    sendPatch: (model: string, field: string, value: unknown) =>
      ctx.currentTarget.dispatchEvent(
        new CustomEvent("spaday:patch", {
          detail: { model, field, value },
          bubbles: true,
        }),
      ),
    // CallEndpoint: the one intentional server round-trip. With a result field, the response is
    // written to the store as {status, ok, body} on completion (so the outcome can drive reactive
    // UI, e.g. show a 422 validation error); without one it stays fire-and-forget.
    callEndpoint: (
      method: string,
      url: unknown,
      body: unknown,
      result?: string,
    ) => {
      const request = fetch(String(url), {
        method,
        headers:
          body === undefined
            ? undefined
            : { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (!result || !ctx.store) return void request;
      const store = ctx.store;
      void request
        .then(async (r) => {
          const text = await r.text();
          let parsed: unknown;
          try {
            parsed = JSON.parse(text); // a JSON response arrives as data …
          } catch {
            parsed = text; // … anything else as raw text
          }
          return { status: r.status, ok: r.ok, body: parsed };
        })
        .catch((err) => ({ status: 0, ok: false, body: String(err) })) // network failure
        .then((outcome) => store.set(result, outcome));
    },
    // NamedJs escape hatch: invoke a pre-registered handler by name (no eval).
    callNamed: (handler: string) =>
      getHandler(handler)?.(ctx.event, ctx.currentTarget),
  };
}
