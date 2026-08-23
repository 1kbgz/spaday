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
];

async function build() {
<<<<<<< before updating
  fs.rmSync("dist/cdn", { recursive: true, force: true });
  fs.rmSync("dist/css", { recursive: true, force: true });
=======
  if (fs.existsSync("dist")) {
    for (const entry of fs.readdirSync("dist")) {
      if (entry !== "pkg") {
        fs.rmSync(`dist/${entry}`, { recursive: true, force: true });
      }
    }
  }
  fs.rmSync("../spaday/extension", {
    recursive: true,
    force: true,
  });
>>>>>>> after updating

  // Bundle css
  await bundle_css();
  // Copy HTML
  await cpy("src/html/*", "dist/");

  // Copy images
  if (fs.existsSync("src/img")) {
    fs.mkdirSync("dist/img", { recursive: true });
    await cpy("src/img/*", "dist/img");
  }

  await Promise.all(BUNDLES.map(bundle)).catch(() => process.exit(1));

  // Copy servable assets to python extension (exclude esm/)
  fs.mkdirSync("../spaday/extension", { recursive: true });
  await cpy("dist/**/*", "../spaday/extension", {
    filter: (file) =>
      !file.relativePath.startsWith("esm/") &&
      !file.relativePath.startsWith("dist/esm/") &&
      !file.relativePath.startsWith("pyodide/") &&
      !file.relativePath.startsWith("dist/pyodide/"),
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

await build();
