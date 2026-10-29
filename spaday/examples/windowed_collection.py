"""Server-windowed records. Run with python -m spaday.examples.windowed_collection."""

from starlette.responses import JSONResponse
from starlette.routing import Route

from spaday import CallEndpoint, If, Request, Sequence, SetField, Text, element, event_prop, field, item
from spaday.backends.starlette import serve
from spaday.components import Each, Row

TOTAL = 100_000
MAX_WINDOW = 512


async def records(request):
    bounds = await request.json()
    if not isinstance(bounds, dict):
        return JSONResponse({"error": "Expected a record window"}, status_code=422)
    start, stop = bounds.get("start"), bounds.get("stop")
    if type(start) is not int or type(stop) is not int or not 0 <= start <= stop <= TOTAL or stop - start > MAX_WINDOW:
        return JSONResponse({"error": "Invalid record window"}, status_code=422)
    return JSONResponse(
        {
            "items": [{"id": index, "label": f"Record {index}"} for index in range(start, stop)],
            "offset": start,
            "total": TOTAL,
        }
    )


def page():
    rows = Each(
        Row(Text(item("id")), Text(item("label")), gap="1rem"),
        field="page",
        key="id",
        row_height=32,
        height=384,
        overscan=4,
        window=True,
    ).on(
        "spaday:range",
        Sequence(
            CallEndpoint("POST", "/records", event_prop("detail"), result="reply", request=Request("records", pending="loading")),
            If(field("reply.ok"), SetField("page", field("reply.body"))),
        ),
    )
    return element(
        "main",
        element("h1", "Windowed records"),
        element("p", "Only the requested rows are sent to the browser. Scroll to fetch another window."),
        rows,
    )


app = serve(
    page,
    store={"page": {"items": [], "offset": 0, "total": TOTAL}, "loading": False},
    routes=[Route("/records", records, methods=["POST"])],
    title="Windowed records",
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8002)
