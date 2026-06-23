// spaday as an anywidget: render a spaday component tree inside any anywidget host — Jupyter
// (Lab/Notebook/Colab/VS Code), Marimo, Shiny-for-Python, Solara, Panel — over the widget's model.
//
// The model carries only the serialized component tree (`_tree`); the wasm core (the action
// interpreter) is inlined into this bundle, so nothing else syncs over the comm. The spaday runtime
// mounts the tree and keeps it live by diffing successive trees with the same core `diff`/`applyPatch`
// it uses over a transports wire — so a Python-side
// `widget.update(tree)` produces a minimal DOM patch, not a re-render. Behavior authored in Python
// (the action DSL) runs client-side here with no kernel round-trip; the DSL's outbound intents
// (a `SendPatch` action's `spaday:patch`) are forwarded to the kernel over the model.

import { applyPatch, diff, init, mount, Node } from "./index";

// the spaday wasm core, inlined into this bundle as bytes (esbuild `binary` loader; see build.mjs),
// so the widget is one self-contained ESM with no separately-synced `_wasm`.
import wasm from "../../dist/pkg/spaday_bg.wasm";

interface AnyModel {
  get(key: string): unknown;
  on(event: string, cb: () => void): void;
  off(event: string, cb: () => void): void;
  send(content: unknown): void;
}

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

    let tree = model.get("_tree") as Node;
    let root = mount(el, tree);

    const onTree = () => {
      const next = model.get("_tree") as Node;
      const patch = JSON.parse(
        diff(JSON.stringify(tree), JSON.stringify(next)),
      );
      root = applyPatch(root, patch);
      tree = next;
    };
    model.on("change:_tree", onTree);

    const forward = (event: Event) =>
      model.send({ type: event.type, detail: (event as CustomEvent).detail });
    for (const name of INTENTS) el.addEventListener(name, forward);

    return () => {
      model.off("change:_tree", onTree);
      for (const name of INTENTS) el.removeEventListener(name, forward);
      root.remove();
    };
  },
};
