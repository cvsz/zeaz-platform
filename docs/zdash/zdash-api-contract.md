# zDash P0 Adapter API Contract

This contract lets the zDash frontend read integration status before the live backend adapter service exists.

## Static endpoints applied

Cloudflare/Vite serves these files from `apps/zdash/public`:

```text
/api/integrations/status
/api/integrations/trading/health
/api/integrations/risk/health
/api/integrations/cloudflare-ops/health
```

These are JSON files without a `.json` extension so the frontend can use the final API paths immediately.

## Main status schema

```json
{
  "generated_at": "2026-05-24T19:50:00Z",
  "source": "static-contract",
  "version": "2026.05.24-p0",
  "modules": [
    {
      "module": "trading",
      "priority": "P0",
      "status": "adapter-required",
      "mode": "api-adapter-first",
      "health": "unknown",
      "latency_ms": null,
      "last_event": "Static contract ready"
    }
  ]
}
```

## Status values

| Value | Meaning |
|---|---|
| `online` | Live adapter connected and healthy |
| `degraded` | Live adapter connected but partial/failing checks exist |
| `planned` | Registered but not active yet |
| `adapter-required` | P0 module needs a backend adapter |
| `offline` | Adapter exists but cannot reach source system |

## P0 modules

| Module | Sources | Current mode |
|---|---|---|
| `trading` | `cvsz/zkbtrader`, `cvsz/livescan` | `api-adapter-first` |
| `risk` | `cvsz/zSafeGuard` | `read-only-then-control` |
| `cloudflare-ops` | `cvsz/zeaz-platform` | `local-service-and-cloudflare-tunnel` |

## Next implementation phase

1. Replace static files with a small adapter API service.
2. Keep the same response schema.
3. Start read-only:
   - trading health/signals summary
   - risk drawdown/kill-switch status summary
   - Cloudflare tunnel/deployment summary
4. Add write/control actions only after auth, audit logging, and confirmation UI exist.

## Local validation

```bash
cd apps/zdash
npm install
npm run build
npm run preview

curl -s http://127.0.0.1:3006/api/integrations/status | jq
curl -s http://127.0.0.1:3006/api/integrations/trading/health | jq
curl -s http://127.0.0.1:3006/api/integrations/risk/health | jq
curl -s http://127.0.0.1:3006/api/integrations/cloudflare-ops/health | jq
```
