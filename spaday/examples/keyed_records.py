"""A server-driven staging queue with rich, keyed rows and no page-specific JavaScript.

Run ``python -m spaday.examples.keyed_records`` and open http://127.0.0.1:8017/.

Every channel and record is a normal Python-authored component subtree. REST actions carry the current
item's values to Python; transports sends the resulting model patch back. ``Each`` preserves the DOM
for unchanged keys, so local input, focus, and component state survive updates and reordering.
"""

from itertools import count

import transports
from pydantic import BaseModel
from starlette.responses import JSONResponse
from starlette.routing import Route, WebSocketRoute

from spaday import CallEndpoint, Strong, Text, concat, element, item, not_, obj, scope
from spaday.backends.starlette import serve
from spaday.components import App, Column, Each, Footer, Main, Nav, Row, Show


class Record(BaseModel):
    id: int
    package: str
    version: str
    ready: bool = False


class Channel(BaseModel):
    name: str
    records: list[Record]
    empty: bool = False


class Queue(BaseModel):
    channels: list[Channel]


queue = Queue(
    channels=[
        Channel(
            name="stable",
            records=[
                Record(id=1, package="spaday", version="0.4.1", ready=True),
                Record(id=2, package="transports", version="0.5.0"),
            ],
        ),
        Channel(
            name="canary",
            records=[Record(id=3, package="spaday-regular-table", version="0.1.0")],
        ),
    ]
)
_ids = count(4)
_packages = ("spaday-trees", "spaday-perspective", "spaday-regular-layout")

session = transports.Session()
session.host(queue)
server = transports.Server(session)


def _replace_records(channel_name: str, records: list[Record]) -> None:
    """Replace one channel immutably so transports can emit a narrow structural patch."""
    queue.channels = [
        channel.model_copy(update={"records": records, "empty": not records}) if channel.name == channel_name else channel
        for channel in queue.channels
    ]


def _records(channel_name: str) -> list[Record]:
    return next(channel.records for channel in queue.channels if channel.name == channel_name)


async def add_record(request):
    channel_name = request.path_params["channel"]
    record_id = next(_ids)
    record = Record(
        id=record_id,
        package=_packages[record_id % len(_packages)],
        version=f"0.1.{record_id}",
    )
    _replace_records(channel_name, [*_records(channel_name), record])
    return JSONResponse(record.model_dump())


async def reverse_records(request):
    channel_name = request.path_params["channel"]
    _replace_records(channel_name, list(reversed(_records(channel_name))))
    return JSONResponse({"ok": True})


async def toggle_record(request):
    channel_name = request.path_params["channel"]
    record_id = request.path_params["record_id"]
    records = [record.model_copy(update={"ready": not record.ready}) if record.id == record_id else record for record in _records(channel_name)]
    _replace_records(channel_name, records)
    return JSONResponse({"id": record_id})


async def remove_record(request):
    channel_name = request.path_params["channel"]
    record_id = request.path_params["record_id"]
    body = await request.json()
    if body.get("id") != record_id:
        return JSONResponse({"error": "body id does not match route"}, status_code=400)
    _replace_records(channel_name, [record for record in _records(channel_name) if record.id != record_id])
    return JSONResponse({"id": record_id})


def record_template():
    """One live record subtree; expressions resolve against its current item scope."""
    endpoint = concat("/api/channels/", scope("channel.name"), "/records/", item("id"))
    return element(
        "article",
        Row(
            Column(
                Strong(item("package")),
                element("code").text(item("version")),
                gap="0.2rem",
            ),
            Show(element("span", class_="badge ready").text("Ready"), when=item("ready")),
            Show(element("span", class_="badge pending").text("Pending"), when=not_(item("ready"))),
            element("button", type="button").text("Toggle ready").on("click", CallEndpoint("POST", endpoint)),
            element("button", type="button", class_="danger").text("Remove").on("click", CallEndpoint("DELETE", endpoint, obj({"id": item("id")}))),
            gap="0.65rem",
        ),
        element("input", placeholder="Local note — type here, then reverse the channel").prop("aria-label", "Local note"),
        class_="record",
    )


def channel_template():
    """One channel subtree containing a nested keyed record collection."""
    base = concat("/api/channels/", item("name"), "/records")
    return element(
        "section",
        Row(
            element("h2").text(item("name")),
            element("button", type="button").text("Add record").on("click", CallEndpoint("POST", base)),
            element("button", type="button").text("Reverse order").on("click", CallEndpoint("POST", concat(base, "/reverse"))),
            gap="0.65rem",
        ),
        Show(element("p", class_="empty").text("Nothing staged in this channel."), when=item("empty")),
        Each(record_template(), items=item("records"), key="id"),
        class_="channel",
    )


def build_page():
    """Build the staging queue component tree."""
    return App(
        Nav(Strong("Release staging queue"), Text("server-driven · keyed · Python-authored")),
        Main(
            Column(
                element("h1").text("Rich actions in live collections"),
                element("p").text(
                    "Add, update, remove, or reorder records. Type in a local note first: keyed reconciliation keeps it attached to the same record."
                ),
                Each(channel_template(), field="channels", key="name", scope="channel"),
                gap="1rem",
            )
        ),
        Footer("Each operation goes to Python; transports returns only the changed model paths. No custom JavaScript."),
    )


STYLE = """<style>
body { margin: 0; font: 15px/1.45 system-ui, sans-serif; color: #18212f; background: #f4f7fb; }
spa-app { min-height: 100vh; --spa-gap: 1rem; --spa-border: #dce3ed; --spa-surface: #fff; }
spa-nav { color: #fff; background: #142238; }
spa-nav span { color: #a9bdd9; }
spa-main { width: min(960px, calc(100% - 2rem)); margin: 0 auto; }
h1, h2, p { margin: 0; }
h1 { font-size: 1.65rem; }
.channel { display: grid; gap: .75rem; padding: 1rem; border: 1px solid #dce3ed; border-radius: .8rem; background: #fff; box-shadow: 0 6px 22px #1d35570d; }
.channel h2 { margin-right: auto; font-size: 1.1rem; text-transform: capitalize; }
.record { display: grid; gap: .65rem; padding: .85rem; border: 1px solid #e1e7f0; border-radius: .65rem; background: #fbfcfe; }
.record spa-row > spa-stack { margin-right: auto; min-width: 13rem; }
.record input { box-sizing: border-box; width: 100%; padding: .55rem .65rem; border: 1px solid #cbd5e1; border-radius: .45rem; }
button { padding: .45rem .7rem; border: 1px solid #b7c5d8; border-radius: .45rem; color: #22334a; background: #fff; cursor: pointer; }
button:hover { background: #edf3fa; }
button.danger { color: #9f2430; border-color: #e6b8bd; }
.badge { padding: .2rem .5rem; border-radius: 999px; font-size: .75rem; font-weight: 700; }
.ready { color: #176b43; background: #dcf5e8; }
.pending { color: #8a5b0b; background: #fff0c9; }
.empty { padding: 1rem; color: #65758b; text-align: center; border: 1px dashed #cbd5e1; border-radius: .6rem; }
code { color: #617089; }
@media (max-width: 700px) { .record spa-row { align-items: stretch; flex-direction: column; } }
</style>"""


def create_app():
    """Create the runnable Starlette application."""
    return serve(
        build_page,
        wire="transports",
        tree="frame",
        routes=[
            WebSocketRoute("/ws", transports.ws_endpoint(server)),
            Route("/api/channels/{channel}/records", add_record, methods=["POST"]),
            Route("/api/channels/{channel}/records/reverse", reverse_records, methods=["POST"]),
            Route("/api/channels/{channel}/records/{record_id:int}", toggle_record, methods=["POST"]),
            Route("/api/channels/{channel}/records/{record_id:int}", remove_record, methods=["DELETE"]),
        ],
        background=[transports.autosync(server)],
        head=STYLE,
        title="spaday — keyed records",
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8017)
