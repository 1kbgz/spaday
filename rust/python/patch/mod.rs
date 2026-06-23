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

/// Frame a JSON-encoded tree/patch into transports' length-prefixed envelope bytes.
///
/// `kind` is `"snapshot"` or `"patch"`; `codec` is `"application/json"` or `"application/msgpack"`.
#[pyfunction]
pub fn encode_frame(
    payload: &str,
    model_type: &str,
    kind: &str,
    rev: u64,
    codec: &str,
) -> PyResult<Vec<u8>> {
    spaday::encode_frame(payload, model_type, kind, rev, codec).map_err(PyValueError::new_err)
}

/// Decode one frame back to a `{"model_type","kind","rev","payload"}` JSON string.
#[pyfunction]
pub fn decode_frame(frame: &[u8]) -> PyResult<String> {
    spaday::decode_frame(frame).map_err(PyValueError::new_err)
}
