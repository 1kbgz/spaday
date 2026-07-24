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
    concat,
    cond,
    eq,
    event_value,
    field,
    lit,
    not_,
    obj,
    prop,
    this,
)
from .bootstrap import Wire
from .cem import classes, generate
from .component import Component, Paragraph, Strong, Text, element
from .packages import ComponentPackage, discover_component_packages, resolve_component_packages
from .render import render_html
from .spaday import apply, decode_frame, diff, encode_frame, parse_cem  # compiled Rust extension (rust/python)
from .theme import SHELL_TOKENS
from .validate import ValidationError, validate

__version__ = "0.4.0"

__all__ = [
    # theming token reference (css custom properties are set via Component.css)
    "SHELL_TOKENS",
    "CallEndpoint",
    "Component",
    # external component-package assets (direct descriptor, Python path, or entry point)
    "ComponentPackage",
    "Emit",
    "If",
    "NamedJs",
    "Paragraph",
    "SendPatch",
    "Sequence",
    "SetField",
    "SetProp",
    "Strong",
    "Text",
    "Toggle",
    "ToggleField",
    "ValidationError",
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
    "classes",
    "concat",
    "cond",
    "decode_frame",
    # component-tree diff/patch (compiled core)
    "diff",
    "discover_component_packages",
    "element",
    # framed wire (tree/patch over transports' Frame + JSON/msgpack codecs)
    "encode_frame",
    "eq",
    "event_value",
    "field",
    "generate",
    "lit",
    "not_",
    "obj",
    # CEM binding generator
    "parse_cem",
    "prop",
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
