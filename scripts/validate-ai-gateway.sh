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
from pathlib import Path
import yaml

cfg = yaml.safe_load(Path('workers-ai/ai-gateway.yaml').read_text())
quota = yaml.safe_load(Path('workers-ai/quota-policy.yaml').read_text())

assert cfg['gateway']['slug_var'] == 'CF_AI_GATEWAY_SLUG'
assert cfg['gateway']['recommended_slug'] == 'cloudflare-platform-ai-gateway'
assert cfg['providers'][0]['api_key_source'] == 'env'
assert quota['abuse_controls']['max_prompt_bytes'] <= 131072
assert quota['abuse_controls']['max_upload_bytes'] <= 26214400
print('{"level":"info","event":"ai_gateway_config_validated"}')
PY

if [[ "$offline" == false ]]; then
  echo '{"level":"info","event":"online_validation_not_implemented_without_cf_api_call"}'
fi
