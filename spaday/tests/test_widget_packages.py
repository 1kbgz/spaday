from pathlib import Path
from unittest.mock import Mock

import pytest

pytest.importorskip("anywidget")

from spaday import ComponentPackage, Widget, element
from spaday.widget_packages import bundle_package


def package(root: Path) -> ComponentPackage:
    root.mkdir(exist_ok=True)
    (root / "index.js").write_text("export const value = 1;")
    return ComponentPackage("test", root, (("js", "index.js"),))


def test_package_assets_are_requested_once_as_a_binary_buffer(tmp_path):
    descriptor = package(tmp_path)
    w = Widget(element("div"), packages=[descriptor])
    w.send = Mock()
    try:
        assert w._packages[0]["name"] == "test"
        assert "data" not in w._packages[0]
        assert not w.send.called
        w._msg_callbacks(w, {"type": "spaday:assets", "package": w._packages[0]["id"], "request": "one"}, [])
        message = w.send.call_args.args[0]
        data = w.send.call_args.kwargs["buffers"][0]
        assert message["request"] == "one"
        assert message["files"][0]["path"] == "index.js"
        assert data == b"export const value = 1;"
        w.send.reset_mock()
        w._msg_callbacks(w, {"type": "spaday:assets", "package": "unknown", "request": "two"}, [])
        assert "not selected" in w.send.call_args.args[0]["error"]
    finally:
        w.close()
    assert not w._bundles


def test_bundle_identity_is_content_based_and_debug_maps_are_excluded(tmp_path):
    first = package(tmp_path / "first")
    second = package(tmp_path / "second")
    assert bundle_package(first).descriptor["id"] == bundle_package(second).descriptor["id"]
    (first.assets_dir / "index.js.map").write_text("debug")
    assert bundle_package(first).descriptor["id"] == bundle_package(second).descriptor["id"]
    (first.assets_dir / "index.js").write_text("export const value = 2;")
    assert bundle_package(first).descriptor["id"] != bundle_package(second).descriptor["id"]


def test_bundle_rejects_missing_assets_and_paths_outside_package(tmp_path):
    descriptor = package(tmp_path / "assets")
    (descriptor.assets_dir / "index.js").unlink()
    with pytest.raises(ValueError, match="missing asset"):
        bundle_package(descriptor)
    (tmp_path / "outside.js").write_text("private")
    (descriptor.assets_dir / "index.js").symlink_to(tmp_path / "outside.js")
    with pytest.raises(ValueError, match="escapes its directory"):
        bundle_package(descriptor)


def test_widget_uses_selected_package_design_for_initial_and_updated_trees(tmp_path):
    from dataclasses import replace

    from spaday import ui
    from spaday.ui.native import NATIVE

    descriptor = replace(package(tmp_path), design=NATIVE)
    w = Widget(ui.Button("First"), packages=[descriptor], design="test")
    try:
        assert w._tree["tag"] == "button"
        w.update(ui.Button("Second"))
        assert w._tree["tag"] == "button"
    finally:
        w.close()
