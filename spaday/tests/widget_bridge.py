"""Real Widget comm endpoint for browser tests, with JSON lines as the test harness."""

import json
import sys
from unittest.mock import Mock

import transports
from pydantic import BaseModel, Field

from spaday import SendPatch, SetField, Wire, element
from spaday.widget import Widget


class Config(BaseModel):
    bpm: int = Field(120, ge=1)
    sample: bytes = b"pcm"


class Status(BaseModel):
    playing: bool = Field(False, json_schema_extra={"owner": "client"})


session = transports.Session()
config, status = Config(), Status()
config_id, status_id = session.host(config), session.host(status)
session.command(status_id, "playing", True)
tree = element(
    "section",
    element("input", type="number", id="bpm").bind("value", "config.bpm", mode="two-way"),
    element("button", id="reset").text("Reset tempo").on("click", SendPatch("config", "bpm", 120)),
    element("button", id="play").text("Play").on("click", SetField("status.playing", True)),
    element("output", id="playing").bind("textContent", "status.playing"),
    element("test-sample").bind("data", "config.sample"),
)
w = Widget(
    tree,
    session=session,
    wires=[
        Wire(model=config_id, namespace="config", codec=sys.argv[1], update_interval=0.05),
        Wire(model=status_id, namespace="status", codec=sys.argv[1], update_interval=0.05),
    ],
    autosync=False,
)
assert w.server is not None
sent = []
w.send = Mock(side_effect=lambda content, buffers=(): sent.append({"content": content, "buffers": [list(b) for b in buffers]}))
try:
    for line in sys.stdin:
        request = json.loads(line)
        op = request["op"]
        result = None
        if op == "describe":
            result = {"_tree": w._tree, "_wires": w._wires, "config_id": config_id, "status_id": status_id}
        elif op == "receive":
            w._msg_callbacks(w, request["content"], [memoryview(bytes(b)) for b in request.get("buffers", [])])
        elif op == "mutate":
            config.sample = bytes(request["sample"])
            transports.sync(w.server)
        elif op == "state":
            result = {"bpm": config.bpm, "playing": status.playing, "sample": list(config.sample)}
        elif op == "close":
            w.close()
        print(json.dumps({"messages": list(sent), "result": result}), flush=True)
        sent.clear()
finally:
    w.close()
