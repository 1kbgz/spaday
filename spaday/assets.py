"""Opt-in HTTP caching and compression for Spaday's static assets."""

from __future__ import annotations

import gzip
import hashlib
import mimetypes
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from functools import cached_property
from pathlib import Path, PurePosixPath
from typing import Literal

from .packages import ComponentPackage, package_url_prefix


@dataclass(frozen=True)
class AssetPolicy:
    """Static asset serving options, shared by all HTTP backends.

    ``cache="immutable"`` snapshots bundles at app startup and puts their content hashes in URLs.
    ``cache="revalidate"`` retains stable URLs and checks file changes on each request.
    ``compression="gzip"`` negotiates gzip for compressible files of at least 1 KiB and caches it.
    Omit ``assets=`` on a backend to retain its existing static-file behavior.
    """

    cache: Literal["revalidate", "immutable"] = "revalidate"
    compression: Literal["gzip"] | None = None

    def __post_init__(self) -> None:
        if self.cache not in ("revalidate", "immutable"):
            raise ValueError("asset cache must be 'revalidate' or 'immutable'")
        if self.compression not in (None, "gzip"):
            raise ValueError("asset compression must be None or 'gzip'")


@dataclass
class _File:
    data: bytes
    content_type: str

    @cached_property
    def etag(self) -> str:
        return '"' + hashlib.sha256(self.data).hexdigest() + '"'

    @cached_property
    def compressed_etag(self) -> str:
        return '"' + hashlib.sha256(self.compressed).hexdigest() + '"'

    @cached_property
    def compressed(self) -> bytes:
        return gzip.compress(self.data, compresslevel=6, mtime=0)


@dataclass(frozen=True)
class AssetResponse:
    status: int
    headers: dict[str, str]
    body: bytes = b""


def _accepts(header: str, coding: str) -> float:
    values = {}
    for part in header.lower().split(","):
        name, *parameters = part.strip().split(";")
        quality = 1.0
        for parameter in parameters:
            key, _, value = parameter.strip().partition("=")
            if key == "q":
                try:
                    quality = float(value)
                except ValueError:
                    quality = 0.0
        values[name] = quality if 0 <= quality <= 1 else 0.0
    if coding in values:
        return values[coding]
    if coding == "identity":
        return 0.0 if values.get("*") == 0 else 1.0
    return values.get("*", 0.0)


class AssetBundle:
    """A static directory, optionally frozen at one immutable URL prefix."""

    def __init__(self, directory: Path, prefix: str, policy: AssetPolicy, roots: Sequence[Path] | None = None):
        self.directory = directory.resolve()
        self.prefix = prefix
        self.policy = policy
        self._files: dict[str, _File] = {}
        self._live_files: dict[str, tuple[tuple[int, int, int], _File]] = {}
        self.digest: str | None = None
        if policy.cache == "immutable":
            for root in roots or (directory,):
                for path in sorted(root.rglob("*")):
                    if path.is_file() and path.resolve().is_relative_to(self.directory):
                        name = path.relative_to(directory).as_posix()
                        self._files[name] = self._load(path)
            digest = hashlib.sha256()
            for name, asset in sorted(self._files.items()):
                digest.update(name.encode() + b"\0" + hashlib.sha256(asset.data).digest())
            self.digest = digest.hexdigest()
        self.url = f"{prefix}/_v/{self.digest}" if self.digest else prefix

    @staticmethod
    def _load(path: Path) -> _File:
        media = "application/wasm" if path.suffix == ".wasm" else mimetypes.guess_type(path.name)[0]
        return _File(path.read_bytes(), media or "application/octet-stream")

    def response(self, name: str, headers: Mapping[str, str], method: str = "GET") -> AssetResponse:
        if method not in ("GET", "HEAD"):
            return AssetResponse(405, {"Allow": "GET, HEAD"})
        immutable = False
        if name.startswith("_v/"):
            _, digest, name = (name.split("/", 2) + [""])[:3]
            if not self.digest or digest != self.digest:
                return AssetResponse(404, {})
            immutable = True
        if not name or "\\" in name or "\0" in name or name.startswith("/") or ".." in PurePosixPath(name).parts:
            return AssetResponse(404, {})
        if self.digest:
            asset = self._files.get(name)
        else:
            path = (self.directory / name).resolve()
            if not path.is_relative_to(self.directory) or not path.is_file():
                return AssetResponse(404, {})
            try:
                stat = path.stat()
                stamp = (stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size)
                cached = self._live_files.get(name)
                if cached is None or cached[0] != stamp:
                    cached = (stamp, self._load(path))
                    self._live_files[name] = cached
                asset = cached[1]
            except OSError:
                return AssetResponse(404, {})
        if asset is None:
            return AssetResponse(404, {})
        result = {"Content-Type": asset.content_type, "Cache-Control": "public, max-age=31536000, immutable" if immutable else "no-cache"}
        data = asset.data
        compressible = asset.content_type.startswith("text/") or asset.content_type in (
            "application/javascript",
            "application/json",
            "application/wasm",
            "image/svg+xml",
        )
        accepts = headers.get("accept-encoding", "")
        identity = _accepts(accepts, "identity")
        if self.policy.compression == "gzip" and compressible and len(data) >= 1024:
            result["Vary"] = "Accept-Encoding"
            quality = _accepts(accepts, "gzip")
            if quality > 0 and quality >= identity:
                data = asset.compressed
                result["Content-Encoding"] = "gzip"
            elif identity == 0:
                return AssetResponse(406, {"Vary": "Accept-Encoding"})
        elif identity == 0:
            return AssetResponse(406, {"Vary": "Accept-Encoding"})
        etag = asset.compressed_etag if "Content-Encoding" in result else asset.etag
        result["ETag"] = etag
        candidates = headers.get("if-none-match", "").split(",")
        if any(tag.strip().removeprefix("W/") in (etag, "*") for tag in candidates):
            return AssetResponse(304, result)
        result["Content-Length"] = str(len(data))
        return AssetResponse(200, result, b"" if method == "HEAD" else data)


def asset_bundles(
    directory: Path, packages: Sequence[ComponentPackage], prefix: str, policy: AssetPolicy | None, *, source: bool = False
) -> list[AssetBundle]:
    """Prepare assets once per mount; source checkouts include built output only."""
    if policy is None:
        return []
    if not isinstance(policy, AssetPolicy):
        raise TypeError("assets must be an AssetPolicy or None")
    roots = (directory / "dist", directory / "node_modules/@1kbgz/transports/dist") if source else None
    return [
        AssetBundle(directory, f"{prefix}/js", policy, roots),
        *(AssetBundle(p.assets_dir, package_url_prefix(p, prefix), policy) for p in packages),
    ]
