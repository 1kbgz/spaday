// Encode/decode spaday's externally-tagged `Value` (the prop-value wire form) to/from plain JS.
// Mirrors `spaday/component.py::_tag` on the Python side, minus `Submodel` (spaday's Value has none).

/** A spaday prop value on the wire: `"Null"` or a single-key tag (`{Bool}`, `{Int}`, `{Str}`, ...). */
export type Value =
  | "Null"
  | { Bool: boolean }
  | { Int: number }
  | { Float: number }
  | { Str: string }
  | { List: Value[] }
  | { Map: Record<string, Value> };

/** Decode a tagged `Value` to a plain JS value. */
export function untag(value: Value): unknown {
  if (value === "Null") return null;
  if ("Bool" in value) return value.Bool;
  if ("Int" in value) return value.Int;
  if ("Float" in value) return value.Float;
  if ("Str" in value) return value.Str;
  if ("List" in value) return value.List.map(untag);
  if ("Map" in value)
    return Object.fromEntries(
      Object.entries(value.Map).map(([k, v]) => [k, untag(v)]),
    );
  throw new Error(`unrecognized tagged value: ${JSON.stringify(value)}`);
}

/** Encode a plain JS value as a tagged `Value` (the inverse of `untag`). */
export function tag(value: unknown): Value {
  if (value === null || value === undefined) return "Null";
  if (typeof value === "boolean") return { Bool: value };
  if (typeof value === "number")
    return Number.isInteger(value) ? { Int: value } : { Float: value };
  if (typeof value === "string") return { Str: value };
  if (Array.isArray(value)) return { List: value.map(tag) };
  if (typeof value === "object")
    return {
      Map: Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          tag(v),
        ]),
      ),
    };
  throw new Error(`unsupported value type: ${typeof value}`);
}
