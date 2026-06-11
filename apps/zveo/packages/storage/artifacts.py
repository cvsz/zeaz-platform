"""Artifact upload helpers with checksum validation."""

from __future__ import annotations

from dataclasses import asdict
from pathlib import Path

from packages.storage.s3 import S3AssetStore, StoredAsset
from packages.storage.validator import sha256_file, validate_asset
from packages.telemetry.metrics import ARTIFACT_UPLOADS


class ArtifactUploader:
    """Uploads validated files and verifies stored checksum metadata."""

    def __init__(self, store: S3AssetStore, prefix: str = "renders") -> None:
        self.store = store
        self.prefix = prefix.strip("/")

    def upload(self, path: Path, job_id: str, kind: str, content_type: str = "application/octet-stream") -> StoredAsset:
        validate_asset(str(path))
        checksum = sha256_file(path)
        key = f"{self.prefix}/{job_id}/{path.name}"
        stored = self.store.put_asset(str(path), key, content_type)
        if stored.checksum_sha256 != checksum:
            raise ValueError("uploaded artifact checksum mismatch")
        ARTIFACT_UPLOADS.labels(kind, content_type).inc()
        return stored

    def upload_many(self, paths: list[Path], job_id: str, kind: str) -> list[dict]:
        return [asdict(self.upload(path, job_id, kind)) for path in paths]
