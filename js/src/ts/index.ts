import * as wasm from "../../dist/pkg/spaday";

export * as wasm from "../../dist/pkg/spaday";

export const placeholder = "";

export const foo = () => wasm.foo();

/** Diff two JSON-encoded component trees, returning the JSON-encoded patch. */
export const diff = (oldTree: string, newTree: string): string =>
  wasm.diff(oldTree, newTree);

/** Apply a JSON-encoded patch to a JSON-encoded tree, returning the JSON-encoded result. */
export const apply = (root: string, patch: string): string =>
  wasm.apply(root, patch);

// Custom Elements Manifest binding: parse a manifest into component schemas / a runtime registry.
export { parseCem, registry } from "./cem";
export type { ComponentSchema, PropSchema, PropType } from "./cem";
