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
    #[serde(default = "default_active")]
    pub active: Expr,
    #[serde(default = "default_error")]
    pub error: Expr,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub result: Option<String>,
    #[serde(default)]
    pub elements: Vec<String>,
    #[serde(default = "default_timeout")]
    pub timeout: u32,
}

fn default_active() -> Expr {
    Expr::Lit {
        value: serde_json::json!(true),
    }
}

fn default_error() -> Expr {
    Expr::Lit {
        value: serde_json::Value::Null,
    }
}

fn default_timeout() -> u32 {
    10000
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
    if readiness
        .result
        .as_ref()
        .is_some_and(|result| result.trim().is_empty())
        || readiness.timeout == 0
        || readiness.timeout > i32::MAX as u32
    {
        return Err(
            "readiness result must be nonempty when supplied; timeout must be from 1 to 2147483647 ms".into(),
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
        validate_condition(expr, readiness.result.as_deref())?;
    }
    serde_json::to_string(&readiness).map_err(|e| e.to_string())
}

fn validate_condition(expr: &Expr, output: Option<&str>) -> Result<(), String> {
    match expr {
        Expr::Field { name } => {
            if let Some(output) = output {
                if name == output
                    || name.starts_with(&format!("{output}."))
                    || output.starts_with(&format!("{name}."))
                {
                    return Err("readiness cannot depend on its own result field".into());
                }
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
    fn readiness_defaults_and_optional_result_are_shared() {
        let minimal = json!({"when": {"expr": "lit", "value": true}});
        let normalized = normalize_readiness(&minimal.to_string()).unwrap();
        let value: serde_json::Value = serde_json::from_str(&normalized).unwrap();
        assert_eq!(
            value,
            json!({
                "when": {"expr": "lit", "value": true},
                "active": {"expr": "lit", "value": true},
                "error": {"expr": "lit", "value": null},
                "elements": [], "timeout": 10000
            })
        );
        let readiness: Readiness = serde_json::from_value(minimal).unwrap();
        assert_eq!(serde_json::to_value(readiness).unwrap(), value);
    }

    #[test]
    fn behavior_changes_round_trip_without_replacing_nodes() {
        let old = Node::new("div");
        let mut new = old.clone();
        let effect = json!({"watch": ["path"], "initial": true, "action": {"kind": "clipboard", "value": {"expr": "field", "name": "url"}, "result": "copied"}});
        new.effects.insert(
            "copy".into(),
            serde_json::from_str(&normalize_effect(&effect.to_string()).unwrap()).unwrap(),
        );
        let readiness = json!({"when": {"expr": "field", "name": "loaded"}, "active": {"expr": "lit", "value": true}, "error": {"expr": "lit", "value": null}, "result": "view", "elements": [], "timeout": 1000});
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
        let mut spec = json!({"when": {"expr": "event"}, "active": {"expr": "lit", "value": true}, "error": {"expr": "lit", "value": null}, "result": "view", "elements": [], "timeout": 1000});
        assert!(normalize_readiness(&spec.to_string())
            .unwrap_err()
            .contains("reactive"));
        spec["when"] = json!({"expr": "not", "of": {"expr": "field", "name": "view.error"}});
        assert!(normalize_readiness(&spec.to_string())
            .unwrap_err()
            .contains("own result"));
    }
}
