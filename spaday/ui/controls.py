"""Generic controls that any design system renders.

An application authors these once — ``Button(label="Save", intent="primary")`` — and the page's
:class:`~spaday.ui.design.Design` decides which element that becomes: a ``wa-button``, a
``ui5-button``, a ``vaadin-button``, or the native baseline's ``<button>``. The controls share one
vocabulary, sized to what every design can express:

- ``label`` (a button's text, a field's caption, a dialog's title), ``help`` (a hint under a
  field) and ``error`` (a validation message, which also marks the field invalid);
- ``disabled``, ``required``, ``readonly``, ``name``;
- ``intent`` — ``neutral`` / ``primary`` / ``info`` / ``success`` / ``warning`` / ``danger`` — the
  same tones the shell palette carries; ``appearance`` — ``filled`` / ``outline`` / ``plain``;
  ``size`` — ``sm`` / ``md`` / ``lg``;
- ``value``, the prop to bind: a string for text and dates, a number for numeric controls, a boolean
  for a checkbox or switch, or a scalar option value for select and radio controls;
- ``open`` for a dialog.

A control serializes to a ``ui-*`` node carrying that vocabulary; :func:`spaday.ui.resolve` turns it
into the design's elements before the tree leaves Python, so the browser only ever sees concrete
tags. A design that lacks a control falls back to the native baseline. What a design cannot express
is dropped rather than half-rendered; :meth:`Control.for_design` sets a design's own props on one
control where that matters.
"""

from __future__ import annotations

from typing import Any, ClassVar, Literal

from ..catalog import ComponentSchema, PropertySchema
from ..component import Child, Component
from .design import OVERRIDES_PROP

INTENTS = ("neutral", "primary", "info", "success", "warning", "danger")
APPEARANCES = ("filled", "outline", "plain")
SIZES = ("sm", "md", "lg")
INPUT_TYPES = ("text", "password", "email", "search", "tel", "url")

Intent = Literal["neutral", "primary", "info", "success", "warning", "danger"]
Appearance = Literal["filled", "outline", "plain"]
Size = Literal["sm", "md", "lg"]


def _prop(name: str, kind: str, description: str, choices: tuple[str, ...] = (), type_text: str | None = None) -> PropertySchema:
    return PropertySchema(name=name, kind=kind, choices=choices, description=description, type_text=type_text)


_LABEL = _prop("label", "string", "The control's caption: a button's text, a field's label, a dialog's title.")
_HELP = _prop("help", "string", "Help text shown with the control.")
_ERROR = _prop("error", "string", "A validation message; while set, the control shows as invalid.")
_DISABLED = _prop("disabled", "boolean", "Whether the control takes input.")
_REQUIRED = _prop("required", "boolean", "Whether a value is required.")
_READONLY = _prop("readonly", "boolean", "Whether the value can be edited.")
_NAME = _prop("name", "string", "The control's form name.")
_INTENT = _prop("intent", "enum", "The tone: neutral, primary, or one of the shell palette's info / success / warning / danger.", INTENTS)
_APPEARANCE = _prop("appearance", "enum", "How the tone is drawn: filled, outline, or plain.", APPEARANCES)
_SIZE = _prop("size", "enum", "The control's size.", SIZES)
_VALUE_TEXT = _prop("value", "string", "The value; bind it two-way to a store field.")
_VALUE_NUMBER = _prop("value", "number", "The numeric value; bind it two-way to a store field.")
_MIN_NUMBER = _prop("min", "number", "The minimum allowed value.")
_MAX_NUMBER = _prop("max", "number", "The maximum allowed value.")
_STEP = _prop("step", "number", "The interval between allowed values.")
_OVERRIDES = _prop(OVERRIDES_PROP, "json", "Per-design props, set with for_design().", type_text="Record<string, Record<string, unknown>>")


class Control(Component):
    """Base of the generic controls: a ``ui-<kind>`` node any design renders."""

    kind: ClassVar[str] = ""

    def __init__(self, *children: Child, key: str | None = None, props: dict[str, Any] | None = None, **attrs: Any) -> None:
        super().__init__(*children, key=key, props=props, **attrs)

    def for_design(self, design: str, **props: Any) -> Control:
        """Props set on the element only when ``design`` renders this control — the design's own
        spelling for what the generic vocabulary leaves out (``for_design("webawesome", pill=True)``).
        Applied after the generic props, so they can also override one."""
        overrides = dict(self._props.get(OVERRIDES_PROP) or {})
        overrides[design] = {**overrides.get(design, {}), **{k: v for k, v in props.items() if v is not None}}
        self._props[OVERRIDES_PROP] = overrides
        return self


class Button(Control):
    """A button. Its ``label`` is its text; attach behavior with ``.on("click", …)``.

    ``Button(label="Save", intent="primary").on("click", SetField("saved", True))``
    """

    kind = "button"
    tag = "ui-button"
    schema = ComponentSchema(
        tag="ui-button",
        class_name="Button",
        summary="A button any design renders.",
        props=(_LABEL, _INTENT, _APPEARANCE, _SIZE, _DISABLED, _NAME, _OVERRIDES),
        events=("click",),
        slots=("",),
    )

    def __init__(
        self,
        *children: Child,
        label: str | None = None,
        intent: Intent | None = None,
        appearance: Appearance | None = None,
        size: Size | None = None,
        disabled: bool | None = None,
        name: str | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            *children,
            key=key,
            props={"label": label, "intent": intent, "appearance": appearance, "size": size, "disabled": disabled, "name": name},
            **props,
        )


class TextInput(Control):
    """A single-line text input. Bind ``value`` (a string) two-way to a store field.

    ``TextInput(label="Name", placeholder="Ada").bind("value", "name", mode="two-way")``
    """

    kind = "input"
    tag = "ui-input"
    schema = ComponentSchema(
        tag="ui-input",
        class_name="TextInput",
        summary="A text input any design renders.",
        props=(
            _LABEL,
            _HELP,
            _ERROR,
            _VALUE_TEXT,
            _prop("placeholder", "string", "Text shown while empty."),
            _prop("type", "enum", "The input type.", INPUT_TYPES),
            _DISABLED,
            _REQUIRED,
            _READONLY,
            _NAME,
            _SIZE,
            _OVERRIDES,
        ),
        events=("change", "input"),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        value: str | None = None,
        placeholder: str | None = None,
        type: Literal["text", "password", "email", "search", "tel", "url"] | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        readonly: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "value": value,
                "placeholder": placeholder,
                "type": type,
                "disabled": disabled,
                "required": required,
                "readonly": readonly,
                "name": name,
                "size": size,
            },
            **props,
        )


class TextArea(Control):
    """A multiline text input. Bind ``value`` (a string) two-way to a store field."""

    kind = "textarea"
    tag = "ui-textarea"
    schema = ComponentSchema(
        tag="ui-textarea",
        class_name="TextArea",
        summary="A multiline text input any design renders.",
        props=(
            _LABEL,
            _HELP,
            _ERROR,
            _VALUE_TEXT,
            _prop("placeholder", "string", "Text shown while empty."),
            _prop("rows", "number", "The visible number of text rows."),
            _prop("minlength", "number", "The minimum text length."),
            _prop("maxlength", "number", "The maximum text length."),
            _DISABLED,
            _REQUIRED,
            _READONLY,
            _NAME,
            _SIZE,
            _OVERRIDES,
        ),
        events=("change", "input"),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        value: str | None = None,
        placeholder: str | None = None,
        rows: int | None = None,
        minlength: int | None = None,
        maxlength: int | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        readonly: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "value": value,
                "placeholder": placeholder,
                "rows": rows,
                "minlength": minlength,
                "maxlength": maxlength,
                "disabled": disabled,
                "required": required,
                "readonly": readonly,
                "name": name,
                "size": size,
            },
            **props,
        )


class NumberInput(Control):
    """A numeric input. Its value is a number, or ``None`` while an optional field is empty."""

    kind = "number-input"
    tag = "ui-number-input"
    schema = ComponentSchema(
        tag="ui-number-input",
        class_name="NumberInput",
        summary="A numeric input any design renders.",
        props=(
            _LABEL,
            _HELP,
            _ERROR,
            _VALUE_NUMBER,
            _MIN_NUMBER,
            _MAX_NUMBER,
            _STEP,
            _prop("placeholder", "string", "Text shown while empty."),
            _DISABLED,
            _REQUIRED,
            _READONLY,
            _NAME,
            _SIZE,
            _OVERRIDES,
        ),
        events=("change", "input"),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        value: int | float | None = None,
        min: int | float | None = None,
        max: int | float | None = None,
        step: int | float | None = None,
        placeholder: str | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        readonly: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "value": value,
                "min": min,
                "max": max,
                "step": step,
                "placeholder": placeholder,
                "disabled": disabled,
                "required": required,
                "readonly": readonly,
                "name": name,
                "size": size,
            },
            **props,
        )


class DateInput(Control):
    """A calendar-date input whose value, minimum and maximum are ISO ``YYYY-MM-DD`` strings."""

    kind = "date-input"
    tag = "ui-date-input"
    schema = ComponentSchema(
        tag="ui-date-input",
        class_name="DateInput",
        summary="An ISO calendar-date input any design renders.",
        props=(
            _LABEL,
            _HELP,
            _ERROR,
            _VALUE_TEXT,
            _prop("min", "string", "The earliest ISO date allowed."),
            _prop("max", "string", "The latest ISO date allowed."),
            _DISABLED,
            _REQUIRED,
            _READONLY,
            _NAME,
            _SIZE,
            _OVERRIDES,
        ),
        events=("change", "input"),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        value: str | None = None,
        min: str | None = None,
        max: str | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        readonly: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "value": value,
                "min": min,
                "max": max,
                "disabled": disabled,
                "required": required,
                "readonly": readonly,
                "name": name,
                "size": size,
            },
            **props,
        )


class _Toggle(Control):
    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        value: bool | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "value": value,
                "disabled": disabled,
                "required": required,
                "name": name,
                "size": size,
            },
            **props,
        )


_TOGGLE_PROPS = (
    _LABEL,
    _HELP,
    _ERROR,
    _prop("value", "boolean", "Whether it is on; bind it two-way to a store field."),
    _DISABLED,
    _REQUIRED,
    _NAME,
    _SIZE,
    _OVERRIDES,
)


class Checkbox(_Toggle):
    """A checkbox. Its ``value`` is a boolean; bind it two-way.

    ``Checkbox(label="Agree").bind("value", "agree", mode="two-way")``
    """

    kind = "checkbox"
    tag = "ui-checkbox"
    schema = ComponentSchema(
        tag="ui-checkbox", class_name="Checkbox", summary="A checkbox any design renders.", props=_TOGGLE_PROPS, events=("change",), slots=()
    )


class Switch(_Toggle):
    """An on/off switch. Its ``value`` is a boolean; bind it two-way. (Exported at the top level as
    ``ToggleSwitch``, beside the shell's ``Switch`` router.)

    ``Switch(label="Dark theme").bind("value", "dark", mode="two-way")``
    """

    kind = "switch"
    tag = "ui-switch"
    schema = ComponentSchema(
        tag="ui-switch", class_name="Switch", summary="A switch any design renders.", props=_TOGGLE_PROPS, events=("change",), slots=()
    )


_OPTIONS = _prop(
    "options",
    "json",
    "Choices as scalar values or {value, label, disabled} objects.",
    type_text="Array<string | number | boolean | {value: string | number | boolean, label: string, disabled?: boolean}>",
)
_CHOICE_VALUE = _prop("value", "json", "The selected scalar value; bind it two-way to a store field.", type_text="string | number | boolean")


class RadioGroup(Control):
    """A single-choice group over ``options``. Values may be strings, numbers or booleans."""

    kind = "radio-group"
    tag = "ui-radio-group"
    schema = ComponentSchema(
        tag="ui-radio-group",
        class_name="RadioGroup",
        summary="A radio group any design renders.",
        props=(_LABEL, _HELP, _ERROR, _OPTIONS, _CHOICE_VALUE, _DISABLED, _REQUIRED, _NAME, _SIZE, _OVERRIDES),
        events=("change",),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        options: list[Any] | None = None,
        value: str | int | float | bool | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "options": list(options) if options is not None else None,
                "value": value,
                "disabled": disabled,
                "required": required,
                "name": name,
                "size": size,
            },
            **props,
        )


class Slider(Control):
    """A single-thumb numeric slider."""

    kind = "slider"
    tag = "ui-slider"
    schema = ComponentSchema(
        tag="ui-slider",
        class_name="Slider",
        summary="A single-thumb numeric slider any design renders.",
        props=(
            _LABEL,
            _HELP,
            _ERROR,
            _VALUE_NUMBER,
            _MIN_NUMBER,
            _MAX_NUMBER,
            _STEP,
            _DISABLED,
            _REQUIRED,
            _NAME,
            _SIZE,
            _OVERRIDES,
        ),
        events=("change", "input"),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        value: int | float | None = None,
        min: int | float | None = None,
        max: int | float | None = None,
        step: int | float | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "value": value,
                "min": min,
                "max": max,
                "step": step,
                "disabled": disabled,
                "required": required,
                "name": name,
                "size": size,
            },
            **props,
        )


class Select(Control):
    """A single-choice select over scalar values or ``{value, label, disabled}`` objects. Bind
    ``value`` two-way.

    ``Select(label="Plan", options=["basic", "plus"]).bind("value", "plan", mode="two-way")``

    A design renders the options as child elements or as a property; binding ``options`` to a store
    field is only possible with a design that takes them as a property.
    """

    kind = "select"
    tag = "ui-select"
    schema = ComponentSchema(
        tag="ui-select",
        class_name="Select",
        summary="A select any design renders.",
        props=(
            _LABEL,
            _HELP,
            _ERROR,
            _OPTIONS,
            _CHOICE_VALUE,
            _prop("placeholder", "string", "Text shown while nothing is chosen."),
            _DISABLED,
            _REQUIRED,
            _NAME,
            _SIZE,
            _OVERRIDES,
        ),
        events=("change",),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        help: str | None = None,
        error: str | None = None,
        options: list[Any] | None = None,
        value: str | int | float | bool | None = None,
        placeholder: str | None = None,
        disabled: bool | None = None,
        required: bool | None = None,
        name: str | None = None,
        size: Size | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(
            key=key,
            props={
                "label": label,
                "help": help,
                "error": error,
                "options": list(options) if options is not None else None,
                "value": value,
                "placeholder": placeholder,
                "disabled": disabled,
                "required": required,
                "name": name,
                "size": size,
            },
            **props,
        )


class Dialog(Control):
    """A modal dialog whose children are its content and whose ``label`` is its title. Bind ``open``
    two-way: the field opens and closes it, and a close the dialog does itself (Escape) writes the
    field back.

    ``Dialog(Paragraph("Saved."), Button(label="OK").on("click", SetField("open", False)), label="Done").bind("open", "open", mode="two-way")``
    """

    kind = "dialog"
    tag = "ui-dialog"
    schema = ComponentSchema(
        tag="ui-dialog",
        class_name="Dialog",
        summary="A dialog any design renders.",
        props=(_LABEL, _prop("open", "boolean", "Whether it is open; bind it two-way to a store field."), _OVERRIDES),
        events=("close",),
        slots=("",),
    )

    def __init__(self, *children: Child, label: str | None = None, open: bool | None = None, key: str | None = None, **props: Any) -> None:
        super().__init__(*children, key=key, props={"label": label, "open": open}, **props)


class Alert(Control):
    """A message that needs the user's attention. Its children are the message body."""

    kind = "alert"
    tag = "ui-alert"
    schema = ComponentSchema(
        tag="ui-alert",
        class_name="Alert",
        summary="An alert any design renders.",
        props=(_LABEL, _INTENT, _OVERRIDES),
        events=(),
        slots=("",),
    )

    def __init__(
        self,
        *children: Child,
        label: str | None = None,
        intent: Intent | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(*children, key=key, props={"label": label, "intent": intent}, **props)


class Progress(Control):
    """Progress toward ``max``. Omit ``value`` for an indeterminate indicator."""

    kind = "progress"
    tag = "ui-progress"
    schema = ComponentSchema(
        tag="ui-progress",
        class_name="Progress",
        summary="A progress indicator any design renders.",
        props=(_LABEL, _VALUE_NUMBER, _MAX_NUMBER, _OVERRIDES),
        events=(),
        slots=(),
    )

    def __init__(
        self,
        *,
        label: str | None = None,
        value: int | float | None = None,
        max: int | float | None = None,
        key: str | None = None,
        **props: Any,
    ) -> None:
        super().__init__(key=key, props={"label": label, "value": value, "max": max}, **props)


CONTROLS: dict[str, type[Control]] = {
    cls.kind: cls
    for cls in (
        Alert,
        Button,
        Checkbox,
        DateInput,
        Dialog,
        NumberInput,
        Progress,
        RadioGroup,
        Select,
        Slider,
        Switch,
        TextArea,
        TextInput,
    )
}
"""Every generic control by kind — the keys a :class:`~spaday.ui.design.Design` describes."""

__all__ = [
    "APPEARANCES",
    "CONTROLS",
    "INTENTS",
    "SIZES",
    "Alert",
    "Button",
    "Checkbox",
    "Control",
    "DateInput",
    "Dialog",
    "NumberInput",
    "Progress",
    "RadioGroup",
    "Select",
    "Slider",
    "Switch",
    "TextArea",
    "TextInput",
]
