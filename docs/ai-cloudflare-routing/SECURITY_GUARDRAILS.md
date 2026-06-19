# Security Guardrails

## Token rules

- Use scoped Cloudflare API tokens only.
- Do not use Global API Key in automation.
- Do not commit token values.
- Keep token files mode `600`.
- Dry-run token and DNS operations first.

## Cost rules

Keep these defaults:

```bash
CLOUDFLARE_PLAN_TIER=Free
COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
ALLOW_LOAD_BALANCING=false
ALLOW_ADVANCED_WAF=false
ALLOW_LOGPUSH=false
ALLOW_R2_WRITE=false
ALLOW_WORKERS_DEPLOY=false
```

## Routing rules

- Cloudflared should reach Traefik internally.
- App containers should not publish public ports unless required for local development.
- Add Cloudflare Access to admin/team surfaces first.
- Keep APIs protected by app auth and narrow CORS.
- Use `http_status:404` catch-all in cloudflared ingress.

## Secrets never allowed in Git

- `.env`
- `.env.cloudflare`
- tunnel credentials JSON
- origin certs
- Terraform state and tfvars
- SOPS/age private keys
- API tokens
