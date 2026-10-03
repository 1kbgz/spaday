"""Tabbed validation, saved drafts, and server previews. Run with ``python -m spaday.examples.tabbed_form``."""

from spaday_webawesome import Tabs
from starlette.responses import JSONResponse
from starlette.routing import Route

from spaday import CallEndpoint, Emit, Lifecycle, NamedJs, Request, Sequence, cond, element, field
from spaday.backends.starlette import serve
from spaday.components.shell import Column


async def preview(request):
    draft = await request.json()
    return JSONResponse({"message": f"{draft.get('name', '')} <{draft.get('email', '')}>"})


async def save(request):
    draft = await request.json()
    if not isinstance(draft, dict) or not all(isinstance(draft.get(key), str) and draft[key].strip() for key in ("name", "email")):
        return JSONResponse({"error": "Name and email are required"}, status_code=422)
    return JSONResponse({"name": draft["name"], "email": draft["email"]})


async def health(request):
    return JSONResponse({"message": "Server reachable"})


def page():
    tabs = (
        Tabs(active="details", id="editor-tabs")
        .tab(
            "Details",
            element("label", "Name", element("input", name="name", required=True).bind("value", "draft.name")),
            name="details",
        )
        .tab(
            "Contact",
            element("label", "Email", element("input", name="email", type="email", required=True).bind("value", "draft.email")),
            name="contact",
        )
    )
    return Column(
        element("h1", "Tabbed form"),
        element("p", "Clear a field in another tab and save to reveal it. Preview calls the server; reset restores the last saved values."),
        element(
            "form",
            tabs,
            element("button", "Save", type="submit").bind("disabled", "saving"),
            element("button", "Reset", type="reset"),
            element("button", "Preview", type="button")
            .bind("disabled", "previewing")
            .on(
                "click",
                CallEndpoint(
                    "POST", "/preview", field("draft"), result="preview", request=Request("preview", pending="previewing", watch=("draft",))
                ),
            ),
            id="editor",
        )
        .on("input", NamedJs("read-draft"))
        .on(
            "submit",
            Sequence(
                NamedJs("begin-save"),
                CallEndpoint("POST", "/save", field("draft"), result="saved", request=Request("save", pending="saving")),
                NamedJs("finish-save"),
            ),
        ),
        element("p", id="form-status", role="status").bind("textContent", "status"),
        element("output", id="preview-result").compute(
            "textContent",
            cond(
                field("previewing"),
                "Loading preview",
                cond(field("preview.ok"), field("preview.body.message"), cond(field("preview"), "Preview failed", "")),
            ),
        ),
        element(
            "section",
            element("h2", "Server status"),
            element("p", "Checks every five seconds while this page is visible."),
            element("p", role="status").compute(
                "textContent",
                cond(
                    field("checking"),
                    "Checking server",
                    cond(field("health.ok"), field("health.body.message"), cond(field("health"), "Server check failed", "Not checked")),
                ),
            ),
            element("button", "Check now", type="button").bind("disabled", "checking").on("click", Emit("refresh")),
            id="server-status",
        )
        .compute("aria-busy", cond(field("checking"), "true", "false"))
        .on("refresh", CallEndpoint("GET", "/health", result="health", request=Request("health", pending="checking"))),
    )


app = serve(
    page,
    packages=["webawesome"],
    layout="installed",
    scripts=["/js/cdn/examples/tabbed-form.js"],
    lifecycle=Lifecycle(elements=("wa-tab-group", "wa-tab", "wa-tab-panel")),
    store={"draft": {"name": "Ada", "email": "ada@example.test"}, "saving": False, "previewing": False, "checking": False, "status": "Saved"},
    routes=[Route("/save", save, methods=["POST"]), Route("/preview", preview, methods=["POST"]), Route("/health", health)],
    styles=["body{font-family:system-ui;margin:2rem;max-width:40rem}label{display:grid;gap:.5rem}button{margin:.5rem .5rem 0 0}"],
    title="Tabbed form",
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8002)
