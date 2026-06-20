//! The scalar/structured value type used for component props and (later) reactive state.
//!
//! `Value` is a small tagged union mirroring the shape the `transports` core will own
//! (see transports ROADMAP Phase 0). For now spaday carries its own copy so the component
//! tree and its diff/patch engine can be built without blocking on transports; the two
//! will be reconciled when transports Phase 0 lands.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// A prop/attribute value.
///
/// Uses `BTreeMap` for maps so serialization and diffing are deterministic (stable key order).
/// `PartialEq` (not `Eq`) because of `Float(f64)`; prop values are compared structurally during
/// diffing, where `NaN != NaN` is an acceptable (and vanishingly rare) edge for UI attributes.
#[derive(Clone, Debug, PartialEq, Default, Serialize, Deserialize)]
pub enum Value {
    #[default]
    Null,
    Bool(bool),
    Int(i64),
    Float(f64),
    Str(String),
    List(Vec<Value>),
    Map(BTreeMap<String, Value>),
}

impl Value {
    /// Convenience constructor for string values.
    pub fn str(s: impl Into<String>) -> Value {
        Value::Str(s.into())
    }
}

impl From<bool> for Value {
    fn from(v: bool) -> Value {
        Value::Bool(v)
    }
}

impl From<i64> for Value {
    fn from(v: i64) -> Value {
        Value::Int(v)
    }
}

impl From<i32> for Value {
    fn from(v: i32) -> Value {
        Value::Int(v as i64)
    }
}

impl From<f64> for Value {
    fn from(v: f64) -> Value {
        Value::Float(v)
    }
}

impl From<&str> for Value {
    fn from(v: &str) -> Value {
        Value::Str(v.to_string())
    }
}

impl From<String> for Value {
    fn from(v: String) -> Value {
        Value::Str(v)
    }
}

impl<T: Into<Value>> From<Vec<T>> for Value {
    fn from(v: Vec<T>) -> Value {
        Value::List(v.into_iter().map(Into::into).collect())
    }
}

#[cfg(test)]
mod value_tests {
    use super::*;

    #[test]
    fn test_from_impls() {
        assert_eq!(Value::from(true), Value::Bool(true));
        assert_eq!(Value::from(7i64), Value::Int(7));
        assert_eq!(Value::from(7i32), Value::Int(7));
        assert_eq!(Value::from("x"), Value::Str("x".into()));
        assert_eq!(Value::from(String::from("y")), Value::Str("y".into()));
        assert_eq!(Value::str("z"), Value::Str("z".into()));
        assert_eq!(
            Value::from(vec!["a", "b"]),
            Value::List(vec![Value::str("a"), Value::str("b")])
        );
    }

    #[test]
    fn test_json_round_trip() {
        let v = Value::Map(BTreeMap::from([
            ("on".to_string(), Value::Bool(true)),
            ("count".to_string(), Value::Int(3)),
            ("label".to_string(), Value::str("hi")),
            (
                "nested".to_string(),
                Value::List(vec![Value::Null, Value::Float(1.5)]),
            ),
        ]));
        let json = serde_json::to_string(&v).unwrap();
        let back: Value = serde_json::from_str(&json).unwrap();
        assert_eq!(v, back);
    }
}
