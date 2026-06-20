import * as wasm from "../../dist/pkg/spaday";

/** A normalized prop type (mirrors the Rust core's `PropType`). */
export type PropType =
  | "Bool"
  | "Str"
  | "Number"
  | "Any"
  | { Enum: string[] }
  | { Optional: PropType };

export interface PropSchema {
  name: string;
  ty: PropType;
  default?: string;
  doc?: string;
}

/** A normalized custom element, parsed from a Custom Elements Manifest. */
export interface ComponentSchema {
  tag_name: string;
  class_name: string;
  summary?: string;
  props: PropSchema[];
  events: string[];
  slots: string[];
}

/** Parse a `custom-elements.json` into component schemas, via the shared Rust core. */
export const parseCem = (manifest: string): ComponentSchema[] =>
  JSON.parse(wasm.parse_cem(manifest));

/** Build a tag-name → schema registry the runtime uses to instantiate and bind elements. */
export const registry = (manifest: string): Map<string, ComponentSchema> =>
  new Map(parseCem(manifest).map((s) => [s.tag_name, s]));
