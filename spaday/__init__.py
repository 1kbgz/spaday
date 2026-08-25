from . import actions
from .actions import (
    CallEndpoint,
    Emit,
    If,
    NamedJs,
    SendPatch,
    Sequence,
    SetField,
    SetProp,
    Toggle,
    ToggleField,
    all_,
    any_,
    bind,
    by_id,
    close_modal,
    close_popup,
    concat,
    cond,
    eq,
    event_prop,
    event_value,
    field,
    item,
    lit,
    not_,
    obj,
    open_modal,
    open_popup,
    prop,
    scope,
    this,
)
from .bootstrap import Js, Wire
from .catalog import ComponentSchema, PropertyKind, PropertySchema
from .cem import classes, generate
from .component import Component, Paragraph, Strong, Text, element
from .packages import ComponentPackage, discover_component_package_names, discover_component_packages, resolve_component_packages
from .render import render_html
from .spaday import apply, decode_frame, diff, encode_frame, parse_cem  # compiled Rust extension (rust/python)
from .theme import SHELL_TOKENS
from .validate import ValidationError, validate
from .worker import WorkerApp

__version__ = "0.7.3"

__all__ = [
    # theming token reference (css custom properties are set via Component.css)
    "SHELL_TOKENS",
    "CallEndpoint",
    "Component",
    # external component-package assets (direct descriptor, Python path, or entry point)
    "ComponentPackage",
    "ComponentSchema",
    "Emit",
    "If",
    "NamedJs",
    "Paragraph",
    "PropertyKind",
    "PropertySchema",
    "SendPatch",
    "Sequence",
    "SetField",
    "SetProp",
    "Strong",
    "Text",
    "Toggle",
    "ToggleField",
    "ValidationError",
    "WorkerApp",
    # anywidget host (optional; requires the `widget` extra)
    "Widget",
    # a typed transports wire spec for a multi-model page (serve/bootstrap wire=[…])
    "Wire",
    "__version__",
    # action DSL (declarative behavior, run in the browser)
    "actions",
    "all_",
    "any_",
    "apply",
    "bind",
    "by_id",
    "close_modal",
    "close_popup",
    "classes",
    "concat",
    "cond",
    "decode_frame",
    # component-tree diff/patch (compiled core)
    "diff",
    "discover_component_packages",
    "discover_component_package_names",
    "element",
    # framed wire (tree/patch over transports' Frame + JSON/msgpack codecs)
    "encode_frame",
    "eq",
    "event_prop",
    "event_value",
    "field",
    "item",
    "generate",
    "lit",
    "not_",
    "open_modal",
    "open_popup",
    "obj",
    # CEM binding generator
    "parse_cem",
    "prop",
    "scope",
    # server-side rendering (light-DOM HTML for first paint; client hydrates)
    "render_html",
    "resolve_component_packages",
    "this",
    # build-time validation
    "validate",
]


def __getattr__(name: str):
    # `Widget` pulls in anywidget (an optional dep), so load it lazily — `import spaday` stays light.
    if name == "Widget":
        from .widget import Widget

        return Widget
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
