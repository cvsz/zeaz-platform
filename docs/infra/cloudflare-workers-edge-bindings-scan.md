# Cloudflare Workers Edge Bindings Scan

Generated: 2026-06-11 19:16:50 UTC

## Summary

| Metric | Value |
|---|---:|
| Wrangler files scanned | 6 |
| Live wrangler files | 3 |
| Example wrangler files | 3 |
| Worker route entries | 2 |
| Custom domain references | 0 |
| Edge bindings | 2 |
| AI Gateway references | 7 |
| Placeholder values | 5 |
| Missing examples | 0 |
| Exact-copy examples | 0 |
| Route/DNS overlaps | 1 |
| Route/tunnel overlaps | 1 |
| Governance issue count | 5 |

## Workers

| File | Name | Main | Compatibility Date | workers_dev | Example |
|---|---|---|---|---|---|
| wrangler.toml | zeaz-platform | workers/src/index.js | 2025-01-01 | true | false |
| workers/zeaz-loading/wrangler.toml | zeaz-loading | src/index.js | 2026-05-24 | false | false |
| workers/zeaz-loading/wrangler.toml.example | zeaz-loading-example | src/index.js | 2026-06-01 | false | true |
| workers/edge-gateway/wrangler.toml | edge-gateway | src/index.ts | 2026-05-12 | true | false |
| workers/edge-gateway/wrangler.toml.example | edge-gateway-example | src/index.ts | 2026-06-01 | true | true |
| wrangler.toml.example | zeaz-platform-example | workers/src/index.js | 2026-06-01 | true | true |

## Routes

| File | Worker | Pattern | Hostname | Example |
|---|---|---|---|---|
| workers/zeaz-loading/wrangler.toml | zeaz-loading | www.zeaz.dev/* | www.zeaz.dev | false |
| workers/zeaz-loading/wrangler.toml.example | zeaz-loading-example | <WORKER_ROUTE_PATTERN> | <WORKER_ROUTE_PATTERN> | true |

## Bindings

| File | Type | Binding | Target | Example |
|---|---|---|---|---|
| workers/edge-gateway/wrangler.toml | KV | EDGE_RATE_LIMIT_KV | <missing-id> | false |
| workers/edge-gateway/wrangler.toml.example | KV | EDGE_RATE_LIMIT_KV | <KV_NAMESPACE_ID> | true |

## AI Gateway References

- workers/edge-gateway/wrangler.toml|wrangler|CLOUDFLARE_AI_GATEWAY_SLUG = "zeaz-platform-ai-gateway"
- workers/edge-gateway/wrangler.toml.example|wrangler|CLOUDFLARE_AI_GATEWAY_SLUG = "<AI_GATEWAY_NAME>"
- /home/zeazdev/zeaz-platform/workers-ai/ai-gateway.yaml:2:gateway:
- /home/zeazdev/zeaz-platform/workers-ai/ai-gateway.yaml:3:  slug_var: CLOUDFLARE_AI_GATEWAY_SLUG
- /home/zeazdev/zeaz-platform/workers-ai/ai-gateway.yaml:4:  recommended_slug: zeaz-platform-ai-gateway
- /home/zeazdev/zeaz-platform/workers/edge-gateway/wrangler.toml:17:CLOUDFLARE_AI_GATEWAY_SLUG = "zeaz-platform-ai-gateway"
- /home/zeazdev/zeaz-platform/workers/edge-gateway/wrangler.toml.example:33:CLOUDFLARE_AI_GATEWAY_SLUG = "<AI_GATEWAY_NAME>"

## Placeholders

- workers/zeaz-loading/wrangler.toml.example|account_id|config|<ACCOUNT_ID>|true
- workers/edge-gateway/wrangler.toml.example|account_id|config|<ACCOUNT_ID>|true
- workers/edge-gateway/wrangler.toml.example|KV|EDGE_RATE_LIMIT_KV|<KV_NAMESPACE_ID>|true
- workers/edge-gateway/wrangler.toml.example|id|config|<KV_NAMESPACE_ID>|true
- wrangler.toml.example|account_id|config|<ACCOUNT_ID>|true

## Governance Findings

- Route/DNS overlap: www.zeaz.dev (worker: zeaz-loading, files: workers/zeaz-loading/wrangler.toml)
- Route/tunnel overlap: www.zeaz.dev (worker: zeaz-loading, files: workers/zeaz-loading/wrangler.toml)
- Governance: www.zeaz.dev has Worker route and local Terraform/OpenTofu DNS ownership evidence
- Governance: www.zeaz.dev has Worker route and local tunnel ownership evidence
- Governance: No Terraform/OpenTofu cloudflare_worker_route resources found for current Worker routes
