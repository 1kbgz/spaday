import ast
import json
from pathlib import Path

from spaday import apply, diff, generate
from spaday.components import LightweightChart, PerspectivePanel

COMPONENTS = Path(__file__).parent.parent / "components"


def test_lightweight_chart_builds_a_node():
    node = LightweightChart(type="area", data=[{"time": "2019-01-01", "value": 1.0}]).to_node()
    assert node["tag"] == "lightweight-chart"
    assert node["props"]["type"] == {"Str": "area"}
    # the free-form `data` (Any) is tagged structurally, so it survives the wire
    assert node["props"]["data"]["List"][0]["Map"]["value"] == {"Float": 1.0}
    # unset props are omitted; the node round-trips through the core diff/apply
    assert "key" not in node
    tree = LightweightChart(type="line").to_json()
    assert json.loads(apply(tree, diff(tree, tree))) == json.loads(tree)


def test_lightweight_charts_codegen_is_current():
    """The committed wrapper class must match its hand-authored CEM through the generator (AST compare,
    so `ruff format` doesn't cause a false mismatch)."""
    fresh = generate(str(COMPONENTS / "lightweight_charts.cem.json"))
    committed = (COMPONENTS / "lightweight_charts.py").read_text(encoding="utf-8")
    assert ast.dump(ast.parse(fresh)) == ast.dump(ast.parse(committed)), (
        "spaday/components/lightweight_charts.py is stale — regenerate:\n"
        "  python -m spaday.cem spaday/components/lightweight_charts.cem.json "
        "-o spaday/components/lightweight_charts.py && ruff format spaday/components/lightweight_charts.py"
    )


def test_perspective_panel_builds_a_node():
    node = PerspectivePanel(config={"ws_url": "/perspective", "tables": ["trades"], "layout": {"viewers": {}}}).to_node()
    assert node["tag"] == "perspective-panel"
    # the whole config rides as one structurally-tagged prop (the runtime sets it via the element's setter)
    assert node["props"]["config"]["Map"]["ws_url"] == {"Str": "/perspective"}
    assert node["props"]["config"]["Map"]["tables"]["List"][0] == {"Str": "trades"}
    tree = PerspectivePanel().to_json()  # unset config is omitted; the node round-trips through the core
    assert json.loads(apply(tree, diff(tree, tree))) == json.loads(tree)


def test_perspective_codegen_is_current():
    fresh = generate(str(COMPONENTS / "perspective.cem.json"))
    committed = (COMPONENTS / "perspective.py").read_text(encoding="utf-8")
    assert ast.dump(ast.parse(fresh)) == ast.dump(ast.parse(committed)), (
        "spaday/components/perspective.py is stale — regenerate:\n"
        "  python -m spaday.cem spaday/components/perspective.cem.json "
        "-o spaday/components/perspective.py && ruff format spaday/components/perspective.py"
    )
