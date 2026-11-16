from dataclasses import replace
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


def test_late_packages_are_bundled_before_announcement_and_duplicates_are_a_noop(tmp_path):
    descriptor = package(tmp_path)
    w = Widget(element("div"))
    changes = []

    def announced(change):
        changes.append(change["new"])
        assert w._bundles[change["new"][0]["id"]].data == b"export const value = 1;"

    w.observe(announced, names="_packages")
    try:
        w.add_packages(descriptor)
        w.add_packages(descriptor, descriptor)
        w.add_packages()
        assert len(changes) == 1
        assert len(w._component_packages) == len(w._packages) == 1
    finally:
        w.close()


def test_late_packages_reconcile_with_existing_packages_atomically(tmp_path):
    provider = replace(package(tmp_path / "provider"), name="provider", provides={"library": "1.0.0"})
    consumer = replace(package(tmp_path / "consumer"), name="consumer", requires={"library": ">=1.0.0"})
    conflict = replace(package(tmp_path / "conflict"), name="conflict", provides={"library": "2.0.0"})
    w = Widget(element("div"), packages=[provider])
    try:
        w.add_packages(consumer)
        selected, bundles, descriptors = w._component_packages, dict(w._bundles), list(w._packages)
        with pytest.raises(ValueError, match="different versions"):
            w.add_packages(replace(consumer, name="another"), conflict)
        assert w._component_packages == selected
        assert w._bundles == bundles
        assert w._packages == descriptors
        (consumer.assets_dir / "index.js").unlink()
        with pytest.raises(ValueError, match="missing asset"):
            w.add_packages(replace(provider, name="another"), consumer)
        assert w._bundles == bundles
        assert w._packages == descriptors
    finally:
        w.close()


def test_late_packages_reject_changed_content_and_keep_original_bundle(tmp_path):
    descriptor = package(tmp_path)
    w = Widget(element("div"), packages=[descriptor])
    try:
        original = w._packages[0]
        (tmp_path / "index.js").write_text("export const value = 2;")
        with pytest.raises(ValueError, match="changed after selection"):
            w.add_packages(descriptor)
        assert w._packages == [original]
        assert w._bundles[original["id"]].data == b"export const value = 1;"
    finally:
        w.close()


def test_late_package_design_does_not_change_selected_design(tmp_path):
    from spaday import ui
    from spaday.ui.native import NATIVE

    w = Widget(ui.Button("First"), design="native")
    try:
        w.add_packages(replace(package(tmp_path), design=NATIVE.model_copy(update={"name": "late"})))
        w.update(ui.Button("Second"))
        assert w._design is NATIVE
        assert w._tree["tag"] == "button"
    finally:
        w.close()


def test_package_status_retry_and_close():
    w = Widget(element("div"))
    w.send = Mock()
    handler, intents = Mock(), Mock()
    w.on_packages(handler)
    w.on_intent(intents)
    for status in ("loading", "ready", "error"):
        message = {"type": "spaday:packages", "view": "one", "packages": ["test"], "status": status}
        w._msg_callbacks(w, message, [])
        handler.assert_called_with(message)
    intents.assert_not_called()
    w.retry_packages()
    w.send.assert_called_once_with({"type": "spaday:packages:retry"})
    w.close()
    assert not w._package_handlers
    with pytest.raises(ValueError, match="closed"):
        w.retry_packages()
    with pytest.raises(ValueError, match="closed"):
        w.add_packages()
