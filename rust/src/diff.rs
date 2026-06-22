//! Structural diff/patch over the component tree.
//!
//! [`diff`] computes the minimal-ish set of [`Op`]s that turn one [`Node`] tree into another;
//! [`apply`] replays them. The guarantee the engine is built around is the round-trip property:
//!
//! ```text
//! apply(old.clone(), diff(old, new)) == new
//! ```
//!
//! which the test suite exercises exhaustively (including a deterministic fuzz). This mirrors the
//! shape of the `transports` patch engine (ROADMAP Phase 0.2); when transports lands its core, the
//! tree becomes a transports model and this delegates rather than re-implements.
//!
//! ## Reconciliation
//! Within one slot, children are reconciled **keyed** when every child (old and new) has a [`key`];
//! otherwise **positionally**. Keys must be unique within a slot. A tag change replaces the whole
//! subtree (a `wa-button` cannot morph into a `wa-card`).
//!
//! [`key`]: crate::node::Node::key

use std::collections::BTreeSet;

use serde::{Deserialize, Serialize};

use crate::action::Action;
use crate::node::{Attr, EventName, Key, Node, SlotName};

/// One step down into a tree: the `index`-th child of slot `slot`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct PathSeg {
    pub slot: SlotName,
    pub index: usize,
}

/// A path from the root to a node, as a sequence of slot/index steps.
pub type Path = Vec<PathSeg>;

/// A single mutation. `path` always addresses the node being mutated; for child operations that is
/// the *parent* node, and `slot`/`index` locate the child within it.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Op {
    SetProp {
        path: Path,
        name: Attr,
        value: crate::value::Value,
    },
    RemoveProp {
        path: Path,
        name: Attr,
    },
    SetEvent {
        path: Path,
        name: EventName,
        action: Action,
    },
    RemoveEvent {
        path: Path,
        name: EventName,
    },
    SetKey {
        path: Path,
        key: Option<Key>,
    },
    InsertChild {
        path: Path,
        slot: SlotName,
        index: usize,
        node: Node,
    },
    RemoveChild {
        path: Path,
        slot: SlotName,
        index: usize,
    },
    MoveChild {
        path: Path,
        slot: SlotName,
        from: usize,
        to: usize,
    },
    /// Replace the entire node at `path` (used when the tag changes).
    Replace {
        path: Path,
        node: Node,
    },
}

impl Op {
    fn path(&self) -> &Path {
        match self {
            Op::SetProp { path, .. }
            | Op::RemoveProp { path, .. }
            | Op::SetEvent { path, .. }
            | Op::RemoveEvent { path, .. }
            | Op::SetKey { path, .. }
            | Op::InsertChild { path, .. }
            | Op::RemoveChild { path, .. }
            | Op::MoveChild { path, .. }
            | Op::Replace { path, .. } => path,
        }
    }
}

/// An ordered set of [`Op`]s. Apply in order to reproduce the target tree.
#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Patch {
    pub ops: Vec<Op>,
}

impl Patch {
    pub fn is_empty(&self) -> bool {
        self.ops.is_empty()
    }
    pub fn len(&self) -> usize {
        self.ops.len()
    }
}

/// Compute the patch that turns `old` into `new`.
pub fn diff(old: &Node, new: &Node) -> Patch {
    let mut ops = Vec::new();
    diff_node(&Vec::new(), old, new, &mut ops);
    Patch { ops }
}

/// Apply a patch to `root` in place.
pub fn apply(root: &mut Node, patch: &Patch) {
    for op in &patch.ops {
        apply_op(root, op);
    }
}

fn child_path(path: &Path, slot: &str, index: usize) -> Path {
    let mut p = path.to_vec();
    p.push(PathSeg {
        slot: slot.to_string(),
        index,
    });
    p
}

fn diff_node(path: &Path, old: &Node, new: &Node, ops: &mut Vec<Op>) {
    // Different element type ⇒ replace the whole subtree.
    if old.tag != new.tag {
        ops.push(Op::Replace {
            path: path.to_vec(),
            node: new.clone(),
        });
        return;
    }

    if old.key != new.key {
        ops.push(Op::SetKey {
            path: path.to_vec(),
            key: new.key.clone(),
        });
    }

    // Props.
    for (name, nv) in &new.props {
        if old.props.get(name) != Some(nv) {
            ops.push(Op::SetProp {
                path: path.to_vec(),
                name: name.clone(),
                value: nv.clone(),
            });
        }
    }
    for name in old.props.keys() {
        if !new.props.contains_key(name) {
            ops.push(Op::RemoveProp {
                path: path.to_vec(),
                name: name.clone(),
            });
        }
    }

    // Events.
    for (name, na) in &new.events {
        if old.events.get(name) != Some(na) {
            ops.push(Op::SetEvent {
                path: path.to_vec(),
                name: name.clone(),
                action: na.clone(),
            });
        }
    }
    for name in old.events.keys() {
        if !new.events.contains_key(name) {
            ops.push(Op::RemoveEvent {
                path: path.to_vec(),
                name: name.clone(),
            });
        }
    }

    // Slots (union of names so additions and removals are both seen).
    let mut slot_names: BTreeSet<&str> = BTreeSet::new();
    slot_names.extend(old.slots.keys().map(String::as_str));
    slot_names.extend(new.slots.keys().map(String::as_str));
    for slot in slot_names {
        let oc = old.slots.get(slot).map(Vec::as_slice).unwrap_or(&[]);
        let nc = new.slots.get(slot).map(Vec::as_slice).unwrap_or(&[]);
        diff_children(path, slot, oc, nc, ops);
    }
}

fn diff_children(path: &Path, slot: &str, old: &[Node], new: &[Node], ops: &mut Vec<Op>) {
    let keyed = !(old.is_empty() && new.is_empty())
        && old.iter().all(|c| c.key.is_some())
        && new.iter().all(|c| c.key.is_some());
    if keyed {
        diff_children_keyed(path, slot, old, new, ops);
    } else {
        diff_children_positional(path, slot, old, new, ops);
    }
}

// Indices here are the op positions themselves, so range loops are intentional.
#[allow(clippy::needless_range_loop)]
fn diff_children_positional(
    path: &Path,
    slot: &str,
    old: &[Node],
    new: &[Node],
    ops: &mut Vec<Op>,
) {
    let n = old.len().min(new.len());
    // Recurse into the overlapping prefix first (indices valid in both old and new).
    for i in 0..n {
        diff_node(&child_path(path, slot, i), &old[i], &new[i], ops);
    }
    if new.len() > old.len() {
        // Append the new tail (ascending indices ⇒ each insert lands at the end).
        for i in old.len()..new.len() {
            ops.push(Op::InsertChild {
                path: path.to_vec(),
                slot: slot.to_string(),
                index: i,
                node: new[i].clone(),
            });
        }
    } else {
        // Trim the old tail (descending indices keep earlier indices stable).
        for i in (new.len()..old.len()).rev() {
            ops.push(Op::RemoveChild {
                path: path.to_vec(),
                slot: slot.to_string(),
                index: i,
            });
        }
    }
}

// Indices here are the op positions themselves, so range loops are intentional.
#[allow(clippy::needless_range_loop)]
fn diff_children_keyed(path: &Path, slot: &str, old: &[Node], new: &[Node], ops: &mut Vec<Op>) {
    let new_keys: BTreeSet<&str> = new.iter().map(|c| c.key.as_deref().unwrap()).collect();

    // `working` simulates the child list as ops are applied. Each entry is (key, Some(old index))
    // where the old index drives later recursion; freshly inserted children carry `None`.
    let mut working: Vec<(String, Option<usize>)> = old
        .iter()
        .enumerate()
        .map(|(i, c)| (c.key.clone().unwrap(), Some(i)))
        .collect();

    // 1. Remove children whose key is gone (descending so indices stay valid).
    for i in (0..working.len()).rev() {
        if !new_keys.contains(working[i].0.as_str()) {
            ops.push(Op::RemoveChild {
                path: path.to_vec(),
                slot: slot.to_string(),
                index: i,
            });
            working.remove(i);
        }
    }

    // 2. Walk the target order; move surviving children into place, insert missing ones.
    for ti in 0..new.len() {
        let nk = new[ti].key.as_deref().unwrap();
        if let Some(cur) = (ti..working.len()).find(|&j| working[j].0 == nk) {
            if cur != ti {
                ops.push(Op::MoveChild {
                    path: path.to_vec(),
                    slot: slot.to_string(),
                    from: cur,
                    to: ti,
                });
                let item = working.remove(cur);
                working.insert(ti, item);
            }
        } else {
            ops.push(Op::InsertChild {
                path: path.to_vec(),
                slot: slot.to_string(),
                index: ti,
                node: new[ti].clone(),
            });
            working.insert(ti, (nk.to_string(), None));
        }
    }

    // 3. Recurse into surviving children, now at their final indices.
    for ti in 0..new.len() {
        if let Some(old_idx) = working[ti].1 {
            diff_node(&child_path(path, slot, ti), &old[old_idx], &new[ti], ops);
        }
    }
}

fn node_at_mut<'a>(root: &'a mut Node, path: &Path) -> &'a mut Node {
    let mut cur = root;
    for seg in path {
        cur = &mut cur
            .slots
            .get_mut(&seg.slot)
            .expect("path references an existing slot")[seg.index];
    }
    cur
}

fn apply_op(root: &mut Node, op: &Op) {
    let target = node_at_mut(root, op.path());
    match op {
        Op::SetProp { name, value, .. } => {
            target.props.insert(name.clone(), value.clone());
        }
        Op::RemoveProp { name, .. } => {
            target.props.remove(name);
        }
        Op::SetEvent { name, action, .. } => {
            target.events.insert(name.clone(), action.clone());
        }
        Op::RemoveEvent { name, .. } => {
            target.events.remove(name);
        }
        Op::SetKey { key, .. } => {
            target.key = key.clone();
        }
        Op::InsertChild {
            slot, index, node, ..
        } => {
            target
                .slots
                .entry(slot.clone())
                .or_default()
                .insert(*index, node.clone());
        }
        Op::RemoveChild { slot, index, .. } => {
            if let Some(v) = target.slots.get_mut(slot) {
                v.remove(*index);
                if v.is_empty() {
                    target.slots.remove(slot); // empty slots are absent in a freshly-built tree
                }
            }
        }
        Op::MoveChild { slot, from, to, .. } => {
            if let Some(v) = target.slots.get_mut(slot) {
                let item = v.remove(*from);
                v.insert(*to, item);
            }
        }
        Op::Replace { node, .. } => {
            *target = node.clone();
        }
    }
}

#[cfg(test)]
mod diff_tests {
    use super::*;

    fn assert_round_trip(old: &Node, new: &Node) -> Patch {
        let patch = diff(old, new);
        let mut got = old.clone();
        apply(&mut got, &patch);
        assert_eq!(
            &got, new,
            "round-trip failed\n old={old:#?}\n new={new:#?}\n patch={patch:#?}"
        );
        patch
    }

    #[test]
    fn test_identical_is_empty() {
        let n = Node::new("wa-card")
            .prop("x", 1i64)
            .child(Node::new("wa-switch").with_key("a"));
        assert!(diff(&n, &n).is_empty());
    }

    #[test]
    fn test_prop_add_change_remove() {
        let old = Node::new("wa-switch")
            .prop("checked", false)
            .prop("size", "m");
        let new = Node::new("wa-switch")
            .prop("checked", true)
            .prop("label", "Lamp");
        let patch = assert_round_trip(&old, &new);
        // checked changed, label added, size removed ⇒ 3 ops
        assert_eq!(patch.len(), 3);
    }

    #[test]
    fn test_event_changes() {
        use crate::action::Ref;
        let old = Node::new("wa-button").event(
            "click",
            Action::Toggle {
                target: Ref::This,
                prop: "a".into(),
            },
        );
        let new = Node::new("wa-button")
            .event(
                "click",
                Action::Toggle {
                    target: Ref::This,
                    prop: "b".into(),
                },
            )
            .event(
                "dblclick",
                Action::Emit {
                    event: "x".into(),
                    detail: None,
                },
            );
        assert_round_trip(&old, &new);
    }

    #[test]
    fn test_key_change() {
        let old = Node::new("wa-switch").with_key("a");
        let new = Node::new("wa-switch").with_key("b");
        let patch = assert_round_trip(&old, &new);
        assert!(matches!(patch.ops.as_slice(), [Op::SetKey { .. }]));
    }

    #[test]
    fn test_tag_change_replaces() {
        let old = Node::new("wa-button").prop("x", 1i64);
        let new = Node::new("wa-card").prop("y", 2i64);
        let patch = assert_round_trip(&old, &new);
        assert!(matches!(patch.ops.as_slice(), [Op::Replace { .. }]));
    }

    #[test]
    fn test_positional_children_grow_and_shrink() {
        let a = Node::new("a");
        let grow = assert_round_trip(
            &Node::new("root").child(a.clone()),
            &Node::new("root")
                .child(a.clone())
                .child(a.clone())
                .child(a.clone()),
        );
        assert_eq!(grow.len(), 2); // two inserts
        let shrink = assert_round_trip(
            &Node::new("root")
                .child(a.clone())
                .child(a.clone())
                .child(a.clone()),
            &Node::new("root").child(a.clone()),
        );
        assert_eq!(shrink.len(), 2); // two removes
    }

    #[test]
    fn test_positional_recurse() {
        let old = Node::new("root").child(Node::new("a").prop("v", 1i64));
        let new = Node::new("root").child(Node::new("a").prop("v", 2i64));
        let patch = assert_round_trip(&old, &new);
        assert!(matches!(patch.ops.as_slice(), [Op::SetProp { .. }]));
    }

    #[test]
    fn test_keyed_reorder() {
        let k = |s: &str| Node::new("item").with_key(s);
        let old = Node::new("list").children_in("default", [k("a"), k("b"), k("c")]);
        let new = Node::new("list").children_in("default", [k("c"), k("a"), k("b")]);
        let patch = assert_round_trip(&old, &new);
        // a pure rotation should be expressible in a single move
        assert!(patch.ops.iter().all(|o| matches!(o, Op::MoveChild { .. })));
        assert_eq!(patch.len(), 1);
    }

    #[test]
    fn test_keyed_insert_remove_middle() {
        let k = |s: &str| Node::new("item").with_key(s);
        let old = Node::new("list").children_in("default", [k("a"), k("b"), k("c")]);
        let new = Node::new("list").children_in("default", [k("a"), k("x"), k("c"), k("d")]);
        assert_round_trip(&old, &new);
    }

    #[test]
    fn test_keyed_recurse_after_move() {
        let item = |key: &str, v: i64| Node::new("item").with_key(key).prop("v", v);
        let old = Node::new("list").children_in("default", [item("a", 1), item("b", 2)]);
        let new = Node::new("list").children_in("default", [item("b", 9), item("a", 1)]);
        // b moved AND its prop changed: must move first, then SetProp at the final index.
        assert_round_trip(&old, &new);
    }

    #[test]
    fn test_nested_and_multislot() {
        let old = Node::new("wa-card")
            .child_in("header", Node::new("h3").prop("text", "old"))
            .children_in(
                "default",
                [
                    Node::new("row").with_key("r1"),
                    Node::new("row").with_key("r2"),
                ],
            );
        let new = Node::new("wa-card")
            .child_in("header", Node::new("h3").prop("text", "new"))
            .children_in(
                "default",
                [
                    Node::new("row").with_key("r2"),
                    Node::new("row").with_key("r3"),
                ],
            );
        assert_round_trip(&old, &new);
    }

    struct Lcg(u64);
    impl Lcg {
        fn next(&mut self) -> u64 {
            self.0 = self
                .0
                .wrapping_mul(6364136223846793005)
                .wrapping_add(1442695040888963407);
            self.0
        }
        fn below(&mut self, n: usize) -> usize {
            ((self.next() >> 33) as usize) % n
        }
        fn flip(&mut self) -> bool {
            self.next() & 1 == 0
        }
    }

    fn gen_node(rng: &mut Lcg, depth: usize) -> Node {
        let tags = ["a", "b", "c"];
        let mut n = Node::new(tags[rng.below(tags.len())]);
        // 0..2 props from a small name pool
        for _ in 0..rng.below(3) {
            let names = ["x", "y", "z"];
            n = n.prop(names[rng.below(names.len())], rng.below(4) as i64);
        }
        if depth > 0 {
            // one or two slots
            let slots = ["default", "header"];
            for s in slots.iter().take(1 + rng.below(2)) {
                if rng.flip() {
                    // keyed slot: unique subset/permutation of a small key universe
                    let universe = ["k0", "k1", "k2", "k3"];
                    let count = rng.below(universe.len() + 1);
                    // pick `count` distinct keys via partial Fisher-Yates
                    let mut pool: Vec<&str> = universe.to_vec();
                    let mut chosen = Vec::new();
                    for _ in 0..count {
                        if pool.is_empty() {
                            break;
                        }
                        let idx = rng.below(pool.len());
                        chosen.push(pool.remove(idx));
                    }
                    let kids: Vec<Node> = chosen
                        .into_iter()
                        .map(|key| gen_node(rng, depth - 1).with_key(key))
                        .collect();
                    if !kids.is_empty() {
                        n = n.children_in(*s, kids);
                    }
                } else {
                    // unkeyed positional slot
                    let count = rng.below(4);
                    let kids: Vec<Node> = (0..count).map(|_| gen_node(rng, depth - 1)).collect();
                    if !kids.is_empty() {
                        n = n.children_in(*s, kids);
                    }
                }
            }
        }
        n
    }

    #[test]
    fn test_fuzz_round_trip() {
        let mut rng = Lcg(0x1234_5678_9abc_def0);
        for _ in 0..2000 {
            let old = gen_node(&mut rng, 3);
            let new = gen_node(&mut rng, 3);
            // assert_round_trip also checks diff(x,x) is empty implicitly via equality after apply
            let patch = diff(&old, &new);
            let mut got = old.clone();
            apply(&mut got, &patch);
            assert_eq!(
                got, new,
                "fuzz round-trip failed\n old={old:#?}\n new={new:#?}\n patch={patch:#?}"
            );
            // idempotence of equality: diffing equal trees yields no ops
            assert!(diff(&new, &new).is_empty());
        }
    }
}
