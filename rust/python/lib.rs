use pyo3::prelude::*;
use pyo3::wrap_pyfunction;

mod example;
mod patch;

pub use example::Example;

#[pymodule]
fn spaday(_py: Python, m: &Bound<PyModule>) -> PyResult<()> {
    // Example
    m.add_class::<Example>().unwrap();
    // Component-tree diff/patch (Phase 0.3) — JSON wire bridge over the shared core.
    m.add_function(wrap_pyfunction!(patch::diff, m)?)?;
    m.add_function(wrap_pyfunction!(patch::apply, m)?)?;
    Ok(())
}
