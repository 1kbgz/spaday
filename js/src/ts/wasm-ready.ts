// Tracks whether the wasm core has been initialized. The action interpreter runs in wasm, so an event
// firing before `init()` would otherwise fail with a cryptic wasm-bindgen error; this lets it fail with
// a clear, actionable message instead. `init` (the package entry) flips the flag on success.

let ready = false;

export function markReady(): void {
  ready = true;
}

export function assertReady(): void {
  if (!ready) {
    throw new Error(
      'spaday: the wasm core is not initialized — `await init({ module_or_path: "…/spaday_bg.wasm" })` ' +
        "before interacting with components that carry actions.",
    );
  }
}
