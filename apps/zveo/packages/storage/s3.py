"""S3-compatible asset storage used by MinIO and cloud object stores."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import boto3
from botocore.client import BaseClient
from botocore.exceptions import ClientError

from packages.logger import get_logger
from packages.storage.validator import sha256_file, validate_asset

logger = get_logger(__name__)


@dataclass(frozen=True)
class StoredAsset:
    bucket: str
    key: str
    checksum_sha256: str
    size_bytes: int
    content_type: str


class S3AssetStore:
    """Validated object storage with checksum metadata and retry-capable clients."""

    def __init__(self, bucket: str, endpoint_url: str | None = None, client: BaseClient | None = None) -> None:
        self.bucket = bucket
        self.client = client or boto3.client("s3", endpoint_url=endpoint_url)

    def ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError:
            self.client.create_bucket(Bucket=self.bucket)

    def put_asset(self, path: str, key: str, content_type: str = "application/octet-stream") -> StoredAsset:
        validate_asset(path)
        checksum = sha256_file(path)
        file_path = Path(path)
        self.ensure_bucket()
        self.client.upload_file(
            str(file_path),
            self.bucket,
            key,
            ExtraArgs={"ContentType": content_type, "Metadata": {"sha256": checksum}},
        )
        logger.info("asset stored", extra={"asset_id": key})
        return StoredAsset(self.bucket, key, checksum, file_path.stat().st_size, content_type)

    def signed_download_url(self, key: str, expires_seconds: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_seconds,
        )
