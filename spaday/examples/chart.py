"""Author a chart in typed Python and emit spaday's wire form for the browser to render.

Builds a ``LightweightChart`` component, serializes it to the JSON the spaday runtime consumes, and
also computes an *update patch* (with the Rust ``diff`` engine) so the page can apply a live,
incremental change. Run this, then serve the repo root and open ``index.html`` — see ``README.md``.
"""

import json
import random
from datetime import date, timedelta
from pathlib import Path

from spaday import diff
from spaday.components import LightweightChart

HERE = Path(__file__).parent


def random_walk(n: int, *, seed: int = 7, start: float = 100.0) -> list:
    """A deterministic daily-value series, e.g. ``[{"time": "2023-01-01", "value": 99.54}, ...]``."""
    random.seed(seed)
    value, day, points = start, date(2023, 1, 1), []
    for i in range(n):
        value += random.uniform(-1.4, 1.5)
        points.append({"time": (day + timedelta(days=i)).isoformat(), "value": round(value, 2)})
    return points


def main() -> None:
    points = random_walk(260)
    initial = LightweightChart(type="area", data=points[:200])
    updated = LightweightChart(type="line", data=points)  # switch area→line and reveal +60 days
    patch = json.loads(diff(initial.to_json(), updated.to_json()))  # the minimal patch from the core

    (HERE / "chart.json").write_text(initial.to_json())
    (HERE / "chart.patch.json").write_text(json.dumps(patch))

    print(f"Authored {type(initial).__name__}: {len(points[:200])} points (area).")
    print(f"Update patch: {len(patch['ops'])} ops {[next(iter(op)) for op in patch['ops']]}.")
    print("Wrote chart.json + chart.patch.json. Serve the repo root, open spaday/examples/index.html.")


if __name__ == "__main__":
    main()
