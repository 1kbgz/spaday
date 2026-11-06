"""Browser-owned playback state and binary samples over transports.

Run ``python -m spaday.examples.playback`` and open http://127.0.0.1:8001 in two tabs.
One tab advances the playhead; Python mirrors it. Server buttons queue commands for that tab.
Closing it hands ownership to the other tab. The sample travels as bytes in both directions.
This example displays a waveform; it does not produce sound.
"""

import hashlib
import math
import struct
from pathlib import Path

import transports
import uvicorn
from pydantic import BaseModel, Field
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Route, WebSocketRoute

from spaday import CallEndpoint, Wire, cond, element, field, not_
from spaday.backends.starlette import serve
from spaday.components.shell import Column, Main, Row


class Playback(BaseModel):
    playing: bool = Field(False, json_schema_extra={"owner": "client"})
    position: float = Field(0, json_schema_extra={"owner": "client"})
    bpm: int = Field(120, ge=30, le=240)
    sample: bytes = struct.pack("<256f", *(math.sin(i / 12) * (1 - i / 256) for i in range(256)))


def page():
    return Main(
        element("h1", "Playback state and binary samples"),
        element("p", "Open two tabs. One advances the playhead; commands and samples pass through Python. No audio is produced."),
        element("p", role="status").compute("textContent", cond(field("connected"), cond(field("owner"), "Owner", "Observer"), "Disconnected")),
        Column(
            Row(
                element("label", "Playing", for_="playing"),
                element("input", id="playing", type="checkbox").bind("checked", "playing", mode="two-way").compute("disabled", not_(field("owner"))),
                element("label", "Tempo", for_="bpm"),
                element("input", id="bpm", type="number", min=30, max=240).bind("value", "bpm", mode="two-way", codec="number"),
            ),
            element("p", id="tempo-error").bind("textContent", "$errors.bpm"),
            element("sample-waveform").bind("data", "sample", mode="two-way", event="sample-change").bind("position", "position"),
            Row(
                element("button", "Play via Python", type="button").on("click", CallEndpoint("POST", "/command/play")),
                element("button", "Stop via Python", type="button").on("click", CallEndpoint("POST", "/command/stop")),
                element("button", "Reset via Python", type="button").on("click", CallEndpoint("POST", "/command/reset")),
                element("button", "New sample via Python", type="button").on("click", CallEndpoint("POST", "/sample")),
            ),
            element("p", "Invert sample changes its binary data in this browser, sends it to Python, and updates every tab."),
        ),
    )


def create_app():
    model = Playback()
    session = transports.Session()
    mid = session.host(model)
    server = transports.Server(session)
    # A pre-connect command must wait for the first eligible owner.
    session.command(mid, "position", 0.0)

    async def command(request):
        name = request.path_params["name"]
        commands = {"play": ("playing", True), "stop": ("playing", False), "reset": ("position", 0.0)}
        if name not in commands:
            return JSONResponse({"error": "unknown command"}, status_code=404)
        command_id = session.command(mid, *commands[name])
        return JSONResponse({"command": command_id})

    async def sample(_request):
        values = struct.unpack("<256f", model.sample)
        model.sample = struct.pack("<256f", *values[16:], *values[:16])
        return JSONResponse({"bytes": len(model.sample)})

    async def state(_request):
        return JSONResponse(
            {
                "playing": model.playing,
                "position": model.position,
                "bpm": model.bpm,
                "bytes": len(model.sample),
                "digest": hashlib.sha256(model.sample).hexdigest(),
            }
        )

    async def script(_request):
        return FileResponse(Path(__file__).with_suffix(".js"), media_type="text/javascript")

    return serve(
        page,
        title="Playback state and binary samples",
        wire=Wire("/ws", codec="msgpack", reconnect=True, retry=250, connected="connected"),
        store={"owner": False},
        scripts=["/playback.js"],
        routes=[
            WebSocketRoute("/ws", transports.ws_endpoint(server)),
            Route("/command/{name}", command, methods=["POST"]),
            Route("/sample", sample, methods=["POST"]),
            Route("/state", state),
            Route("/playback.js", script),
        ],
        background=[transports.autosync(server)],
        head="<style>body{font:16px system-ui;margin:2rem;color:#183147;background:#f6f8fa}spa-main{max-width:880px;margin:auto}spa-column{gap:1rem}spa-row{gap:1rem;flex-wrap:wrap}button,input{font:inherit;padding:.5rem}#tempo-error{color:#a12424;min-height:1.5em}sample-waveform{display:block}</style>",
    )


if __name__ == "__main__":
    uvicorn.run(create_app(), host="127.0.0.1", port=8001)
