"""Shared CRDT data, private tenant state, and an elected producer across workers."""

import asyncio
import json
import os
import time
from contextlib import asynccontextmanager, suppress
from pathlib import Path

from pydantic import BaseModel
from transports import WRITE, Backplane, Election, Hub, RelayBroadcaster, ZmqBackplane, autosync, to_value, ws_endpoint

from spaday import Wire, element
from spaday.backends.starlette import PageSpec, build_site
from spaday.examples.collaborative_data import SPEC, Board


class PrivateNotes(BaseModel):
    note: str = ""


class Deployment:
    """Example-owned lifecycle and persistence; no component or collab dependency."""

    def __init__(self, backplane: Backplane, checkpoint: Path, *, worker: str, interval: float = 1.0):
        self.checkpoint = checkpoint
        self.hub = Hub(key=lambda connection: connection.query_params["user"])
        if checkpoint.exists():
            saved = json.loads(checkpoint.read_text())
            self.board = self.hub.share(saved["value"], saved["type_name"], rev=saved["rev"], merge_state=saved["merge_state"])
        else:
            self.board = self.hub.share(Board(), crdt_spec=SPEC)
        self.feed = self.hub.share(to_value({"slot": 0}), "Clock", replay=True, log_cap=16)
        self.private = {}
        for user in ("alice", "bob", "viewer"):
            self.private[user] = self.hub.tenant(user).host(PrivateNotes())
            self.hub.subscribe(user, self.board, WRITE if user != "viewer" else "read")
            self.hub.subscribe(user, self.feed)
        self.hub.on_shared_write(self._persist)
        self.relay = RelayBroadcaster(self.hub, backplane)
        self.election = Election(backplane, id=worker, interval=interval, timeout=interval * 3)
        self.interval = interval
        self.tasks = []

    def _persist(self, sid, *_):
        if sid != self.board:
            return
        self.save()

    def save(self):
        # Each worker owns a separate file: election leases are not a persistence fence.
        self.checkpoint.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.checkpoint.with_suffix(".tmp")
        temporary.write_text(json.dumps(self.hub.snapshot_shared(self.board)))
        temporary.replace(self.checkpoint)

    async def produce(self):
        while True:
            # A time bucket is idempotent if election briefly runs two producers.
            await self.relay.set_shared(self.feed, to_value({"slot": int(time.time())}))
            await asyncio.sleep(self.interval)

    async def start(self):
        await self.relay.start()
        self.save()  # include relay catch-up in this worker's checkpoint
        self.tasks = [asyncio.create_task(autosync(self.relay)), asyncio.create_task(self.election.run_singleton(self.produce))]

    async def stop(self):
        await self.election.stop()
        for task in self.tasks:
            task.cancel()
        for task in self.tasks:
            with suppress(asyncio.CancelledError):
                await task
        self.save()
        await self.relay.stop()


def page(user: str, worker: str):
    readonly = user == "viewer"
    return element(
        "main",
        element("h1", "Shared board"),
        element("p", f"Worker {worker} · {user.title()}"),
        element("nav", *(element("a", name.title(), href=f"/{name}") for name in ("alice", "bob", "viewer"))),
        element("label", "Shared title", element("input", id="title", readOnly=readonly).bind("value", "board.settings.title", mode="two-way")),
        element("label", "Shared owner", element("input", id="owner", readOnly=readonly).bind("value", "board.settings.owner", mode="two-way")),
        element("output", id="error").bind("textContent", "$errors.board.settings"),
        element("label", "Private note on this worker", element("input", id="note").bind("value", "private.note", mode="two-way")),
        element("p", "Producer time bucket: ", element("output", id="slot").bind("textContent", "feed.slot")),
        element("p", "Shared fields merge across workers. Private notes are isolated by user and local to this worker."),
    )


def create_app(*, deployment: Deployment | None = None, codec: str | None = None):
    from starlette.applications import Starlette
    from starlette.routing import WebSocketRoute

    codec = codec or os.environ.get("SPADAY_CODEC", "json")
    worker = os.environ.get("SPADAY_WORKER", "a")
    if deployment is None:
        deployment = Deployment(
            ZmqBackplane(os.environ.get("SPADAY_BUS_FRONT", "tcp://127.0.0.1:5599"), os.environ.get("SPADAY_BUS_BACK", "tcp://127.0.0.1:5600")),
            Path(os.environ.get("SPADAY_STATE_DIR", ".shared-board")) / f"{worker}.json",
            worker=worker,
        )
    worker = deployment.election.id
    endpoint = ws_endpoint(deployment.relay)

    async def websocket(connection):
        # Demo identities only. Replace with authenticated session claims in a deployed app.
        if connection.query_params.get("user") not in deployment.private:
            await connection.close(code=1008)
            return
        await endpoint(connection)

    @asynccontextmanager
    async def lifespan(_app):
        await deployment.start()
        try:
            yield
        finally:
            await deployment.stop()

    pages = {
        f"/{user}": PageSpec(
            lambda user=user: page(user, worker),
            wire=[
                Wire(f"/ws?user={user}", model=model, namespace=namespace, codec=codec, reconnect=True)
                for model, namespace in ((deployment.board, "board"), (deployment.private[user], "private"), (deployment.feed, "feed"))
            ],
            title="Shared board",
            styles=[
                "body { font: 16px system-ui; margin: 2rem; } main { max-width: 40rem; } label { display: grid; gap: .5rem; margin: 1rem 0; } input { font: inherit; padding: .5rem; } nav { display: flex; gap: 1rem; }"
            ],
        )
        for user in deployment.private
    }
    return Starlette(routes=build_site(pages, routes=[WebSocketRoute("/ws", websocket)]).all(), lifespan=lifespan)
