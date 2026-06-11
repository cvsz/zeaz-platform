import pytest

from packages.storage.validator import validate_asset


def test_validate_asset_allows_supported_file(tmp_path) -> None:
    asset = tmp_path / "clip.mp4"
    asset.write_bytes(b"video")

    assert validate_asset(str(asset)) is True


def test_validate_asset_rejects_extension(tmp_path) -> None:
    asset = tmp_path / "payload.exe"
    asset.write_bytes(b"bad")

    with pytest.raises(ValueError, match="invalid extension"):
        validate_asset(str(asset))


def test_strict_magic_rejects_mismatched_signature(tmp_path) -> None:
    asset = tmp_path / "clip.mp4"
    asset.write_bytes(b"not an mp4 payload")

    with pytest.raises(ValueError, match="file signature does not match extension"):
        validate_asset(str(asset), strict_magic=True)
