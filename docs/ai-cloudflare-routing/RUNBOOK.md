# Zeaz Platform Cloudflare Routing Runbook

## Goal

Route all requested `zeaz.dev` hostnames through Cloudflare Tunnel to the existing Traefik layer inside `cvsz/zeaz-platform`.

## Target architecture

```text
User Browser
  -> Cloudflare DNS / Proxy / Access
  -> Cloudflare Tunnel
  -> cloudflared container
  -> http://traefik:80
  -> Traefik Host router
  -> app container/service
```

## Why this design

The repository already uses a Cloudflare Tunnel container and Traefik include stack. This package keeps that pattern and expands the hostname inventory instead of exposing app ports directly.

## Install package into repo

```bash
unzip zeaz-cloudflare-ai-prompt-pack.zip
cd zeaz-cloudflare-ai-prompt-pack
bash scripts/install_into_repo.sh /home/zeazdev/zeaz-platform
```

## Generate cloudflared config

```bash
cd /home/zeazdev/zeaz-platform
python3 ops/zeaz-cloudflare/generate_cloudflared_config.py   ops/zeaz-cloudflare/domain-map.zeaz-platform.json   > /tmp/zeaz-cloudflared.config.yml
```

## Validate

```bash
python3 ops/zeaz-cloudflare/validate_zeaz_domain_map.py ops/zeaz-cloudflare/domain-map.zeaz-platform.json
cloudflared tunnel ingress validate /tmp/zeaz-cloudflared.config.yml
```

## DNS dry-run

```bash
cd /home/zeazdev/zeaz-platform
CLOUDFLARE_ZONE_ID=xxx CLOUDFLARE_TUNNEL_ID=uuid CLOUDFLARE_DNS_TOKEN=token bash ops/zeaz-cloudflare/apply_cloudflare_dns_dryrun.sh
```

## DNS apply gate

```bash
APPLY=true CONFIRM_DNS_APPLY=yes CLOUDFLARE_ZONE_ID=xxx CLOUDFLARE_TUNNEL_ID=uuid CLOUDFLARE_DNS_TOKEN=token bash ops/zeaz-cloudflare/apply_cloudflare_dns_dryrun.sh
```

## Host verification

```bash
for host in zcfdash.zeaz.dev openwork.zeaz.dev www.zeaz.dev zeaz.dev api.zeaz.dev zcino.zeaz.dev zdash.zeaz.dev api-zdash.zeaz.dev zlms.zeaz.dev zoffice.zeaz.dev zaiz.zeaz.dev api-zveo.zeaz.dev zsticker.zeaz.dev ztrader.zeaz.dev zveo.zeaz.dev app.zeaz.dev; do
  echo "== $host =="
  dig +short "$host" CNAME || true
  curl -I --max-time 10 "https://$host" || true
done
```

## Rollback

```bash
git checkout -- infra/cloudflare/config.yml
docker compose up -d cloudflared
```

For DNS rollback, use Cloudflare dashboard or a reviewed delete script. Do not delete DNS records in bulk without a record backup.
