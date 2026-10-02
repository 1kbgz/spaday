"""Python Store → encoded WebSocket frames → transports Client → Spaday Each."""

import inspect
import json
import threading
from collections.abc import Iterator
from importlib.metadata import version
from time import perf_counter
from typing import Any

import pytest
from playwright.sync_api import Page
from transports import Store, to_value
from transports.protocol import batch_msg, encode, patch_msg, snapshot_msg
from websockets.sync.server import ServerConnection, serve


def _serve_collection(socket: ServerConnection) -> None:
    config = json.loads(socket.recv(timeout=300))
    size, workload, codec = config["size"], config["workload"], config["codec"]
    rows = [{"id": index, "label": f"row-{index}"} for index in range(size)]
    store = Store()
    options = {"list_keys": json.dumps([{"path": [{"Key": "rows"}], "key": [{"Key": "id"}]}])} if config["keyed"] else {}
    mid = store.host("Rows", json.dumps(to_value({"rows": rows})), **options)
    snapshot_json = store.snapshot(mid)
    assert snapshot_json is not None
    snapshot = json.loads(snapshot_json)
    wire = encode(snapshot_msg(mid, "Rows", snapshot["rev"], snapshot["value"]), codec)
    snapshot_bytes = len(wire.encode() if isinstance(wire, str) else wire)
    socket.send(wire)
    assert socket.recv(timeout=300) == "update"
    metrics = {"snapshot_bytes": snapshot_bytes, "patch_bytes": 0, "operations": 0, "frames": 0, "bridge_ms": 0.0, "diff_ms": 0.0, "encode_ms": 0.0}
    messages = []
    for revision in range(10 if workload in {"burst", "batch-burst"} else 1):
        if workload == "insert":
            rows = [{"id": size, "label": "inserted"}, *rows]
        elif workload == "remove":
            rows = rows[:-1]
        elif workload in {"move", "move-update"}:
            rows = [rows[-1], *rows[:-1]]
            if workload == "move-update":
                rows[0] = {**rows[0], "label": "moved"}
        elif workload == "reorder":
            rows = rows[::-1]
        else:
            rows[size // 2] = {**rows[size // 2], "label": f"updated-{revision}"}
        started = perf_counter()
        value = json.dumps(to_value({"rows": rows}))
        metrics["bridge_ms"] += (perf_counter() - started) * 1000
        started = perf_counter()
        patch = store.mutate(mid, value)
        assert patch is not None
        metrics["diff_ms"] += (perf_counter() - started) * 1000
        started = perf_counter()
        decoded = json.loads(patch)
        message = patch_msg(mid, decoded)
        metrics["operations"] += len(decoded["ops"])
        if workload == "batch-burst":
            messages.append(message)
            metrics["encode_ms"] += (perf_counter() - started) * 1000
            continue
        wire = encode(message, codec)
        metrics["encode_ms"] += (perf_counter() - started) * 1000
        metrics["patch_bytes"] += len(wire.encode() if isinstance(wire, str) else wire)
        metrics["frames"] += 1
        socket.send(wire)
    if messages:
        started = perf_counter()
        wire = encode(batch_msg(messages), codec)
        metrics["encode_ms"] += (perf_counter() - started) * 1000
        metrics["patch_bytes"] = len(wire.encode() if isinstance(wire, str) else wire)
        metrics["frames"] = 1
        socket.send(wire)
    socket.send(json.dumps({"benchmark": metrics}))
    socket.recv(timeout=300)  # Keep connection open until browser validation finishes.


@pytest.fixture(scope="session")
def collection_wire_url() -> Iterator[str]:
    with serve(_serve_collection, "127.0.0.1", 0, compression=None) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            yield f"ws://127.0.0.1:{server.socket.getsockname()[1]}"
        finally:
            server.shutdown()
            thread.join()


@pytest.mark.parametrize("size", [1_000, 10_000, 100_000], ids=["1k", "10k", "100k"])
@pytest.mark.parametrize("workload", ["insert", "remove", "update", "move", "move-update", "reorder", "burst", "batch-burst"])
@pytest.mark.parametrize("codec", ["json", "msgpack", "cbor"])
@pytest.mark.parametrize("keyed", [False, True], ids=["positional", "keyed"])
def test_collection_wire(benchmark: Any, runtime_page: Page, collection_wire_url: str, size: int, workload: str, codec: str, keyed: bool) -> None:
    if keyed and "list_keys" not in inspect.signature(Store.host).parameters:
        pytest.skip("keyed cases require a transports build with Store.host(list_keys=...)")
    runtime_page.evaluate("async () => { window.wireBenchmark = await import('/tests/collection-benchmark.js'); }")
    config = {"url": collection_wire_url, "size": size, "workload": workload, "codec": codec, "keyed": keyed}

    def setup() -> None:
        runtime_page.evaluate("config => window.wireBenchmark.prepare(config)", config)

    samples = []

    def run() -> dict:
        result = runtime_page.evaluate("() => window.wireBenchmark.update()")
        assert result["values_match"]
        assert result["retained_identity"]
        assert result["input_preserved"]
        assert result["focus_preserved"]
        assert result["selection_preserved"]
        assert result["received_frames"] == result["frames"]
        if workload == "batch-burst":
            assert result["scope_writes"] == 1
            assert result["dom_mutations"] == 1
        assert result["rows"] == size + (1 if workload == "insert" else -1 if workload == "remove" else 0)
        samples.append(result)
        return result

    benchmark.group = f"collection-wire-{workload}-{size}"
    result = benchmark.pedantic(run, setup=setup, rounds=3, iterations=1)
    browser = runtime_page.context.browser
    assert browser is not None
    benchmark.extra_info.update(
        {
            "records": size,
            "workload": workload,
            "codec": codec,
            "keyed": keyed,
            "browser_version": browser.version,
            "transports_python_distribution_version": version("transports"),
            **result,
            "rounds": samples,
        }
    )
