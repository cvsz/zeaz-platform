import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from src.core.line import LineAPI
from src.utils.config import Settings

@pytest.fixture
def mock_config(monkeypatch):
    monkeypatch.setenv("SHEET_ID", "123")
    monkeypatch.setenv("LINE_CHANNEL_ACCESS_TOKEN", "123456789012345678901")
    monkeypatch.setenv("LINE_GROUP_ID", "456")
    monkeypatch.setenv("IMGUR_CLIENT_ID", "789")
    monkeypatch.setenv("GOOGLE_APPLICATION_CREDENTIALS", "dummy.json")
    return Settings(_env_file=None)

@pytest.mark.asyncio
async def test_upload_imgur(mock_config):
    line = LineAPI(mock_config)
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"data": {"link": "http://imgur.com/xyz"}}
        mock_post.return_value = mock_resp
        
        with open("dummy.png", "wb") as f: f.write(b"")
        url = await line.upload_to_imgur("dummy.png", retries=1)
        assert url == "http://imgur.com/xyz"

@pytest.mark.asyncio
async def test_send_image(mock_config):
    line = LineAPI(mock_config)
    with patch("src.core.line.LineAPI._enqueue_payload", new_callable=AsyncMock) as mock_enqueue:
        mock_enqueue.return_value = {"success": True, "error_code": 200}
        result = await line.send_image("http://url", "cap")
        assert result["success"] is True
