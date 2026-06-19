use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn foo() -> u32 {
    // do something
    1 + 1
}

/// Diff two JSON-encoded component trees, returning the JSON-encoded patch.
///
/// Thin wrapper over the shared core (`spaday::diff_json`); the same code runs in the PyO3 binding.
#[wasm_bindgen]
pub fn diff(old: &str, new: &str) -> Result<String, JsError> {
    spaday::diff_json(old, new).map_err(|e| JsError::new(&e.to_string()))
}

/// Apply a JSON-encoded patch to a JSON-encoded tree, returning the JSON-encoded result.
#[wasm_bindgen]
pub fn apply(root: &str, patch: &str) -> Result<String, JsError> {
    spaday::apply_json(root, patch).map_err(|e| JsError::new(&e.to_string()))
}
