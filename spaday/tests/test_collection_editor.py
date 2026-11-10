import asyncio

import httpx

from spaday.examples.collection_editor import create_app


def test_delete_checks_role_and_parent_identity_before_mutating():
    async def run():
        transport = httpx.ASGITransport(app=create_app())
        async with httpx.AsyncClient(transport=transport, base_url="http://example") as client:
            target = {"group": "work", "record": "a"}
            assert (await client.post("/api/viewer/delete", json=target)).status_code == 403
            for body in ([], {}, {"group": "work", "record": 1}, {"group": True, "record": "a"}):
                assert (await client.post("/api/alice/delete", json=body)).status_code == 422
            assert (await client.post("/api/alice/delete", json={**target, "group": "missing"})).status_code == 404
            assert (await client.post("/api/alice/delete", json=target)).status_code == 200
            assert (await client.post("/api/bob/delete", json=target)).status_code == 404
            # The same child ID in another parent still exists, as does its sibling.
            assert (await client.post("/api/bob/delete", json={**target, "group": "home"})).status_code == 200
            assert (await client.post("/api/alice/delete", json={**target, "record": "b"})).status_code == 200

    asyncio.run(run())
