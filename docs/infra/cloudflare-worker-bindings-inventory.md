# Cloudflare Worker Bindings Inventory

*Generated: 2026-06-11T20:07:08Z*

| Source File | Worker/App | Env | Type | Name | Target | Risk | Recommendation | Manual Action |
|---|---|---|---|---|---|---|---|---|
| workers/edge-gateway/wrangler.toml | workers/edge-gateway | default | kv_namespace | unknown | REDACTED_ID | OK | Verify ID is real | Verify |
| workers/edge-gateway/wrangler.toml | workers/edge-gateway | default | vars | multiple | REDACTED | OK | Vars are public | None |
| workers/zeaz-loading/wrangler.toml | workers/zeaz-loading | all | file | missing_example | none | REVIEW | Create workers/zeaz-loading/wrangler.toml.example | Create example |
| workers/zeaz-loading/wrangler.toml | workers/zeaz-loading | default | vars | multiple | REDACTED | OK | Vars are public | None |
| workers/edge-gateway/wrangler.toml.example | workers/edge-gateway | all | file | exact_copy | none | BLOCKER | Example is exact copy of real file | Fix example |
