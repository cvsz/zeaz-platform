#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

file="${1:-.env.cloudflare}"
[[ -f "$file" ]] || exit 0

optional_keys=(
  CLOUDFLARE_AUDIT_TOKEN
  CLOUDFLARE_AI_GATEWAY_TOKEN
)

tmp="$(mktemp "${file}.clean.XXXXXX")"
chmod 600 "$tmp"

while IFS= read -r line || [[ -n "$line" ]]; do
  skip=false
  for key in "${optional_keys[@]}"; do
    case "$line" in
      "${key}="|"${key}=\"\""|"${key}=\'\'")
        skip=true
        ;;
    esac
    $skip && break
  done
  $skip || printf '%s\n' "$line" >> "$tmp"
done < "$file"

mv "$tmp" "$file"
chmod 600 "$file"
