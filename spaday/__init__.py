from . import actions
from .actions import (
    CallEndpoint,
    Emit,
    If,
    NamedJs,
    SendPatch,
    Sequence,
    SetProp,
    Toggle,
    all_,
    any_,
    bind,
    by_id,
    eq,
    event_value,
    field,
    lit,
    not_,
    prop,
    this,
)
from .cem import classes, generate
from .component import Component, element
from .spaday import apply, diff, parse_cem  # compiled Rust extension (rust/python)
from .validate import ValidationError, validate

__version__ = "0.1.0"

__all__ = [
    "__version__",
    # component-tree diff/patch (compiled core)
    "diff",
    "apply",
    # CEM binding generator
    "parse_cem",
    "generate",
    "classes",
    "Component",
    "element",
    # build-time validation
    "validate",
    "ValidationError",
    # action DSL (declarative behavior, run in the browser)
    "actions",
    "SetProp",
    "Toggle",
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
