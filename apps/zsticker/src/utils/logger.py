import os
import sys
from loguru import logger

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Determine log level
env = os.getenv("ENV", "production").lower()
log_level = "DEBUG" if env == "development" else "INFO"

# Remove default logger to prevent duplicates
logger.remove()

# Format for file and console
log_format = "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{extra[name]}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"

# Console output
logger.add(sys.stdout, format=log_format, level=log_level, colorize=True)

# Standard rotation files
logger.add("logs/app.log", rotation="10 MB", retention="7 days", level=log_level, format=log_format)
logger.add("logs/error.log", rotation="10 MB", retention="7 days", level="ERROR", format=log_format)

# Module-specific files based on bound name
logger.add("logs/line_api.log", rotation="10 MB", retention="7 days", level=log_level, format=log_format, filter=lambda r: "line" in r["extra"].get("name", "").lower())
logger.add("logs/sheets.log", rotation="10 MB", retention="7 days", level=log_level, format=log_format, filter=lambda r: "sheets" in r["extra"].get("name", "").lower())

# LINE Admin Error Handler
class LineAdminHandler:
    def write(self, message):
        record = message.record
        if record["level"].name in ["ERROR", "CRITICAL"]:
            admin_id = os.getenv("ADMIN_LINE_GROUP_ID")
            token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
            if admin_id and token:
                import requests
                url = "https://api.line.me/v2/bot/message/push"
                headers = {"Authorization": f"Bearer {token}"}
                data = {"to": admin_id, "messages": [{"type": "text", "text": f"🚨 {record['level'].name} 🚨\n{record['message']}"}]}
                try:
                    requests.post(url, headers=headers, json=data, timeout=3)
                except Exception as e:
                    import sys
                    print(f"Failed to send LINE admin alert: {e}", file=sys.stderr)

logger.add(LineAdminHandler(), level="ERROR", format="{message}")

def get_logger(name: str):
    return logger.bind(name=name)
