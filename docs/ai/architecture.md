# Cloudflare AI + Fintech Architecture

This platform segments zeaz.dev into AI and fintech trust zones using Cloudflare Tunnel, Zero Trust, WAF, and Workers.

## Segments
- `app.zeaz.dev`: fintech applications protected by Access, strict mTLS-ready routing, and WAF managed rules.
- `zveo.zeaz.dev`: AI generation services with rate limits, abuse controls, and JWT-gated APIs.

## Routing Topology
- `zeaz.dev` -> static/edge entry
- `app.zeaz.dev` -> private origin `http://app-internal:8080`
- `zveo.zeaz.dev` -> private origin `http://zveo-internal:8787`
- `api.zeaz.dev`, `admin.zeaz.dev`, `grafana.zeaz.dev`, `logs.zeaz.dev`, `auth.zeaz.dev`, `tunnel.zeaz.dev` mapped through named tunnel ingress.

## Security Controls
- TLS 1.3, Strict SSL, HSTS preload
- Access policies enforcing MFA and hardware-backed keys where required
- Token scope separation for DNS/Tunnel/WAF/Workers/Zero Trust
- Logpush and telemetry for tunnel and WAF monitoring
