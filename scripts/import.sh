#!/usr/bin/env bash
set -euo pipefail
cd terraform/cloudflare-apps
export APPLY=true COST_LOCK=true ALLOW_PAID_CLOUDFLARE_FEATURES=false CLOUDFLARE_PLAN_TIER=Free CONFIRM_TERRAFORM_APPLY=yes
source ../../.env

# Provide variables via wrapper or export them
export TF_VAR_cloudflare_zone_id="$CLOUDFLARE_ZONE_ID"
export TF_VAR_cloudflare_tunnel_id="$CLOUDFLARE_TUNNEL_ID"
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_DNS_TOKEN}}"

# Import records
terraform import 'cloudflare_dns_record.app_routes["ssh.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/a175fafea722f19372a010c8768e409c || true
terraform import 'cloudflare_dns_record.app_routes["zoffice.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/ccf1285c3649897cdf55ae13b8249e38 || true
terraform import 'cloudflare_dns_record.app_routes["zdash.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/1784fddf802a770178abbeb76498a141 || true
terraform import 'cloudflare_dns_record.app_routes["zcino.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/e866d4e0bc47f0041b023ffcbe804412 || true
terraform import 'cloudflare_dns_record.app_routes["zkbtrader.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/821d5cdeb8c304a2d538ccfc67494046 || true
terraform import 'cloudflare_dns_record.app_routes["api-zdash.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/b763385db615ed266173eb621426a2fb || true
terraform import 'cloudflare_dns_record.app_routes["api-zveo.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/796e3ee3037b51781b600dcecf8cc53a || true
terraform import 'cloudflare_dns_record.app_routes["zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/7f4e76d869127ea75b9a1f6a694f23d8 || true
terraform import 'cloudflare_dns_record.app_routes["zveo.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/a614413b6840af0f2da7b1d6ff71a317 || true
terraform import 'cloudflare_dns_record.app_routes["studio.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/af9ba2b940e1b1cd7cf18945a4243d91 || true
terraform import 'cloudflare_dns_record.app_routes["ztrader.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/661db225b5095b455c5b7d406bd7aeb6 || true
terraform import 'cloudflare_dns_record.app_routes["cctv.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/7dbe85c91c9193b8df36ad5d40bef222 || true
terraform import 'cloudflare_dns_record.app_routes["www.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/ef17f8e5633ed3040f6cdc747103a6ae || true
terraform import 'cloudflare_dns_record.app_routes["app.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/5cfa76f0eb7e98dd7f56b341996f8933 || true
terraform import 'cloudflare_dns_record.app_routes["release.zeaz.dev"]' ${CLOUDFLARE_ZONE_ID}/38556f08b66f408ff81b031fe6ed09a3 || true

# Finally run terraform apply again to ensure state matches config
terraform apply -auto-approve
