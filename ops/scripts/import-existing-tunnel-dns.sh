#!/usr/bin/env bash
set -euo pipefail

: "${CF_ZONE_ID:?CF_ZONE_ID is required}"
: "${CF_DNS_TOKEN:?CF_DNS_TOKEN is required}"

TF_CHDIR="${TF_CHDIR:-terraform}"

records=(
  "www.zeaz.dev|cloudflare_record.tunnel_cname[\"www.zeaz.dev\"]"
  "app.zeaz.dev|cloudflare_record.tunnel_cname[\"app.zeaz.dev\"]"
  "admin-wallet.zeaz.dev|cloudflare_record.tunnel_cname[\"admin-wallet.zeaz.dev\"]"
  "api-zveo.zeaz.dev|cloudflare_record.tunnel_cname[\"api-zveo.zeaz.dev\"]"
  "api.zeaz.dev|module.dns.cloudflare_record.records[\"api\"]"
)

get_record_id() {
  local name="$1"
  curl -fsS \
    "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${name}" \
    -H "Authorization: Bearer ${CF_DNS_TOKEN}" \
    -H "Content-Type: application/json" \
    | jq -r '.result[0].id // empty'
}

state_has() {
  local address="$1"
  terraform -chdir="${TF_CHDIR}" state list 2>/dev/null | grep -Fqx "$address"
}

for item in "${records[@]}"; do
  name="${item%%|*}"
  address="${item#*|}"

  echo "== ${name} -> ${address} =="

  if state_has "$address"; then
    echo "already in Terraform state; skipping"
    continue
  fi

  id="$(get_record_id "$name")"

  if [ -z "$id" ]; then
    echo "record not found in Cloudflare; skipping import"
    continue
  fi

  terraform -chdir="${TF_CHDIR}" import "$address" "${CF_ZONE_ID}/${id}"
done

echo "Import check complete. Re-run: terraform -chdir=${TF_CHDIR} plan"
