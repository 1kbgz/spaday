from __future__ import annotations

from typing import Any

import pytest
from playwright.sync_api import Page

SIZES = (1_000, 10_000, 100_000)
ROUNDS = {1_000: 10, 10_000: 5, 100_000: 3}
WORKLOADS = ("append", "front-insert", "random-update", "reorder", "burst")
DELTA_WORKLOADS = ("append", "front-insert", "random-update", "burst")


def _record_browser_metrics(
    benchmark: Any,
    result: dict[str, int | float | None],
    *,
    size: int,
    workload: str,
    delivery: str = "reset",
) -> None:
    benchmark.extra_info.update(
        {
            "records": size,
            "workload": workload,
            "delivery": delivery,
            "browser_duration_ms": result["durationMs"],
            "dom_nodes": result["domNodes"],
            "heap_used_bytes": result["heapUsedBytes"],
        }
    )


@pytest.mark.parametrize("size", SIZES, ids=lambda size: f"{size // 1_000}k")
def test_each_initial_mount(benchmark: Any, runtime_page: Page, size: int) -> None:
    benchmark.group = "each-initial-mount"

    def setup() -> None:
        runtime_page.evaluate("size => window.__eachBenchmark.prepare(size)", size)
        runtime_page.request_gc()

    result = benchmark.pedantic(
        lambda: runtime_page.evaluate("() => window.__eachBenchmark.mount()"),
        setup=setup,
        rounds=ROUNDS[size],
        iterations=1,
    )

    assert result["rows"] == size
    _record_browser_metrics(benchmark, result, size=size, workload="initial-mount")


@pytest.mark.parametrize("size", SIZES, ids=lambda size: f"{size // 1_000}k")
@pytest.mark.parametrize("workload", WORKLOADS)
def test_each_reconcile(benchmark: Any, runtime_page: Page, size: int, workload: str) -> None:
    benchmark.group = f"each-{workload}"

    def setup() -> None:
        runtime_page.evaluate("size => window.__eachBenchmark.prepareUpdate(size)", size)
        runtime_page.request_gc()

    def run() -> dict[str, int | float | None]:
        return runtime_page.evaluate("workload => window.__eachBenchmark.update(workload)", workload)

    result = benchmark.pedantic(run, setup=setup, rounds=ROUNDS[size], iterations=1)

    expected_rows = size + 1 if workload in {"append", "front-insert"} else size
    assert result["rows"] == expected_rows
    _record_browser_metrics(benchmark, result, size=size, workload=workload)


@pytest.mark.parametrize("size", SIZES, ids=lambda size: f"{size // 1_000}k")
@pytest.mark.parametrize("workload", DELTA_WORKLOADS)
def test_each_delta(benchmark: Any, runtime_page: Page, size: int, workload: str) -> None:
    benchmark.group = f"each-delta-{workload}"

    def setup() -> None:
        runtime_page.evaluate("size => window.__eachBenchmark.prepareUpdate(size)", size)
        runtime_page.request_gc()

    def run() -> dict[str, int | float | None]:
        return runtime_page.evaluate("workload => window.__eachBenchmark.update(workload, true)", workload)

    result = benchmark.pedantic(run, setup=setup, rounds=ROUNDS[size], iterations=1)

    expected_rows = size + 1 if workload in {"append", "front-insert"} else size
    assert result["rows"] == expected_rows
    _record_browser_metrics(
        benchmark,
        result,
        size=size,
        workload=workload,
        delivery="delta",
    )
