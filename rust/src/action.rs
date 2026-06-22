//! The declarative action DSL — behavior as serializable data (Phase 2).
//!
//! An [`Action`] is the typed event-handler model the component tree carries (replacing the Phase 0
//! `Action(Value)` placeholder). It is *data, not code*: authored in Python, serialized as the
//! canonical wire form defined here, and evaluated in the browser by the wasm interpreter (the `js`
//! crate) against DOM primitives the browser supplies — there is no `eval`. The core owns the model
//! and the wire format so both bindings agree on the shape.
//!
//! The wire form (matched by `spaday.actions` in Python and the runtime in JS):
//! - `Ref`:  `{"ref":"this"}` · `{"ref":"id","id":"panel"}`
//! - `Expr`: `{"expr":"lit","value":<json>}` · `{"expr":"event"}` · `{"expr":"not","of":<Expr>}`
//! - `Action`: `{"kind":"set",target,prop,value}` · `{"kind":"toggle",target,prop}` ·
//!   `{"kind":"seq","actions":[..]}` · `{"kind":"emit","event","detail":<Expr>|null}`

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
}
