#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: bash scripts/validate-config.sh

Offline validation for the LiteLLM service scaffold.
Checks file presence, YAML structure, and required environment keys in
.env.example without contacting third-party APIs.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
service_dir="$(cd "${script_dir}/.." && pwd)"

LITELLM_SERVICE_DIR="$service_dir" python3 - <<'PY'
from pathlib import Path
import sys
import yaml

root = Path(__import__("os").environ["LITELLM_SERVICE_DIR"])
required = [
    root / ".env.example",
    root / "docker-compose.yaml",
    root / "config" / "litellm.config.yaml",
    root / "monitoring" / "prometheus.yml",
]
missing = [str(path) for path in required if not path.exists()]
if missing:
    print({"ok": False, "missing": missing})
    sys.exit(1)

compose = yaml.safe_load((root / "docker-compose.yaml").read_text())
config = yaml.safe_load((root / "config" / "litellm.config.yaml").read_text())
prom = yaml.safe_load((root / "monitoring" / "prometheus.yml").read_text())

assert "services" in compose and "litellm" in compose["services"]
assert "model_list" in config and len(config["model_list"]) >= 1
assert "scrape_configs" in prom and len(prom["scrape_configs"]) >= 1

env_keys = {
    line.split("=", 1)[0]
    for line in (root / ".env.example").read_text().splitlines()
    if line and not line.startswith("#")
}
for key in ("LITELLM_MASTER_KEY", "OPENAI_API_KEY", "LITELLM_DB_PASSWORD", "GRAFANA_ADMIN_PASSWORD"):
    assert key in env_keys, key

print({"ok": True, "event": "litellm_scaffold_validated"})
PY
