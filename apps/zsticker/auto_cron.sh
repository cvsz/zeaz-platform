#!/bin/bash
# ตั้งให้รันทุก 5 นาที
CRON="*/5 * * * * cd $HOME/zsticker && $HOME/zsticker/venv/bin/python main.py >> $HOME/sticker.log 2>&1"
(crontab -l 2>/dev/null; echo "$CRON") | crontab -
echo "✅ ตั้ง cron เรียบร้อย รันทุก 5 นาที"
echo "ดู log: tail -f ~/sticker.log"
