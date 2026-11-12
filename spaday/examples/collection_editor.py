"""Edit nested records through table and tree views. Run python -m spaday.examples.collection_editor."""

import asyncio
from contextlib import asynccontextmanager, suppress

from pydantic import BaseModel, Field
from transports import WRITE, CrdtDocument, CrdtSpec, Hub, autosync, ws_endpoint

from spaday import CallEndpoint, Wire, concat, element, item, obj, scope
from spaday.components import Each


class Board(BaseModel):
    groups: list[dict] = Field(
        default_factory=lambda: [
            {
                "id": group,
                "owner": owner,
                "rows": [{"id": row, "label": label, "details": {"note": ""}} for row, label in (("a", "Draft"), ("b", "Review"))],
            }
            for group, owner in (("work", "Alice"), ("home", "Bob"))
        ]
    )


SPEC = CrdtSpec(
    {
        "kind": "map",
        "fields": {
            "groups": {
                "kind": "set",
                "keys": [["id"]],
                "element": {
                    "kind": "map",
                    "fields": {"rows": {"kind": "set", "keys": [["id"]], "element": {"kind": "map", "fields": {"details": {"kind": "map"}}}}},
                },
            }
        },
    }
)


def controls(user: str):
    return (
        element("input", **{"aria-label": "Label"}).bind("value", item("label"), mode="two-way"),
        element("input", **{"aria-label": "Note"}).bind("value", item("details.note"), mode="two-way"),
        element("input", **{"aria-label": "Group owner"}).bind("value", scope("group.owner"), mode="two-way"),
        element("button")
        .text("Delete")
        .on("click", CallEndpoint("POST", f"/api/{user}/delete", obj({"group": scope("group.id"), "record": item("id")}), result="deletion")),
    )


def page(user: str):
    table = element(
        "section",
        element("h3").compute("textContent", item("id")),
        element(
            "table",
            element("thead", element("tr", *(element("th").text(title) for title in ("Label", "Note", "Group owner", "Action")))),
            element(
                "tbody",
                Each(
                    element("tr", *(element("td", control) for control in controls(user))).compute(
                        "id", concat("table-", scope("group.id"), "-", item("id"))
                    ),
                    items=item("rows"),
                    key="id",
                    direct=True,
                ),
            ),
        ),
    )
    tree = element(
        "details",
        element("summary").compute("textContent", item("id")),
        element(
            "ul",
            Each(
                element("li", *controls(user)).compute("id", concat("tree-", scope("group.id"), "-", item("id"))),
                items=item("rows"),
                key="id",
                direct=True,
            ),
        ),
        open=True,
    )
    return element(
        "main",
        element("h1").text("Shared collection editor"),
        element("nav", element("a", "Alice", href="/"), " · ", element("a", "Bob", href="/bob"), " · ", element("a", "Viewer", href="/viewer")),
        element("p").text("Both views edit the same records. Child IDs repeat between groups; edits and deletes include the parent identity."),
        element("p", "Connected: ", element("output", id="connected").bind("textContent", "board.connected")),
        element("h2").text("Table"),
        Each(table, field="board.groups", key="id", scope="group"),
        element("h2").text("Tree"),
        Each(tree, field="board.groups", key="id", scope="group"),
        element("output", id="edit-error").bind("textContent", "$errors.board.groups"),
        element("output", id="delete-result").bind("textContent", "deletion.body.message"),
        element("details", element("summary").text("Shared state"), element("pre", id="state").bind("textContent", "board.groups", codec="json")),
    )


def create_app(*, codec: str = "json"):
    from starlette.applications import Starlette
    from starlette.responses import JSONResponse
    from starlette.routing import Route, WebSocketRoute

    from spaday.backends.starlette import PageSpec, build_site

    # Demo roles are selected by URL. Production applications must derive these from authenticated users.
    hub = Hub(key=lambda connection: connection.query_params.get("user", "viewer"))
    model = hub.share(Board(), crdt_spec=SPEC)
    for user in ("alice", "bob"):
        hub.subscribe(user, model, WRITE)
    hub.subscribe("viewer", model)

    async def delete(request):
        if request.path_params["user"] not in ("alice", "bob"):
            return JSONResponse({"message": "Read-only view"}, status_code=403)
        body = await request.json()
        if not isinstance(body, dict) or not all(isinstance(body.get(key), str) for key in ("group", "record")):
            return JSONResponse({"message": "Expected group and record IDs"}, status_code=422)
        snapshot = hub.snapshot_shared(model)
        document = CrdtDocument.from_state(SPEC, snapshot["crdt_state"], "delete-preview")
        value = document.value
        group = next((group for group in value["groups"] if group["id"] == body["group"]), None)
        if group is None or not any(row["id"] == body["record"] for row in group["rows"]):
            return JSONResponse({"message": "Record no longer exists"}, status_code=404)
        group["rows"] = [row for row in group["rows"] if row["id"] != body["record"]]
        hub.mutate_shared_crdt(model, document.diff(value))
        return JSONResponse({"message": "Deleted record"})

    @asynccontextmanager
    async def lifespan(_app):
        task = asyncio.create_task(autosync(hub))
        try:
            yield
        finally:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task

    pages = {
        path: PageSpec(
            lambda user=user: page(user),
            wire=Wire(f"/ws?user={user}", model=model, namespace="board", codec=codec, reconnect=True),
            title="Shared collection editor",
            head="<style>body{font:16px system-ui;margin:2rem}main{max-width:64rem;margin:auto}table{border-collapse:collapse;width:100%}th,td{padding:.4rem;text-align:left}input{width:10rem}li{padding:.4rem}output{display:block;margin:1rem 0}</style>",
        )
        for path, user in (("/", "alice"), ("/bob", "bob"), ("/viewer", "viewer"))
    }
    return Starlette(
        routes=build_site(pages, routes=[WebSocketRoute("/ws", ws_endpoint(hub)), Route("/api/{user}/delete", delete, methods=["POST"])]).all(),
        lifespan=lifespan,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8004)
