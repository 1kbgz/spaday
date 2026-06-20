//! The serializable component tree.
//!
//! A [`Node`] is a single high-level web component: a tag, an optional reconciliation key,
//! a bag of props (attributes/properties), named slots holding child nodes, and event handlers.
//!
//! Phase 0 models event handlers as an opaque [`Action`] (wrapping a [`Value`]) so the tree is
//! structurally complete and diffable now. The real declarative action DSL replaces [`Action`]'s
//! body in Phase 2 — the tree/diff machinery here is written against the `Action` type so that
//! change is contained.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::value::Value;

pub type TagName = String;
pub type Key = String;
pub type Attr = String;
pub type SlotName = String;
pub type EventName = String;

/// The conventional name for a component's unnamed (default) slot.
pub const DEFAULT_SLOT: &str = "default";

/// Phase 0 placeholder for a declarative event handler.
///
/// In Phase 2 this becomes the action DSL (`SetProp`/`Toggle`/`Bind`/`CallEndpoint`/...). It is a
/// distinct newtype today so call sites and the diff engine don't have to change when that lands.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Action(pub Value);

/// A node in the component tree.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Node {
    /// The web-component tag, e.g. `"wa-switch"`, or a high-level shell tag e.g. `"spa-nav"`.
    pub tag: TagName,
    /// Stable identity for keyed child reconciliation. `None` ⇒ positional within its slot.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub key: Option<Key>,
    /// Attribute/property values.
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub props: BTreeMap<Attr, Value>,
    /// Named slots, each holding an ordered list of child nodes.
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub slots: BTreeMap<SlotName, Vec<Node>>,
    /// Event handlers keyed by event name (`"click"`, `"wa-change"`, ...).
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub events: BTreeMap<EventName, Action>,
}

impl Node {
    /// Create a node with the given tag and nothing else.
    pub fn new(tag: impl Into<TagName>) -> Node {
        Node {
            tag: tag.into(),
            key: None,
            props: BTreeMap::new(),
            slots: BTreeMap::new(),
            events: BTreeMap::new(),
        }
    }

    /// Builder: set the reconciliation key.
    pub fn with_key(mut self, key: impl Into<Key>) -> Node {
        self.key = Some(key.into());
        self
    }

    /// Builder: set a prop.
    pub fn prop(mut self, name: impl Into<Attr>, value: impl Into<Value>) -> Node {
        self.props.insert(name.into(), value.into());
        self
    }

    /// Builder: set an event handler.
    pub fn event(mut self, name: impl Into<EventName>, action: Action) -> Node {
        self.events.insert(name.into(), action);
        self
    }

    /// Builder: append a child to a named slot.
    pub fn child_in(mut self, slot: impl Into<SlotName>, node: Node) -> Node {
        self.slots.entry(slot.into()).or_default().push(node);
        self
    }

    /// Builder: append a child to the default slot.
    pub fn child(self, node: Node) -> Node {
        self.child_in(DEFAULT_SLOT, node)
    }

    /// Builder: append several children to a named slot.
    pub fn children_in(
        mut self,
        slot: impl Into<SlotName>,
        nodes: impl IntoIterator<Item = Node>,
    ) -> Node {
        self.slots.entry(slot.into()).or_default().extend(nodes);
        self
    }

    /// Children of a slot, or an empty slice if the slot is absent.
    pub fn slot(&self, slot: &str) -> &[Node] {
        self.slots.get(slot).map(Vec::as_slice).unwrap_or(&[])
    }
}

#[cfg(test)]
mod node_tests {
    use super::*;

    #[test]
    fn test_builder() {
        let n = Node::new("wa-switch")
            .with_key("lamp")
            .prop("checked", true)
            .prop("size", "m")
            .event("wa-change", Action(Value::str("toggle")));
        assert_eq!(n.tag, "wa-switch");
        assert_eq!(n.key.as_deref(), Some("lamp"));
        assert_eq!(n.props.get("checked"), Some(&Value::Bool(true)));
        assert_eq!(
            n.events.get("wa-change"),
            Some(&Action(Value::str("toggle")))
        );
    }

    #[test]
    fn test_slots() {
        let card = Node::new("wa-card")
            .child(Node::new("wa-switch"))
            .child_in("header", Node::new("h3"));
        assert_eq!(card.slot(DEFAULT_SLOT).len(), 1);
        assert_eq!(card.slot("header").len(), 1);
        assert_eq!(card.slot("missing").len(), 0);
    }

    #[test]
    fn test_json_round_trip_skips_empty() {
        let n = Node::new("wa-button");
        let json = serde_json::to_string(&n).unwrap();
        // empty maps and absent key are skipped on the wire
        assert_eq!(json, r#"{"tag":"wa-button"}"#);
        let back: Node = serde_json::from_str(&json).unwrap();
        assert_eq!(n, back);
    }
}
