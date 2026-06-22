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
    bind,
    by_id,
    event_value,
    lit,
    not_,
    prop,
    this,
)
from .cem import classes, generate
from .component import Component, element
from .spaday import apply, diff, parse_cem  # compiled Rust extension (rust/python)

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
    "this",
    "by_id",
    "bind",
]
