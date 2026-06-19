from prometheus_client import Counter, Gauge
import time

stickers_generated_total = Counter('stickers_generated_total', 'Total stickers generated')
line_send_success = Counter('line_send_success', 'Total successful LINE messages')
sheets_errors = Counter('sheets_errors', 'Total Google Sheets errors')

last_run_timestamp = Gauge('last_run_timestamp', 'Timestamp of the last run')
pending_tasks_count = Gauge('pending_tasks_count', 'Number of pending tasks')
