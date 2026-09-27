"""Shared validation and JSON Schemas for declarative wire values."""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

from .spaday import (
    action_schema as _action_schema,
    binding_schema as _binding_schema,
    expr_schema as _expr_schema,
    normalize_action as _normalize_action,
    normalize_binding as _normalize_binding,
    normalize_expr as _normalize_expr,
)


def validate_action(value: object) -> dict[str, Any]:
    """Validate an action against the Rust-owned wire model and return its canonical form."""
    return _normalize(value, _normalize_action)


def validate_expr(value: object) -> dict[str, Any]:
    """Validate an expression against the Rust-owned wire model and return its canonical form."""
    return _normalize(value, _normalize_expr)


def validate_binding(value: object) -> dict[str, Any]:
    """Validate a binding against the Rust-owned wire model and return its canonical form."""
    return _normalize(value, _normalize_binding)


def action_schema() -> dict[str, Any]:
    """Return JSON Schema for the complete action wire model."""
    return json.loads(_action_schema())


def expr_schema() -> dict[str, Any]:
    """Return JSON Schema for the complete expression wire model."""
    return json.loads(_expr_schema())


def binding_schema() -> dict[str, Any]:
    """Return JSON Schema for the complete binding wire model."""
    return json.loads(_binding_schema())


def _normalize(value: object, validator: Callable[[str], str]) -> dict[str, Any]:
    serialized = json.dumps(value, allow_nan=False, separators=(",", ":"))
    normalized = json.loads(validator(serialized))
    if not isinstance(normalized, dict):
        raise TypeError("validated wire value must be an object")
    return normalized


__all__ = [
    "action_schema",
    "binding_schema",
    "expr_schema",
    "validate_action",
    "validate_binding",
    "validate_expr",
]
