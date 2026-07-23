import { getarg } from "./getarg.mjs";

import { bundleAsync } from "lightningcss";
import fs from "fs";
import path from "path";

const DEBUG = getarg("--debug");

const DEFAULT_RESOLVER = {
  resolve(specifier, originatingFile) {
    if (/^https?:\/\//.test(specifier)) {
      return specifier;
    }

    return path.resolve(path.dirname(originatingFile), specifier);
  },
};

const bundle_one = async (file, resolver) => {
  const { code } = await bundleAsync({
    filename: path.resolve(file),
    minify: !DEBUG,
    sourceMap: false,
    resolver: resolver || DEFAULT_RESOLVER,
  });
  const outName = path.basename(file);
  fs.mkdirSync("./dist/css", { recursive: true });
  fs.writeFileSync(path.join("./dist/css", outName), code);
};

export const bundle_css = async (root = "src/css/index.css", resolver = null) => {
  const resolved = path.resolve(root);
  if (fs.statSync(resolved).isDirectory()) {
    const files = fs.readdirSync(resolved).filter((f) => f.endsWith(".css"));
    for (const file of files) {
      await bundle_one(path.join(root, file), resolver);
    }
  } else {
    await bundle_one(root, resolver);
  }
}
