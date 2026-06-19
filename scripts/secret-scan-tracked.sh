#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "ERROR: secret-scan-tracked must run inside a git repository" >&2
  exit 1
}
cd "$root"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "WARN: gitleaks not installed; skipped gitleaks scan"
  exit 0
fi

config="$root/security/gitleaks.toml"
if [[ ! -f "$config" ]]; then
  echo "ERROR: missing gitleaks config: $config" >&2
  exit 1
fi

tmp="$(mktemp -d)"
cleanup(){ rm -rf "$tmp"; }
trap cleanup EXIT

copied=0
while IFS= read -r -d '' path; do
  # Scan tracked files from the current working tree. This intentionally skips
  # untracked/ignored local secret files such as .env and Cloudflare audit logs.
  [[ -e "$path" ]] || continue
  mkdir -p "$tmp/$(dirname "$path")"
  cp -P "$path" "$tmp/$path"
  copied=$((copied + 1))
done < <(git ls-files -z)

if [[ "$copied" -eq 0 ]]; then
  echo "WARN: no tracked files found for secret scan"
  exit 0
fi

gitleaks detect --no-git --config "$config" --source "$tmp" --redact "$@"
