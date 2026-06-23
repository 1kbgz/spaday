import { bundle } from "./tools/bundle.mjs";
import { bundle_css } from "./tools/css.mjs";
import { node_modules_external } from "./tools/externals.mjs";

import fs from "fs";
import cpy from "cpy";

// Statically register the whole WebAwesome catalog by importing each installed component module, so the
// widget bundle is self-contained (no runtime chunk loading — WebAwesome's own `webawesome.js` entry is
// a lazy bootstrap that can't resolve under anywidget's single-file ESM). Generated from node_modules,
// so it tracks the installed version with no committed list.
const WA_COMPONENTS = "node_modules/@awesome.me/webawesome/dist/components";
const WA_WIDGET_ENTRY =
  fs
    .readdirSync(WA_COMPONENTS)
    .filter((n) => fs.existsSync(`${WA_COMPONENTS}/${n}/${n}.js`))
    .map((n) => `import "@awesome.me/webawesome/dist/components/${n}/${n}.js";`)
    .join("\n") + '\nexport { default } from "./src/ts/widget";\n';

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
    // Self-contained WebAwesome controls for the dashboard example (esbuild resolves WA's chunks).
    entryPoints: ["src/ts/examples/webawesome.ts"],
    outfile: "dist/cdn/examples/webawesome.js",
  },
  {
    // spaday as an anywidget ESM (self-contained runtime); the Python Widget loads it as `_esm`.
    entryPoints: ["src/ts/widget.ts"],
    outfile: "dist/cdn/widget.js",
  },
  {
    // The widget bundle with the full WebAwesome catalog statically registered — the default ESM for
    // the Python `Widget`, so every wa-* element renders in a notebook with no extra script. The entry
    // is a generated virtual module (see WA_WIDGET_ENTRY) re-exporting the lean widget's default.
    stdin: { contents: WA_WIDGET_ENTRY, resolveDir: ".", loader: "js" },
    outfile: "dist/cdn/widget.webawesome.js",
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
  cpy("src/html/*", "dist/");

  // Copy images
  fs.mkdirSync("dist/img", { recursive: true });
  cpy("src/img/*", "dist/img");

  await Promise.all(BUNDLES.map(bundle)).catch(() => process.exit(1));

  // Copy servable assets to python extension (exclude esm/)
  fs.mkdirSync("../spaday/extension", { recursive: true });
  cpy("dist/**/*", "../spaday/extension", {
    filter: (file) => !file.relativePath.startsWith("esm"),
  });
}

build();
