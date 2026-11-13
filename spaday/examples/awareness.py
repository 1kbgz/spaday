"""Editor and table awareness on one connection. Run python -m spaday.examples.awareness.

Install spaday-codemirror and spaday-regular-table alongside spaday[examples].
Participant identity here comes from demo URLs; production hosts must authenticate it.
"""

from pydantic import BaseModel, Field
from transports import WRITE, CrdtSpec, Hub, ws_endpoint

from spaday import Awareness, SetField, Text, Wire, element, event_value, item, obj
from spaday.backends.starlette import PageSpec, build_site
from spaday.components import Each


class Document(BaseModel):
    doc: str = "Shared notes\n"
    rows: list[dict] = Field(default_factory=lambda: [{"id": "draft", "title": "Draft"}, {"id": "review", "title": "Review"}])


def create_app(*, codec: str = "json"):
    from spaday_codemirror import CodeMirror, package as editor_package
    from spaday_regular_table import RegularTable, package as table_package
    from starlette.applications import Starlette
    from starlette.routing import WebSocketRoute

    hub = Hub(key=lambda ws: ws.path_params["user"])
    spec = CrdtSpec({"kind": "map", "fields": {"doc": {"kind": "sequence", "materialization": "string"}, "rows": {"kind": "register"}}})
    model = hub.share(Document(), crdt_spec=spec)
    for user in ("alice", "bob", "viewer"):
        hub.subscribe(user, model, WRITE if user != "viewer" else "read")

    def page(user):
        cursor = SetField("cursor", obj({"user": user, "selection": event_value("selection")}))
        editor = (
            CodeMirror(id="editor", read_only=user == "viewer")
            .bind("doc", "document.doc", mode="two-way", event="editor-change")
            .on("selection-update", cursor)
        )
        table = (
            RegularTable(id="records", columns=["id", "title"])
            .bind("rows", "document.rows")
            .on("cell-click", SetField("row", obj({"user": user, "row": event_value("row.id")})))
        )
        return element(
            "main",
            element("h1", "Shared editor and table"),
            element("nav", *(element("a", name, href="/" if name == "alice" else f"/{name}") for name in ("alice", "bob", "viewer"))),
            element(
                "p",
                "Open another user. Edit the notes or click a table cell. Both scopes share one connection; this example displays state without cursor overlays.",
            ),
            editor,
            table,
            element("h2", "Other editor selections"),
            element(
                "ul",
                Each(element("li", Text(item("state.user")), " at ", Text(item("state.selection.anchor"))), field="cursors", key="peer"),
                id="cursors",
            ),
            element("h2", "Other table selections"),
            element("ul", Each(element("li", Text(item("state.user")), " selected ", Text(item("state.row"))), field="rows", key="peer"), id="rows"),
        )

    pages = {
        "/" if user == "alice" else f"/{user}": PageSpec(
            lambda user=user: page(user),
            packages=[editor_package, table_package],
            wire=Wire(
                f"/ws/{user}",
                model=model,
                namespace="document",
                codec=codec,
                reconnect=True,
                awareness={"editor": Awareness(local="cursor", peers="cursors"), "table": Awareness(local="row", peers="rows")},
            ),
            store={"cursor": {"user": user, "selection": {"anchor": 0}}, "row": None},
            styles=[
                "body{font:16px system-ui;margin:2rem}main{max-width:60rem;margin:auto}nav{display:flex;gap:1rem}spaday-codemirror{height:16rem}spaday-regular-table{height:10rem;margin-top:1rem}"
            ],
            title="Shared editor and table",
        )
        for user in ("alice", "bob", "viewer")
    }
    return Starlette(routes=build_site(pages, routes=[WebSocketRoute("/ws/{user}", ws_endpoint(hub))]).all())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8005)
