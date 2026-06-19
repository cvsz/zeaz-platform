# AI Platform Security Controls

Scope: `zveo.zeaz.dev`, `studio.zeaz.dev`, `analytics.zeaz.dev`.

## Enforced controls

- JWT validation hooks at the edge gateway before rate-limit evaluation.
- Security headers on every response.
- MFA + WebAuthn policy requirement.
- Upload validation policy (file size and MIME constraints).
- Prompt-injection mitigation guardrails and challenge actions.
- Publishing RBAC quotas and abuse throttling.
- Bot mitigation gated by Cloudflare plan tier (Enterprise native controls, non-Enterprise fallback rate controls).
