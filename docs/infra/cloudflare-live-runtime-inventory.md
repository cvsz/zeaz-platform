# Cloudflare Live Runtime Inventory (Phase 8)

This document provides a safe, read-only inventory of the live `cloudflared` runtime environment. It acts as the absolute source of truth for routing.

## 1. Runtime Service Details

| Component | Path / Value | Notes |
|-----------|--------------|-------|
| **systemd Unit Path** | `/etc/systemd/system/cloudflared.service` | Manages the live process. |
| **cloudflared Config Path** | `/etc/cloudflared/config.yml` | The active configuration file. |
| **Authentication Mode** | Token-based Authentication | Uses a token, not a `credentials-file`. |
| **Live Tunnel ID** | `ef0355dd-8e90-45ed-a222-b5053794ed20` | Extracted safely; no secret tokens exposed. |

## 2. Live Ingress Hostnames & Service Targets

The live tunnel actively routes the following hostnames (based on Phase 5 findings):

| Hostname | Live Service Target (Hypothesized/Known) | Notes |
|----------|------------------------------------------|-------|
| `office.zeaz.dev` | Local Service / Port | Live-only |
| `zveo.zeaz.dev` | `http://127.0.0.1:3002` | Matches `apps.auto.tfvars.json` |
| `cctv.zeaz.dev` | `http://127.0.0.1:9292` | Matches `apps.auto.tfvars.json` |
| `api-zveo.zeaz.dev`| `http://127.0.0.1:8090` | Matches `apps.auto.tfvars.json` |
| `app.zeaz.dev` | `http://127.0.0.1:3003` | Matches `apps.auto.tfvars.json` |
| `admin-wallet.zeaz.dev`| `http://127.0.0.1:8081` | Live-only |
| `zcloud.zeaz.dev`| `http://127.0.0.1:3004` | Matches `apps.auto.tfvars.json` |
| `ztest.zeaz.dev` | `http://127.0.0.1:3008` | Matches `apps.auto.tfvars.json` |

## 3. Catch-all Behavior

The live `config.yml` must terminate its ingress rules with a catch-all block to prevent cloudflared errors and securely drop unknown hostnames:

```yaml
- service: http_status:404
```

*Status:* Required per best practices. It safely drops requests to `panel.zeaz.dev` or `trader.zeaz.dev` (from legacy Terraform) which currently have no specific live routing targets.

## 4. Comparison Against Repo Canonical Configs

- **Alignment:** Live hostnames map closely to the routes defined in `terraform/cloudflare-apps/apps.auto.tfvars.json`.
- **Drift:** 
  - Hostnames like `panel.zeaz.dev` and `api.zeaz.dev` are managed by Terraform but are missing from the live tunnel ingress, leading to 404s.
  - The live tunnel is using a token, but legacy `.yml` examples in the repo reference `credentials-file`.

## 5. Risks and Recommendations

**Risks:**
- Token rotation requires restarting the `cloudflared` systemd service (potential brief downtime).
- Unmapped hostnames in Terraform hit the `http_status:404` catch-all.

**Recommendations:**
- **Do NOT** manually modify `/etc/cloudflared/config.yml` without updating `infra/cloudflare/config/tunnels.yml` as the canonical source.
- Standardize on token-based authentication in documentation.
- Remove references to `credentials-file` from IaC where possible.
