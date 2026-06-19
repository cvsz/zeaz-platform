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
    mode = r.get("origin_check") or ("must-run" if r["status"] == "active" or str(r["status"]).startswith("refactor-") else "report-only")
    health_path = r.get("health_path") or ""
    print(r["app_id"], r["hostname"], r["origin"], str(r["port"]), r["status"], mode, health_path, sep="\t")
PY

{
  echo "# Apps port origin check"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "| App | Hostname | Origin | Port | Status | Mode | Probe | Result |"
  echo "|---|---|---|---:|---|---|---|---|"
} > "$REPORT"

fail=0

while IFS=$'\t' read -r app hostname origin port status mode health_path; do
  result="UNKNOWN"
  probe="$origin/"
  if [[ -n "${health_path:-}" ]]; then
    probe="$origin$health_path"
  fi

  if [[ "$origin" == ssh://* ]]; then
    probe="tcp://127.0.0.1:$port"
    if timeout 2 bash -lc "cat < /dev/null > /dev/tcp/127.0.0.1/$port" 2>/dev/null; then
      result="PASS"
    else
      if [[ "$mode" == "must-run" ]]; then
        result="FAIL"
        fail=1
      else
        result="WARN"
      fi
    fi
  else
    code="$(curl -k -sS -o /dev/null -w '%{http_code}' --max-time 3 "$probe" 2>/dev/null || true)"
    case "$code" in
      200|204|301|302|307|308|401|403|404|405)
        result="PASS:$code"
        ;;
      *)
        if [[ "$mode" == "must-run" ]]; then
          result="FAIL:${code:-000}"
          fail=1
        else
          result="WARN:${code:-000}"
        fi
        ;;
    esac
  fi

  printf '| %s | `%s` | `%s` | %s | %s | %s | `%s` | %s |\n' "$app" "$hostname" "$origin" "$port" "$status" "$mode" "$probe" "$result" >> "$REPORT"
done < /tmp/zeaz-port-origins.tsv

rm -f /tmp/zeaz-port-origins.tsv

cat "$REPORT"

if [ "$fail" -ne 0 ]; then
  echo "ERROR: active/refactor origins are not reachable"
  exit 1
fi

echo "PASS: local origin check complete"
