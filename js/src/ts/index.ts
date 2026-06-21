import * as wasm from "../../dist/pkg/spaday";

export * as wasm from "../../dist/pkg/spaday";

/** Diff two JSON-encoded component trees, returning the JSON-encoded patch. */
export const diff = (oldTree: string, newTree: string): string =>
  wasm.diff(oldTree, newTree);

/** Apply a JSON-encoded patch to a JSON-encoded tree, returning the JSON-encoded result. */
export const apply = (root: string, patch: string): string =>
  wasm.apply(root, patch);

// Custom Elements Manifest binding: parse a manifest into component schemas / a runtime registry.
export { parseCem, registry } from "./cem";
export type { ComponentSchema, PropSchema, PropType } from "./cem";

// Browser runtime: render a component tree to the DOM and apply tree patches incrementally.
export { mount, applyPatch } from "./runtime";
export type { Node } from "./runtime";

// Action DSL: declarative behavior, interpreted in the browser on DOM events (no Python round-trip).
export { interpret } from "./actions";
export type { ActionContext } from "./actions";

// High-level layout/shell primitives — defines the spa-* custom elements on import.
export { SHELL_TAGS } from "./shell";

// Prop-value (`Value`) encode/decode.
export { tag, untag } from "./value";
export type { Value } from "./value";
