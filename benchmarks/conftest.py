from __future__ import annotations

import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Iterator

import pytest
from playwright.sync_api import Page, sync_playwright

JS_ROOT = Path(__file__).parents[1] / "js"


class _QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


@pytest.fixture(scope="session")
def runtime_url() -> Iterator[str]:
    required = (JS_ROOT / "dist/esm/index.js", JS_ROOT / "dist/pkg/spaday_bg.wasm")
    missing = [str(path.relative_to(JS_ROOT.parent)) for path in required if not path.exists()]
    if missing:
        pytest.fail(f"missing browser build artifacts: {', '.join(missing)}; run `make build-js`")

    handler = partial(_QuietHandler, directory=str(JS_ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/tests/runtime.html"
    finally:
        server.shutdown()
        thread.join()
        server.server_close()


@pytest.fixture(scope="session")
def runtime_page(runtime_url: str) -> Iterator[Page]:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--enable-precise-memory-info"])
        page = browser.new_page()
        page.goto(runtime_url)
        page.wait_for_function("window.__spaday !== undefined")
        page.evaluate(_INSTALL_BENCHMARK)
        try:
            yield page
        finally:
            browser.close()


_INSTALL_BENCHMARK = """
() => {
  const { mount, Store } = window.__spaday;
  const template = {
    tag: "div",
    bindings: {
      textContent: {
        compute: { expr: "item", path: "label" },
        mode: "one-way",
      },
    },
  };
  const tree = {
    tag: "spa-each",
    props: { itemKey: { Str: "id" } },
    bindings: { items: { field: "rows", mode: "one-way" } },
    slots: { default: [template] },
  };
  const state = { rows: [], store: undefined, root: undefined };
  const makeRows = (size) =>
    Array.from({ length: size }, (_, id) => ({
      id,
      label: `row-${id}`,
      value: id,
    }));
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  const metrics = (started) => ({
    durationMs: performance.now() - started,
    rows: state.root.childElementCount,
    domNodes: document.getElementsByTagName("*").length,
    heapUsedBytes: performance.memory?.usedJSHeapSize ?? null,
  });
  const mountPrepared = () => {
    document.body.replaceChildren();
    state.store = new Store({ rows: state.rows });
    state.root = mount(document.body, tree, state.store);
  };

  window.__eachBenchmark = {
    prepare(size) {
      document.body.replaceChildren();
      state.rows = makeRows(size);
      state.store = undefined;
      state.root = undefined;
    },
    prepareUpdate(size) {
      this.prepare(size);
      mountPrepared();
    },
    mount() {
      const started = performance.now();
      mountPrepared();
      return metrics(started);
    },
    async update(workload, granular = false) {
      const started = performance.now();
      const size = state.rows.length;
      const middle = Math.floor(size / 2);
      const publish = (rows, deltas) => {
        state.rows = rows;
        if (granular) state.store.setCollection("rows", rows, deltas);
        else state.store.set("rows", rows);
      };
      if (workload === "append") {
        const item = { id: size, label: `row-${size}`, value: size };
        publish([...state.rows, item], [
          { kind: "insert", key: size, index: size, item },
        ]);
      } else if (workload === "front-insert") {
        const item = { id: -1, label: "row--1", value: -1 };
        publish([item, ...state.rows], [
          { kind: "insert", key: -1, index: 0, item },
        ]);
      } else if (workload === "random-update") {
        const item = {
          ...state.rows[middle],
          label: `updated-${middle}`,
        };
        publish(state.rows.with(middle, item), [
          { kind: "update", key: middle, path: ["label"], value: item.label },
        ]);
      } else if (workload === "reorder") {
        if (granular) throw new Error("reorder has no granular transport operation");
        publish(state.rows.toReversed(), []);
      } else if (workload === "burst") {
        for (let revision = 0; revision < 10; revision += 1) {
          const item = {
            ...state.rows[middle],
            label: `burst-${revision}`,
          };
          publish(state.rows.with(middle, item), [
            { kind: "update", key: middle, path: ["label"], value: item.label },
          ]);
        }
      } else {
        throw new Error(`unknown workload: ${workload}`);
      }
      await nextFrame();
      return metrics(started);
    },
  };
}
"""
