from src.utils.config import Config
from src.core.sheets import GoogleSheetsAPI
from src.utils.logger import get_logger

logger = get_logger(__name__)

def run_setup():
    logger.info("Starting Google Sheet Setup...")
    config = Config()
    if not config.credentials_path:
        logger.error("Credentials path not found in config.")
        return
        
    try:
        sheets_api = GoogleSheetsAPI(config)
        sheet_id = sheets_api.create_initial_sheet()
        logger.info(f"Setup complete. Please add SHEET_ID={sheet_id} to your .env file.")
    except Exception as e:
        logger.error(f"Setup failed: {e}")

if __name__ == "__main__":
    run_setup()
