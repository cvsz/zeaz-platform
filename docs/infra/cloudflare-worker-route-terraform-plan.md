# Terraform Worker Route Implementation Plan

## Proposed Changes
This document outlines the proposed `cloudflare_worker_route` resources needed to formally manage Cloudflare Workers via Infrastructure as Code (IaC) in Terraform.

**Note: This is a proposed plan for review only. Do not apply without manual intervention.**

### 1. Root Worker Route (`www.zeaz.dev`)
The root Worker handles the main domain.

```hcl
# Proposed Terraform Resource
resource "cloudflare_worker_route" "root_worker" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "www.zeaz.dev/*"
  script_name = "zeaz-root-worker"
}
```

**⚠️ Action Required:**
The DNS CNAME for `www.zeaz.dev` in `terraform/cloudflare-apps` (or similar module) must be manually marked for removal in the Terraform configuration, as the Worker route will intercept traffic and makes the CNAME redundant.

### 2. Edge Gateway Worker Routes
The Edge Gateway handles API and Gateway endpoints.

```hcl
# Proposed Terraform Resource
resource "cloudflare_worker_route" "edge_gateway_api" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "api.zeaz.dev/*"
  script_name = "edge-gateway"
}

resource "cloudflare_worker_route" "edge_gateway_main" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "gateway.zeaz.dev/*"
  script_name = "edge-gateway"
}
```

### 3. zeaz-loading Worker Route
(Assuming it handles loading/assets)

```hcl
# Proposed Terraform Resource
resource "cloudflare_worker_route" "zeaz_loading" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "loading.zeaz.dev/*"
  script_name = "zeaz-loading"
}
```

## Review Checklist
- [ ] Verify `script_name` values match exactly with `wrangler.toml` name fields.
- [ ] Manually delete `cloudflare_record` for `www.zeaz.dev` from Terraform state and `.tf` files.
- [ ] Run `terraform plan` locally to review the drift and ensure no service disruption.
