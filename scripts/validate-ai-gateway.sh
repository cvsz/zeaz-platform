#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

offline=false
if [[ "${1:-}" == "--offline" ]]; then
  offline=true
fi

: "${CF_ACCOUNT_ID:=offline-account}"
: "${CF_AI_GATEWAY_SLUG:=cloudflare-platform-ai-gateway}"

if ! [[ "$CF_ACCOUNT_ID" =~ ^[a-fA-F0-9]{32}$|^offline-account$ ]]; then
  echo '{"level":"error","event":"invalid_account_id"}'
  exit 1
fi
if ! [[ "$CF_AI_GATEWAY_SLUG" =~ ^[a-z0-9-]{3,63}$ ]]; then
  echo '{"level":"error","event":"invalid_gateway_slug"}'
  exit 1
fi

python3 - <<'PY'
import sys, yaml
from pathlib import Path
p = Path('workers-ai/ai-gateway.yaml')
obj = yaml.safe_load(p.read_text())
assert obj['gateway']['slug_var'] == 'CF_AI_GATEWAY_SLUG'
assert obj['providers'][0]['api_key_source'] == 'env'
print('{"level":"info","event":"ai_gateway_config_validated"}')
PY

if [[ "$offline" == false ]]; then
  echo '{"level":"info","event":"online_validation_not_implemented_without_cf_api_call"}'
fi
