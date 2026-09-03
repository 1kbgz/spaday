"""Serializable metadata for component catalogs."""

from __future__ import annotations

from typing import Any, Literal, Mapping

from pydantic import BaseModel, ConfigDict

PropertyKind = Literal["string", "boolean", "number", "enum", "json"]


class PropertySchema(BaseModel):
    """One editable DOM property exposed by a component."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    name: str
    kind: PropertyKind
    choices: tuple[str, ...] = ()
    #: The manifest's declared type, carried only for ``json`` props — the kind that says nothing about
    #: shape. An author cannot tell ``{rows, cols, values}`` from a matrix without it, and the browser
    #: reports the difference as a setter throwing far from the mistake.
    type_text: str | None = None
    default: str | None = None
    description: str | None = None

    def __repr_args__(self) -> Any:
        """Drop an absent ``type_text``, so the kinds that describe themselves — every prop but the
        ``json`` ones — generate exactly as they did before it existed."""
        return [(name, value) for name, value in super().__repr_args__() if name != "type_text" or value]

    def to_dict(self) -> dict[str, Any]:
        """Return JSON-serializable catalog data."""
        value: dict[str, Any] = {"name": self.name, "kind": self.kind}
        if self.choices:
            value["choices"] = list(self.choices)
        if self.type_text is not None:
            value["type_text"] = self.type_text
        if self.default is not None:
            value["default"] = self.default
        if self.description is not None:
            value["description"] = self.description
        return value


class ComponentSchema(BaseModel):
    """Catalog metadata for one component class and custom-element tag."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    tag: str
    class_name: str
    summary: str | None = None
    props: tuple[PropertySchema, ...] = ()
    #: Property-only inputs — public fields the element declares with no attribute of their own, so a
    #: manifest leaves them out of ``props``. A data component's payload (an object no attribute can
    #: express) lives here; authors set one exactly like a prop and the runtime writes the property.
    fields: tuple[PropertySchema, ...] = ()
    events: tuple[str, ...] = ()
    slots: tuple[str, ...] = ()

    @classmethod
    def from_cem(cls, schema: Mapping[str, Any]) -> ComponentSchema:
        """Build catalog metadata from spaday's normalized CEM schema."""
        return cls(
            tag=schema["tag_name"],
            class_name=schema["class_name"],
            summary=schema.get("summary"),
            props=tuple(_property_from_cem(prop) for prop in schema.get("props", ())),
            fields=tuple(_property_from_cem(prop) for prop in schema.get("fields", ())),
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
        if self.fields:  # omitted when empty, as PropertySchema omits its own empty entries
            value["fields"] = [prop.to_dict() for prop in self.fields]
        if self.summary is not None:
            value["summary"] = self.summary
        return value


def _property_from_cem(prop: Mapping[str, Any]) -> PropertySchema:
    kind, choices = _property_type(prop.get("ty"))
    return PropertySchema(
        name=prop["name"],
        kind=kind,
        choices=choices,
        type_text=prop.get("type_text"),
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
