import pytest
from pydantic import ValidationError
from src.utils.config import Settings

def test_config_validation_success(monkeypatch):
    monkeypatch.setenv("SHEET_ID", "123")
    monkeypatch.setenv("LINE_CHANNEL_ACCESS_TOKEN", "123456789012345678901")
    monkeypatch.setenv("LINE_GROUP_ID", "456")
    monkeypatch.setenv("IMGUR_CLIENT_ID", "789")
    monkeypatch.setenv("GOOGLE_APPLICATION_CREDENTIALS", "dummy.json")
    
    settings = Settings(_env_file=None)
    assert settings.sheet_id == "123"

def test_config_validation_fail(monkeypatch):
    monkeypatch.setenv("SHEET_ID", "123")
    monkeypatch.delenv("LINE_CHANNEL_ACCESS_TOKEN", raising=False)
    # force ignoring .env
    with pytest.raises(ValidationError):
        Settings(_env_file=None)
