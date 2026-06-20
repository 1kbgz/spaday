//! JSON wire bridge — the bring-up codec for trees and patches.
//!
//! This is the minimal wire format so the PyO3 and wasm bindings can exchange trees and patches
//! today. It is deliberately thin: `transports` will own real, pluggable codecs (transports ROADMAP
//! Phase 2), at which point this becomes one codec among several rather than the only path.
//!
//! Both bindings call straight through to these two functions, which is what makes "one core, two
//! bindings" concrete: a patch produced by [`diff_json`] in Python is consumed by [`apply_json`] in
//! the browser using the very same Rust code.

use crate::{apply, diff, Node, Patch};

/// Diff two JSON-encoded component trees, returning the JSON-encoded [`Patch`].
pub fn diff_json(old: &str, new: &str) -> Result<String, serde_json::Error> {
    let old: Node = serde_json::from_str(old)?;
    let new: Node = serde_json::from_str(new)?;
    serde_json::to_string(&diff(&old, &new))
}

/// Apply a JSON-encoded [`Patch`] to a JSON-encoded tree, returning the JSON-encoded result.
pub fn apply_json(root: &str, patch: &str) -> Result<String, serde_json::Error> {
    let mut root: Node = serde_json::from_str(root)?;
    let patch: Patch = serde_json::from_str(patch)?;
    apply(&mut root, &patch);
    serde_json::to_string(&root)
}

#[cfg(test)]
mod json_tests {
    use super::*;

    #[test]
    fn test_diff_apply_round_trip_over_json() {
        let old = r#"{"tag":"wa-switch","props":{"checked":{"Bool":false}}}"#;
        let new = r#"{"tag":"wa-switch","props":{"checked":{"Bool":true}}}"#;
        let patch = diff_json(old, new).unwrap();
        let got = apply_json(old, &patch).unwrap();
        // compare as Values to be independent of key ordering / whitespace
        let got: serde_json::Value = serde_json::from_str(&got).unwrap();
        let want: serde_json::Value = serde_json::from_str(new).unwrap();
        assert_eq!(got, want);
    }

    #[test]
    fn test_identical_yields_empty_ops() {
        let tree = r#"{"tag":"wa-card"}"#;
        let patch = diff_json(tree, tree).unwrap();
        assert_eq!(patch, r#"{"ops":[]}"#);
    }

    #[test]
    fn test_malformed_input_errors() {
        assert!(diff_json("{not json", "{}").is_err());
        assert!(apply_json(r#"{"tag":"a"}"#, "nope").is_err());
    }
}
