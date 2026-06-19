import os
import gspread
from src.utils.logger import get_logger
from src.utils.retry import retry
from src.utils.metrics import sheets_errors

logger = get_logger(__name__)

class GoogleSheetsAPI:
    def __init__(self, config):
        self.sheet_id = config.sheet_id
        self.credentials_path = config.credentials_path
        self.scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        self.client = self._authorize()

    @retry(times=3, delay=2, backoff=2)
    def _authorize(self):
        # Auto-detect which auth method to use
        if os.path.exists(self.credentials_path):
            logger.info(f"🔑 Authorizing Google Sheets with Service Account JSON: {self.credentials_path}")
            from oauth2client.service_account import ServiceAccountCredentials
            creds = ServiceAccountCredentials.from_json_keyfile_name(self.credentials_path, self.scope)
            return gspread.authorize(creds)
        else:
            logger.info("🛡️ Authorizing Google Sheets with Application Default Credentials (ADC)")
            import google.auth
            credentials, project = google.auth.default(scopes=self.scope)
            return gspread.authorize(credentials)

    @retry(times=5, delay=2, backoff=2)
    def get_sheet(self):
        return self.client.open_by_key(self.sheet_id).sheet1

    @retry(times=5, delay=2, backoff=2)
    def get_pending_rows(self) -> list:
        sheet = self.get_sheet()
        rows = sheet.get_all_records()
        pending = []
        for i, row in enumerate(rows, start=2):
            if str(row.get('status', '')).strip().lower() == 'pending':
                pending.append((i, row))
        return pending

    @retry(times=5, delay=2, backoff=2)
    def update_status(self, row_id: int, status: str, error_msg: str = "", image_url: str = "", timestamp: str = ""):
        """Single row update"""
        sheet = self.get_sheet()
        # E: status, F: error, G: image_url, H: timestamp
        sheet.update(f'E{row_id}:H{row_id}', [[status, error_msg, image_url, timestamp]])
        logger.info(f"Row {row_id} updated: status={status}")

    @retry(times=5, delay=2, backoff=2)
    def batch_update_rows(self, updates: list):
        """
        Batch update to reduce API calls.
        updates = [
            {'row_id': 2, 'status': 'done', 'error': '', 'image_url': 'http..', 'timestamp': '2023-..'},
            ...
        ]
        """
        if not updates:
            return

        sheet = self.get_sheet()
        data = []
        for u in updates:
            row_id = u['row_id']
            status = u.get('status', '')
            error = u.get('error', '')
            img = u.get('image_url', '')
            ts = u.get('timestamp', '')
            
            data.append({
                'range': f'E{row_id}:H{row_id}',
                'values': [[status, error, img, ts]]
            })
            
        sheet.batch_update(data)
        logger.info(f"✅ Batch updated {len(updates)} rows successfully.")

    @retry(times=3, delay=2, backoff=2)
    def create_initial_sheet(self, title: str = 'Line Sticker Auto') -> str:
        sh = self.client.create(title)
        ws = sh.sheet1
        headers = ['ชื่อสินค้า', 'ราคา', 'โปร', 'แคปชั่น', 'status', 'error', 'image_url', 'timestamp']
        ws.update('A1:H1', [headers])
        ws.update('A2:H2', [['เสื้อครอป', '199', 'ส่งฟรี', 'ของใหม่เข้า', 'pending', '', '', '']])
        sh.share(None, perm_type='anyone', role='writer')
        logger.info(f"Sheet created: {sh.url}")
        return sh.id
