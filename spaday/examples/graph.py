"""A live graph on **transports**: host a graph model, add a node every second, stream it.

The graph's nodes/edges live in a `transports.Session`; `transports.Server` + `starlette_endpoint`
serve it over a WebSocket and `autoflush` broadcasts the patches. The browser (`graph.html`) mirrors
the model with transports' JS `Client` and feeds it to the `<dagre-graph>` element (dagre-d3).
transports is the wire; spaday renders. This is the daggre rendering path: a Graph model rendered by
the dagre wrapper, synced over transports — the daggre app adds the typed Graph/Node/Edge domain and a
notebook widget on top.

Run (needs `transports`, `starlette`, `uvicorn`, `websockets`, and the built `js/dist` bundles +
`@1kbgz/transports` in `js/node_modules`)::

    cd js && pnpm install && pnpm build && cd ..
    python -m spaday.examples.graph       # -> http://127.0.0.1:8002
"""

import asyncio
import random
from contextlib import asynccontextmanager
from pathlib import Path

import transports
import uvicorn
from pydantic import BaseModel, Field
from starlette.applications import Starlette
from starlette.responses import FileResponse
from starlette.routing import Mount, Route, WebSocketRoute
from starlette.staticfiles import StaticFiles

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"  # spaday/js — holds the built dist/ and node_modules/ we serve
MAX_NODES = 25  # stop growing so the layout stays legible


class Graph(BaseModel):
    direction: str = "left-to-right"
    nodes: list = Field(default_factory=list)
    edges: list = Field(default_factory=list)


random.seed(7)
graph = Graph(nodes=[{"id": "n0", "label": "n0"}])
session = transports.Session()
session.host(graph)  # the only model; the browser finds it by id
server = transports.Server(session)


async def homepage(request):
    return FileResponse(HERE / "graph.html")


async def ticker() -> None:
    while True:
        await asyncio.sleep(1.0)
        if len(graph.nodes) >= MAX_NODES:
            continue
        i = len(graph.nodes)
        parent = random.choice(graph.nodes)["id"]  # attach to a random existing node
        # reassign (not append) so the reactive Session observes the change
        graph.nodes = graph.nodes + [{"id": f"n{i}", "label": f"n{i}"}]
        graph.edges = graph.edges + [{"from": parent, "to": f"n{i}"}]


@asynccontextmanager
async def lifespan(app):
    flush = asyncio.create_task(transports.autoflush(server))  # broadcast patches to clients
    tick = asyncio.create_task(ticker())
    try:
        yield
    finally:
        flush.cancel()
        tick.cancel()


app = Starlette(
    routes=[
        Route("/", homepage),
        WebSocketRoute("/ws", transports.starlette_endpoint(server)),
        Mount("/js", StaticFiles(directory=JS)),
        Mount("/nm", StaticFiles(directory=JS / "node_modules")),  # serves @1kbgz/transports
    ],
    lifespan=lifespan,
)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
