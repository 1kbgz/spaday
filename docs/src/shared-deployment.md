# How to serve shared state across workers

Run `spaday.examples.shared_deployment` to serve shared CRDT fields, private tenant notes, and a
read-only feed from an elected producer. The example uses native Spaday controls and has no
`spaday-collab` dependency.

Install the cluster dependencies from this checkout:

```bash
pip install -e '.[cluster]'
```

## Start the broker and workers

Start a dedicated broker in one terminal so restarting a worker does not remove the backplane:

```bash
python -m transports.backplane tcp://127.0.0.1:5599 tcp://127.0.0.1:5600
```

Start two workers in separate terminals, using the same state directory and distinct worker names:

```bash
SPADAY_WORKER=a uvicorn spaday.examples.shared_deployment:create_app --factory --port 8004
```

```bash
SPADAY_WORKER=b uvicorn spaday.examples.shared_deployment:create_app --factory --port 8005
```

Open <http://127.0.0.1:8004/alice> and <http://127.0.0.1:8005/bob>. Edit the shared title in one
browser and owner in the other. Both browsers receive both edits. Private notes appear only for the
same user on the same worker. Open `/viewer` to inspect the board without write access; the Hub
rejects writes even if someone removes the input's `readOnly` property.

Set `SPADAY_CODEC` to `json`, `msgpack`, or `cbor` before starting a worker. Set `SPADAY_BUS_FRONT`,
`SPADAY_BUS_BACK`, and `SPADAY_STATE_DIR` to use different broker addresses or checkpoint storage.
Keep worker names unique; each owns its checkpoint file.

## Exercise recovery

Stop worker B, change a shared field on worker A, then restart B with the same command. Its relay
requests current state before accepting browsers. Reconnecting clients reconcile their pending edits
against that state. Try an offline browser edit while the other browser edits a different field;
both changes should appear after reconnect.

Stop worker A while leaving the broker and worker B running. The producer time bucket resumes on B
after the election timeout. Election is a best-effort lease with possible temporary overlap. Keep the
producer idempotent, as this example does by writing a time bucket. Use an external fenced coordinator
for work that requires exactly one execution.

Stop both workers and restart them with their checkpoint files intact. The example restores shared
values **and CRDT reducer metadata**. Private notes intentionally reset after a worker restart.
For private data that must persist or follow users between workers, supply an application-owned store
and routing policy; the relay only distributes shared models.

The example writes small JSON checkpoints through a temporary file and rename. Each worker writes its
own file, avoiding competing writers under an election lease. For production durability, replace this
with storage that provides the required crash consistency and acknowledgment guarantees. A successful
browser write is not a durable-storage acknowledgment, and best-effort pub/sub is not a durable log.

## Adapt authorization and presence

Replace the demo `/alice`, `/bob`, and `/viewer` roles and `?user=` parameter with authenticated HTTP
and WebSocket session claims. Keep authorization in the host. A namespace chooses where the browser
stores fields; it does not grant access. The board allows Alice and Bob to write, the feed is read-only,
and each private Session is selected by the authenticated tenant key.

Create shared models in the same order and with the same schemas in each worker, so model IDs agree.
Keep checkpoints with the matching schema; handle schema migration explicitly when changing it.
The page uses a separate managed `Wire` for each model and selects its model ID explicitly.

Do not enable cross-worker presence on this recipe yet. Awareness is local to each Hub; the relay
currently distributes shared patches and CRDT operations, not cursor or focus state. Single-worker
applications can use scoped awareness without `spaday-collab`, or add its optional display components.
