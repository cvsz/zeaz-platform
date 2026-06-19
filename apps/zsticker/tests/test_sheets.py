import pytest
from unittest.mock import MagicMock, patch
from src.core.sheets import GoogleSheetsAPI
from src.utils.config import Settings

@pytest.fixture
def mock_config(monkeypatch):
    monkeypatch.setenv("SHEET_ID", "123")
    monkeypatch.setenv("LINE_CHANNEL_ACCESS_TOKEN", "123456789012345678901")
    monkeypatch.setenv("LINE_GROUP_ID", "456")
    monkeypatch.setenv("IMGUR_CLIENT_ID", "789")
    monkeypatch.setenv("GOOGLE_APPLICATION_CREDENTIALS", "dummy.json")
    return Settings(_env_file=None)

@patch("os.path.exists", return_value=False)
@patch("src.core.sheets.gspread.authorize")
@patch("google.auth.default")
def test_get_pending_rows(mock_auth, mock_gspread, mock_exists, mock_config):
    mock_auth.return_value = (MagicMock(), "project")
    mock_client = MagicMock()
    mock_gspread.return_value = mock_client
    mock_sheet = MagicMock()
    mock_client.open_by_key.return_value.sheet1 = mock_sheet
    mock_sheet.get_all_records.return_value = [
        {"ชื่อสินค้า": "B", "status": "pending"},
    ]
    api = GoogleSheetsAPI(mock_config)
    pending = api.get_pending_rows()
    assert len(pending) == 1

@patch("os.path.exists", return_value=False)
@patch("src.core.sheets.gspread.authorize")
@patch("google.auth.default")
def test_batch_update(mock_auth, mock_gspread, mock_exists, mock_config):
    mock_auth.return_value = (MagicMock(), "project")
    mock_client = MagicMock()
    mock_gspread.return_value = mock_client
    mock_sheet = MagicMock()
    mock_client.open_by_key.return_value.sheet1 = mock_sheet
    
    api = GoogleSheetsAPI(mock_config)
    api.batch_update_rows([{"row_id": 2, "status": "done"}])
    mock_sheet.batch_update.assert_called_once()
