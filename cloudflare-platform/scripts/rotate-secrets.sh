#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
: "${CF_API_TOKEN:?CF_API_TOKEN required}"
new_secret="$(openssl rand -base64 32 | tr -d '\n')"
printf 'Generated new secret material (%s chars). Store in secret manager manually.\n' "${#new_secret}"
