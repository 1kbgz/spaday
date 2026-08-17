"""Serializable metadata for component catalogs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Mapping

PropertyKind = Literal["string", "boolean", "number", "enum", "json"]


@dataclass(frozen=True)
class PropertySchema:
    """One editable DOM property exposed by a component."""

    name: str
    kind: PropertyKind
    choices: tuple[str, ...] = ()
    default: str | None = None
    description: str | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "choices", tuple(self.choices))

    def to_dict(self) -> dict[str, Any]:
        """Return JSON-serializable catalog data."""
        value: dict[str, Any] = {"name": self.name, "kind": self.kind}
        if self.choices:
            value["choices"] = list(self.choices)
        if self.default is not None:
            value["default"] = self.default
        if self.description is not None:
            value["description"] = self.description
        return value


@dataclass(frozen=True)
class ComponentSchema:
    """Catalog metadata for one component class and custom-element tag."""

    tag: str
    class_name: str
    summary: str | None = None
    props: tuple[PropertySchema, ...] = ()
    events: tuple[str, ...] = ()
    slots: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "props", tuple(self.props))
        object.__setattr__(self, "events", tuple(self.events))
        object.__setattr__(self, "slots", tuple(self.slots))

    @classmethod
    def from_cem(cls, schema: Mapping[str, Any]) -> ComponentSchema:
        """Build catalog metadata from spaday's normalized CEM schema."""
        return cls(
            tag=schema["tag_name"],
            class_name=schema["class_name"],
            summary=schema.get("summary"),
            props=tuple(_property_from_cem(prop) for prop in schema.get("props", ())),
            events=tuple(schema.get("events", ())),
            slots=tuple(schema.get("slots", ())),
        )

    def to_dict(self) -> dict[str, Any]:
        """Return JSON-serializable catalog data."""
        value: dict[str, Any] = {
            "tag": self.tag,
            "class_name": self.class_name,
            "props": [prop.to_dict() for prop in self.props],
            "events": list(self.events),
            "slots": list(self.slots),
        }
        if self.summary is not None:
            value["summary"] = self.summary
        return value


def _property_from_cem(prop: Mapping[str, Any]) -> PropertySchema:
    kind, choices = _property_type(prop.get("ty"))
    return PropertySchema(
        name=prop["name"],
        kind=kind,
        choices=choices,
        default=prop.get("default"),
        description=prop.get("doc"),
    )


def _property_type(value: Any) -> tuple[PropertyKind, tuple[str, ...]]:
    if isinstance(value, dict):
        if "Optional" in value:
            return _property_type(value["Optional"])
        if "Enum" in value:
            return "enum", tuple(value["Enum"])
    if value == "Bool":
        return "boolean", ()
    if value == "Str":
        return "string", ()
    if value == "Number":
        return "number", ()
    return "json", ()


__all__ = ["ComponentSchema", "PropertyKind", "PropertySchema"]
