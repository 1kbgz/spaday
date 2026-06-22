// spaday as an anywidget: render a spaday component tree inside any anywidget host — Jupyter
// (Lab/Notebook/Colab/VS Code), Marimo, Shiny-for-Python, Solara, Panel — over the widget's model.
//
// The model carries the serialized component tree (`_tree`) and the spaday wasm core (`_wasm`, the
// action interpreter). The spaday runtime mounts the tree and keeps it live by diffing successive
// trees with the same core `diff`/`applyPatch` it uses over a transports wire — so a Python-side
// `widget.update(tree)` produces a minimal DOM patch, not a re-render. Behavior authored in Python
// (the action DSL) runs client-side here with no kernel round-trip; the DSL's outbound intents
// (a `SendPatch` action's `spaday:patch`) are forwarded to the kernel over the model.

import { applyPatch, diff, init, mount, Node } from "./index";

interface AnyModel {
  get(key: string): unknown;
  on(event: string, cb: () => void): void;
  off(event: string, cb: () => void): void;
  send(content: unknown): void;
}

// The wasm core is process-wide, so initialize it once from the first model's bytes; later widgets
// reuse the same ready promise.
let ready: Promise<void> | undefined;
function ensureWasm(model: AnyModel): Promise<void> {
  if (!ready) {
    const raw = model.get("_wasm");
    const bytes =
      raw instanceof ArrayBuffer
        ? new Uint8Array(raw)
        : new Uint8Array((raw as DataView).buffer);
    ready = init({ module_or_path: bytes });
  }
  return ready;
}

// Intents the action DSL bubbles to the host element; forward each to the kernel over the model so a
// Python handler (Widget.on_intent) can react.
const INTENTS = ["spaday:patch"];

export default {
  async initialize({ model }: { model: AnyModel }): Promise<void> {
    await ensureWasm(model);
  },
  async render({
    model,
    el,
  }: {
    model: AnyModel;
    el: HTMLElement;
  }): Promise<() => void> {
    await ensureWasm(model);

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
