# Cloudflare Terraform Reconciliation Plan (Phase 8)

This plan outlines how to securely reconcile Terraform state, DNS records, Worker routes, and the live cloudflared runtime without causing outages.

## 1. Canonical State Decisions

- **Canonical via Terraform:**
  - DNS Records (`terraform/cloudflare-apps` will serve as the single source of truth for platform routing)
  - Zero Trust Access Policies
  - WAF and Security Settings
- **Manual / Runtime until Migrated:**
  - Live `cloudflared` tunnel configuration (`/etc/cloudflared/config.yml`)
  - Initial `cloudflare_zero_trust_tunnel_cloudflared` connection (relies on manual token setup for the initial deployment)
- **Archive / Stale Resources:**
  - `terraform/cloudflare/` (legacy module)
  - `terraform/zdash/` (legacy module)
  - Untracked/stale credential files (`creds.json`, duplicate `config.yml` files outside canonical `infra/cloudflare/config`)

## 2. Identified Conflicts

- **DNS vs Worker Routes:** 
  - `www.zeaz.dev` currently resolves via DNS (CNAME) but a Worker route exists. It should be migrated fully to the Worker and the DNS record removed.
- **Tunnel Hostnames vs DNS/App Routes:**
  - The live tunnel routes `office.zeaz.dev` and `admin-wallet.zeaz.dev`, which must be tracked via canonical configuration to ensure Terraform doesn't overwrite or delete them.

## 3. Safe Migration Sequence

This sequence ensures a review-first approach without breaking the live runtime.

1. **Inventory**: Create lists of active DNS records, active Workers routes, and active tunnel ingress rules. (Complete - Phase 5-8)
2. **Review**: Ensure no overlaps exist and manual interventions are recorded.
3. **Backup**: Export existing Cloudflare state and `/etc/cloudflared/config.yml`.
4. **Import/State Plan**: Use `terraform import` to absorb existing manual resources into `terraform/cloudflare-apps/`.
5. **Dry-Run Plan**: Run `terraform plan` to verify that 0 resources are flagged for destruction, and no unexpected changes appear.
6. **PR Review**: Create a Pull Request with the Terraform updates and `plan` output.
7. **Controlled Apply**: Only merge and run `terraform apply` after approval, in a dedicated subsequent phase.
