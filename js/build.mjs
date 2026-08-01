import { bundle } from "./tools/bundle.mjs";
import { bundle_css } from "./tools/css.mjs";
import { node_modules_external } from "./tools/externals.mjs";

import fs from "fs";
import cpy from "cpy";

// Statically register the whole WebAwesome catalog by importing each installed component module, so a
// bundle is self-contained (no runtime chunk loading — WebAwesome's own `webawesome.js` entry is a lazy
// bootstrap that can't resolve under anywidget's single-file ESM). Generated from node_modules, so it
// tracks the installed version with no committed list; shared by the widget bundle and the served-examples
// bundle so every `wa-*` (nav included) is available.
const WA_COMPONENTS = "node_modules/@awesome.me/webawesome/dist/components";
const WA_CATALOG = fs
  .readdirSync(WA_COMPONENTS)
  .filter((n) => fs.existsSync(`${WA_COMPONENTS}/${n}/${n}.js`))
  .map((n) => `import "@awesome.me/webawesome/dist/components/${n}/${n}.js";`)
  .join("\n");
// WebAwesome controls whose shadow content uses border-box can overflow tight hosts. Buttons have the
// same problem when a parent custom element (notably wa-button-group) blockifies their inline-block host:
// the shadow base paints wider than the flex item and overlaps its neighbor. Install these at the
// WebAwesome integration boundary so they apply inside shell rows, nested WA components, and widgets.
const WA_LAYOUT_FIXES =
  '\nif (typeof document !== "undefined" && !document.querySelector("style[data-spaday-webawesome]")) { const s = document.createElement("style"); s.dataset.spadayWebawesome = ""; s.textContent = "wa-input::part(base),wa-select::part(combobox){box-sizing:border-box}wa-button{display:inline-flex}"; document.head.appendChild(s); }\n';
const WA_WIDGET_ENTRY =
  WA_CATALOG +
  WA_LAYOUT_FIXES +
  '\nexport { default } from "./src/ts/widget";\n';
const WA_EXAMPLES_ENTRY = WA_CATALOG + WA_LAYOUT_FIXES;

const BUNDLES = [
  {
    entryPoints: ["src/ts/index.ts"],
    plugins: [node_modules_external()],
    outfile: "dist/esm/index.js",
  },
  {
    entryPoints: ["src/ts/index.ts"],
    outfile: "dist/cdn/index.js",
  },
  {
    // Self-contained wrapper bundle (lightweight-charts included); importing it defines the element.
    entryPoints: ["src/ts/wrappers/lightweight-chart.ts"],
    outfile: "dist/cdn/wrappers/lightweight-chart.js",
  },
  {
    // The full WebAwesome catalog for served examples (serve(bundles=["webawesome"])) — every wa-*
    // registers (nav, etc.), plus the rendered-layout fixes. Generated, like the widget bundle.
    stdin: { contents: WA_EXAMPLES_ENTRY, resolveDir: ".", loader: "js" },
    outfile: "dist/cdn/examples/webawesome.js",
  },
  {
    // The gateway example's clear-blotter NamedJs handler (Perspective repaint glue), loaded via
    // serve(scripts=[…]). The runtime is external so it shares the page's handler registry, not a copy.
    entryPoints: ["src/ts/examples/gateway.ts"],
    outfile: "dist/cdn/examples/gateway.js",
    external: ["/js/dist/esm/index.js"],
  },
  {
    // spaday as an anywidget ESM (self-contained runtime + inlined wasm); the Python Widget loads it
    // as `_esm`. The `binary` loader inlines the wasm core into the bundle (see widget.ts), so the
    // widget is one self-contained file with no separately-synced `_wasm`.
    entryPoints: ["src/ts/widget.ts"],
    outfile: "dist/cdn/widget.js",
    loader: { ".wasm": "binary" },
  },
  {
    // The widget bundle with the full WebAwesome catalog statically registered — the default ESM for
    // the Python `Widget`, so every wa-* element renders in a notebook with no extra script. The entry
    // is a generated virtual module (see WA_WIDGET_ENTRY) re-exporting the lean widget's default.
    stdin: { contents: WA_WIDGET_ENTRY, resolveDir: ".", loader: "js" },
    outfile: "dist/cdn/widget.webawesome.js",
    loader: { ".wasm": "binary" },
  },
];

async function build() {
  // Bundle css
  await bundle_css();
  // WebAwesome's base + theme CSS (resolve its @import chain into one file) for the widget's `_css`.
  await bundle_css(
    "node_modules/@awesome.me/webawesome/dist/styles/webawesome.css",
  );

  // Copy HTML
  await cpy("src/html/*", "dist/");

  // Copy images
  if (fs.existsSync("src/img")) {
    fs.mkdirSync("dist/img", { recursive: true });
    await cpy("src/img/*", "dist/img");
  }

  await Promise.all(BUNDLES.map(bundle)).catch(() => process.exit(1));

  // Copy servable assets to python extension (exclude esm/)
  fs.rmSync("../spaday/extension", {
    recursive: true,
    force: true,
  });
  fs.mkdirSync("../spaday/extension", { recursive: true });
  await cpy("dist/**/*", "../spaday/extension", {
    filter: (file) =>
      !file.relativePath.startsWith("esm/") &&
      !file.relativePath.startsWith("dist/esm/"),
  });
  await cpy(
    "node_modules/@1kbgz/transports/dist/cdn/index.js*",
    "../spaday/extension/transports/cdn",
  );
  await cpy(
    "node_modules/@1kbgz/transports/dist/pkg/*",
    "../spaday/extension/transports/pkg",
  );
}

build();
