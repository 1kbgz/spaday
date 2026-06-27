// The WebAwesome elements the omnibus example uses, bundled self-contained (esbuild resolves
// WebAwesome's internal chunk imports) so the page can load one file and have wa-* register —
// importing each component module defines its custom element.
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/details/details.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/switch/switch.js";

// WebAwesome renders a form control's `base` / `combobox` part as content-box, so its horizontal padding
// can spill past the host and overflow a tight container (e.g. a fixed-width gutter — see gateway.py).
// Fold the padding into the width once for every example that loads this bundle (`::part` reaches into
// the shadow DOM, which a page-level `* { box-sizing }` reset cannot).
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent =
    "wa-input::part(base),wa-select::part(combobox){box-sizing:border-box}";
  document.head.appendChild(style);
}

export {};
