//! Custom Elements Manifest (CEM) parser — the binding-generator foundation.
//!
//! Web-component libraries publish a `custom-elements.json` (the [Custom Elements Manifest]) that
//! describes every element: its tag, attributes (with types and defaults), class members, events, and
//! slots. [`parse_manifest`] reads one into a normalized [`ComponentSchema`] per element. The bindings then
//! render that schema two ways — build-time typed **Python** classes and a **JS** runtime registry —
//! so a UI authored in typed Python binds to the real web components. One parse, two outputs, the
//! same "one core, two bindings" shape as the diff engine.
//!
//! This layer is deliberately about *binding* only: attribute/slot/event structure. Event *handlers*
//! (the declarative action DSL) live in the [`crate::action`] module.
//!
//! [Custom Elements Manifest]: https://github.com/webcomponents/custom-elements-manifest

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Manifest {
    #[serde(default)]
    modules: Vec<Module>,
}

#[derive(Deserialize)]
struct Module {
    #[serde(default)]
    declarations: Vec<Declaration>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Declaration {
    #[serde(default)]
    custom_element: bool,
    tag_name: Option<String>,
    #[serde(default)]
    summary: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    attributes: Vec<Attribute>,
    #[serde(default)]
    members: Vec<Member>,
    #[serde(default)]
    events: Vec<Named>,
    #[serde(default)]
    slots: Vec<Named>,
}

/// A class member (`kind: "field"` or `"method"`). Only public, element-specific, writable fields with
/// no attribute of their own become [`ComponentSchema::fields`]; see [`is_authorable_field`].
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Member {
    kind: String,
    name: String,
    #[serde(default, rename = "type")]
    ty: Option<TypeText>,
    #[serde(default)]
    privacy: Option<String>,
    #[serde(default, rename = "static")]
    is_static: bool,
    #[serde(default)]
    readonly: bool,
    /// Present when the field is declared by a base class rather than this element.
    #[serde(default)]
    inherited_from: Option<serde_json::Value>,
    /// Present when the field is backed by an attribute (already carried by `attributes`).
    #[serde(default)]
    attribute: Option<String>,
    #[serde(default)]
    default: Option<String>,
    #[serde(default)]
    description: Option<String>,
}

#[derive(Deserialize)]
struct Attribute {
    name: String,
    #[serde(default, rename = "type")]
    ty: Option<TypeText>,
    #[serde(default)]
    default: Option<String>,
    #[serde(default)]
    description: Option<String>,
}

#[derive(Deserialize)]
struct TypeText {
    #[serde(default)]
    text: Option<String>,
}

#[derive(Deserialize)]
struct Named {
    name: String,
}

/// A normalized type for a component prop, derived from the manifest's TS type string.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum PropType {
    Bool,
    Str,
    Number,
    /// A string union, e.g. `'small' | 'medium' | 'large'`.
    Enum(Vec<String>),
    /// Nullable (`X | null` / `X | undefined`).
    Optional(Box<PropType>),
    /// Anything we don't model precisely (objects, arrays, functions, mixed unions).
    Any,
}

/// One bindable prop of a component (from a manifest `attribute`).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PropSchema {
    /// The attribute name as it appears on the element (the wire key), e.g. `"checked"`.
    pub name: String,
    pub ty: PropType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub doc: Option<String>,
}

/// A normalized custom element: its tag, a class name, props, property-only fields, events, and slots.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ComponentSchema {
    pub tag_name: String,
    /// PascalCase class name derived from the tag, e.g. `wa-switch` → `WaSwitch`.
    pub class_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    pub props: Vec<PropSchema>,
    /// Property-only inputs: public fields the element declares with no attribute of their own, so they
    /// are absent from `props`. Data components carry their payload here (an object a plain attribute
    /// cannot express), and the author sets one exactly like a prop — the runtime writes the property.
    #[serde(default)]
    pub fields: Vec<PropSchema>,
    pub events: Vec<String>,
    /// Slot names; the empty string is the default (unnamed) slot.
    pub slots: Vec<String>,
}

/// Parse a `custom-elements.json` into one [`ComponentSchema`] per custom element.
pub fn parse_manifest(json: &str) -> Result<Vec<ComponentSchema>, serde_json::Error> {
    let manifest: Manifest = serde_json::from_str(json)?;
    let mut out = Vec::new();
    for module in manifest.modules {
        for decl in module.declarations {
            if !decl.custom_element {
                continue;
            }
            let Some(tag_name) = decl.tag_name else {
                continue;
            };
            let props = decl
                .attributes
                .iter()
                .map(|a| PropSchema {
                    name: a.name.clone(),
                    ty: parse_type(a.ty.as_ref().and_then(|t| t.text.as_deref())),
                    default: clean_default(a.default.as_deref()),
                    doc: a.description.clone(),
                })
                .collect();
            let attribute_names: Vec<&str> =
                decl.attributes.iter().map(|a| a.name.as_str()).collect();
            let fields = decl
                .members
                .iter()
                .filter(|m| is_authorable_field(m, &attribute_names))
                .map(|m| PropSchema {
                    name: m.name.clone(),
                    ty: parse_type(m.ty.as_ref().and_then(|t| t.text.as_deref())),
                    default: clean_default(m.default.as_deref()),
                    doc: m.description.clone(),
                })
                .collect();
            out.push(ComponentSchema {
                class_name: pascal_case(&tag_name),
                tag_name,
                summary: decl.summary.or(decl.description),
                props,
                fields,
                events: decl.events.into_iter().map(|e| e.name).collect(),
                slots: decl.slots.into_iter().map(|s| s.name).collect(),
            });
        }
    }
    Ok(out)
}

/// String-in/string-out facade for the bindings: manifest JSON → schemas JSON.
pub fn parse_cem(json: &str) -> Result<String, serde_json::Error> {
    serde_json::to_string(&parse_manifest(json)?)
}

/// Whether a manifest member is a property-only input an author can set.
///
/// `members` is the element's whole class surface, most of which is not authorable: methods, private
/// and static members, base-class plumbing, and references into the element's own shadow tree. Excluded
/// in order: anything but a public instance field; a `#private`/`_internal` name; a field a base class
/// declares (`inheritedFrom`); a field backed by an attribute (`attribute`, or a name `attributes`
/// already carries — [`ComponentSchema::props`] describes those); a `readonly` field; a standard DOM
/// member (see [`DOM_MEMBERS`]); a field typed as a platform object (see [`is_platform_type`]); and a
/// callback field, which no serializable tree can carry. What survives is the payload-shaped surface an
/// attribute cannot express.
///
/// Deliberately conservative in one direction: an internal field that slips through only widens what
/// the schema accepts, while dropping a real input would leave authors with no way to name it.
fn is_authorable_field(m: &Member, attributes: &[&str]) -> bool {
    let ty = m.ty.as_ref().and_then(|t| t.text.as_deref()).unwrap_or("");
    m.kind == "field"
        && m.privacy.as_deref().unwrap_or("public") == "public"
        && !m.is_static
        && !m.readonly
        && !m.name.starts_with('#')
        && !m.name.starts_with('_')
        && m.inherited_from.is_none()
        && m.attribute.is_none()
        && !attributes.contains(&m.name.as_str())
        && !DOM_MEMBERS.contains(&m.name.as_str())
        && !is_platform_type(ty)
        && !ty.contains("=>") // a callback: behavior is authored as actions, never passed as a value
}

/// Members of `Element`, `HTMLElement` and `Node` that describe *any* element rather than this one.
///
/// A manifest that redeclares its base-class surface per element — rather than marking it
/// `inheritedFrom` — offers these as if they were the component's own inputs; one such catalog carried
/// `adoptedStyleSheets` on 34 of 40 elements. [`is_platform_type`] cannot reach them, because most are
/// declared as plain strings and booleans (`className: string`, `hidden: boolean`).
///
/// Scoped to the interfaces every element implements. Form-control members (`checked`, `value`, `type`,
/// `readOnly`, `disabled`, …) are deliberately absent: on a custom control those *are* the authored
/// input, and a manifest that declares one as a field with no attribute behind it means it.
const DOM_MEMBERS: &[&str] = &[
    "accessKey",
    "adoptedStyleSheets",
    "attributes",
    "autocapitalize",
    "autofocus",
    "classList",
    "className",
    "contentEditable",
    "dataset",
    "dir",
    "draggable",
    "enterKeyHint",
    "hidden",
    "id",
    "innerHTML",
    "innerText",
    "inert",
    "lang",
    "nodeValue",
    "nonce",
    "outerHTML",
    "outerText",
    "part",
    "popover",
    "shadowRoot",
    "slot",
    "spellcheck",
    "style",
    "tabIndex",
    "textContent",
    "title",
    "translate",
];

/// Browser and base-class objects a field can only hold a live instance of: DOM nodes, CSSOM sheets,
/// observers, the element's own internals. Enumerated rather than pattern-matched, because the platform
/// surface is finite and stable while application types are neither — a name this list does not know is
/// treated as an input.
const PLATFORM_TYPES: &[&str] = &[
    "AbortController",
    "AbortSignal",
    "CSSResult",
    "CSSResultArray",
    "CSSResultGroup",
    "CSSStyleDeclaration",
    "CSSStyleSheet",
    "Document",
    "DocumentFragment",
    "Element",
    "ElementInternals",
    "EventTarget",
    "IntersectionObserver",
    "MutationObserver",
    "Node",
    "NodeList",
    "ResizeObserver",
    "ShadowRoot",
    "StyleSheet",
    "StyleSheetList",
    "TemplateResult",
];

/// Whether every alternative of a TS type is a platform object (`CSSStyleSheet[]`,
/// `HTMLDivElement | undefined`, `ElementInternals`, …).
///
/// Such a field is never an input: no serializable value can be assigned to one. The check is by type
/// rather than by name, because names like `styles` or `data` are ambiguous across libraries while a
/// declared `CSSResultGroup` is not. A manifest that marks this plumbing `inheritedFrom`, `readonly` or
/// `static` is already filtered before reaching here; this catches the manifests that do not.
fn is_platform_type(text: &str) -> bool {
    let mut saw_platform = false;
    for member in text.split('|').map(str::trim).filter(|m| !m.is_empty()) {
        let member = unwrap_array(member);
        if member == "null" || member == "undefined" {
            continue;
        }
        let platform = PLATFORM_TYPES.contains(&member)
            || ((member.starts_with("HTML")
                || member.starts_with("SVG")
                || member.starts_with("MathML"))
                && member.ends_with("Element"));
        if !platform {
            return false;
        }
        saw_platform = true;
    }
    saw_platform
}

/// The element type of `T[]`, `Array<T>` or `ReadonlyArray<T>` — a collection of platform objects is
/// one too. Anything else is returned unchanged.
fn unwrap_array(text: &str) -> &str {
    let text = text.trim().trim_end_matches("[]").trim();
    for prefix in ["Array<", "ReadonlyArray<"] {
        if let Some(inner) = text.strip_prefix(prefix).and_then(|t| t.strip_suffix('>')) {
            return inner.trim().trim_end_matches("[]").trim();
        }
    }
    text
}

fn pascal_case(tag: &str) -> String {
    tag.split(['-', '_'])
        .filter(|s| !s.is_empty())
        .map(|s| {
            let mut c = s.chars();
            match c.next() {
                Some(first) => first.to_uppercase().chain(c).collect::<String>(),
                None => String::new(),
            }
        })
        .collect()
}

/// Map a TS type string (`type.text`) to a normalized [`PropType`].
fn parse_type(text: Option<&str>) -> PropType {
    let Some(text) = text else {
        return PropType::Any;
    };
    let members: Vec<&str> = text
        .split('|')
        .map(str::trim)
        .filter(|m| !m.is_empty())
        .collect();
    let nullable = members.iter().any(|m| *m == "null" || *m == "undefined");
    let rest: Vec<&str> = members
        .into_iter()
        .filter(|m| *m != "null" && *m != "undefined")
        .collect();
    let base = base_type(&rest);
    if nullable && base != PropType::Any {
        PropType::Optional(Box::new(base)) // `Optional(Any)` is redundant — keep it `Any`
    } else {
        base
    }
}

fn base_type(members: &[&str]) -> PropType {
    if members.is_empty() {
        return PropType::Any;
    }
    if members.iter().all(|m| is_quoted(m)) {
        return PropType::Enum(members.iter().map(|m| unquote(m).to_string()).collect());
    }
    if members.len() == 1 {
        return match members[0] {
            "boolean" => PropType::Bool,
            "string" => PropType::Str,
            "number" => PropType::Number,
            _ => PropType::Any,
        };
    }
    PropType::Any // mixed union (e.g. `string | number`)
}

fn is_quoted(s: &str) -> bool {
    let b = s.as_bytes();
    s.len() >= 2 && (b[0] == b'\'' || b[0] == b'"') && b[b.len() - 1] == b[0]
}

fn unquote(s: &str) -> &str {
    &s[1..s.len() - 1]
}

/// Normalize a manifest `default` (a JS literal string) into a plain value, or `None` if absent /
/// not a simple literal (complex defaults like `[styles]` are dropped — they aren't author-facing).
fn clean_default(text: Option<&str>) -> Option<String> {
    let text = text?.trim();
    match text {
        "" | "null" | "undefined" => None,
        "true" | "false" => Some(text.to_string()),
        _ if is_quoted(text) => Some(unquote(text).to_string()),
        _ if text.parse::<f64>().is_ok() => Some(text.to_string()),
        _ => None,
    }
}

#[cfg(test)]
mod cem_tests {
    use super::*;

    const MANIFEST: &str = r#"{
      "schemaVersion": "1.0.0",
      "modules": [
        { "declarations": [
          { "kind": "class", "name": "Helper", "customElement": false },
          {
            "kind": "class", "name": "WaSwitch", "customElement": true, "tagName": "wa-switch",
            "summary": "A toggle.",
            "attributes": [
              { "name": "checked", "type": {"text": "boolean"}, "default": "false", "description": "On/off." },
              { "name": "size", "type": {"text": "'small' | 'medium' | 'large'"}, "default": "'medium'" },
              { "name": "name", "type": {"text": "string | null"}, "default": "null" },
              { "name": "css", "type": {"text": "CSSResultGroup | undefined"}, "default": "[styles]" }
            ],
            "events": [ {"name": "change"}, {"name": "input"} ],
            "slots": [ {"name": ""}, {"name": "hint"} ]
          }
        ] }
      ]
    }"#;

    #[test]
    fn test_parse_filters_to_custom_elements() {
        let schemas = parse_manifest(MANIFEST).unwrap();
        assert_eq!(schemas.len(), 1);
        let s = &schemas[0];
        assert_eq!(s.tag_name, "wa-switch");
        assert_eq!(s.class_name, "WaSwitch");
        assert_eq!(s.summary.as_deref(), Some("A toggle."));
        assert_eq!(s.events, vec!["change", "input"]);
        assert_eq!(s.slots, vec!["", "hint"]);
    }

    #[test]
    fn test_prop_type_normalization() {
        let s = &parse_manifest(MANIFEST).unwrap()[0];
        let by = |n: &str| s.props.iter().find(|p| p.name == n).unwrap();
        assert_eq!(by("checked").ty, PropType::Bool);
        assert_eq!(by("checked").default.as_deref(), Some("false"));
        assert_eq!(
            by("size").ty,
            PropType::Enum(vec!["small".into(), "medium".into(), "large".into()])
        );
        assert_eq!(by("size").default.as_deref(), Some("medium"));
        assert_eq!(by("name").ty, PropType::Optional(Box::new(PropType::Str)));
        assert_eq!(by("name").default, None); // `null` ⇒ no default
        assert_eq!(by("css").ty, PropType::Any); // unmodeled type
    }

    #[test]
    fn test_parse_cem_round_trips_as_json() {
        let json = parse_cem(MANIFEST).unwrap();
        let back: Vec<ComponentSchema> = serde_json::from_str(&json).unwrap();
        assert_eq!(back, parse_manifest(MANIFEST).unwrap());
    }

    /// A data component: its payload is a *field* (an object no attribute can express), alongside the
    /// class surface a manifest also lists — methods, private/static/internal members, inherited and
    /// attribute-backed fields, and references into its own shadow tree.
    const FIELDS_MANIFEST: &str = r##"{
      "modules": [
        { "declarations": [
          {
            "kind": "class", "name": "SpaHeatmap", "customElement": true, "tagName": "spa-heatmap",
            "attributes": [ { "name": "digits", "type": {"text": "number"} } ],
            "members": [
              { "kind": "field", "name": "data", "type": {"text": "HeatmapData"}, "description": "The payload." },
              { "kind": "field", "name": "scale", "type": {"text": "'linear' | 'log'"}, "default": "'linear'" },
              { "kind": "method", "name": "render" },
              { "kind": "field", "name": "#buffer", "type": {"text": "number[]"} },
              { "kind": "field", "name": "_cache", "type": {"text": "object"} },
              { "kind": "field", "name": "internals", "privacy": "private", "type": {"text": "object"} },
              { "kind": "field", "name": "version", "static": true, "type": {"text": "string"} },
              { "kind": "field", "name": "digits", "type": {"text": "number"} },
              { "kind": "field", "name": "formAction", "attribute": "formaction", "type": {"text": "string"} },
              { "kind": "field", "name": "title", "type": {"text": "string"}, "inheritedFrom": {"name": "WaElement"} },
              { "kind": "field", "name": "validity", "readonly": true, "type": {"text": "ValidityState"} },
              { "kind": "field", "name": "canvas", "type": {"text": "HTMLCanvasElement | undefined"} },
              { "kind": "field", "name": "adoptedStyleSheets", "type": {"text": "CSSStyleSheet[]"} },
              { "kind": "field", "name": "styles", "type": {"text": "CSSResultGroup"} },
              { "kind": "field", "name": "internals", "type": {"text": "ElementInternals"} },
              { "kind": "field", "name": "className", "type": {"text": "string"} },
              { "kind": "field", "name": "hidden", "type": {"text": "boolean"} },
              { "kind": "field", "name": "checked", "type": {"text": "boolean"} },
              { "kind": "field", "name": "renderCell", "type": {"text": "(row: number) => string"} }
            ]
          }
        ] }
      ]
    }"##;

    #[test]
    fn test_fields_carry_property_only_inputs() {
        let s = &parse_manifest(FIELDS_MANIFEST).unwrap()[0];
        let names: Vec<&str> = s.fields.iter().map(|f| f.name.as_str()).collect();
        // `checked` stays: on a custom control a form-control member with no attribute behind it is
        // the authored input, unlike the DOM members every element carries
        assert_eq!(names, vec!["data", "scale", "checked"]);
        assert_eq!(
            s.props.iter().map(|p| p.name.as_str()).collect::<Vec<_>>(),
            vec!["digits"]
        );
        let data = &s.fields[0];
        assert_eq!(data.ty, PropType::Any); // an object type stays unmodeled, as a `json` attribute does
        assert_eq!(data.doc.as_deref(), Some("The payload."));
        assert_eq!(
            s.fields[1].ty,
            PropType::Enum(vec!["linear".into(), "log".into()])
        );
        assert_eq!(s.fields[1].default.as_deref(), Some("linear"));
    }

    #[test]
    fn test_dom_members_are_not_inputs_even_when_typed_as_primitives() {
        // a manifest that redeclares its base-class surface per element offers `className: string` and
        // `hidden: boolean` as if they were this component's inputs; no type check can catch those
        let s = &parse_manifest(FIELDS_MANIFEST).unwrap()[0];
        let names: Vec<&str> = s.fields.iter().map(|f| f.name.as_str()).collect();
        assert!(!names.contains(&"className"));
        assert!(!names.contains(&"hidden"));
        assert!(!names.contains(&"adoptedStyleSheets"));
    }

    #[test]
    fn test_platform_typed_fields_are_not_inputs() {
        assert!(is_platform_type("HTMLSlotElement"));
        assert!(is_platform_type(
            "HTMLInputElement | HTMLTextAreaElement | undefined"
        ));
        assert!(is_platform_type("SVGSVGElement"));
        assert!(is_platform_type("Element[]"));
        // the base-class surface a manifest may leave unmarked: Lit styles, adopted sheets, internals
        assert!(is_platform_type("CSSStyleSheet[]"));
        assert!(is_platform_type("CSSResultGroup"));
        assert!(is_platform_type("ElementInternals"));
        assert!(is_platform_type("Array<HTMLElement>"));
        assert!(is_platform_type("ReadonlyArray<CSSStyleSheet>"));
        assert!(!is_platform_type("")); // an untyped field is still an input
        assert!(!is_platform_type("HeatmapData"));
        assert!(!is_platform_type("SheetConfig")); // an application type that merely reads like one
        assert!(!is_platform_type("string | HTMLElement")); // a mixed union may still be authorable
    }

    #[test]
    fn test_a_manifest_without_members_has_no_fields() {
        assert!(parse_manifest(MANIFEST).unwrap()[0].fields.is_empty());
    }

    #[test]
    fn test_pascal_case() {
        assert_eq!(pascal_case("wa-switch"), "WaSwitch");
        assert_eq!(pascal_case("wa-button-group"), "WaButtonGroup");
        assert_eq!(pascal_case("daggre-graph"), "DaggreGraph");
    }
}
