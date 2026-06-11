# Cloudflare Workers, Edge Gateway & AI Gateway Inventory

## Overview
This inventory lists the Cloudflare Workers, Edge Gateways, and AI Gateways discovered within the `zeaz-platform` repository. It identifies binding configurations (KV, D1, R2, AI), domains, routes, and missing documentation.

## Workers Inventory

### 1. Root Workspace Worker
- **Location**: `/`
- **Config**: `wrangler.toml`
- **Example Config**: `wrangler.toml.example`
- **Bindings**:
  - D1 Database
  - KV Namespace
  - R2 Bucket
  - AI Binding
- **Routes**:
  - `www.zeaz.dev/*` (Note: Overlaps with Terraform DNS CNAME. Worker route wins.)

### 2. zeaz-loading Worker
- **Location**: `workers/zeaz-loading/`
- **Config**: `workers/zeaz-loading/wrangler.toml`
- **Example Config**: `workers/zeaz-loading/wrangler.toml.example`
- **Bindings**: None detected
- **Routes**: Unknown / Requires definition

### 3. Edge Gateway Worker
- **Location**: `workers/edge-gateway/`
- **Config**: `workers/edge-gateway/wrangler.toml`
- **Example Config**: `workers/edge-gateway/wrangler.toml.example`
- **Bindings**:
  - KV Namespaces (e.g., RATE_LIMIT_STORE, SESSION_STORE)
  - AI Gateway Integration
- **Routes**:
  - `api.zeaz.dev/*`
  - `gateway.zeaz.dev/*`

## AI Gateway Inventory
- **Name**: `zeaz-ai-gateway`
- **Slug**: `zeaz` (from `CLOUDFLARE_AI_GATEWAY_SLUG`)
- **Integration**: Bound to `edge-gateway` for LLM routing and governance.

## Discovered Issues & Governance Gaps
1. `www.zeaz.dev` has a DNS CNAME in `terraform/cloudflare-apps` but is also claimed by a Worker route. **Worker route takes precedence.**
2. Some KV namespace IDs in `edge-gateway` examples contained placeholder `00000000000000000000000000000000` which may flag security validators.
3. Missing sanitized `wrangler.toml.example` files across multiple worker directories.
4. Terraform is missing explicit `cloudflare_worker_route` resources to manage Worker routes via IaC.
