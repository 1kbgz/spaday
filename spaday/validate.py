"""Build-time validation of a component tree: catch dangling action references before they ship.

An action that targets ``by_id("panel")`` does nothing at runtime if no element in the tree has that
id — a silent, easy-to-miss bug. :func:`validate` walks the tree and raises :class:`ValidationError`
listing every ``by_id`` reference (in an action or a ``prop(...)`` expression, however deeply nested)
that doesn't resolve to a node's id in the same tree.

Reactive ``bind`` targets a state *field*, not a node, so it has nothing to resolve here; and prop
*names* aren't checked (the typed component constructors already validate those, and the string escape
hatches legitimately allow custom attributes).
"""

from typing import Any, Iterator, List, Set, Union

from .component import Component


class ValidationError(ValueError):
    """Raised by :func:`validate` when a component tree has unresolved references."""


def _collect_ids(node: dict, ids: Set[str]) -> None:
    id_value = (node.get("props") or {}).get("id")
    if isinstance(id_value, dict) and isinstance(id_value.get("Str"), str):
        ids.add(id_value["Str"])
    for children in (node.get("slots") or {}).values():
        for child in children:
            _collect_ids(child, ids)


def _expr_refs(expr: Any) -> Iterator[str]:
    if not isinstance(expr, dict):
        return
    target = expr.get("target")
    if expr.get("expr") == "prop" and isinstance(target, dict) and target.get("ref") == "id":
        yield target["id"]
    if expr.get("expr") == "not":
        yield from _expr_refs(expr.get("of"))


def _action_refs(action: Any) -> Iterator[str]:
    if not isinstance(action, dict):
        return
    target = action.get("target")
    if isinstance(target, dict) and target.get("ref") == "id":
        yield target["id"]
    for key in ("value", "detail", "body", "cond"):
        yield from _expr_refs(action.get(key))
    for sub in action.get("actions") or []:
        yield from _action_refs(sub)
    for key in ("then", "else"):
        if action.get(key) is not None:
            yield from _action_refs(action[key])


def _collect_refs(node: dict, refs: List[str]) -> None:
    for action in (node.get("events") or {}).values():
        refs.extend(_action_refs(action))
    for children in (node.get("slots") or {}).values():
        for child in children:
            _collect_refs(child, refs)


def validate(tree: Union[Component, dict]) -> None:
    """Raise :class:`ValidationError` if any ``by_id(...)`` reference in the tree's actions is unresolved.

    Pass a :class:`~spaday.component.Component` (or its serialized node dict). Returns ``None`` on success.
    """
    node = tree.to_node() if isinstance(tree, Component) else tree
    ids: Set[str] = set()
    _collect_ids(node, ids)
    refs: List[str] = []
    _collect_refs(node, refs)
    missing = sorted({ref for ref in refs if ref not in ids})
    if missing:
        known = sorted(ids)
        raise ValidationError("unresolved by_id reference(s): " + ", ".join(repr(m) for m in missing) + f" (known ids: {known})")
