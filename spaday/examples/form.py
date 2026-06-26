"""A form generated from a pydantic model, two-way-bound over transports — no hand-authored controls.

``form(Settings)`` turns the model's fields into bound ``wa-*`` controls; ``connectStore`` syncs them
with the hosted model. Edit a field in the browser and the server-side model updates (and fans to other
tabs) — the same reactive seam as ``examples/reactive.py``, but the controls come from the schema.

The serving is one ``spaday.serve`` call: it hosts the generated tree at ``/tree.json`` (so the page is
a Component, not a hand-built dict), serves ``form.html`` (which wires the transports ``Client``), splices
in the ``/ws`` endpoint, and runs ``autosync`` for the app's lifetime.

Run: ``python -m spaday.examples.form`` then open http://127.0.0.1:8002/.
"""

import enum
from pathlib import Path

import transports
import uvicorn
from pydantic import BaseModel
from starlette.routing import WebSocketRoute

from spaday import serve
from spaday.components import form

HERE = Path(__file__).parent


class Size(str, enum.Enum):
    small = "small"
    medium = "medium"
    large = "large"


class Settings(BaseModel):
    name: str = "lamp"
    enabled: bool = True
    brightness: int = 50
    size: Size = Size.medium  # an Enum field → a <wa-select> of its members


session = transports.Session()
settings = Settings()
session.host(settings)
server = transports.Server(session)


app = serve(
    lambda: form(Settings),  # the form, generated from the model — no controls authored by hand
    html=HERE / "form.html",
    routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],
    background=[transports.autosync(server)],
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
