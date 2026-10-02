# Collection benchmarks

These reports are built by `benched.sphinx` from the recorded runs in `benchmarks/results`.
Each run retains its revision, dirty-worktree flag, parameters, Python version, and machine metadata.
The initial records are local development measurements, not release performance guarantees.

## Browser collections

The browser-only suite measures eager mount and collection reconciliation at 1k, 10k, and 100k
records. Reset delivery reconciles the complete collection; delta delivery applies granular changes.
Parameters distinguish append, front insert, update, reorder, and ten-update burst workloads.

```{benched} ../../benchmarks/results
:view: trend
:metric: median
:benchmark-filter: *test_each*
:x-axis: time
```

## Python-to-browser collections

The wire suite sends real Python Store snapshots and patches over a loopback WebSocket to the
transports JavaScript client, `connectStore`, and `Each`. It covers JSON, MessagePack, and CBOR;
positional and application-keyed diff policies; and streamed or batched updates. Every round checks
final values, retained element identity, unsaved input, focus, and selection. Keyed cases require
the optional `Store.host(list_keys=...)` API and skip on older transports builds. The browser client
remains the version installed from Spaday's lockfile.

```{benched} ../../benchmarks/results
:view: trend
:metric: median
:benchmark-filter: *test_collection_wire*
:x-axis: time
```

## Measurement boundaries

The charts show pytest-benchmark timing distributions. For wire cases, that timing includes the
browser call and its correctness checks, but excludes initial snapshot delivery and eager mount.
The run records also retain each round's diagnostics in `extra_info`:

- `roundtrip_render_ms`: update request through two animation frames, excluding final checks.
- `bridge_ms`, `diff_ms`, `encode_ms`: server model conversion, Store mutation/diff, and wire encoding.
- `client_receive_apply_ms`: combined decoding, client reduction, and synchronous Store propagation.
  Deferred item-scope rendering is included in `roundtrip_render_ms`.
- `snapshot_bytes`, `patch_bytes`, `operations`, `frames`: encoded message bodies and update counts;
  WebSocket/TCP framing is excluded and compression is disabled.
- `scope_writes`, `dom_mutations`: label-property writes and observed child-list/character-data
  mutations. Attribute mutations are not counted by the text-update probes.
- `long_tasks`, `long_task_ms`, `max_frame_gap_ms`, `estimated_missed_frames`: browser responsiveness
  diagnostics. Missed frames are estimated from the median idle animation-frame interval, not GPU
  dropped-frame counters.
- `heap_used_bytes`: Chromium's JavaScript heap estimate, not total browser memory.

Benched's process peak-memory metric is distinct from the browser heap measurement. Timing and memory
depend on hardware, browser version, scheduling, and whether data is already cached. Partial runs
contain only the selected cases; missing cases are not zero-cost results. No regression budgets are
set yet. This single-connection harness does not measure Hub fan-out, reconnect, or slow consumers.

MutationObserver and PerformanceObserver instrumentation runs inside the measured interval. These
timings include its overhead and are not directly comparable with older uninstrumented measurements.

See [How to benchmark collection updates](../../benchmarks/README.md) for commands and local
transports-build selection.
