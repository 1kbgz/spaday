import wasmInit from "../../dist/pkg/spaday";
import * as wasm from "../../dist/pkg/spaday";

import { markReady } from "./wasm-ready";

export * as wasm from "../../dist/pkg/spaday";

/**
 * Initialize the wasm core (required before the action interpreter runs in the browser). Pass the
 * `spaday_bg.wasm` URL, e.g. `await init({ module_or_path: "/js/dist/pkg/spaday_bg.wasm" })`, before
 * interacting.
 */
export async function init(
  moduleOrPath?: Parameters<typeof wasmInit>[0],
): Promise<void> {
  await wasmInit(moduleOrPath);
  markReady();
}

/** Diff two JSON-encoded component trees, returning the JSON-encoded patch. */
export const diff = (oldTree: string, newTree: string): string =>
  wasm.diff(oldTree, newTree);

/** Apply a JSON-encoded patch to a JSON-encoded tree, returning the JSON-encoded result. */
export const apply = (root: string, patch: string): string =>
  wasm.apply(root, patch);

/**
 * Frame a JSON-encoded tree (`kind: "snapshot"`) or patch (`kind: "patch"`) into transports'
 * length-prefixed envelope bytes, encoded with `codec` (`"application/json"` or `"application/msgpack"`).
 */
export const encodeFrame = (
  payload: string,
  modelType: string,
  kind: "snapshot" | "patch",
  rev: number,
  codec = "application/json",
): Uint8Array => wasm.encode_frame(payload, modelType, kind, rev, codec);

/** Decode one frame back to a `{model_type,kind,rev,payload}` JSON string (payload ready for mount/applyPatch). */
export const decodeFrame = (frame: Uint8Array): string =>
  wasm.decode_frame(frame);

// Custom Elements Manifest binding: parse a manifest into component schemas / a runtime registry.
export { parseCem, registry } from "./cem";
export type { ComponentSchema, PropSchema, PropType } from "./cem";

// Browser runtime: render a component tree to the DOM and apply tree patches incrementally.
// `hydrate` adopts server-rendered HTML (Python `spaday.render_html`) instead of rebuilding.
export { mount, applyPatch, hydrate } from "./runtime";
export type { Binding, Node } from "./runtime";

// Reactive engine: a signal store whose fields back the tree's reactive `bindings` (prop ↔ field).
export { Store } from "./signals";
export type { Field } from "./signals";

// The transports seam: bidirectionally sync a Store with a transports-mirrored model. Imports nothing
// from transports — it speaks to the Client through the ModelClient interface (spaday's view of the wire).
export { connectStore } from "./store-sync";
export type { ModelClient, ValueCodec, StoreLink } from "./store-sync";

// Action DSL: declarative behavior, interpreted in the browser on DOM events (no Python round-trip).
export { interpret } from "./actions";
export type { ActionContext } from "./actions";

// Register a named JS handler for the `NamedJs` action (the DSL's no-eval escape hatch).
export { registerHandler } from "./handlers";
export type { NamedHandler } from "./handlers";

// High-level layout/shell primitives — defines the spa-* custom elements on import.
export { SHELL_TAGS } from "./shell";

// Prop-value (`Value`) encode/decode.
export { tag, untag } from "./value";
export type { Value } from "./value";
