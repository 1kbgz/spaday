"""Fixed-height collection mount/scroll costs and realized-row budgets."""

import pytest


@pytest.mark.parametrize("size", [1000, 10000, 100000], ids=["1k", "10k", "100k"])
def test_virtual_collection(benchmark, runtime_page, size):
    runtime_page.evaluate(
        """size => {
      const { mount, Store, unmount } = window.__spaday;
      const rows = Array.from({length: size}, (_, id) => ({id, label: String(id)}));
      const tree = {
        tag: "spa-each",
        props: { itemKey: {Str: "id"}, rowHeight: {Int: 24}, viewportHeight: {Int: 240}, overscan: {Int: 4} },
        bindings: { items: {field: "rows", mode: "one-way"} },
        slots: {default: [{tag: "div", bindings: {textContent: {compute: {expr: "item", path: "label"}, mode: "one-way"}}}]}
      };
      window.virtualBenchmark = async () => {
        document.body.replaceChildren();
        const store = new Store({rows});
        const root = mount(document.body, tree, store);
        const frames = async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); };
        await frames();
        root.scrollTop = Math.floor(size / 2) * 24;
        await frames();
        const result = { rows: root.firstElementChild.childElementCount, first: root.firstElementChild.firstElementChild.textContent };
        const { unmount } = await import('/dist/esm/index.js');
        unmount(root);
        return result;
      };
    }""",
        size,
    )

    def run():
        result = runtime_page.evaluate("() => window.virtualBenchmark()")
        assert result["rows"] == 18
        assert result["first"] == str(size // 2 - 4)
        return result

    result = benchmark.pedantic(run, rounds=3, iterations=1)
    benchmark.extra_info.update(records=size, realized_rows=result["rows"], row_height=24, viewport_height=240, overscan=4)
