#!/bin/bash

echo "========================================="
echo "   🌿 zsticker Environment Generator"
echo "========================================="
echo "This script will interactively configure your .env file."
echo "If you want to keep the default value, just press Enter."
echo ""

# Default values
DEF_LINE_TOKEN="put_your_long_lived_token_here"
DEF_LINE_GROUP="C1234567890abcdef"
DEF_SHEET="1A2B3C_your_google_sheet_id"
DEF_IMGUR="your_imgur_client_id"
DEF_PASS="admin123"

read -p "1. LINE Channel Access Token [$DEF_LINE_TOKEN]: " LINE_TOKEN
LINE_TOKEN=${LINE_TOKEN:-$DEF_LINE_TOKEN}

read -p "2. LINE Group ID (Starts with C) [$DEF_LINE_GROUP]: " LINE_GROUP
LINE_GROUP=${LINE_GROUP:-$DEF_LINE_GROUP}

read -p "3. Google Sheet ID [$DEF_SHEET]: " SHEET_ID
SHEET_ID=${SHEET_ID:-$DEF_SHEET}

read -p "4. Imgur Client ID [$DEF_IMGUR]: " IMGUR_ID
IMGUR_ID=${IMGUR_ID:-$DEF_IMGUR}

read -p "5. Dashboard Admin Password [$DEF_PASS]: " DASHBOARD_PASS
DASHBOARD_PASS=${DASHBOARD_PASS:-$DEF_PASS}

echo ""
echo "⚙️ Writing configuration to .env..."

cat > .env <<EOF
LINE_CHANNEL_ACCESS_TOKEN=$LINE_TOKEN
LINE_GROUP_ID=$LINE_GROUP
SHEET_ID=$SHEET_ID
IMGUR_CLIENT_ID=$IMGUR_ID
DASHBOARD_PASSWORD=$DASHBOARD_PASS
EOF

echo "✅ .env file successfully generated!"
echo "If your Docker containers are already running, you can restart them to apply the new environment using:"
echo "   docker compose down && make golive"
echo ""
