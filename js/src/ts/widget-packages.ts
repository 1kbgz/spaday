import { parse } from "es-module-lexer/minimal/js";
import * as css from "css-tree";
import type { AnyModel } from "./widget-transport";

interface PackageSpec {
  id: string;
  name: string;
  assets: [string, string][];
  imports: [string, string][];
  provides: [string, string][];
  tags: string[];
}
interface AssetFile {
  path: string;
  offset: number;
  length: number;
  type: string;
}
type Sources = Map<string, { data: Uint8Array; type: string }>;

interface Registry {
  queue: Promise<void>;
  packages: Map<string, { id: string; loaded: Promise<void> }>;
  libraries: Map<string, string>;
  imports: Map<string, string>;
  urls: Map<string, string>;
  sources: Sources;
  importVersions: Map<string, string | undefined>;
  resolve(specifier: unknown, parent: string): string;
}
const key = Symbol.for("spaday.notebook.packages");
const globals = globalThis as typeof globalThis & { [key: symbol]: Registry };
const registry = (globals[key] ??= {
  queue: Promise.resolve(),
  packages: new Map(),
  libraries: new Map(),
  imports: new Map(),
  urls: new Map(),
  sources: new Map(),
  importVersions: new Map(),
  resolve(value, parent) {
    const specifier = String(value);
    if ([...this.urls.values()].includes(specifier)) return specifier;
    const target = resolvePath(specifier, parent, this.imports);
    const urls = prepareAssets([target], this.sources, this.imports);
    registerUrls(urls);
    return urls.get(target)!;
  },
});
const base = (spec: PackageSpec) =>
  `https://spaday.invalid/notebook/${spec.id}/`;
const helper = 'globalThis[Symbol.for("spaday.notebook.packages")]';

function resolvePath(
  specifier: string,
  parent: string,
  imports: Map<string, string>,
): string {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(specifier)
  )
    return new URL(specifier, parent).href;
  for (const [name, target] of [...imports].sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    if (specifier === name) return target;
    if (name.endsWith("/") && specifier.startsWith(name))
      return target + specifier.slice(name.length);
  }
  throw new Error(`Notebook package has no import mapping for ${specifier}`);
}

function requestAssets(
  model: AnyModel,
  spec: PackageSpec,
): Promise<{ files: AssetFile[]; data: Uint8Array }> {
  return new Promise((resolve, reject) => {
    const request = crypto.randomUUID();
    const clean = () => {
      clearTimeout(timer);
      model.off("msg:custom", receive);
      model.off("destroy", closed);
    };
    const closed = () => {
      clean();
      reject(new Error(`Widget closed while loading ${spec.name}`));
    };
    const receive = (content: any, buffers: ArrayBufferView[] = []) => {
      if (content?.type !== "spaday:assets" || content.request !== request)
        return;
      clean();
      if (content.error) {
        reject(new Error(content.error));
        return;
      }
      const buffer = buffers[0];
      if (!buffer || !Array.isArray(content.files)) {
        reject(new Error(`Invalid notebook assets for ${spec.name}`));
        return;
      }
      resolve({
        files: content.files,
        data: new Uint8Array(
          buffer.buffer,
          buffer.byteOffset,
          buffer.byteLength,
        ),
      });
    };
    const timer = setTimeout(() => {
      clean();
      reject(new Error(`Timed out loading notebook package ${spec.name}`));
    }, 60_000);
    model.on("msg:custom", receive);
    model.on("destroy", closed);
    try {
      model.send({ type: "spaday:assets", request, package: spec.id });
    } catch (error) {
      clean();
      reject(error);
    }
  });
}

/** Prepare reachable graphs atomically; dynamic imports use the same path when requested. */
function prepareAssets(
  entries: string[],
  sources: Sources,
  imports: Map<string, string>,
): Map<string, string> {
  const urls = new Map(registry.urls);
  const visiting = new Set<string>();
  const decoder = new TextDecoder();
  const blob = (data: string | Uint8Array, type: string) =>
    URL.createObjectURL(
      new Blob(
        [typeof data === "string" ? data : new Uint8Array(data).buffer],
        { type },
      ),
    );
  const asset = (url: string): string => {
    const existing = urls.get(url);
    if (existing) return existing;
    const path = new URL(url);
    const fragment = path.hash;
    path.search = "";
    path.hash = "";
    const file = sources.get(path.href);
    if (!file) throw new Error(`Notebook package is missing ${url}`);
    if (visiting.has(url)) {
      if (file.type === "text/javascript") return url;
      throw new Error(`Circular CSS import in notebook package: ${url}`);
    }
    visiting.add(url);
    let result: string;
    if (file.type === "text/css") {
      const tree = css.parse(decoder.decode(file.data), {
        parseCustomProperty: true,
      });
      const resolveCss = (value: string) =>
        value.startsWith("data:") || value.startsWith("#")
          ? value
          : asset(new URL(value, url).href);
      css.walk(tree, (node) => {
        if (node.type === "Url") node.value = resolveCss(node.value);
        if (
          node.type === "Atrule" &&
          node.name === "import" &&
          node.prelude?.type === "AtrulePrelude"
        ) {
          const first = node.prelude.children.first;
          if (first?.type === "String") first.value = resolveCss(first.value);
        }
      });
      result = blob(css.generate(tree), file.type);
    } else if (file.type === "text/javascript") {
      let source = decoder.decode(file.data);
      const edits: [number, number, string][] = [];
      for (const entry of parse(source)[0]) {
        if (entry.d === -2) {
          edits.push([
            entry.s,
            entry.e,
            `({url:${JSON.stringify(url)},resolve:s=>${helper}.resolve(s,${JSON.stringify(url)})})`,
          ]);
        } else if (entry.d >= 0) {
          edits.push([
            entry.ss,
            entry.d,
            `(async(s,o)=>import(${helper}.resolve(s,${JSON.stringify(url)}),o))`,
          ]);
        } else {
          const target = resolvePath(entry.n!, url, imports);
          asset(target);
          edits.push([entry.s - 1, entry.e + 1, JSON.stringify(target)]);
        }
      }
      for (const [start, end, replacement] of edits.sort((a, b) => b[0] - a[0]))
        source = source.slice(0, start) + replacement + source.slice(end);
      result = blob(source, file.type);
    } else result = blob(file.data, file.type);
    if (fragment) result += fragment;
    visiting.delete(url);
    urls.set(url, result);
    return result;
  };
  try {
    for (const url of entries) asset(url);
    return urls;
  } catch (error) {
    for (const [url, objectUrl] of urls)
      if (!registry.urls.has(url)) URL.revokeObjectURL(objectUrl.split("#")[0]);
    throw error;
  }
}

function registerUrls(urls: Map<string, string>): void {
  const added = [...urls].filter(([url]) => !registry.urls.has(url));
  if (added.length) {
    const map = document.createElement("script");
    map.type = "importmap";
    map.textContent = JSON.stringify({ imports: Object.fromEntries(added) });
    document.head.appendChild(map);
  }
  registry.urls = urls;
}

async function load(model: AnyModel, specs: PackageSpec[]): Promise<void> {
  const fresh = specs.filter((spec) => {
    const existing = registry.packages.get(spec.name);
    if (existing && existing.id !== spec.id)
      throw new Error(
        `Notebook package ${spec.name} changed after loading; reload the document to use its new assets`,
      );
    return !existing;
  });
  const libraries = new Map(registry.libraries);
  const imports = new Map(registry.imports);
  const importVersions = new Map(registry.importVersions);
  for (const spec of fresh) {
    for (const [library, version] of spec.provides) {
      if (libraries.has(library) && libraries.get(library) !== version)
        throw new Error(
          `Notebook packages provide conflicting versions of ${library}: ${libraries.get(library)} and ${version}`,
        );
      libraries.set(library, version);
    }
    for (const [name, path] of spec.imports) {
      const target = new URL(path, base(spec)).href;
      const library = name.startsWith("@")
        ? name.split("/").slice(0, 2).join("/")
        : name.split("/")[0];
      const version = spec.provides.find(
        ([provided]) => provided === library,
      )?.[1];
      if (imports.has(name) && imports.get(name) !== target) {
        if (version === undefined || importVersions.get(name) !== version)
          throw new Error(
            `Notebook packages provide conflicting imports for ${name}`,
          );
      } else {
        imports.set(name, target);
        importVersions.set(name, version);
      }
    }
    const collision = spec.tags.find((tag) => customElements.get(tag));
    if (collision)
      throw new Error(
        `Notebook package ${spec.name} conflicts with an existing ${collision} element; reload without the other copy`,
      );
  }
  const sources = new Map(registry.sources);
  for (const spec of fresh) {
    const { files, data } = await requestAssets(model, spec);
    for (const file of files)
      sources.set(new URL(file.path, base(spec)).href, {
        data: data.slice(file.offset, file.offset + file.length),
        type: file.type,
      });
  }
  const urls = prepareAssets(
    fresh.flatMap((spec) =>
      spec.assets.map(([, path]) => new URL(path, base(spec)).href),
    ),
    sources,
    imports,
  );
  registry.sources = sources;
  registry.imports = imports;
  registry.importVersions = importVersions;
  registry.libraries = libraries;
  registerUrls(urls);
  for (const spec of fresh) {
    const loaded = (async () => {
      for (const [kind, path] of spec.assets) {
        const url = urls.get(new URL(path, base(spec)).href)!;
        if (kind === "js") await import(/* @vite-ignore */ url);
        else {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.dataset.spadayPackage = spec.id;
          link.href = url;
          await new Promise<void>((resolve, reject) => {
            link.onload = () => resolve();
            link.onerror = () => {
              link.remove();
              reject(new Error(`Could not load notebook stylesheet ${path}`));
            };
            document.head.appendChild(link);
          });
        }
      }
    })();
    registry.packages.set(spec.name, { id: spec.id, loaded });
    await loaded;
  }
  await Promise.all(
    specs.map((spec) => registry.packages.get(spec.name)!.loaded),
  );
}

/** Load selected packages once per document before any component properties are assigned. */
export function loadWidgetPackages(model: AnyModel): Promise<void> {
  const specs = (model.get("_packages") ?? []) as PackageSpec[];
  if (!specs.length) return Promise.resolve();
  const loaded = registry.queue.then(() => load(model, specs));
  registry.queue = loaded.catch(() => {});
  return loaded;
}
