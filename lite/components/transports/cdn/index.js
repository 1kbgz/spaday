var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// dist/pkg/transports.js
var transports_exports = {};
__export(transports_exports, {
  Store: () => Store,
  apply: () => apply,
  cbor_to_json: () => cbor_to_json,
  decode: () => decode,
  decode_as: () => decode_as,
  default: () => __wbg_init,
  diff: () => diff,
  encode: () => encode,
  encode_as: () => encode_as,
  initSync: () => initSync,
  json_to_cbor: () => json_to_cbor,
  json_to_msgpack: () => json_to_msgpack,
  msgpack_to_json: () => msgpack_to_json
});
var Store = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    StoreFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_store_free(ptr, 0);
  }
  /**
   * Apply a JSON patch to a mirrored model; returns whether the id was known.
   * @param {bigint} id
   * @param {string} patch_json
   * @returns {boolean}
   */
  apply(id, patch_json) {
    const ptr0 = passStringToWasm0(patch_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.store_apply(this.__wbg_ptr, id, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * Host a model from its JSON; returns the assigned id.
   * @param {string} type_name
   * @param {string} value_json
   * @returns {bigint}
   */
  host(type_name, value_json) {
    const ptr0 = passStringToWasm0(type_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(value_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.store_host(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return BigInt.asUintN(64, ret[0]);
  }
  /**
   * Replace a hosted model from JSON; returns the JSON patch (or `undefined` if id unknown).
   * @param {bigint} id
   * @param {string} value_json
   * @returns {string | undefined}
   */
  mutate(id, value_json) {
    const ptr0 = passStringToWasm0(value_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.store_mutate(this.__wbg_ptr, id, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]).slice();
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  constructor() {
    const ret = wasm.store_new();
    this.__wbg_ptr = ret;
    StoreFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * `{"type_name":..,"rev":..,"value":..}` for a hosted model, or `undefined`.
   * @param {bigint} id
   * @returns {string | undefined}
   */
  snapshot(id) {
    const ret = wasm.store_snapshot(this.__wbg_ptr, id);
    let v1;
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice();
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v1;
  }
};
if (Symbol.dispose) Store.prototype[Symbol.dispose] = Store.prototype.free;
function apply(value, patch) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(patch, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.apply(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}
function cbor_to_json(data) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.cbor_to_json(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function decode(data) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decode(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function decode_as(data, codec) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(codec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.decode_as(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}
function diff(old, _new) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passStringToWasm0(old, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(_new, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.diff(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}
function encode(value) {
  const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.encode(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}
function encode_as(value, codec) {
  const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(codec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.encode_as(ptr0, len0, ptr1, len1);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
}
function json_to_cbor(json) {
  const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.json_to_cbor(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}
function json_to_msgpack(json) {
  const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.json_to_msgpack(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}
function msgpack_to_json(data) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.msgpack_to_json(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Error_92b29b0548f8b746: function(arg0, arg1) {
      const ret = Error(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./transports_bg.js": import0
  };
}
var StoreFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_store_free(ptr, 1));
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasmInstance;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("transports_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}

// src/ts/bridge.ts
function toValue(v) {
  if (v === null || v === void 0) return "Null";
  if (typeof v === "boolean") return { Bool: v };
  if (typeof v === "number")
    return Number.isInteger(v) ? { Int: v } : { Float: v };
  if (typeof v === "string") return { Str: v };
  if (Array.isArray(v)) return { List: v.map(toValue) };
  if (typeof v === "object") {
    const m = {};
    for (const [k, x] of Object.entries(v)) m[k] = toValue(x);
    return { Map: m };
  }
  throw new TypeError(`unsupported value for transports: ${typeof v}`);
}
function fromValue(value) {
  if (value === "Null") return null;
  const [tag, inner] = Object.entries(value)[0];
  switch (tag) {
    case "Bool":
    case "Int":
    case "Float":
    case "Str":
    case "Submodel":
      return inner;
    case "List":
      return inner.map(fromValue);
    case "Map": {
      const o = {};
      for (const [k, x] of Object.entries(inner))
        o[k] = fromValue(x);
      return o;
    }
    default:
      throw new Error(`unrecognized tagged value: ${JSON.stringify(value)}`);
  }
}

// src/ts/codecs.ts
var BUILTIN = /* @__PURE__ */ new Set([
  "",
  "json",
  "application/json",
  "msgpack",
  "application/msgpack",
  "x-msgpack",
  "application/x-msgpack",
  "cbor",
  "application/cbor"
]);
var registry = /* @__PURE__ */ new Map();
function registerCodec(contentType, encode3, decode3) {
  if (BUILTIN.has(contentType)) {
    throw new Error(`cannot override built-in codec: ${contentType}`);
  }
  registry.set(contentType, { encode: encode3, decode: decode3 });
}
function unregisterCodec(contentType) {
  registry.delete(contentType);
}
function codecFor(contentType) {
  return registry.get(contentType);
}

// src/ts/client.ts
function mapValue(value) {
  if (value && typeof value === "object" && "Map" in value && value.Map && typeof value.Map === "object" && !Array.isArray(value.Map))
    return value.Map;
  throw new Error("patch path expected a map");
}
function listValue(value) {
  if (value && typeof value === "object" && "List" in value && Array.isArray(value.List))
    return value.List;
  throw new Error("patch path expected a list");
}
function validIndex(index) {
  return Number.isSafeInteger(index) && index >= 0;
}
function updateAt(value, path, update) {
  if (!path.length) return update(value);
  const [segment, ...rest] = path;
  if ("Key" in segment) {
    const map = mapValue(value);
    if (rest.length && !Object.prototype.hasOwnProperty.call(map, segment.Key))
      throw new Error(
        `patch path key ${JSON.stringify(segment.Key)} not found`
      );
    return {
      Map: {
        ...map,
        [segment.Key]: updateAt(map[segment.Key], rest, update)
      }
    };
  }
  const list = listValue(value);
  if (!validIndex(segment.Index) || segment.Index >= list.length)
    throw new Error(
      `patch path index ${segment.Index} out of bounds (len ${list.length})`
    );
  const next = [...list];
  next[segment.Index] = updateAt(next[segment.Index], rest, update);
  return { List: next };
}
function applyOp(value, op) {
  if ("Set" in op) return updateAt(value, op.Set.path, () => op.Set.value);
  if ("Remove" in op) {
    const { path } = op.Remove;
    const segment = path[path.length - 1];
    if (!segment || !("Key" in segment))
      throw new Error("remove path must end in a map key");
    return updateAt(value, path.slice(0, -1), (container) => {
      const map = { ...mapValue(container) };
      delete map[segment.Key];
      return { Map: map };
    });
  }
  if ("Insert" in op) {
    const { path, index, value: inserted } = op.Insert;
    return updateAt(value, path, (container) => {
      const list = listValue(container);
      if (!validIndex(index) || index > list.length)
        throw new Error(
          `insert index ${index} out of bounds (len ${list.length})`
        );
      const next = [...list];
      next.splice(index, 0, inserted);
      return { List: next };
    });
  }
  if ("RemoveAt" in op) {
    const { path, index } = op.RemoveAt;
    return updateAt(value, path, (container) => {
      const list = listValue(container);
      if (!validIndex(index) || index >= list.length)
        throw new Error(
          `remove index ${index} out of bounds (len ${list.length})`
        );
      const next = [...list];
      next.splice(index, 1);
      return { List: next };
    });
  }
  if ("Move" in op) {
    const { path, from, to } = op.Move;
    return updateAt(value, path, (container) => {
      const list = listValue(container);
      if (!validIndex(from) || from >= list.length)
        throw new Error(
          `move source index ${from} out of bounds (len ${list.length})`
        );
      if (!validIndex(to) || to >= list.length)
        throw new Error(
          `move destination index ${to} out of bounds (len ${list.length})`
        );
      if (from === to) return container;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { List: next };
    });
  }
  if ("Reorder" in op) {
    const { path, order } = op.Reorder;
    return updateAt(value, path, (container) => {
      const list = listValue(container);
      if (!Array.isArray(order))
        throw new Error("reorder order must be an array");
      if (order.length !== list.length)
        throw new Error(
          `reorder length ${order.length} does not match list length ${list.length}`
        );
      const seen = /* @__PURE__ */ new Set();
      for (const index of order) {
        if (!validIndex(index) || index >= list.length)
          throw new Error(
            `reorder index ${index} out of bounds (len ${list.length})`
          );
        if (seen.has(index))
          throw new Error(`reorder index ${index} is duplicated`);
        seen.add(index);
      }
      if (order.every((old, current) => old === current))
        return container;
      return { List: order.map((index) => list[index]) };
    });
  }
  throw new Error("unknown patch op");
}
function applyPatch(value, patch) {
  let next = value;
  for (const op of patch.ops) next = applyOp(next, op);
  return next;
}
var Client = class {
  constructor(codec = "json") {
    this.codec = codec;
  }
  codec;
  values = /* @__PURE__ */ new Map();
  revs = /* @__PURE__ */ new Map();
  changeListeners = [];
  rejectListeners = [];
  /** Register a listener fired when the server refuses a proposed edit, with the decoded `reject`
   * frame (model id, the server's current rev, and the validation error). The mirror itself reverts
   * via the authoritative snapshot the server sends alongside. Returns an unsubscribe function.
   */
  onReject(listener) {
    this.rejectListeners.push(listener);
    return () => {
      const i = this.rejectListeners.indexOf(listener);
      if (i >= 0) this.rejectListeners.splice(i, 1);
    };
  }
  /** Register a listener fired after each accepted snapshot or patch — the same `ReceiveChange`
   * `recv` returns — so `connect`/`run`/`connectSSE` consumers get path-level changes without
   * managing the socket themselves. Not fired for ignored frames (stale revision, unknown message
   * type). Returns an unsubscribe function. A listener exception propagates to the `recv` caller;
   * the mirror has already updated by then.
   */
  onChange(listener) {
    this.changeListeners.push(listener);
    return () => {
      const i = this.changeListeners.indexOf(listener);
      if (i >= 0) this.changeListeners.splice(i, 1);
    };
  }
  accepted(change) {
    for (const listener of [...this.changeListeners]) listener(change);
    return change;
  }
  /** Apply an inbound snapshot or patch frame to the mirror.
   *
   * Decodes by the client's codec: a registered custom codec, else built-in JSON (text) / msgpack
   * (binary). Returns the accepted change so reactive adapters can update only its paths; returns
   * `undefined` for a patch whose revision was already applied, and for an unrecognized message
   * type — ignored, not an error, so a newer server can add message types without breaking older
   * clients. The returned change and values from `value()` share immutable branches with the
   * mirror; consumers must not mutate them. Invalid frames throw without changing the mirror or its
   * accepted revision.
   */
  recv(data) {
    const custom = codecFor(this.codec);
    let msg;
    if (custom) {
      msg = custom.decode(data);
    } else if (typeof data === "string") {
      msg = JSON.parse(data);
    } else {
      msg = JSON.parse(
        this.codec === "cbor" ? cborToJson(data) : msgpackToJson(data)
      );
    }
    if (msg.t === "snapshot") {
      this.values.set(msg.id, msg.value);
      this.revs.set(msg.id, msg.rev);
      return this.accepted({ t: "snapshot", id: msg.id, rev: msg.rev });
    } else if (msg.t === "patch") {
      const seen = this.revs.get(msg.id);
      if (seen !== void 0 && msg.patch.rev <= seen) return void 0;
      const current = this.values.get(msg.id);
      if (current === void 0)
        throw new Error(`patch received before snapshot for model ${msg.id}`);
      this.values.set(msg.id, applyPatch(current, msg.patch));
      this.revs.set(msg.id, msg.patch.rev);
      return this.accepted(msg);
    } else if (msg.t === "reject") {
      for (const listener of [...this.rejectListeners]) listener(msg);
      return void 0;
    }
    return void 0;
  }
  /** The current mirrored core `Value` of a model. */
  value(id) {
    return this.values.get(id);
  }
  ids() {
    return [...this.values.keys()];
  }
  /** Propose an edit to a mirrored model; returns the patch frame to send (encoded in this codec).
   *
   * Server-authoritative: the local mirror updates when the server echoes the authoritative patch
   * back via `recv`, not optimistically.
   */
  edit(id, value) {
    const patch = JSON.parse(
      diff2(JSON.stringify(this.values.get(id)), JSON.stringify(value))
    );
    const msg = { t: "patch", id, patch };
    const custom = codecFor(this.codec);
    if (custom) return custom.encode(msg);
    const s = JSON.stringify(msg);
    if (this.codec === "msgpack") return jsonToMsgpack(s);
    if (this.codec === "cbor") return jsonToCbor(s);
    return s;
  }
  /** Connect to a transports server and mirror it. Returns the `WebSocket`.
   *
   * On a reconnect (this client already mirrors models) it appends `?since=` with its last-seen rev per
   * model, so the server replays only the delta instead of re-sending each whole model.
   */
  connect(url) {
    const sep = url.includes("?") ? "&" : "?";
    let params = `codec=${this.codec}`;
    if (this.revs.size) {
      const since = encodeURIComponent(
        JSON.stringify(Object.fromEntries(this.revs))
      );
      params += `&since=${since}`;
    }
    const ws = new WebSocket(`${url}${sep}${params}`);
    ws.binaryType = "arraybuffer";
    ws.addEventListener("message", (e) => {
      const data = e.data;
      this.recv(
        typeof data === "string" ? data : new Uint8Array(data)
      );
    });
    return ws;
  }
  /** Connect and mirror, **reconnecting** whenever the socket drops — so the client survives a server
   * restart or a refresh. `authority` decides reconciliation on each (re)connect:
   *
   * - `"server"` (default): the server is canonical; the client adopts its state (resuming via `?since=`
   *   when it can, else a fresh snapshot) — the "refetch on refresh" behavior.
   * - `"client"`: the client is canonical; after the server's snapshot it pushes its last-known state
   *   back as an edit, rectifying a server that came back stale/empty (merges under a CRDT, else
   *   overwrites).
   *
   * `onMessage` fires after each applied frame (e.g. to re-render). Returns `{ stop() }`.
   */
  run(url, opts = {}) {
    const { authority = "server", retry = 1e3, onMessage } = opts;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      const pre = authority === "client" ? new Map(this.values) : null;
      const pushed = /* @__PURE__ */ new Set();
      const ws = this.connect(url);
      ws.addEventListener("message", () => {
        onMessage?.();
        if (pre) {
          for (const id of this.values.keys()) {
            if (!pushed.has(id) && pre.has(id)) {
              ws.send(
                this.edit(id, pre.get(id))
              );
              pushed.add(id);
            }
          }
        }
      });
      ws.addEventListener("close", () => {
        if (!stopped) setTimeout(loop, retry);
      });
      ws.addEventListener("error", () => {
        try {
          ws.close();
        } catch {
        }
      });
    };
    loop();
    return {
      stop() {
        stopped = true;
      }
    };
  }
  /** Mirror a server over Server-Sent Events (receive-only, JSON). Returns the `EventSource`. */
  connectSSE(url) {
    const es = new EventSource(url);
    es.addEventListener(
      "message",
      (e) => this.recv(e.data)
    );
    return es;
  }
};

// src/ts/index.ts
var placeholder = "";
var diff2 = (oldModel, newModel) => diff(oldModel, newModel);
var apply2 = (model, patch) => apply(model, patch);
var encode2 = (model) => encode(model);
var decode2 = (bytes) => decode(bytes);
var encodeAs = (model, codec) => encode_as(model, codec);
var decodeAs = (bytes, codec) => decode_as(bytes, codec);
var jsonToMsgpack = (json) => json_to_msgpack(json);
var msgpackToJson = (bytes) => msgpack_to_json(bytes);
var jsonToCbor = (json) => json_to_cbor(json);
var cborToJson = (bytes) => cbor_to_json(bytes);
var Store2 = Store;
export {
  Client,
  Store2 as Store,
  apply2 as apply,
  cborToJson,
  codecFor,
  decode2 as decode,
  decodeAs,
  diff2 as diff,
  encode2 as encode,
  encodeAs,
  fromValue,
  jsonToCbor,
  jsonToMsgpack,
  msgpackToJson,
  placeholder,
  registerCodec,
  toValue,
  unregisterCodec,
  transports_exports as wasm
};
//# sourceMappingURL=index.js.map
