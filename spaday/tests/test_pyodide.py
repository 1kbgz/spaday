import sys

import pytest
from pydantic import BaseModel
from transports import Client, Server, Session, to_value

from spaday import SendPatch, WorkerApp, element, lit

pytestmark = pytest.mark.skipif(sys.platform != "emscripten", reason="requires Pyodide")


def test_worker_round_trip_uses_compiled_diff() -> None:
    class Counter(BaseModel):
        count: int = 0

    session = Session()
    authoritative = Counter()
    model_id = session.host(authoritative)
    server = Server(session, default_codec="msgpack")
    client = Client(codec="msgpack")
    for frame in server.open("browser", "msgpack"):
        client.recv(frame)

    def render():
        return element("button").text(str(client.model(model_id, Counter).count)).on("click", SendPatch("counter", "increment", lit(1)))

    def handle(intent: dict) -> None:
        proposal = client.model(model_id, Counter).model_copy()
        proposal.count += intent["detail"]["value"]
        outbound = client.edit(model_id, to_value(proposal))
        for frame in server.recv("browser", outbound)["browser"]:
            client.recv(frame)

    app = WorkerApp(render, handle)
    app.start()
    message = app.dispatch({"type": "spaday:patch", "detail": {"value": 1}})

    assert authoritative.count == 1
    assert message["patch"]["ops"] == [{"SetProp": {"path": [], "name": "textContent", "value": {"Str": "1"}}}]
