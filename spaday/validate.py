"""Build-time validation of a component tree: catch dangling action references before they ship.

An action that targets ``by_id("panel")`` does nothing at runtime if no element in the tree has that
id — a silent, easy-to-miss bug. :func:`validate` walks the tree and raises :class:`ValidationError`
listing every ``by_id`` reference (in an action or a ``prop(...)`` expression, however deeply nested)
that doesn't resolve to a node's id in the same tree.

Reactive ``bind`` targets a state *field*, not a node, so it has nothing to resolve here. Prop and
binding *names* are checked too, wherever a catalog schema is known — see :func:`validate`.
"""

from collections.abc import Iterator
from typing import Any

from .component import _SCHEMAS_BY_TAG, Component, _settable, _snake_name

#: Generic props the runtime sets on any element, so they pass the unknown-prop check everywhere.
_GLOBAL_PROPS = {"id", "class", "style", "slot", "part", "title", "role", "hidden", "tabindex", "textContent"}
_GLOBAL_PREFIXES = ("data-", "aria-")
#: Binding names that target the document root rather than a prop on the bound element; one-way by
#: construction, so they are exempt from the two-way and unknown-prop checks below.
_ROOT_PREFIXES = ("root-class:", "root-attr:")


class ValidationError(ValueError):
    """Raised by :func:`validate` when a component tree has unresolved references."""


def _collect_ids(node: dict, ids: set[str]) -> None:
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
    for key, value in expr.items():
        if key in {"value", "target"}:  # literal payload is data; a prop target was handled above
            continue
        if isinstance(value, list):
            for item in value:
                yield from _expr_refs(item)
        else:
            yield from _expr_refs(value)


def _action_refs(action: Any) -> Iterator[str]:
    if not isinstance(action, dict):
        return
    target = action.get("target")
    if isinstance(target, dict) and target.get("ref") == "id":
        yield target["id"]
    for key in ("value", "detail", "url", "body", "cond"):
        yield from _expr_refs(action.get(key))
    for sub in action.get("actions") or []:
        yield from _action_refs(sub)
    for key in ("then", "else"):
        if action.get(key) is not None:
            yield from _action_refs(action[key])


def _collect_refs(node: dict, refs: list[str]) -> None:
    for action in (node.get("events") or {}).values():
        refs.extend(_action_refs(action))
    for children in (node.get("slots") or {}).values():
        for child in children:
            _collect_refs(child, refs)


def _collect_unknown_props(component: Component, problems: list[str]) -> None:
    schema = type(component).schema
    if schema is not None:
        known = {prop.name for prop in _settable(schema)}
        # two-way bindings target live form-control properties (a composed control's `value` is
        # routinely absent from its manifest), so their names stay unchecked
        bound = [n for n, b in component._bindings.items() if b.get("mode") != "two-way" and not n.startswith(_ROOT_PREFIXES)]
        names = list(component._props) + bound
        for name in names:
            if name in known or name in _GLOBAL_PROPS or name.startswith(_GLOBAL_PREFIXES):
                continue
            hint = next((p for p in sorted(known) if _snake_name(p) == name), None)
            problems.append(f"<{component.tag}> unknown prop {name!r}" + (f" (did you mean {hint!r}?)" if hint else ""))
    for children in component._slots.values():
        for child in children:
            if isinstance(child, Component):
                _collect_unknown_props(child, problems)
            elif isinstance(child, dict):
                _collect_unknown_props_dict(child, problems)


def _collect_unknown_props_dict(node: dict, problems: list[str]) -> None:
    """The dict-tree half of the unknown-prop check: schemas resolve by tag, from every imported
    schema-carrying class (``Component.__init_subclass__`` registers them)."""
    schema = _SCHEMAS_BY_TAG.get(node.get("tag", ""))
    if schema is not None:
        known = {prop.name for prop in _settable(schema)}
        bindings = node.get("bindings") or {}
        bound = [n for n, b in bindings.items() if b.get("mode") != "two-way" and not n.startswith(_ROOT_PREFIXES)]
        for name in list(node.get("props") or {}) + bound:
            if name in known or name in _GLOBAL_PROPS or name.startswith(_GLOBAL_PREFIXES):
                continue
            hint = next((p for p in sorted(known) if _snake_name(p) == name), None)
            problems.append(f"<{node['tag']}> unknown prop {name!r}" + (f" (did you mean {hint!r}?)" if hint else ""))
    for children in (node.get("slots") or {}).values():
        for child in children:
            _collect_unknown_props_dict(child, problems)


def validate(tree: Component | dict) -> None:
    """Raise :class:`ValidationError` if the tree has unresolved ``by_id(...)`` references or unknown props.

    Pass a :class:`~spaday.component.Component` (or its serialized node dict). Returns ``None`` on success.

    Two checks run. Every ``by_id`` reference (in an action or a ``prop(...)`` expression) must resolve
    to a node's id in the same tree. And on each node that carries a catalog ``schema`` (CEM-generated
    components retain one), every prop and binding name must be a schema prop or a generic global
    (``id``, ``class``, ``style``, ``slot``, …, plus ``data-*``/``aria-*``); an unknown name is reported
    with the tag and — when it is the snake_case spelling of a real prop — a "did you mean" hint. On a
    serialized dict tree, schemas resolve by tag instead, covering every schema-carrying class that has
    been imported — so ``validate(component.to_node())`` checks the same props as ``validate(component)``.
    Nodes with no schema either way (``element(...)`` tags) stay unvalidated, as do two-way binding
    names, which target live form-control properties a manifest routinely omits.
    """
    node = tree.to_node() if isinstance(tree, Component) else tree
    ids: set[str] = set()
    _collect_ids(node, ids)
    refs: list[str] = []
    _collect_refs(node, refs)
    missing = sorted({ref for ref in refs if ref not in ids})
    if missing:
        known = sorted(ids)
        raise ValidationError("unresolved by_id reference(s): " + ", ".join(repr(m) for m in missing) + f" (known ids: {known})")
    problems: list[str] = []
    if isinstance(tree, Component):
        _collect_unknown_props(tree, problems)
    else:
        _collect_unknown_props_dict(tree, problems)
    if problems:
        raise ValidationError("unknown prop(s): " + "; ".join(problems))
