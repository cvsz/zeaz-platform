#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

show_help() {
  cat <<'EOF'
Usage: validate-policies.sh

Offline validation for LiteLLM access and quota policy files.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
  show_help
  exit 0
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
service_dir="$(cd "${script_dir}/.." && pwd)"
export LITELLM_SERVICE_DIR="${service_dir}"

python3 <<'PY'
from __future__ import annotations

import os
from pathlib import Path

import yaml

service_dir = Path(os.environ["LITELLM_SERVICE_DIR"])
access_path = service_dir / "policies" / "access-policy.yaml"
quota_path = service_dir / "policies" / "quota-policy.yaml"

access = yaml.safe_load(access_path.read_text(encoding="utf-8"))
quota = yaml.safe_load(quota_path.read_text(encoding="utf-8"))

required_access_headers = {"user", "role", "groups"}
header_keys = set((access.get("headers") or {}).keys())
if not required_access_headers.issubset(header_keys):
    raise SystemExit(f"access policy missing headers: {sorted(required_access_headers - header_keys)}")

required_groups = set((access.get("identity") or {}).get("required_groups") or [])
if not {"zveo-admin", "zveo-publisher"}.issubset(required_groups):
    raise SystemExit("access policy must include at least zveo-admin and zveo-publisher")

tiers = quota.get("tiers") or {}
for tier in ("free", "starter", "pro", "enterprise"):
    if tier not in tiers:
        raise SystemExit(f"quota policy missing tier: {tier}")
    tier_cfg = tiers[tier] or {}
    for key in ("llm_requests_per_minute", "llm_requests_per_day", "allowed_models"):
        if key not in tier_cfg:
            raise SystemExit(f"quota policy tier {tier} missing field: {key}")

print({"ok": True, "event": "litellm_policies_validated"})
PY
