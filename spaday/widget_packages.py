"""Transfer installed component assets over a widget comm, without a web server."""

import hashlib
import json
import mimetypes
from dataclasses import dataclass

from .packages import ComponentPackage


@dataclass(frozen=True)
class PackageBundle:
    descriptor: dict
    files: tuple[dict, ...]
    data: bytes


def bundle_package(package: ComponentPackage) -> PackageBundle:
    root = package.assets_dir.resolve()
    if not root.is_dir():
        raise ValueError(f"component package {package.name!r} has no built assets")
    files, chunks = [], []
    offset = 0
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.name.endswith((".map", ".d.ts")):
            continue
        if not path.resolve().is_relative_to(root):
            raise ValueError(f"component package asset escapes its directory: {path}")
        data = path.read_bytes()
        mime = {".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".wasm": "application/wasm"}.get(path.suffix)
        files.append(
            {
                "path": path.relative_to(root).as_posix(),
                "offset": offset,
                "length": len(data),
                "type": mime or mimetypes.guess_type(path)[0] or "application/octet-stream",
            }
        )
        chunks.append(data)
        offset += len(data)
    names = {file["path"] for file in files}
    for _, path in package.assets:
        if path not in names:
            raise ValueError(f"component package {package.name!r} is missing asset {path!r}")
    for _, path in package.imports:
        if path not in names and not (path.endswith("/") and any(name.startswith(path) for name in names)):
            raise ValueError(f"component package {package.name!r} is missing import path {path!r}")
    descriptor = {
        "name": package.name,
        "assets": package.assets,
        "imports": package.imports,
        "provides": package.provides,
        "requires": package.requires,
        "tags": [component.tag for component in package.components],
    }
    data = b"".join(chunks)
    digest = hashlib.sha256(json.dumps([descriptor, files], sort_keys=True).encode() + data).hexdigest()
    return PackageBundle({**descriptor, "id": digest}, tuple(files), data)
