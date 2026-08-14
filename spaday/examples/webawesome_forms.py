"""Build a reactive settings form from WebAwesome controls.

Run ``python -m spaday.examples.webawesome_forms`` and open http://127.0.0.1:8010.
"""

from spaday_webawesome import (
    WaButton,
    WaCheckbox,
    WaCheckboxGroup,
    WaColorPicker,
    WaInput,
    WaKnownDate,
    WaNumberInput,
    WaOption,
    WaRadio,
    WaRadioGroup,
    WaRating,
    WaSelect,
    WaSlider,
    WaSwitch,
    WaTextarea,
    WaTimeInput,
)

from spaday import CallEndpoint, If, Sequence, SetField, element, eq, field, not_, obj
from spaday.components.shell import App, Body, Column, Footer, Main, Nav, Row, Show, Toolbar

STYLE = """<style>
body { margin: 0; font-family: system-ui, sans-serif; }
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem; }
.settings-grid > * { min-width: 0; }
</style>"""


def build_page() -> App:
    """Return a local-state settings form with reset and save actions."""
    identity = Column(
        WaInput(label="Display name", placeholder="Ada Lovelace", with_clear=True).bind("value", "name", mode="two-way"),
        WaInput(type="email", label="Email", placeholder="ada@example.com", required=True).bind("value", "email", mode="two-way"),
        WaSelect(label="Role", with_clear=True)
        .child(
            WaOption(value="engineer").text("Engineer"),
            WaOption(value="designer").text("Designer"),
            WaOption(value="operator").text("Operator"),
        )
        .bind("value", "role", mode="two-way"),
        WaTextarea(label="Bio", rows=4, maxlength=240, with_count=True).bind("value", "bio", mode="two-way"),
        gap="0.9rem",
    )

    preferences = Column(
        WaCheckboxGroup(label="Notifications", hint="Choose every channel you want to enable")
        .child(
            WaCheckbox(value="email").text("Email"),
            WaCheckbox(value="push").text("Push"),
            WaCheckbox(value="sms").text("SMS"),
        )
        .bind("value", "notifications", mode="two-way"),
        WaRadioGroup(label="Density", orientation="vertical")
        .child(
            WaRadio(value="compact").text("Compact"),
            WaRadio(value="comfortable").text("Comfortable"),
            WaRadio(value="spacious").text("Spacious"),
        )
        .bind("value", "density", mode="two-way"),
        WaSwitch(with_hint=True, hint="Applied without a page reload").text("Dark theme").bind("checked", "dark", mode="two-way"),
        WaColorPicker(label="Accent color", format="hex", swatches="#2563eb; #7c3aed; #db2777; #059669").bind("value", "accent", mode="two-way"),
        gap="0.9rem",
    )

    schedule = Column(
        WaKnownDate(label="Start date", required=True).bind("value", "start_date", mode="two-way"),
        WaTimeInput(label="Daily reminder", with_now=True, with_clear=True).bind("value", "reminder", mode="two-way"),
        WaNumberInput(label="Seats", min=1, max=50, step=1).bind("value", "seats", mode="two-way"),
        WaSlider(label="Weekly digest size", min=1, max=20, with_markers=True, with_tooltip=True).bind("value", "digest", mode="two-way"),
        WaRating(label="Product rating", precision=0.5).style(align_self="flex-start", width="max-content").bind("value", "rating", mode="two-way"),
        gap="0.9rem",
    )

    reset = Sequence(
        SetField("name", "Ada Lovelace"),
        SetField("email", "ada@example.com"),
        SetField("role", "engineer"),
        SetField("bio", ""),
        SetField("dark", False),
        SetField("notifications", ["email"]),
        SetField("density", "comfortable"),
        SetField("accent", "#2563eb"),
        SetField("start_date", "2026-08-01"),
        SetField("reminder", "09:30"),
        SetField("seats", 8),
        SetField("digest", 8),
        SetField("rating", 4),
        SetField("save_result", None),
        SetField("form_error", None),
    )
    save = If(
        field("email"),
        Sequence(
            SetField("form_error", None),
            CallEndpoint(
                "POST",
                "/api/settings",
                obj(
                    {
                        "name": field("name"),
                        "email": field("email"),
                        "role": field("role"),
                        "accent": field("accent"),
                    }
                ),
                result="save_result",
            ),
        ),
        Sequence(
            SetField("save_result", None),
            SetField("form_error", "Enter an email address before saving."),
        ),
    )

    return (
        App(
            Nav(
                Row(
                    "Account settings",
                    WaSwitch(size="small").text("Dark").bind("checked", "dark", mode="two-way"),
                    justify="space-between",
                )
            ),
            Body(
                Main(
                    Column(
                        Column(identity, preferences, schedule, class_="settings-grid"),
                        Show(
                            WaTextarea(label="Advanced notes", rows=3, placeholder="Only shown for operators"),
                            when=eq(field("role"), "operator"),
                        ),
                        Show(
                            element("p").text("Settings saved."),
                            field="save_result",
                        ),
                        Show(
                            element("p").bind("textContent", "form_error"),
                            field="form_error",
                        ),
                        Toolbar(
                            WaButton(appearance="outlined").text("Reset").on("click", reset),
                            WaButton(variant="brand").text("Save settings").compute("disabled", not_(field("email"))).on("click", save),
                            justify="end",
                        ),
                        gap="1.25rem",
                    )
                )
            ),
            Footer("All form state is local until Save settings calls the endpoint."),
        )
        .bind_root_class("wa-dark", "dark")
        .css(wa_color_brand_fill_loud="#2563eb")
    )


def create_app():
    """Create the optional Starlette app used by the runnable example."""
    from starlette.responses import JSONResponse
    from starlette.routing import Route

    from spaday.backends.starlette import serve

    async def save_settings(request):
        payload = await request.json()
        return JSONResponse({"saved": True, "name": payload["name"]})

    return serve(
        build_page,
        packages=["webawesome"],
        store={
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "role": "engineer",
            "bio": "",
            "dark": False,
            "notifications": ["email"],
            "density": "comfortable",
            "accent": "#2563eb",
            "start_date": "2026-08-01",
            "reminder": "09:30",
            "seats": 8,
            "digest": 8,
            "rating": 4,
            "save_result": None,
            "form_error": None,
        },
        routes=[Route("/api/settings", save_settings, methods=["POST"])],
        title="spaday — settings form",
        head=STYLE,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(create_app(), host="127.0.0.1", port=8010)
