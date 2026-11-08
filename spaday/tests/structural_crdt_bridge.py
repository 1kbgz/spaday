"""Python Hub endpoint for browser structural-binding tests."""

import json
import sys

from transports._bridge import _py_of

from spaday.examples.collaborative_data import create_hub, page
from spaday.ui import NATIVE, resolve


class Connection:
    def __init__(self, user):
        self.query_params = {"user": user}


hub, model = create_hub()
connections = {name: Connection(name) for name in ("alice", "bob", "viewer")}
codec = sys.argv[1]


def wire(value):
    return list(value) if isinstance(value, bytes) else value


for line in sys.stdin:
    request = json.loads(line)
    op = request["op"]
    result = None
    messages = {}
    if op == "describe":
        result = {"tree": resolve(page().to_node(), NATIVE), "model": model}
    elif op == "open":
        name = request["view"]
        messages[name] = [wire(frame) for frame in hub.open(connections[name], codec=codec)]
    elif op == "receive":
        payload = request["wire"]
        output = hub.recv(connections[request["view"]], bytes(payload) if isinstance(payload, list) else payload)
        messages = {name: [wire(frame) for frame in output.get(conn, [])] for name, conn in connections.items()}
    elif op == "state":
        result = _py_of(hub._shared[model].value)
    elif op == "disconnect":
        hub.close(connections[request["view"]])
    elif op == "close":
        for connection in connections.values():
            hub.close(connection)
    print(json.dumps({"result": result, "messages": messages}), flush=True)
