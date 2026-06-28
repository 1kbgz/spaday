"""The gateway example's REST 'orders' channel validates a posted struct, appends it to the live
Perspective table, and rejects an invalid one — the csp-gateway form→REST→blotter loop. Skips unless the
[perspective] extra (perspective-python + starlette) is installed."""

import json

import pytest

gateway = pytest.importorskip("spaday.examples.gateway", reason="needs the [perspective] extra (perspective-python + starlette)")


def test_page_has_the_form_and_the_blotter():
    s = json.dumps(gateway.page())
    assert "wa-select" in s  # the Side enum → a select (the form is generated from the schema)
    assert "perspective-panel" in s  # the live blotter
    # Send is declarative now: a CallEndpoint composing the form's two-way-bound store fields (obj + field)
    assert "/api/send/orders" in s and '"expr": "field"' in s
    assert "clear-blotter" in s  # Clear still uses a NamedJs handler (the Perspective repaint)


def test_send_validates_appends_and_clears():
    from starlette.testclient import TestClient

    client = TestClient(gateway.app)
    gateway.orders.clear()
    assert client.post("/api/send/orders", json={"symbol": "X", "side": "buy", "qty": 10, "price": 1.5}).status_code == 200
    assert gateway.orders.size() == 1  # the order was appended to the channel table
    bad = client.post("/api/send/orders", json={"symbol": "X", "side": "buy", "qty": 0, "price": 1})
    assert bad.status_code == 422  # qty < ge=1 — rejected server-side (the authority)
    assert gateway.orders.size() == 1  # the invalid order was not appended
    client.post("/api/clear")
    assert gateway.orders.size() == 0
