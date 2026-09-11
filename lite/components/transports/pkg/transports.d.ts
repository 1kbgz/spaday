/* tslint:disable */
/* eslint-disable */

/**
 * In-process model store: host / mutate → patch / apply / snapshot.
 */
export class Store {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Apply a JSON patch to a mirrored model; returns whether the id was known.
     */
    apply(id: bigint, patch_json: string): boolean;
    /**
     * Host a model from its JSON; returns the assigned id.
     */
    host(type_name: string, value_json: string): bigint;
    /**
     * Replace a hosted model from JSON; returns the JSON patch (or `undefined` if id unknown).
     */
    mutate(id: bigint, value_json: string): string | undefined;
    constructor();
    /**
     * `{"type_name":..,"rev":..,"value":..}` for a hosted model, or `undefined`.
     */
    snapshot(id: bigint): string | undefined;
}

/**
 * Apply a JSON-encoded patch to a JSON-encoded model, returning the JSON-encoded result.
 */
export function apply(value: string, patch: string): string;

/**
 * Convert CBOR bytes back to a JSON document.
 */
export function cbor_to_json(data: Uint8Array): string;

/**
 * Decode codec bytes back to a JSON-encoded model string.
 */
export function decode(data: Uint8Array): string;

/**
 * Decode bytes (produced by `codec`'s codec) back to a JSON-encoded model string.
 */
export function decode_as(data: Uint8Array, codec: string): string;

/**
 * Diff two JSON-encoded models, returning the JSON-encoded patch.
 */
export function diff(old: string, _new: string): string;

/**
 * Encode a JSON-encoded model to codec bytes (a `Uint8Array` in JS).
 */
export function encode(value: string): Uint8Array;

/**
 * Encode a JSON-encoded model with the codec named by `codec` (e.g. `"application/msgpack"`).
 */
export function encode_as(value: string, codec: string): Uint8Array;

/**
 * Convert an arbitrary JSON document to CBOR bytes (a `Uint8Array` in JS).
 */
export function json_to_cbor(json: string): Uint8Array;

/**
 * Convert an arbitrary JSON document to MessagePack bytes (a `Uint8Array` in JS).
 */
export function json_to_msgpack(json: string): Uint8Array;

/**
 * Convert MessagePack bytes back to a JSON document.
 */
export function msgpack_to_json(data: Uint8Array): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_store_free: (a: number, b: number) => void;
    readonly apply: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly cbor_to_json: (a: number, b: number) => [number, number, number, number];
    readonly decode: (a: number, b: number) => [number, number, number, number];
    readonly decode_as: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly diff: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly encode: (a: number, b: number) => [number, number, number, number];
    readonly encode_as: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly json_to_cbor: (a: number, b: number) => [number, number, number, number];
    readonly json_to_msgpack: (a: number, b: number) => [number, number, number, number];
    readonly msgpack_to_json: (a: number, b: number) => [number, number, number, number];
    readonly store_apply: (a: number, b: bigint, c: number, d: number) => [number, number, number];
    readonly store_host: (a: number, b: number, c: number, d: number, e: number) => [bigint, number, number];
    readonly store_mutate: (a: number, b: bigint, c: number, d: number) => [number, number, number, number];
    readonly store_new: () => number;
    readonly store_snapshot: (a: number, b: bigint) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
