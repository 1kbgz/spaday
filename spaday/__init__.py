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
from .render import render_html
from .spaday import apply, decode_frame, diff, encode_frame, parse_cem  # compiled Rust extension (rust/python)
from .theme import SHELL_TOKENS
from .validate import ValidationError, validate

__version__ = "0.1.1"

__all__ = [
    "__version__",
    # component-tree diff/patch (compiled core)
    "diff",
    "apply",
    # framed wire (tree/patch over transports' Frame + JSON/msgpack codecs)
    "encode_frame",
    "decode_frame",
    # CEM binding generator
    "parse_cem",
    "generate",
    "classes",
    "Component",
    "element",
    "Text",
    "Strong",
    "Paragraph",
    # server-side rendering (light-DOM HTML for first paint; client hydrates)
    "render_html",
    # a typed transports wire spec for a multi-model page (serve/bootstrap wire=[…])
    "Wire",
    # theming token reference (css custom properties are set via Component.css)
    "SHELL_TOKENS",
    # build-time validation
    "validate",
    "ValidationError",
    # action DSL (declarative behavior, run in the browser)
    "actions",
    "SetProp",
    "Toggle",
    "SetField",
    "ToggleField",
    "Sequence",
    "Emit",
    "SendPatch",
    "If",
    "CallEndpoint",
    "NamedJs",
    "lit",
    "event_value",
    "not_",
    "prop",
    "field",
    "eq",
    "all_",
    "any_",
    "cond",
    "obj",
    "this",
    "by_id",
    "bind",
    # anywidget host (optional; requires the `widget` extra)
    "Widget",
]


def __getattr__(name: str):
    # `Widget` pulls in anywidget (an optional dep), so load it lazily — `import spaday` stays light.
    if name == "Widget":
        from .widget import Widget

        return Widget
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
