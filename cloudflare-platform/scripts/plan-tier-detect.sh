#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

plan="${CLOUDFLARE_PLAN_TIER:-}"
case "$plan" in
  Free)
    echo '{"plan":"Free","enterprise_features":false,"fallback_profile":"basic-security"}'
    ;;
  Pro)
    echo '{"plan":"Pro","enterprise_features":false,"fallback_profile":"enhanced-security"}'
    ;;
  Business)
    echo '{"plan":"Business","enterprise_features":false,"fallback_profile":"advanced-security"}'
    ;;
  Enterprise)
    echo '{"plan":"Enterprise","enterprise_features":true,"fallback_profile":"full"}'
    ;;
  *)
    echo '{"error":"Invalid CLOUDFLARE_PLAN_TIER. Allowed: Free|Pro|Business|Enterprise"}' >&2
    exit 1
    ;;
esac
