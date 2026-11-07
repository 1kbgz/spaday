// spaday as an anywidget: render a spaday component tree inside any anywidget host — Jupyter
// (Lab/Notebook/Colab/VS Code), Marimo, Shiny-for-Python, Solara, Panel — over the widget's model.
//
// The model carries the serialized component tree (`_tree`); bindings use either the `_state` trait
// or transports models over custom comm messages. Both wasm cores are inlined into this bundle.
// The spaday runtime
// mounts the tree and keeps it live by diffing successive trees with the same core `diff`/`applyPatch`
// it uses over a transports wire — so a Python-side
// `widget.update(tree)` produces a minimal DOM patch, not a re-render. Behavior authored in Python
// (the action DSL) runs client-side here with no kernel round-trip; the DSL's outbound intents
// (a `SendPatch` action's `spaday:patch`) are forwarded to the kernel over the model.

import { applyPatch, diff, init, mount, Node, Store, unmount } from "./index";
import { connectWidget, type AnyModel } from "./widget-transport";
import { loadWidgetPackages } from "./widget-packages";
import { provideWires } from "./wire-context";

// the spaday wasm core, inlined into this bundle as bytes (esbuild `binary` loader; see build.mjs),
// so the widget is one self-contained ESM with no separately-synced `_wasm`.
import wasm from "../../dist/pkg/spaday_bg.wasm";

// The wasm core is inlined into this bundle and is process-wide, so initialize it once; later widgets
// reuse the same promise. On failure, drop it so a retry can re-attempt (a cached rejection would
// otherwise poison every later render until reload).
let ready: Promise<void> | undefined;
function ensureWasm(): Promise<void> {
  if (!ready) {
    ready = init({ module_or_path: wasm }).catch((err) => {
      ready = undefined;
      throw err;
    });
  }
  return ready;
}

// Back the runtime's signal Store with the widget's synced `_state` dict — the notebook counterpart to
// `connectStore` (transports). Inbound: a Python-side `_state` change flows into the store (and bound
// props). Outbound: a two-way control's change writes `_state` back to the kernel. An echo guard keeps
// an inbound update from bouncing straight back out.
function connectState(store: Store, model: AnyModel): () => void {
  let inbound = false;
  const wired = new Set<string>();
  const unsubs: Array<() => void> = [];
  const pull = () => {
    const state = (model.get("_state") ?? {}) as Record<string, unknown>;
    inbound = true;
    for (const [field, value] of Object.entries(state)) {
      store.set(field, value);
      if (!wired.has(field)) {
        wired.add(field);
        unsubs.push(
          store.subscribe(field, (v) => {
            if (inbound) return;
            model.set("_state", {
              ...((model.get("_state") ?? {}) as Record<string, unknown>),
              [field]: v,
            });
            model.save_changes();
          }),
        );
      }
    }
    inbound = false;
  };
  model.on("change:_state", pull);
  pull(); // seed from the initial state
  return () => {
    model.off("change:_state", pull);
    for (const unsub of unsubs) unsub();
  };
}

// Intents the action DSL bubbles to the host element; forward each to the kernel over the model so a
// Python handler (Widget.on_intent) can react.
const INTENTS = ["spaday:patch"];

export default {
  async initialize(): Promise<void> {
    await ensureWasm();
  },
  async render({
    model,
    el,
  }: {
    model: AnyModel;
    el: HTMLElement;
  }): Promise<() => void> {
    await ensureWasm();

    await loadWidgetPackages(model);

    // State mode seeds bindings before mount; session mode receives snapshots after mounting.
    const store = new Store();
    const session = (model.get("_wires") as unknown[] | undefined)?.length
      ? await connectWidget(store, model, el)
      : undefined;
    const stateLink = session
      ? () => session.dispose()
      : connectState(store, model);
    const stopRequests = session ? () => {} : provideWires(el, []);

    let tree = model.get("_tree") as Node;
    let root: Element | undefined;
    try {
      root = mount(el, tree, store);
      session?.start();
    } catch (error) {
      if (root) unmount(root);
      stateLink();
      stopRequests();
      throw error;
    }

    const onTree = () => {
      const next = model.get("_tree") as Node;
      const patch = JSON.parse(
        diff(JSON.stringify(tree), JSON.stringify(next)),
      );
      root = applyPatch(root!, patch, store);
      tree = next;
    };
    model.on("change:_tree", onTree);

    const forward = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (session)
        store.set(
          detail.model ? `${detail.model}.${detail.field}` : detail.field,
          detail.value,
        );
      model.send({ type: event.type, detail });
    };
    for (const name of INTENTS) el.addEventListener(name, forward);

    return () => {
      stateLink();
      stopRequests();
      model.off("change:_tree", onTree);
      for (const name of INTENTS) el.removeEventListener(name, forward);
      unmount(root!);
    };
  },
};
