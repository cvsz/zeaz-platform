#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$ROOT/.env.full-local.example}"

cat > "$OUT" <<'EOF_ENV'
# zOffice safe full-feature local runtime
VO_OFFICE_NAME=zOffice
VO_PORT=8091
VO_WS_PORT=8092
VO_STATUS_DIR=.runtime/data
VO_CONFIG=.runtime/data/vo-config.json

VO_OPENCLAW_PATH=~/.openclaw
VO_GATEWAY_URL=ws://127.0.0.1:18789
VO_GATEWAY_HTTP=http://127.0.0.1:18789

VO_FEATURE_PC_METRICS=true
VO_FEATURE_SMS_PANEL=true
VO_FEATURE_BROWSER_PANEL=true
VO_FEATURE_WHISPER=true
VO_FEATURE_API_USAGE=true

VO_PC_METRICS_URL=http://127.0.0.1:8093
VO_WHISPER_URL=http://127.0.0.1:8087
VO_CDP_URL=
VO_VIEWER_URL=

VO_HERMES_ENABLED=true
VO_HERMES_HOME=~/.hermes
VO_HERMES_BIN=~/.local/bin/hermes
VO_HERMES_TIMEOUT_SEC=600

VO_WEATHER_LOCATION=Bangkok,TH
VO_SMS_OWNER_AGENT_ID=
VO_SMS_AGENT_ID=
VO_SMS_TIMEZONE=Asia/Bangkok
EOF_ENV

echo "Generated: $OUT"
echo "Safe mode: optional panels enabled; provider actions remain configuration-gated."
