"""The native baseline: generic controls rendered with HTML form elements and small ``spa-*``
adapters where the DOM lacks a typed group value.

What a page gets with no design-system package selected, and the fallback for a control a design
does not describe. The runtime styles the elements (marked ``data-ui``) from the ``--spa-*`` shell
palette, so they follow the page mode and any app-level theme; see ``js/src/ts/ui.ts``.
"""

from __future__ import annotations

from .design import ControlSpec, Design, Open, Options, Part, Value, Wrap

_FIELD = Wrap(tag="label", props={"data-ui": "field"})
_GROUP = Wrap(tag="div", props={"data-ui": "field"})
_INLINE = Wrap(tag="label", props={"data-ui": "field", "data-inline": True})
_LABEL = Part(kind="sibling", tag="span", props={"data-ui": "label"})
_HELP = Part(kind="sibling", tag="span", props={"data-ui": "help"}, after=True)
_ERROR = Part(kind="sibling", tag="span", props={"data-ui": "error"}, after=True)
_FIELD_PROPS = {"disabled": "disabled", "required": "required", "readonly": "readonly", "name": "name", "size": "data-size"}

NATIVE = Design(
    name="native",
    controls={
        "button": ControlSpec(
            tag="button",
            fixed={"type": "button", "data-ui": "button"},
            label=Part(kind="text"),
            props={"intent": "data-intent", "appearance": "data-appearance", "size": "data-size", "disabled": "disabled", "name": "name"},
        ),
        "input": ControlSpec(
            tag="input",
            fixed={"data-ui": "input"},
            wrap=_FIELD,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={**_FIELD_PROPS, "placeholder": "placeholder", "type": "type"},
        ),
        "textarea": ControlSpec(
            tag="textarea",
            fixed={"data-ui": "textarea"},
            wrap=_FIELD,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={
                **_FIELD_PROPS,
                "placeholder": "placeholder",
                "rows": "rows",
                "minlength": "minlength",
                "maxlength": "maxlength",
            },
        ),
        "number-input": ControlSpec(
            tag="input",
            fixed={"type": "number", "step": "any", "data-ui": "number-input"},
            wrap=_FIELD,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={**_FIELD_PROPS, "placeholder": "placeholder", "min": "min", "max": "max", "step": "step"},
            value=Value(codec="number"),
        ),
        "date-input": ControlSpec(
            tag="input",
            fixed={"type": "date", "data-ui": "date-input"},
            wrap=_FIELD,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={**_FIELD_PROPS, "min": "min", "max": "max"},
        ),
        "checkbox": ControlSpec(
            tag="input",
            fixed={"type": "checkbox", "data-ui": "checkbox"},
            wrap=_INLINE,
            label=Part(kind="sibling", tag="span", props={"data-ui": "label"}, after=True),
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props=_FIELD_PROPS,
            value=Value(prop="checked"),
        ),
        "switch": ControlSpec(
            tag="input",
            fixed={"type": "checkbox", "role": "switch", "data-ui": "switch"},
            wrap=_INLINE,
            label=Part(kind="sibling", tag="span", props={"data-ui": "label"}, after=True),
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props=_FIELD_PROPS,
            value=Value(prop="checked"),
        ),
        "radio-group": ControlSpec(
            tag="spa-radio-group",
            fixed={"data-ui": "radio-group"},
            wrap=_GROUP,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={"disabled": "disabled", "required": "required", "name": "name", "size": "data-size"},
            options=Options(kind="prop", name="options", value="value", label="label", disabled="disabled"),
        ),
        "slider": ControlSpec(
            tag="input",
            fixed={"type": "range", "data-ui": "slider"},
            wrap=_FIELD,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={"disabled": "disabled", "required": "required", "name": "name", "size": "data-size", "min": "min", "max": "max", "step": "step"},
            value=Value(codec="number"),
        ),
        "select": ControlSpec(
            tag="spa-select",
            fixed={"data-ui": "select"},
            wrap=_FIELD,
            label=_LABEL,
            help=_HELP,
            error=_ERROR,
            invalid={"data-invalid": True},
            props={**_FIELD_PROPS, "placeholder": "placeholder"},
            options=Options(kind="prop", name="options", value="value", label="label", disabled="disabled"),
        ),
        "dialog": ControlSpec(
            tag="dialog",
            fixed={"data-ui": "dialog"},
            label=Part(kind="child", tag="h2", props={"data-ui": "title"}),
            open=Open(prop="open", event="close", methods=("showModal", "close")),
        ),
        "alert": ControlSpec(
            tag="div",
            fixed={"role": "alert", "data-ui": "alert"},
            label=Part(kind="child", tag="strong", props={"data-ui": "alert-title"}),
            props={"intent": "data-intent"},
        ),
        "progress": ControlSpec(
            tag="spa-progress",
            fixed={"data-ui": "progress"},
            wrap=_FIELD,
            label=_LABEL,
            props={"max": "max"},
        ),
    },
)
"""The native design."""

__all__ = ["NATIVE"]
