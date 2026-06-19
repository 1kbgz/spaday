//! spaday core — the Rust reactive component model.
//!
//! This crate is the single source of truth for the component tree and its diff/patch engine; it
//! compiles into the PyO3 (`rust/python`) and wasm (`js`) bindings so Python (build-time) and
//! JavaScript (run-time) share one implementation. See `spaday/ROADMAP.md`, Phase 0.
//!
//! Layers (built bottom-up):
//! - [`value`] — the prop/state value type.
//! - [`node`] — the serializable component tree ([`Node`], slots, events).
//! - [`diff`] — structural diff/patch with keyed child reconciliation.
//! - [`json`] — the JSON wire bridge the bindings call (`diff_json`/`apply_json`).

mod diff;
mod example;
mod json;
mod node;
mod value;

pub use diff::{apply, diff, Op, Patch, Path, PathSeg};
pub use example::Example;
pub use json::{apply_json, diff_json};
pub use node::{Action, Attr, EventName, Key, Node, SlotName, TagName, DEFAULT_SLOT};
pub use value::Value;
