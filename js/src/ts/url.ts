// URL channel for store fields: the `url=` counterpart of `persist=` (localStorage). A bound field
// is seeded from its query parameter at boot, every later change pushes a history entry, and
// back/forward write the parameter back — so a `Switch` on a bound field is a router: deep links,
// bookmarks, and reloads land on what the user was looking at.

import type { Store } from "./signals";

// strings ride the URL verbatim, other values JSON-encode (the `set-storage` convention)
function encode(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}

// a field seeded with a non-string reads its parameter back as JSON (`?page=2` → 2), falling back
// to the raw text; a string-seeded (or unseeded) field keeps the text as-is
function decode(text: string, seed: unknown): unknown {
  if (typeof seed === "string" || seed === undefined || seed === null)
    return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Bind store `fields` (field → query parameter name) to the page URL. Returns an unbind function.
 * Call before mounting so the tree renders with the URL's values; a parameter absent from the
 * URL leaves the field's seed alone, and navigating back past a field's first change restores it.
 */
export function bindUrl(
  store: Store,
  fields: Record<string, string>,
): () => void {
  const entries = Object.entries(fields);
  const seeds = new Map(entries.map(([field]) => [field, store.get(field)]));
  const apply = () => {
    const params = new URLSearchParams(window.location.search);
    for (const [field, param] of entries) {
      const text = params.get(param);
      store.set(
        field,
        text === null ? seeds.get(field) : decode(text, seeds.get(field)),
      );
    }
  };
  apply();
  const unsubscribes = entries.map(([field, param]) =>
    store.subscribe(field, (value) => {
      const params = new URLSearchParams(window.location.search);
      const text = encode(value);
      if (params.get(param) === text) return; // already there (a popstate write, or a no-op)
      if (text === null) params.delete(param);
      else params.set(param, text);
      const query = params.toString();
      window.history.pushState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }),
  );
  window.addEventListener("popstate", apply);
  return () => {
    window.removeEventListener("popstate", apply);
    for (const unsubscribe of unsubscribes) unsubscribe();
  };
}
