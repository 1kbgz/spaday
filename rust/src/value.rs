//! The scalar/structured value type used for component props and reactive state.
//!
//! spaday's prop/state `Value` **is** transports' core `Value` — the component tree and a transports
//! model speak the same scalar/list/map union, so a prop bound to a model field needs no conversion and
//! the wire form is shared by construction. We re-export it (with transports' `From` conversions and the
//! `Submodel` variant spaday never authors but tolerates on the wire) so the rest of the core keeps
//! using `crate::value::Value`.

pub use transports::Value;
