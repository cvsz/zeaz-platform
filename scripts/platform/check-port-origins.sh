#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

PLAN="configs/platform/apps-port-plan.json"
REPORT="reports/platform/apps-port-origin-check.md"
mkdir -p "$(dirname "$REPORT")"

python3 - "$PLAN" <<'PY' > /tmp/zeaz-port-origins.tsv
import json, sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text())
for r in data["routes"]:
    if r["status"] == "reserved":
        continue
    print(r["app_id"], r["hostname"], r["origin"], str(r["port"]), r["status"], sep="\t")
PY

{
  echo "# Apps port origin check"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "| App | Hostname | Origin | Port | Status | Result |"
  echo "|---|---|---|---:|---|---|"
} > "$REPORT"

fail=0

while IFS=$'\t' read -r app hostname origin port status; do
  result="UNKNOWN"

  if [[ "$origin" == ssh://* ]]; then
    if timeout 2 bash -lc "cat < /dev/null > /dev/tcp/127.0.0.1/$port" 2>/dev/null; then
      result="PASS"
    else
      result="FAIL"
      fail=1
    fi
  else
    code="$(curl -k -sS -o /dev/null -w '%{http_code}' --max-time 3 "$origin" 2>/dev/null || true)"
    case "$code" in
      200|204|301|302|307|308|401|403|404|405)
        result="PASS:$code"
        ;;
      *)
        result="FAIL:${code:-000}"
        if [[ "$status" == "active" || "$status" == refactor-* ]]; then
          fail=1
        fi
        ;;
    esac
  fi

  printf '| %s | `%s` | `%s` | %s | %s | %s |\n' "$app" "$hostname" "$origin" "$port" "$status" "$result" >> "$REPORT"
done < /tmp/zeaz-port-origins.tsv

rm -f /tmp/zeaz-port-origins.tsv

cat "$REPORT"

if [ "$fail" -ne 0 ]; then
  echo "ERROR: active/refactor origins are not reachable"
  exit 1
fi

echo "PASS: local origin check complete"
