import pytest

from spaday import validate
from spaday.components import webawesome
from spaday.examples import (
    data_dashboard,
    webawesome_content,
    webawesome_feedback,
    webawesome_forms,
    webawesome_navigation,
    webawesome_observers,
)

WEB_AWESOME_BUILDERS = (
    webawesome_forms.build_page,
    webawesome_navigation.build_page,
    webawesome_feedback.build_page,
    webawesome_content.build_page,
    webawesome_observers.build_page,
)
BUILDERS = (
    *WEB_AWESOME_BUILDERS,
    data_dashboard.build_page,
)


def _tags(node: dict) -> set[str]:
    tags = {node["tag"]}
    for children in node.get("slots", {}).values():
        for child in children:
            tags.update(_tags(child))
    return tags


def _nodes(node: dict):
    yield node
    for children in node.get("slots", {}).values():
        for child in children:
            yield from _nodes(child)


def _action_dicts(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from _action_dicts(child)
    elif isinstance(value, list):
        for child in value:
            yield from _action_dicts(child)


def test_gallery_pages_are_valid_component_trees():
    for build_page in BUILDERS:
        page = build_page()
        validate(page)
        assert page.to_node()["slots"]


def test_gallery_covers_every_generated_webawesome_component():
    expected = {getattr(webawesome, name).tag for name in webawesome.__all__}
    covered = set()
    for build_page in WEB_AWESOME_BUILDERS:
        covered.update(_tags(build_page().to_node()))
    assert covered >= expected


def test_navigation_example_uses_one_state_driven_navigation_model():
    nodes = tuple(_nodes(webawesome_navigation.build_page().to_node()))
    section_actions = {
        action["value"]["value"]
        for node in nodes
        if node["tag"] in {"wa-button", "wa-breadcrumb-item"}
        for event in node.get("events", {}).values()
        for action in _action_dicts(event)
        if action.get("kind") == "set-field" and action.get("field") == "section"
    }
    section_conditions = {
        binding["compute"]["b"]["value"] for node in nodes if node["tag"] == "spa-show" for binding in node.get("bindings", {}).values()
    }
    assert section_actions == section_conditions == {"overview", "projects", "settings"}


def test_navigation_example_breadcrumb_tracks_current_section():
    nodes = tuple(_nodes(webawesome_navigation.build_page().to_node()))
    breadcrumb_items = [node for node in nodes if node["tag"] == "wa-breadcrumb-item"]

    assert len(breadcrumb_items) == 1
    binding = breadcrumb_items[0]["bindings"]["textContent"]
    parts = tuple(_action_dicts(binding["compute"]))
    assert binding["mode"] == "one-way"
    assert {part["name"] for part in parts if part.get("expr") == "field"} == {"section"}
    assert {part["value"] for part in parts if part.get("expr") == "lit"} == {
        "Overview",
        "projects",
        "Projects",
        "settings",
        "Settings",
    }


def test_data_dashboard_covers_core_shell_and_chart_components():
    covered = _tags(data_dashboard.build_page().to_node())
    assert covered >= {
        "lightweight-chart",
        "spa-app",
        "spa-body",
        "spa-footer",
        "spa-gutter",
        "spa-main",
        "spa-nav",
        "spa-row",
        "spa-show",
        "spa-stack",
        "spa-table",
        "spa-toolbar",
    }


def test_gallery_apps_serve_their_bootstrap_and_routes():
    pytest.importorskip("starlette")
    from starlette.testclient import TestClient

    modules = (
        webawesome_forms,
        webawesome_navigation,
        webawesome_feedback,
        webawesome_content,
        webawesome_observers,
        data_dashboard,
    )
    for module in modules:
        with TestClient(module.create_app()) as client:
            page = client.get("/")
            assert page.status_code == 200
            assert "/js/dist/cdn/examples/webawesome.js" in page.text
            assert "<style>\nbody {" in page.text
            assert page.text.index("</style>") < page.text.index("</head>")
            assert client.get("/tree.json").status_code == 200

    with TestClient(webawesome_forms.create_app()) as client:
        response = client.post("/api/settings", json={"name": "Ada"})
        assert response.status_code == 200
        assert response.json() == {"saved": True, "name": "Ada"}

    with TestClient(webawesome_observers.create_app()) as client:
        assert "reusable HTML fragment" in client.get("/partial.html").text
