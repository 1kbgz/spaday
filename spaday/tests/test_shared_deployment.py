"""Deployment recipe: tenant isolation, CRDT relay, permissions, and recovery."""

import asyncio
from types import SimpleNamespace

import pytest
from transports import Backplane, Client, from_value, to_value

from spaday.examples.shared_deployment import Deployment


def plain(value):
    return from_value(value, dict)


class MemoryBackplane(Backplane):
    def __init__(self, peers):
        super().__init__()
        self.peers = peers

    async def _start(self):
        self.peers.append(self)

    async def publish(self, data):
        for peer in self.peers:
            if peer is not self:
                peer._deliver(self._frame(data))

    async def stop(self):
        await super().stop()
        self.peers.remove(self)


class Connection:
    def __init__(self, user):
        self.query_params = {"user": user}


def connect(worker, user, codec):
    connection = Connection(user)
    client = Client(codec=codec)
    for frame in worker.relay.open(connection, codec=codec):
        client.recv(frame)
    return SimpleNamespace(connection=connection, client=client, worker=worker)


def deliver(output, peers):
    for peer in peers:
        for frame in output.get(peer.connection, []):
            peer.client.recv(frame)


@pytest.mark.parametrize("codec", ["json", "msgpack", "cbor"])
def test_shared_deployment_merges_recovers_and_isolates_tenants(tmp_path, codec):
    async def run():
        bus = []
        workers = [Deployment(MemoryBackplane(bus), tmp_path / f"{name}.json", worker=name) for name in ("a", "b")]
        first, second = workers
        try:
            for worker in workers:
                await worker.relay.start(catch_up_timeout=0.05)
            alice, bob, viewer = peers = [connect(first, "alice", codec), connect(second, "bob", codec), connect(second, "viewer", codec)]
            # Both edits are authored before either receives the other's update.
            for peer, field, value in ((alice, "title", "Alice title"), (bob, "owner", "Bob owner")):
                sid = peer.worker.board
                current = plain(peer.client.value(sid))
                current["settings"][field] = value
                frame = peer.client.edit_crdt(sid, peer.client.crdt_diff(sid, current))
                deliver(peer.worker.relay.recv(peer.connection, frame), peers)
            for _ in range(100):
                await asyncio.sleep(0.01)
                for worker in workers:
                    deliver(worker.relay.flush(), peers)
                if plain(alice.client.value(first.board))["settings"] == {"title": "Alice title", "owner": "Bob owner"}:
                    break
            expected = plain(alice.client.value(first.board))
            assert expected["settings"] == {"title": "Alice title", "owner": "Bob owner"}
            assert plain(bob.client.value(second.board)) == expected

            denied = plain(viewer.client.value(second.board))
            denied["settings"]["title"] = "forbidden"
            frame = viewer.client.edit_crdt(second.board, viewer.client.crdt_diff(second.board, denied))
            deliver(second.relay.recv(viewer.connection, frame), peers)
            assert plain(viewer.client.value(second.board)) == expected
            assert viewer.client.pending_crdt_ops(second.board) == 0

            # Private model IDs coincide across users, but authorization is tenant-scoped.
            frame = alice.client.edit(first.private["alice"], to_value({"note": "private"}))
            output = first.relay.recv(alice.connection, frame)
            deliver(output, peers)
            assert set(output) == {alice.connection}
            assert plain(alice.client.value(first.private["alice"])) == {"note": "private"}
            assert plain(bob.client.value(second.private["bob"])) == {"note": ""}
            assert plain(viewer.client.value(second.private["viewer"])) == {"note": ""}

            # A read-only feed cannot be replaced by a browser, even by a board editor.
            frame = alice.client.edit(first.feed, to_value({"slot": -1}))
            deliver(first.relay.recv(alice.connection, frame), peers)
            assert plain(alice.client.value(first.feed)) == {"slot": 0}

            first.relay.close(alice.connection)
            alice = connect(first, "alice", codec)
            assert plain(alice.client.value(first.board)) == expected
            assert plain(alice.client.value(first.private["alice"])) == {"note": "private"}

            # Late worker catches up without a checkpoint, then restores reducer metadata from disk.
            late = Deployment(MemoryBackplane(bus), tmp_path / "late.json", worker="late")
            workers.append(late)
            await late.relay.start(catch_up_timeout=0.5)
            assert plain(late.hub.snapshot_shared(late.board)["value"]) == expected
            late.save()
            restored = Deployment(MemoryBackplane([]), tmp_path / "late.json", worker="restored")
            assert restored.hub.snapshot_shared(restored.board) == late.hub.snapshot_shared(late.board)
            # Full outage restore retains CRDT identity, not only materialized values.
            restored_client = connect(restored, "alice", codec)
            assert restored_client.client.crdt_spec(restored.board) is not None
            assert plain(restored_client.client.value(restored.board)) == expected
        finally:
            for worker in reversed(workers):
                await worker.relay.stop()

    asyncio.run(run())
