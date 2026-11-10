"""Collaborative map and keyed-record bindings. Run python -m spaday.examples.collaborative_data."""

from pydantic import BaseModel, Field
from transports import WRITE, CrdtSpec, Hub, ws_endpoint

from spaday import Text, Wire, concat, element, item, ui
from spaday.components import Each


class Board(BaseModel):
    settings: dict = Field(default_factory=lambda: {"title": "Shared board", "owner": "Team"})
    rows: list[dict] = Field(default_factory=lambda: [{"id": "a", "label": "Draft", "done": False}, {"id": "b", "label": "Review", "done": False}])


SPEC = CrdtSpec({"kind": "map", "fields": {"settings": {"kind": "map"}, "rows": {"kind": "set", "keys": [["id"]], "element": {"kind": "map"}}}})


def create_hub():
    hub = Hub(key=lambda connection: connection.query_params.get("user", "alice"))
    model = hub.share(Board(), crdt_spec=SPEC)
    for user in ("alice", "bob"):
        hub.subscribe(user, model, WRITE)
    hub.subscribe("viewer", model)
    return hub, model


def page():
    return element(
        "main",
        element("h1", "Collaborative records"),
        element("nav", element("a", "Alice", href="/"), " · ", element("a", "Bob", href="/bob"), " · ", element("a", "Viewer", href="/viewer")),
        element(
            "p", "Open two tabs. Map fields and record fields merge independently. Records use id as identity; their array order is not editable."
        ),
        ui.TextInput(label="Title", id="title").bind("value", "board.settings.title", mode="two-way"),
        ui.TextInput(label="Owner", id="owner").bind("value", "board.settings.owner", mode="two-way"),
        element(
            "label",
            "Settings (JSON)",
            element("textarea", id="settings", rows=4).bind("value", "board.settings", mode="two-way", codec="json", event="change"),
        ),
        element("output", id="settings-error").bind("textContent", "$errors.board.settings"),
        element(
            "label",
            "Records (JSON)",
            element("textarea", id="rows", rows=8).bind("value", "board.rows", mode="two-way", codec="json", event="change"),
        ),
        element("p", "Change records, add a unique id, or remove a record, then leave the editor to apply the change."),
        element("output", id="rows-error").bind("textContent", "$errors.board.rows"),
        Each(
            element(
                "div",
                Text(item("label")),
                ui.TextInput(label="Record label").prop("class", "row-label").bind("value", item("label"), mode="two-way"),
                ui.Checkbox(label="Done").prop("class", "row-done").bind("value", item("done"), mode="two-way"),
            ).compute("id", concat("row-", item("id"))),
            field="board.rows",
            key="id",
        ),
    )


def create_app():
    from starlette.applications import Starlette
    from starlette.routing import WebSocketRoute

    from spaday.backends.starlette import PageSpec, build_site

    hub, model = create_hub()
    pages = {
        path: PageSpec(
            page,
            packages=["webawesome"],
            wire=Wire(f"/ws?user={user}", model=model, namespace="board", reconnect=True),
            title="Collaborative records",
            head="<style>body { font-family: system-ui, sans-serif; margin: 2rem; } main { max-width: 48rem; display: grid; gap: 1rem; } label { display: grid; gap: .5rem; } textarea { width: 100%; box-sizing: border-box; }</style>",
        )
        for path, user in (("/", "alice"), ("/bob", "bob"), ("/viewer", "viewer"))
    }
    return Starlette(
        routes=build_site(pages, routes=[WebSocketRoute("/ws", ws_endpoint(hub))]).all(),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8003)
