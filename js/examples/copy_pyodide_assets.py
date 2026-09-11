"""Copy browser assets from dependency wheels into a static documentation site."""

import sys
import zipfile
from pathlib import Path

PACKAGES = (
    ("transports", "transports", "transports"),
    ("spaday-webawesome", "spaday_webawesome", "webawesome"),
    ("spaday-lightweight-charts", "spaday_lightweight_charts", "lightweight-charts"),
)


def main(wheel_dir: Path, output_dir: Path) -> None:
    for distribution, package, asset_name in PACKAGES:
        wheels = sorted(wheel_dir.glob(f"{distribution.replace('-', '_')}-*.whl"))
        if len(wheels) != 1:
            raise RuntimeError(f"expected one {distribution} wheel in {wheel_dir}, found {len(wheels)}")
        prefix = f"{package}/extension/"
        with zipfile.ZipFile(wheels[0]) as wheel:
            assets = [name for name in wheel.namelist() if name.startswith(prefix) and not name.endswith("/")]
            if not assets:
                raise RuntimeError(f"{wheels[0].name} contains no browser assets")
            for name in assets:
                target = output_dir / asset_name / name.removeprefix(prefix)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(wheel.read(name))


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
