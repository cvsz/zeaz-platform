#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

trap 'printf "{\"level\":\"error\",\"script\":\"sign-artifacts\",\"line\":%s}\n" "$LINENO" >&2' ERR

artifact="${1:-artifacts.sbom.spdx.json}"
[[ -f "$artifact" ]] || { echo "artifact not found: $artifact" >&2; exit 1; }
: "${COSIGN_OPTIONAL:=true}"

command -v cosign >/dev/null 2>&1 || {
  if [[ "$COSIGN_OPTIONAL" == "true" ]]; then
    echo 'cosign unavailable, optional mode enabled'; exit 0
  fi
  echo 'missing required tool: cosign' >&2; exit 1
}

if [[ -n "${COSIGN_KEY:-}" ]]; then
  cosign sign-blob --yes --key "${COSIGN_KEY}" "${artifact}"
elif [[ "${COSIGN_EXPERIMENTAL:-0}" == "1" ]]; then
  cosign sign-blob --yes "${artifact}"
elif [[ "${COSIGN_OPTIONAL}" == "true" ]]; then
  echo 'cosign signing skipped (optional mode)'
else
  echo 'cosign keyless/keyed config required' >&2
  exit 1
fi
