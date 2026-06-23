//! Custom Elements Manifest (CEM) parser — the binding-generator foundation.
//!
//! Web-component libraries publish a `custom-elements.json` (the [Custom Elements Manifest]) that
//! describes every element: its tag, attributes (with types and defaults), events, and slots.
//! [`parse_manifest`] reads one into a normalized [`ComponentSchema`] per element. The bindings then
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
    events: Vec<Named>,
    #[serde(default)]
    slots: Vec<Named>,
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

/// A normalized custom element: its tag, a class name, props, events, and slots.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ComponentSchema {
    pub tag_name: String,
    /// PascalCase class name derived from the tag, e.g. `wa-switch` → `WaSwitch`.
    pub class_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    pub props: Vec<PropSchema>,
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
            out.push(ComponentSchema {
                class_name: pascal_case(&tag_name),
                tag_name,
                summary: decl.summary.or(decl.description),
                props,
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

    #[test]
    fn test_pascal_case() {
        assert_eq!(pascal_case("wa-switch"), "WaSwitch");
        assert_eq!(pascal_case("wa-button-group"), "WaButtonGroup");
        assert_eq!(pascal_case("daggre-graph"), "DaggreGraph");
    }
}
