"""Check that a substitute bundle really implements the components a package declares.

An application can keep a component package's Python surface and serve its own JS bundle (see the
customization guide). The contract between the two halves is implicit -- the bundle must register
the tags the schemas name -- and breaking it fails silently: an unregistered tag renders an inert
element, and nothing reports it.

This produces a browser-side check from the schemas the package already carries, so a substitute
bundle can be tested against the surface it claims to implement:

.. code-block:: python

    problems = page.evaluate(check_script([my_package]))
    assert problems == []

What it checks is deliberately narrow -- only what the runtime genuinely requires, so a passing
bundle is really usable and a reported problem is really a defect:

* **Every declared tag is a defined custom element.** An undefined tag is the silent no-render.
* **Every ``json``-kind prop is exposed as a DOM property.** :func:`setProp` in the runtime sets a
  DOM property when the element has one and falls back to an attribute otherwise, and an attribute
  can only carry a string -- so a ``json`` prop that is attribute-only turns an object into
  ``"[object Object]"``. Other kinds (string, enum, number, boolean) survive that fallback, so
  requiring properties for them would report defects that are not defects. A prop named with a
  hyphen (``did-ssr``, ``href-template``) is left out as well: no element has a property by that
  name, so the runtime carries it as an attribute whichever bundle implements the element, the
  package's own included -- it is not something a bundle can get wrong.

Slots and events are not checked: neither can be verified without rendering and dispatching, and a
guess either way would be noise.
"""

from __future__ import annotations

import json
from collections.abc import Sequence

from .packages import ComponentPackage

__all__ = ["CHECKER_JS", "check_script", "expectations"]

#: The JS half: takes the expectations and returns an array of problem strings, empty when the
#: bundle conforms. Kept as source so any browser driver can evaluate it.
CHECKER_JS = """(expectations) => {
  const problems = [];
  for (const { tag, jsonProps } of expectations) {
    if (!customElements.get(tag)) {
      problems.push(`<${tag}> is not a defined custom element`);
      continue;
    }
    const element = document.createElement(tag);
    for (const name of jsonProps) {
      if (!(name in element)) {
        problems.push(
          `<${tag}> has no ${name} DOM property, so its object value would be set as an attribute and stringify to "[object Object]"`
        );
      }
    }
  }
  return problems;
}"""


def expectations(packages: Sequence[ComponentPackage]) -> tuple[dict, ...]:
    """Per component: the tag that must be defined, and the ``json`` props that must be properties."""
    out = []
    for package in packages:
        for schema in package.catalog:
            out.append({"tag": schema.tag, "jsonProps": [prop.name for prop in schema.props if prop.kind == "json" and "-" not in prop.name]})
    return tuple(out)


def check_script(packages: Sequence[ComponentPackage]) -> str:
    """A self-contained JS expression evaluating to an array of problems (empty when conforming)."""
    return f"({CHECKER_JS})({json.dumps(expectations(packages))})"
