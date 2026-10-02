# How to benchmark collection updates

Use Python 3.11 or newer for benched history and Sphinx reports. Install the project's development
dependencies and Chromium, then build the browser runtime:

```sh
pnpm --dir js install --frozen-lockfile
pnpm --dir js build
python -m playwright install chromium
```

Run a small wire benchmark first:

```sh
python -m benched run benchmarks/test_collection_wire.py -k '1k and json'
```

For browser-only comparisons, run `benchmarks/test_each.py`. Use `-k '100k'` for the largest
collections, or omit `-k` for the complete matrix. The wire matrix covers 1k, 10k, and 100k records,
JSON/MessagePack/CBOR, positional/keyed diffs, and insert, remove, update, move, move-with-update,
reorder, streamed-burst, and batched-burst workloads. Large eager mounts make the full matrix slow.
Use plain `python -m pytest` with `--benchmark-disable` for a single correctness pass without recording
history. `make benchmark-history` builds the runtime and records the full suite; use
`BENCHMARK_ARGS="-k '1k and json'"` to restrict it.

Benched saves immutable records in `benchmarks/results`. Keep the records you want published alongside
the benchmark changes. Build the Sphinx reports from those records:

```sh
yardang build
```

Open `docs/html/docs/src/benchmarks.html` through a local HTTP server to inspect the interactive reports.
The docs build reads stored results; it does not rerun benchmarks. For exploratory measurements that
should not enter the published history, pass `--results-dir .benchmarks/benched` to `benched run`.

Keyed cases skip when Python transports lacks `Store.host(list_keys=...)`. To test an unreleased
transports checkout, build its Python extension first and select it explicitly:

```sh
PYTHONPATH=/absolute/path/to/transports python -m benched run benchmarks/test_collection_wire.py \
  -k 'keyed and 1k' --subject-label transports=local-keyed-diffs
```

The browser uses the transports package installed by Spaday's lockfile. No local JS replacement is
needed: keyed Python diffs emit existing wire operations. Each round checks values against the
workload, agreement between the transports mirror and Spaday Store, retained element identity, and
unsaved input, focus, and selection. Batched bursts must write the changed item's label once.

Label local builds explicitly; their installed distribution version need not describe the checkout.
Benched also retains Spaday's revision and dirty-worktree flag. Do not present local-development runs
as released-package baselines.

If installed Spaday metadata differs from the browser checkout, pass `--subject-version` with the
version in `js/package.json`; `make benchmark-history` supplies it automatically. Use a clean Python
environment for published-dependency measurements, and check `extra_info.transports_python_distribution_version`
against the intended transports version before publishing a record.

Compare like-for-like runs on idle hardware. Inspect each wire benchmark's `extra_info.rounds` for all
rounds' counters and timings (top-level fields describe the final round). Pytest-benchmark's distribution covers the complete Python-to-browser
test call, including correctness checks. `roundtrip_render_ms` excludes setup, initial snapshot/mount,
and final correctness checks, and ends after two animation frames. Server bridge, diff, and encode
timings are separate. `client_receive_apply_ms` combines codec decoding, client reduction, and
synchronous store propagation; deferred item-scope rendering is included in the roundtrip time.

Payload sizes count encoded message bodies, excluding WebSocket/TCP framing. Compression is disabled.
The streamed burst sends ten revisions as they are generated; the batched burst sends those revisions
in one transports batch. Long tasks come from Chromium's observer; estimated missed frames use the
median idle animation-frame interval. They are diagnostics, not hardware-independent release budgets.
This single-connection harness does not measure Hub fan-out, reconnect, or slow-consumer policy.
