"""A form generated from a pydantic model, two-way-bound over transports — no hand-authored controls.

``form(Settings)`` turns the model's fields into bound ``wa-*`` controls; ``connectStore`` syncs them
with the hosted model. Edit a field in the browser and the server-side model updates (and fans to other
tabs) — the same reactive seam as ``examples/reactive.py``, but the controls come from the schema.

Run: ``python -m spaday.examples.form`` then open http://127.0.0.1:8002/.
"""

import asyncio
from pathlib import Path
from typing import Literal

import transports
import uvicorn
from pydantic import BaseModel
from starlette.applications import Starlette
from starlette.responses import FileResponse, JSONResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles

from spaday.components import form

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"


class Settings(BaseModel):
    name: str = "lamp"
    enabled: bool = True
    brightness: int = 50
    # a Literal (a plain str field) becomes a <wa-select>; an Enum would too, but transports'
    # bigbrother deep-watch can't observe enum field values (enums aren't subclassable) — Literal sidesteps it
    size: Literal["small", "medium", "large"] = "medium"


session = transports.Session()
settings = Settings()
session.host(settings)
server = transports.Server(session)


def tree() -> dict:
    """The form, generated from the model — no controls authored by hand."""
    return form(Settings).to_node()


async def homepage(_request):
    return FileResponse(HERE / "form.html")


async def tree_json(_request):
    return JSONResponse(tree())


async def startup():
    asyncio.create_task(transports.autosync(server))


app = Starlette(
    routes=[
        Route("/", homepage),
        Route("/tree.json", tree_json),
        WebSocketRoute("/ws", transports.ws_endpoint(server)),
        Mount("/js", StaticFiles(directory=JS)),
    ],
    on_startup=[startup],
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
