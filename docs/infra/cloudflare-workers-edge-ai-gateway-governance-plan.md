# Cloudflare Workers & AI Gateway Governance Plan

## Objective
Establish strict governance, visibility, and security boundaries for Cloudflare Workers, Edge Gateway, and AI Gateway configurations.

## Governance Principles

1. **Infrastructure as Code (IaC) First**
   - All Worker Routes must be managed via Terraform `cloudflare_worker_route`.
   - Wrangler deployments apply code and bindings, but Terraform controls routing and domain associations.
2. **Sanitized Examples Requirement**
   - Every `wrangler.toml` must have a corresponding `wrangler.toml.example`.
   - Examples must **never** contain real `account_id`, `zone_id`, `kv_namespaces.id`, or D1/R2 credentials.
   - Use standardized placeholders: `<ACCOUNT_ID>`, `<KV_NAMESPACE_ID>`, `<D1_DATABASE_ID>`, `<R2_BUCKET_NAME>`, `<AI_GATEWAY_NAME>`.
   - Avoid `00000000000000000000000000000000` as a fake ID to prevent false positives in security scanners.
3. **No Exact-Copy Examples**
   - Example files must be generalized to serve as templates for new developers, not mirror exact production values.
4. **AI Gateway Governance**
   - All AI calls from Workers must route through the configured AI Gateway (`CLOUDFLARE_AI_GATEWAY_SLUG`).
   - Direct LLM provider API keys must not be hardcoded in Workers. They must be injected via Cloudflare Secrets and used securely.
5. **Route Precedence & Conflict Resolution**
   - When a Custom Domain (DNS CNAME) and a Worker Route overlap, the Worker Route intercepts traffic.
   - Example: `www.zeaz.dev` is managed by DNS CNAME in Terraform, but claimed by a Worker. The CNAME must be documented for removal, and the Worker Route formally adopted in Terraform.

## Security & Scanning
- A local validation script (`scan-workers-edge-bindings.sh`) will run during CI to verify that:
  - All examples are sanitized.
  - No real IDs are committed.
  - Binding configurations are strictly typed and safe.
