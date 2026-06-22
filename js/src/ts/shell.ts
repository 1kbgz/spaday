// spaday's high-level layout/shell primitives — Phase 4.1. These are the "higher altitude" authoring
// surface: instead of building layout from raw `div`s, you compose real `spa-*` web components whose
// layout (flex/grid, spacing, surfaces) is encapsulated in shadow DOM. Each is a thin custom element
// with one default `<slot>` and a `:host` style; structure comes from how you nest them
// (App › Nav / Body › Gutter + Main / Footer), spacing from Stack/Row/Toolbar.
//
// Surfaces/borders/muted-text fall back to **WebAwesome theme tokens**, so the shell follows the active
// light/dark theme automatically (with a plain default when WebAwesome isn't present). A few layout
// attributes — `gap` / `align` / `justify` / `width` — map to the corresponding CSS custom properties.
// Importing this module (side effect, via the runtime entry) defines the elements.

const BORDER = "var(--spa-border, var(--wa-color-surface-border, #e6e6e6))";
const SURFACE = "var(--spa-surface, var(--wa-color-surface-default, #fff))";
const SURFACE_2 =
  "var(--spa-surface-2, var(--wa-color-surface-lowered, #fafafa))";
const MUTED = "var(--spa-muted, var(--wa-color-text-quiet, #666))";

/** tag → the element's `:host` layout style. Each gets a shadow root with this style + a default slot. */
const SHELL: Record<string, string> = {
  // page frame: nav (top) / body (fills) / footer (bottom), stacked
  "spa-app": ":host{display:flex;flex-direction:column;min-height:100vh}",
  // top app bar
  "spa-nav": `:host{display:flex;align-items:center;gap:var(--spa-gap, 1rem);padding:.75rem 1.25rem;border-bottom:1px solid ${BORDER};background:${SURFACE}}`,
  // middle region: gutters + main, side by side
  "spa-body": ":host{display:flex;flex:1;min-height:0}",
  // a sidebar; place before or after main to get a left/right gutter
  "spa-gutter": `:host{display:flex;flex-direction:column;gap:var(--spa-gap, .5rem);flex:none;width:var(--spa-gutter-width, 220px);padding:1rem;border-right:1px solid ${BORDER};background:${SURFACE_2}}`,
  // primary content region
  "spa-main":
    ":host{display:block;flex:1;min-width:0;padding:1.5rem;overflow:auto}",
  // bottom bar
  "spa-footer": `:host{padding:.6rem 1.25rem;border-top:1px solid ${BORDER};background:${SURFACE};font-size:.8rem;color:${MUTED}}`,
  // generic vertical group
  "spa-stack":
    ":host{display:flex;flex-direction:column;gap:var(--spa-gap, .75rem);align-items:var(--spa-align, stretch)}",
  // generic horizontal group
  "spa-row":
    ":host{display:flex;align-items:var(--spa-align, center);justify-content:var(--spa-justify, flex-start);gap:var(--spa-gap, 1rem)}",
  // a contained strip of actions/controls
  "spa-toolbar": `:host{display:flex;align-items:var(--spa-align, center);gap:var(--spa-gap, .5rem);padding:.5rem .6rem;background:${SURFACE_2};border:1px solid ${BORDER};border-radius:8px}`,
};

/** The shell element tags, defined on import. */
export const SHELL_TAGS = Object.keys(SHELL);

// Layout attributes → the CSS custom property they drive. Setting e.g. `gap="2rem"` on a shell element
// sets `--spa-gap` on its host, which the `:host` style above reads (an element ignores vars it doesn't
// use, so the same set is safe on every tag).
const ATTR_VARS: Record<string, string> = {
  gap: "--spa-gap",
  align: "--spa-align",
  justify: "--spa-justify",
  width: "--spa-gutter-width",
};

// WebAwesome's `wa-button` host is `inline-block`; as a flex item in these containers it blockifies to
// `block` and its internal base part overflows the host (overlapping neighbors). Forcing `inline-flex`
// blockifies to `flex` instead, so a slotted button sizes to its content. (wa-select/wa-switch are
// already inline-flex and unaffected.)
const SLOTTED_FIX = "::slotted(wa-button){display:inline-flex}";

// Guard so importing the runtime in a non-DOM context (e.g. the test runner / SSR in node) is a no-op
// rather than touching `customElements`/`HTMLElement`, which only exist in the browser.
if (typeof customElements !== "undefined") {
  for (const [tag, css] of Object.entries(SHELL)) {
    if (customElements.get(tag)) continue;
    customElements.define(
      tag,
      class extends HTMLElement {
        static get observedAttributes(): string[] {
          return Object.keys(ATTR_VARS);
        }
        constructor() {
          super();
          const root = this.attachShadow({ mode: "open" });
          const style = document.createElement("style");
          style.textContent = css + SLOTTED_FIX;
          root.append(style, document.createElement("slot"));
        }
        attributeChangedCallback(
          name: string,
          _old: string | null,
          value: string | null,
        ): void {
          const prop = ATTR_VARS[name];
          if (!prop) return;
          if (value == null) this.style.removeProperty(prop);
          else this.style.setProperty(prop, value);
        }
      },
    );
  }
}
