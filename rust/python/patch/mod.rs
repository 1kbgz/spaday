use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;

/// Diff two JSON-encoded component trees, returning the JSON-encoded patch.
///
/// Thin wrapper over the shared core (`spaday::diff_json`); the same code runs in the wasm binding.
#[pyfunction]
pub fn diff(old: &str, new: &str) -> PyResult<String> {
    spaday::diff_json(old, new).map_err(|e| PyValueError::new_err(e.to_string()))
}

/// Apply a JSON-encoded patch to a JSON-encoded tree, returning the JSON-encoded result.
#[pyfunction]
pub fn apply(root: &str, patch: &str) -> PyResult<String> {
    spaday::apply_json(root, patch).map_err(|e| PyValueError::new_err(e.to_string()))
}

/// Parse a `custom-elements.json` manifest into the JSON-encoded list of component schemas.
#[pyfunction]
pub fn parse_cem(manifest: &str) -> PyResult<String> {
    spaday::parse_cem(manifest).map_err(|e| PyValueError::new_err(e.to_string()))
}
