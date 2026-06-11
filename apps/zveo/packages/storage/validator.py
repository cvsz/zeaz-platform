"""Asset validation for generated media and uploaded inputs."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Final

ALLOWED_EXTENSIONS: Final = {".mp4", ".mov", ".mkv", ".png", ".jpg", ".jpeg", ".webp", ".srt", ".vtt", ".wav", ".mp3", ".flac"}
MAX_SIZE_MB: Final = 1024
MAGIC_BYTES: Final[dict[str, tuple[bytes, ...]]] = {
    ".mp4": (b"....ftyp",),
    ".mov": (b"....ftyp",),
    ".png": (b"\x89PNG\r\n\x1a\n",),
    ".jpg": (b"\xff\xd8\xff",),
    ".jpeg": (b"\xff\xd8\xff",),
    ".webp": (b"RIFF",),
    ".wav": (b"RIFF",),
    ".mp3": (b"ID3", b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"),
}


def sha256_file(path: str | Path) -> str:
    """Calculate a streaming SHA-256 checksum for storage integrity."""

    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _matches_magic(path: Path) -> bool:
    suffix = path.suffix.lower()
    expected = MAGIC_BYTES.get(suffix)
    if not expected:
        return True
    with path.open("rb") as handle:
        header = handle.read(16)
    if suffix in {".mp4", ".mov"}:
        return len(header) >= 12 and header[4:8] == b"ftyp"
    if suffix == ".webp":
        return len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"
    return any(header.startswith(candidate) for candidate in expected)


def validate_asset(path: str, max_size_mb: int = MAX_SIZE_MB, strict_magic: bool = False) -> bool:
    """Validate existence, extension, non-empty content, size, and optional magic bytes."""

    asset_path = Path(path)
    if not asset_path.exists():
        raise FileNotFoundError(path)
    if not asset_path.is_file():
        raise ValueError("asset path must be a file")
    if asset_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ValueError("invalid extension")
    size = asset_path.stat().st_size
    if size <= 0:
        raise ValueError("file is empty")
    if size / 1024 / 1024 > max_size_mb:
        raise ValueError("file too large")
    if strict_magic and not _matches_magic(asset_path):
        raise ValueError("file signature does not match extension")
    return True
