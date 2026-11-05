//! Store-driven behavior attached to a component's lifetime.
use crate::{Action, Expr};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, JsonSchema, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Effect {
    pub watch: Vec<String>,
    #[serde(default)]
    pub initial: bool,
    pub action: Action,
}

#[derive(Clone, Debug, JsonSchema, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Readiness {
    pub when: Expr,
    pub active: Expr,
    pub error: Expr,
    pub state: String,
    pub elements: Vec<String>,
    pub timeout: u32,
}

pub fn normalize_effect(json: &str) -> Result<String, String> {
    let effect: Effect = serde_json::from_str(json).map_err(|e| e.to_string())?;
    if effect.watch.is_empty() || effect.watch.iter().any(|field| field.trim().is_empty()) {
        return Err("effect watch requires at least one nonempty store field".into());
    }
    serde_json::to_string(&effect).map_err(|e| e.to_string())
}

pub fn normalize_readiness(json: &str) -> Result<String, String> {
    let readiness: Readiness = serde_json::from_str(json).map_err(|e| e.to_string())?;
    if readiness.state.trim().is_empty()
        || readiness.timeout == 0
        || readiness.timeout > i32::MAX as u32
    {
        return Err(
            "readiness requires a nonempty state field and timeout from 1 to 2147483647 ms".into(),
        );
    }
    if readiness
        .elements
        .iter()
        .any(|name| !name.contains('-') || name.chars().any(char::is_whitespace))
    {
        return Err("readiness elements must be custom-element names".into());
    }
    for expr in [&readiness.when, &readiness.active, &readiness.error] {
        validate_condition(expr, &readiness.state)?;
    }
    serde_json::to_string(&readiness).map_err(|e| e.to_string())
}

fn validate_condition(expr: &Expr, output: &str) -> Result<(), String> {
    match expr {
        Expr::Field { name } => {
            if name == output
                || name.starts_with(&format!("{output}."))
                || output.starts_with(&format!("{name}."))
            {
                return Err("readiness cannot depend on its own state field".into());
            }
        }
        Expr::Lit { .. } | Expr::Item { .. } | Expr::Scope { .. } => (),
        Expr::Not { of } => validate_condition(of, output)?,
        Expr::Eq { a, b } => {
            validate_condition(a, output)?;
            validate_condition(b, output)?;
        }
        Expr::All { of } | Expr::Any { of } | Expr::Arr { of } => {
            for value in of {
                validate_condition(value, output)?;
            }
        }
        Expr::Cond {
            test,
            then,
            otherwise,
        } => {
            for value in [test, then, otherwise] {
                validate_condition(value, output)?;
            }
        }
        Expr::Obj { fields } => {
            for value in fields.values() {
                validate_condition(value, output)?;
            }
        }
        Expr::Concat { parts } => {
            for value in parts {
                validate_condition(value, output)?;
            }
        }
        _ => {
            return Err(
                "readiness requires reactive expressions, not DOM or event expressions".into(),
            )
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{apply, diff, Node};
    use serde_json::json;

    #[test]
    fn behavior_changes_round_trip_without_replacing_nodes() {
        let old = Node::new("div");
        let mut new = old.clone();
        let effect = json!({"watch": ["path"], "initial": true, "action": {"kind": "clipboard", "value": {"expr": "field", "name": "url"}, "result": "copied"}});
        new.effects.insert(
            "copy".into(),
            serde_json::from_str(&normalize_effect(&effect.to_string()).unwrap()).unwrap(),
        );
        let readiness = json!({"when": {"expr": "field", "name": "loaded"}, "active": {"expr": "lit", "value": true}, "error": {"expr": "lit", "value": null}, "state": "view", "elements": [], "timeout": 1000});
        new.readiness = Some(
            serde_json::from_str(&normalize_readiness(&readiness.to_string()).unwrap()).unwrap(),
        );
        let patch = diff(&old, &new);
        assert_eq!(patch.len(), 2);
        let mut actual = old.clone();
        apply(&mut actual, &patch);
        assert_eq!(actual, new);
        apply(&mut actual, &diff(&new, &old));
        assert_eq!(actual, old);
        assert_eq!(serde_json::to_value(old).unwrap(), json!({"tag": "div"}));
    }

    #[test]
    fn readiness_rejects_event_expressions_and_feedback_loops() {
        let mut spec = json!({"when": {"expr": "event"}, "active": {"expr": "lit", "value": true}, "error": {"expr": "lit", "value": null}, "state": "view", "elements": [], "timeout": 1000});
        assert!(normalize_readiness(&spec.to_string())
            .unwrap_err()
            .contains("reactive"));
        spec["when"] = json!({"expr": "not", "of": {"expr": "field", "name": "view.error"}});
        assert!(normalize_readiness(&spec.to_string())
            .unwrap_err()
            .contains("own state"));
    }
}
