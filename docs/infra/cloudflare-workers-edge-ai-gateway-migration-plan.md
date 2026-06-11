# Cloudflare Workers, Edge & AI Gateway Migration Plan

## Context
Phase 7 introduces governance over Cloudflare Workers and bindings. This migration plan outlines the steps required to move from the current undocumented, unsanitized state into a fully governed IaC structure.

## Migration Steps

### Step 1: Cleanup Examples
- Remove live IDs from `wrangler.toml.example` files across all Worker directories.
- Ensure KV namespaces use `<KV_NAMESPACE_ID>` instead of all-zeros or real production IDs.
- Create missing `wrangler.toml.example` files in `/` and `workers/zeaz-loading/`.

### Step 2: Terraform Route Planning
- Identify overlapping Custom Domains and Worker Routes.
- Specifically, the DNS CNAME for `www.zeaz.dev` defined in `terraform/cloudflare-apps` needs to be marked for removal in the Terraform plan.
- Add explicit `cloudflare_worker_route` resources to Terraform for all active Workers.

### Step 3: Implement Scanner Validation
- Integrate `scan-workers-edge-bindings.sh` into the CI/CD pipeline to automatically block PRs that contain unsanitized `wrangler.toml` copies or missing examples.
- Enforce strict checks on AI Gateway configurations.

### Step 4: Terraform Execution (Manual)
- **Do not apply automatically.**
- Operator must review the `cloudflare-worker-route-terraform-plan.md`.
- Operator executes `terraform plan` and verifies the removal of the redundant DNS CNAME for `www.zeaz.dev`.
- Operator executes `terraform apply` after manual approval.
