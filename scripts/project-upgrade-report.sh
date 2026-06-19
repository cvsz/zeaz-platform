#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="${PROJECT_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$PWD"
  while [[ "$ROOT" != "/" ]]; do
    if [[ -d "$ROOT/.git" || -f "$ROOT/Makefile" || -f "$ROOT/.env.example" ]]; then
      break
    fi
    ROOT="$(dirname "$ROOT")"
  done
fi
[[ "$ROOT" != "/" ]] || ROOT="$PWD"
cd "$ROOT"

REPORT_DIR="${REPORT_DIR:-reports}"
mkdir -p "$REPORT_DIR"
REPORT_FILE="${REPORT_FILE:-$REPORT_DIR/project-upgrade-report.md}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
has(){ command -v "$1" >/dev/null 2>&1; }

run_check(){
  local name="$1"
  shift
  local output rc
  log "running: $name"
  set +e
  output="$("$@" 2>&1)"
  rc=$?
  set -e
  {
    printf "\n### %s\n\n" "$name"
    printf "**Status:** \`%s\`\n\n" "$rc"
    printf "\`\`\`text\n%s\n\`\`\`\n" "$output"
  } >> "$REPORT_FILE"
  return 0
}

cat > "$REPORT_FILE" <<HEADER
# zeaz-platform Full Project Upgrade Report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Repository root: $ROOT

## Summary

This report runs CI-safe local checks for source health, tests, YAML syntax, shell syntax, Terraform formatting/validation, OpenTofu validation, Cloudflare docs context cache readiness, and repository hygiene.

Deployment secrets are treated as advisory here so the report can stay useful on fresh clones and CI. Use `make validate-env-strict` for strict deployment validation.

## Tool inventory

| Tool | Status |
|---|---|
HEADER

for tool in git bash python3 pytest terraform tofu cloudflared curl jq shellcheck; do
  if has "$tool"; then
    printf "| \`%s\` | available |\n" "$tool" >> "$REPORT_FILE"
  else
    printf "| \`%s\` | missing |\n" "$tool" >> "$REPORT_FILE"
  fi
done

{
  printf "\n## Git state\n\n"
  printf "\`\`\`text\n"
  git status --short 2>&1 || true
  printf "\nHEAD: "
  git rev-parse --short HEAD 2>/dev/null || true
  printf "\nBranch: "
  git branch --show-current 2>/dev/null || true
  printf "\n\`\`\`\n"
} >> "$REPORT_FILE"

run_check "Environment advisory check" bash scripts/env-report-check.sh

if has pytest; then
  run_check "Pytest" pytest -q tests
else
  run_check "Pytest" bash -lc 'echo "pytest missing; install requirements-dev.txt"; exit 0'
fi

run_check "YAML validation" python3 scripts/validate-yaml.py
run_check "Shell syntax" bash -lc 'find scripts ops -type f -name "*.sh" -print0 2>/dev/null | xargs -0 -r -I{} bash -n {}'

if has shellcheck; then
  run_check "Shellcheck" bash scripts/shellcheck-tracked.sh
else
  run_check "Shellcheck" bash -lc 'echo "shellcheck missing; skipped"; exit 0'
fi

if has terraform; then
  run_check "Terraform fmt check" terraform fmt -check -recursive terraform opentofu
  run_check "Terraform validate root" bash scripts/terraform/export-tf-vars.sh terraform -chdir=terraform validate
else
  run_check "Terraform" bash -lc 'echo "terraform missing; skipped"; exit 0'
fi

if has tofu && [[ -d opentofu/environments/${ENVIRONMENT:-dev} ]]; then
  tofu_path="$(command -v tofu)"
  if [[ "$tofu_path" == "/usr/bin/tofu" ]]; then
    run_check "OpenTofu" bash -lc 'echo "system /usr/bin/tofu appears to be a desktop UFO tool, not OpenTofu; install official opentofu binary or set TOFU_BIN"; exit 0'
  else
    run_check "OpenTofu validate" "$tofu_path" -chdir="opentofu/environments/${ENVIRONMENT:-dev}" validate
  fi
else
  run_check "OpenTofu" bash -lc 'echo "tofu missing or env root missing; skipped"; exit 0'
fi

if [[ -f scripts/cloudflare/fetch-cloudflare-llms-context.sh ]]; then
  run_check "Cloudflare docs cache fetch" bash scripts/cloudflare/fetch-cloudflare-llms-context.sh
else
  run_check "Cloudflare docs cache fetch" bash -lc 'echo "fetch script missing; skipped"; exit 0'
fi

cat >> "$REPORT_FILE" <<'FOOTER'

## Upgrade checklist

- [ ] Review `.env.example` against actual deployment values.
- [ ] Keep `COST_LOCK=true` for Free/no-cost operation.
- [ ] Run `make validate` after installing local dependencies.
- [ ] Run `make validate-env-strict` after real deployment values are filled.
- [ ] Review Terraform plan output before any apply.
- [ ] Run token lifecycle only in dry-run first.
- [ ] Confirm Cloudflare docs cache is refreshed before docs/API-related agent work.
- [ ] Do not commit `.env`, `.env.cloudflare`, `.cache`, tunnel credentials, origin certs, or state files.

## Recommended next commands

```bash
python3 -m pip install -r requirements-dev.txt
make setup-free
make validate
make yaml-validate
make tf-fmt-check
make tf-validate
bash scripts/project-upgrade-report.sh
```
FOOTER

log "wrote $REPORT_FILE"
