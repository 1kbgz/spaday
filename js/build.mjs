import { bundle } from "./tools/bundle.mjs";
import { bundle_css } from "./tools/css.mjs";
import { node_modules_external } from "./tools/externals.mjs";

import fs from "fs";
import cpy from "cpy";

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
    // Self-contained wrapper bundle (dagre-d3-es + d3 included); importing it defines the element.
    entryPoints: ["src/ts/wrappers/dagre-graph.ts"],
    outfile: "dist/cdn/wrappers/dagre-graph.js",
  },
  {
    // Self-contained WebAwesome controls for the dashboard example (esbuild resolves WA's chunks).
    entryPoints: ["src/ts/examples/webawesome.ts"],
    outfile: "dist/cdn/examples/webawesome.js",
  },
];

async function build() {
  // Bundle css
  await bundle_css();

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
