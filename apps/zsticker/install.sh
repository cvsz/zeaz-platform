#!/bin/bash
set -e
echo "=== Line Sticker Auto Installer ==="
command -v python3 >/dev/null 2>&1 || { echo "ต้องติดตั้ง Python3 ก่อน"; exit 1; }
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp -n .env.example .env 2>/dev/null || true
mkdir -p fonts output templates
curl -sL "https://github.com/google/fonts/raw/main/ofl/kanit/Kanit-Bold.ttf" -o fonts/Kanit-Bold.ttf
[ ! -f credentials.json ] && echo '{"type":"service_account","project_id":"your-project"}' > credentials.json
echo "=== เสร็จแล้ว ==="
