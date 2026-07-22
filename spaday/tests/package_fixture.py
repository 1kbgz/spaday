from pathlib import Path

from spaday.packages import ComponentPackage

package = ComponentPackage(
    name="fixture",
    assets_dir=Path(__file__).parent / "fixtures" / "component_package",
    assets=(("css", "fixture.css"), ("js", "fixture.js")),
)
