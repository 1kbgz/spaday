//! The declarative action DSL — behavior as serializable data.
//!
//! An [`Action`] is the typed event-handler model the component tree carries. It is *data, not code*:
//! authored in Python, serialized as the
//! canonical wire form defined here, and evaluated in the browser by the wasm interpreter (the `js`
//! crate) against DOM primitives the browser supplies — there is no `eval`. The core owns the model
//! and the wire format so both bindings agree on the shape.
//!
//! The wire form (matched by `spaday.actions` in Python and the runtime in JS):
//! - `Ref`:  `{"ref":"this"}` · `{"ref":"id","id":"panel"}`
//! - `Expr`: `{"expr":"lit","value":<json>}` · `{"expr":"event"}` · `{"expr":"not","of":<Expr>}` ·
//!   `{"expr":"prop","target":<Ref>,"name":"checked"}` · `{"expr":"field","name":"qty"}` ·
//!   `{"expr":"obj","fields":{<name>:<Expr>}}`
//! - `Action`: `{"kind":"set",target,prop,value}` · `{"kind":"toggle",target,prop}` ·
//!   `{"kind":"set-field","field","value":<Expr>}` · `{"kind":"toggle-field","field"}` ·
//!   `{"kind":"seq","actions":[..]}` · `{"kind":"emit","event","detail":<Expr>|null}` ·
//!   `{"kind":"patch","model","field","value":<Expr>}` ·
//!   `{"kind":"if","cond":<Expr>,"then":<Action>,"else":<Action>|null}` ·
//!   `{"kind":"call","method","url","body":<Expr>|null,"result":<string>|null}` ·
//!   `{"kind":"js","handler"}`

use serde::{Deserialize, Serialize};

/// Parse a serialized action (the canonical wire form) into an [`Action`]. Used by the wasm
/// interpreter so parsing/validation live in the core, not the binding.
pub fn parse_action(json: &str) -> Result<Action, String> {
    serde_json::from_str(json).map_err(|e| e.to_string())
}

/// A reference to a DOM element an action targets.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "ref", rename_all = "lowercase")]
pub enum Ref {
    /// The element the event fired on (the listener's element).
    This,
    /// The element with this `id` within the mounted tree.
    Id { id: String },
}

/// A value computed in the browser at event time.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "expr", rename_all = "lowercase")]
pub enum Expr {
    /// A literal (plain JSON) value.
    Lit { value: serde_json::Value },
    /// The triggering event's value — a control's `checked` (bool), else `value`, else `detail`.
    Event,
    /// Boolean negation of an expression.
    Not { of: Box<Expr> },
    /// The current value of a `name` prop on `target` (reads live element state).
    Prop { target: Ref, name: String },
    /// The current value of a reactive state `field` from the signal store the tree was mounted with —
    /// e.g. compose `CallEndpoint`'s body from a form's two-way-bound fields. (Also a binding expr.)
    Field { name: String },
    /// Compose a JSON object from named sub-expressions — e.g. a whole model as a `CallEndpoint` body:
    /// `{"expr":"obj","fields":{"symbol":{"expr":"prop","target":{"ref":"id","id":"sym"},"name":"value"}}}`.
    Obj {
        fields: std::collections::BTreeMap<String, Expr>,
    },
}

/// A declarative event handler, interpreted in the browser.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum Action {
    /// Set `prop` on `target` to `value`.
    #[serde(rename = "set")]
    SetProp {
        target: Ref,
        prop: String,
        value: Expr,
    },
    /// Flip a boolean `prop` on `target` (e.g. `hidden`, `checked`, `open`).
    #[serde(rename = "toggle")]
    Toggle { target: Ref, prop: String },
    /// Write `value` to a reactive state `field` in the signal store the tree was mounted with —
    /// the store-writing counterpart of the `field` expr, so a plain control can drive state.
    #[serde(rename = "set-field")]
    SetField { field: String, value: Expr },
    /// Flip a boolean state `field` in the signal store (e.g. a `dark` theme flag).
    #[serde(rename = "toggle-field")]
    ToggleField { field: String },
    /// Run several actions in order.
    #[serde(rename = "seq")]
    Sequence { actions: Vec<Action> },
    /// Dispatch a (bubbling) custom event named `event` with an optional `detail`.
    #[serde(rename = "emit")]
    Emit {
        event: String,
        #[serde(default)]
        detail: Option<Expr>,
    },
    /// Set `field` to `value` on a host-routed model (e.g. a transports model named `model`). The
    /// interpreter surfaces this as a patch intent; the app routes it to the actual wire.
    #[serde(rename = "patch")]
    SendPatch {
        model: String,
        field: String,
        value: Expr,
    },
    /// Run `then` if `cond` is truthy, else `els` (if present).
    #[serde(rename = "if")]
    If {
        cond: Expr,
        then: Box<Action>,
        #[serde(rename = "else", default)]
        els: Option<Box<Action>>,
    },
    /// A REST round-trip: `method` `url` with an optional JSON `body`. The one intentional server call
    /// (the interpreter performs it via the host's `fetch`). With `result`, the host writes the
    /// response as `{status, ok, body}` to that signal-store field on completion, so the outcome can
    /// drive reactive UI (e.g. show a 422 validation error) — otherwise fire-and-forget.
    #[serde(rename = "call")]
    CallEndpoint {
        method: String,
        url: String,
        #[serde(default)]
        body: Option<Expr>,
        #[serde(default)]
        result: Option<String>,
    },
    /// The escape hatch: invoke a pre-registered named JS handler (no arbitrary `eval`). For the rare
    /// irreducible case the declarative actions can't express.
    #[serde(rename = "js")]
    NamedJs { handler: String },
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// Assert the action serializes to exactly `wire` and parses back — locking the cross-binding form.
    fn round(action: &Action, wire: serde_json::Value) {
        assert_eq!(serde_json::to_value(action).unwrap(), wire, "serialize");
        assert_eq!(
            &serde_json::from_value::<Action>(wire).unwrap(),
            action,
            "deserialize"
        );
    }

    #[test]
    fn toggle_on_this() {
        round(
            &Action::Toggle {
                target: Ref::This,
                prop: "hidden".into(),
            },
            json!({"kind": "toggle", "target": {"ref": "this"}, "prop": "hidden"}),
        );
    }

    #[test]
    fn setprop_by_id_with_not_event() {
        round(
            &Action::SetProp {
                target: Ref::Id { id: "panel".into() },
                prop: "hidden".into(),
                value: Expr::Not {
                    of: Box::new(Expr::Event),
                },
            },
            json!({
                "kind": "set",
                "target": {"ref": "id", "id": "panel"},
                "prop": "hidden",
                "value": {"expr": "not", "of": {"expr": "event"}},
            }),
        );
    }

    #[test]
    fn setprop_with_literal() {
        round(
            &Action::SetProp {
                target: Ref::This,
                prop: "type".into(),
                value: Expr::Lit {
                    value: json!("area"),
                },
            },
            json!({"kind": "set", "target": {"ref": "this"}, "prop": "type", "value": {"expr": "lit", "value": "area"}}),
        );
    }

    #[test]
    fn sequence_and_emit_with_detail() {
        round(
            &Action::Sequence {
                actions: vec![
                    Action::Toggle {
                        target: Ref::This,
                        prop: "hidden".into(),
                    },
                    Action::Emit {
                        event: "opened".into(),
                        detail: Some(Expr::Lit { value: json!(true) }),
                    },
                ],
            },
            json!({
                "kind": "seq",
                "actions": [
                    {"kind": "toggle", "target": {"ref": "this"}, "prop": "hidden"},
                    {"kind": "emit", "event": "opened", "detail": {"expr": "lit", "value": true}},
                ],
            }),
        );
    }

    #[test]
    fn send_patch_wire() {
        round(
            &Action::SendPatch {
                model: "global".into(),
                field: "type".into(),
                value: Expr::Event,
            },
            json!({"kind": "patch", "model": "global", "field": "type", "value": {"expr": "event"}}),
        );
    }

    #[test]
    fn if_with_prop_cond_and_else_wire() {
        round(
            &Action::If {
                cond: Expr::Prop {
                    target: Ref::Id { id: "sw".into() },
                    name: "checked".into(),
                },
                then: Box::new(Action::Toggle {
                    target: Ref::This,
                    prop: "hidden".into(),
                }),
                els: Some(Box::new(Action::Emit {
                    event: "off".into(),
                    detail: None,
                })),
            },
            json!({
                "kind": "if",
                "cond": {"expr": "prop", "target": {"ref": "id", "id": "sw"}, "name": "checked"},
                "then": {"kind": "toggle", "target": {"ref": "this"}, "prop": "hidden"},
                "else": {"kind": "emit", "event": "off", "detail": null},
            }),
        );
    }

    #[test]
    fn if_without_else_serializes_null() {
        round(
            &Action::If {
                cond: Expr::Event,
                then: Box::new(Action::Toggle {
                    target: Ref::This,
                    prop: "hidden".into(),
                }),
                els: None,
            },
            json!({"kind": "if", "cond": {"expr": "event"}, "then": {"kind": "toggle", "target": {"ref": "this"}, "prop": "hidden"}, "else": null}),
        );
    }

    #[test]
    fn call_endpoint_wire() {
        round(
            &Action::CallEndpoint {
                method: "POST".into(),
                url: "/api/order".into(),
                body: Some(Expr::Event),
                result: None,
            },
            json!({"kind": "call", "method": "POST", "url": "/api/order", "body": {"expr": "event"}, "result": null}),
        );
        round(
            &Action::CallEndpoint {
                method: "GET".into(),
                url: "/ping".into(),
                body: None,
                result: None,
            },
            json!({"kind": "call", "method": "GET", "url": "/ping", "body": null, "result": null}),
        );
    }

    #[test]
    fn call_endpoint_with_result_field() {
        // the result field routes the response {status, ok, body} into the signal store
        round(
            &Action::CallEndpoint {
                method: "POST".into(),
                url: "/api/order".into(),
                body: Some(Expr::Event),
                result: Some("order_result".into()),
            },
            json!({"kind": "call", "method": "POST", "url": "/api/order", "body": {"expr": "event"}, "result": "order_result"}),
        );
    }

    #[test]
    fn call_endpoint_without_result_also_parses() {
        // pre-`result` wire (no key at all) still parses — the field defaults to None
        let a: Action =
            serde_json::from_value(json!({"kind": "call", "method": "GET", "url": "/ping"}))
                .unwrap();
        assert_eq!(
            a,
            Action::CallEndpoint {
                method: "GET".into(),
                url: "/ping".into(),
                body: None,
                result: None,
            }
        );
    }

    #[test]
    fn set_field_wire() {
        round(
            &Action::SetField {
                field: "qty".into(),
                value: Expr::Event,
            },
            json!({"kind": "set-field", "field": "qty", "value": {"expr": "event"}}),
        );
    }

    #[test]
    fn toggle_field_wire() {
        round(
            &Action::ToggleField {
                field: "dark".into(),
            },
            json!({"kind": "toggle-field", "field": "dark"}),
        );
    }

    #[test]
    fn named_js_wire() {
        round(
            &Action::NamedJs {
                handler: "confetti".into(),
            },
            json!({"kind": "js", "handler": "confetti"}),
        );
    }

    #[test]
    fn emit_without_detail_serializes_null() {
        // matches the Python authoring (detail key present, null) and the JS `detail != null` check
        round(
            &Action::Emit {
                event: "ping".into(),
                detail: None,
            },
            json!({"kind": "emit", "event": "ping", "detail": null}),
        );
    }

    #[test]
    fn missing_detail_also_parses() {
        let a: Action = serde_json::from_value(json!({"kind": "emit", "event": "ping"})).unwrap();
        assert_eq!(
            a,
            Action::Emit {
                event: "ping".into(),
                detail: None
            }
        );
    }

    #[test]
    fn call_endpoint_with_obj_body() {
        let mut fields = std::collections::BTreeMap::new();
        fields.insert(
            "symbol".to_string(),
            Expr::Prop {
                target: Ref::Id { id: "sym".into() },
                name: "value".into(),
            },
        );
        fields.insert("qty".to_string(), Expr::Lit { value: json!(10) });
        round(
            &Action::CallEndpoint {
                method: "POST".into(),
                url: "/api/order".into(),
                body: Some(Expr::Obj { fields }),
                result: None,
            },
            json!({
                "kind": "call",
                "method": "POST",
                "url": "/api/order",
                "body": {"expr": "obj", "fields": {
                    "qty": {"expr": "lit", "value": 10},
                    "symbol": {"expr": "prop", "target": {"ref": "id", "id": "sym"}, "name": "value"},
                }},
                "result": null,
            }),
        );
    }

    #[test]
    fn obj_body_from_store_fields() {
        // the csp-gateway pattern: POST a whole model composed from the form's two-way-bound store fields
        let mut fields = std::collections::BTreeMap::new();
        fields.insert("qty".to_string(), Expr::Field { name: "qty".into() });
        fields.insert(
            "symbol".to_string(),
            Expr::Field {
                name: "symbol".into(),
            },
        );
        round(
            &Action::CallEndpoint {
                method: "POST".into(),
                url: "/api/order".into(),
                body: Some(Expr::Obj { fields }),
                result: None,
            },
            json!({
                "kind": "call",
                "method": "POST",
                "url": "/api/order",
                "body": {"expr": "obj", "fields": {
                    "qty": {"expr": "field", "name": "qty"},
                    "symbol": {"expr": "field", "name": "symbol"},
                }},
                "result": null,
            }),
        );
    }
}
