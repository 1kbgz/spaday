// The WebAwesome elements the dashboard example uses, bundled self-contained (esbuild resolves
// WebAwesome's internal chunk imports) so the page can load one file and have wa-* register —
// importing each component module defines its custom element.
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/button/button.js";

export {};
