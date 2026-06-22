# TOKENOMICS

> Usage economics for zLM-CLI — how tokens flow, how rate limits map to cost, and how to budget access.

## Overview

zLM-CLI is a **single-instance application** that proxies to the z.ai zLM 1.0 model. It layers three economic controls on top of the underlying z.ai API usage:

1. **Rate limiting via API keys** — controls how many requests a user can make per hour (in-memory sliding 1hr window).
2. **Plan-based limits + credits** — the Payment Gateway (`/payments`) sells 4 plans (**Starter $0 / Pro $19 / Team $49 / Enterprise $199**); each plan imposes request/token caps and is funded by credits. The Billing module (`/billing`) issues invoices and tracks usage against plan limits.
3. **PromptPay top-ups** — Thai QR payments (EMVCo TLV payload + CRC16-CCITT) for credit top-ups without a third-party gateway.

This document explains the token economics: how a request translates to model tokens, how rate limits map to approximate cost, how plan tiers and credits cap exposure, and how PromptPay can be used to top up credits.

## The token flow

```
User prompt (N chars)
  │
  ▼
Client → POST /api/cli
  │  body: { messages, mode, skill, modules, workspace, model }
  │
  ▼
Server composes system prompt:
  [BASE ~2,000 chars]
  + [MODE ~200-400 chars]
  + [SKILL ~300-500 chars]        (if active)
  + [MODULES ~150 chars each]     (if active)
  + [WORKSPACE up to 12,000 chars](if connected)
  + [USER MESSAGE N chars]
  + [HISTORY up to 12 prior messages]
  │
  ▼
Total input ≈ 2,000 + mode + skill + modules + workspace + history + N
  │
  ▼
zLM 1.0 generates response (M output tokens)
  │
  ▼
Total tokens = input + output
```

## Token estimation

A rough heuristic: **~4 characters ≈ 1 token** for English text and code.

| Component | Est. tokens | Notes |
| --- | --- | --- |
| Base system prompt | ~500 | The terminal persona + rules |
| Mode suffix | ~50-100 | chat/explain/debug/generate/review/optimize |
| Skill layer | ~80-120 | One expert persona (e.g. code-review) |
| Each module | ~40-60 | Context sentence per active module |
| Workspace snippet | 0-3,000 | Up to 12,000 chars → ~3,000 tokens |
| Conversation history | 0-2,000 | Last 12 messages, capped |
| User message | varies | Your prompt |
| Model response | 200-2,000 | Depends on complexity |

**Typical single-turn request**: ~700 input + ~500 output = ~1,200 tokens
**With workspace + history**: ~3,500 input + ~800 output = ~4,300 tokens
**Agent (5 steps)**: 5 × (~2,000 input + ~600 output) = ~13,000 tokens
**Coding Plan**: ~1,000 input + ~1,500 output = ~2,500 tokens

## Rate limit tiers

Each API key has a `rateLimitPerHour` (0 = unlimited). Plan-based limits (from `/payments` + `/billing`) can impose additional caps. The 4 payment plans plus the 4 RBAC roles plus the implicit Free tier cover the spectrum:

| Tier | Plan | Price | req/hour | Est. tokens/hour | Use case |
| --- | --- | --- | --- | --- | --- |
| **Guest (RBAC role)** | — | — | 0 (denied by role) | 0 | Read-only or denied |
| **Viewer (RBAC role)** | — | — | 10 (read-only routes) | ~12,000 | Browse dashboard, search |
| **Free** (no plan) | — | — | 10 | ~12,000 | Trial, light Q&A |
| **Starter** | Starter | $0 | 60 | ~72,000 | Individual developer, daily coding help |
| **Pro** | Pro | $19/mo | 200 | ~240,000 | Power user, agents + plans + workflows |
| **Team** | Team | $49/mo | 500 | ~600,000 | Small team sharing one instance |
| **Enterprise** | Enterprise | $199/mo | 2,000 | ~2,400,000 | Org-wide rollout, multi-team |
| **Admin (RBAC role)** | — | — | 0 (∞) | — | Internal/admin use, all routes |

> RBAC roles (admin / developer / viewer / guest) gate *which routes* a user can call; plan tiers gate *how many times* per hour. A developer on the Starter plan gets developer-level routes capped at 60 req/hr.
>
> These are estimates. Actual token usage depends on workspace size, conversation length, and response verbosity. Rate limiting counts **requests**, not tokens — a long agent run with 5 steps counts as 1 request to `/api/agent` (but makes 6 model calls internally: 1 plan + 5 executes). A workflow with N nodes counts as 1 request to `/api/workflows` (but makes N+ model calls).

## Cost model

zLM-CLI itself is **free and open source**. The cost is the underlying z.ai API usage, which is billed by z.ai based on model tokens. zLM-CLI's rate limiting helps you **cap exposure**:

```
Max cost/hour ≈ rateLimitPerHour × avgTokensPerRequest × pricePerToken
```

For example, with a 60 req/hr key averaging 1,200 tokens/request:
- Tokens/hour: ~72,000
- At a hypothetical $0.002/1K tokens: ~$0.14/hour
- At 8 hours/day: ~$1.15/day

> Contact z.ai for current pricing. The numbers above are illustrative.

## Payment methods

zLM-CLI supports **two payment paths**:

### 1. Mock Payment Gateway (default)

The Payment Gateway (`/payments`) provides a 4-plan catalog with mock checkout. Plans are funded by credits, which are consumed as the user makes API requests. The `PaymentOrder` Prisma model tracks each order: `reference`, `email`, `plan`, `amountCents`, `currency` (USD), `status` (pending / paid / failed / refunded), `provider` (mock / stripe / paypal), `credits`, `paidAt`.

| Plan | Price | Credits | req/hr | Intended use |
| --- | --- | --- | --- | --- |
| **Starter** | $0/mo | 100 | 60 | Individual developer, daily coding help |
| **Pro** | $19/mo | 1,000 | 200 | Power user — agents, plans, workflows |
| **Team** | $49/mo | 5,000 | 500 | Small team sharing one instance |
| **Enterprise** | $199/mo | 50,000 | 2,000 | Org-wide rollout, multi-team |

### 2. PromptPay (Thai QR)

In addition to the mock checkout, zLM-CLI can generate **Thai PromptPay QR codes** via `/api/promptpay`. The QR payload is built locally (EMVCo TLV format with CRC16-CCITT Tag 63) — no third-party gateway roundtrip.

```
User requests /api/promptpay { phone, amount }
  │
  ▼
src/lib/promptpay.ts
  │  • Build Tag 29 (PromptPay ID = 0066 + phone)
  │  • Append amount tag
  │  • Compute CRC-16 over payload
  │  • Encode as QR data URL
  ▼
Returns PNG data URL → PromptPay panel renders it
  │
  ▼
User scans with any Thai banking app → pays
  │
  ▼
(Mock) server credits the user's profile balance
```

### PromptPay endpoint
```bash
# Generate a 100.50 THB QR for 081-234-5678
curl "http://localhost:3000/api/promptpay?phone=0812345678&amount=100.50"
# → { "qr": "data:image/png;base64,...", "payload": "000201010212..." }
```

Or via the slash command in the terminal:
```
/promptpay 0812345678 100.50
```

> The QR is standards-compliant and will scan in any Thai banking app. The actual credit posting is currently mock (no bank webhook); pair with the real Stripe webhook in the v0.8 roadmap for live reconciliation.

## Configuring rate limits

### Via the UI
1. Open the sidebar → **Keys** tab (or click the "keys" button in the header)
2. Create a key with a name and `rateLimitPerHour`
3. The rate limit applies immediately to all requests using that key

### Via the API
```bash
# Create a key with 30 req/hr
curl -X POST http://localhost:3000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"alice","rateLimitPerHour":30}'

# Update a key's rate limit
curl -X PATCH http://localhost:3000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"id":"<keyId>","rateLimitPerHour":100}'
```

### Rate limit semantics
- **Sliding window**: The window is the last 60 minutes from the current request. Old requests fall off as time passes.
- **Per-key**: Each key has its own bucket. Keys don't share limits.
- **Plan-layered**: If the key's profile has a plan (Starter/Pro/Team/Enterprise), the lower of the key's `rateLimitPerHour` and the plan's `rateLimitPerHour` applies.
- **In-memory**: Limits reset on server restart (the bucket is a `Map` in process memory).
- **Request-counted**: Each HTTP request to `/api/cli`, `/api/agent`, `/api/plan`, or `/api/workflows` counts as 1. An agent run that makes 6 internal model calls still counts as 1 request. A workflow with N nodes counts as 1 request.
- **RBAC-gated**: If the active key's role lacks permission for the route (e.g. viewer calling `/api/sandbox`), the request is rejected with `403 Forbidden` before rate-limit checks.
- **429 response**: When exceeded, the response is `{"error":"Rate limit exceeded (N/hour). Try again in Xs."}` with HTTP 429.

## Usage tracking

In addition to per-key counters, zLM-CLI now records **per-request token usage** via `src/lib/usage.ts`:

- `usageCount` — total requests ever made with this key (incremented on every successful request)
- `lastUsedAt` — timestamp of the most recent request
- **Per-request**: input tokens, output tokens, model, route, timestamp — visible in the Dashboard panel and via `GET /api/usage`
- **Toggles** (server-side, exposed via `/api/usage`):
  - **internet** — when off, zLM-CLI won't call any external/web-search/research routes (air-gapped mode)
  - **memory** — when off, memories are not injected into the system prompt

View in the Keys panel, the Dashboard panel, or via `GET /api/keys`:

```json
{
  "keys": [
    {
      "id": "cmq...",
      "name": "alice",
      "lastFour": "3ce59",
      "rateLimitPerHour": 30,
      "usageCount": 142,
      "lastUsedAt": "2025-01-21T18:42:00.000Z",
      "active": true
    }
  ]
}
```

## Budgeting strategies

### For individuals
- Set `rateLimitPerHour: 60` (default) — enough for active coding without runaway costs
- Use the **GLM-4.5-Flash** model for quick Q&A (lower cost, faster)
- Reserve **GLM-4.5** (flagship) for complex plans, agents, and workflows
- Top up credits with **PromptPay** (`/promptpay`) when you hit a plan cap
- Toggle **internet off** + switch to **ZLM-1.0 Local** for zero-cost offline coding

### For teams
- Create one key per team member with individual limits
- Assign each member an RBAC role (developer / viewer / guest) so they only see the routes they need
- Enable **Require API key** so anonymous access is blocked
- Monitor `usageCount` via `GET /api/keys` and `/api/admin` to identify heavy users
- Use the **Team** plan for shared credit pooling

### For API consumers
- Use the **GLM-4-Long** model for large workspace snippets (1M context)
- Batch related questions into agent runs or workflows (1 request, multiple model calls)
- Cache responses client-side for repeated queries
- Use `/api/research` for GLM-summarized web pages instead of repeated raw search calls

## Model cost ranking (illustrative)

From lowest to highest cost (based on model size/speed):

```
GLM-4-FlashX ≤ GLM-4.5-Flash ≤ GLM-4-Flash
  ≤ GLM-4.5-Air ≤ GLM-4-Air
  ≤ GLM-4-Plus ≤ GLM-4.5
  ≤ GLM-4.5-X ≤ GLM-4.5-AirX
  ≤ GLM-4-Long (long context premium)
  ≤ GLM-4V / GLM-4V-Plus (vision premium)
```

> Actual pricing is set by z.ai. See the z.ai dashboard for per-model rates.

## Future tokenomics (roadmap)

Planned features that extend the economics model:

- **Per-model rate limits** — different quotas per model (e.g. unlimited Flash, 10/hr for 4.5)
- **Token meter UI** — track actual input/output tokens per request (parses SDK's `usage` field)
- **Cost dashboard** — aggregate usage by key, model, route, and time range (`/api/admin` already exposes raw stats)
- **Quota alerts** — notify when a key approaches its limit
- **Real Stripe integration** — replace the mock payment gateway with live Stripe checkout (would make zLM-CLI a monetizable API product)
- **PromptPay bank webhook** — automate credit posting when a Thai bank confirms a payment
- **Workflow cost attribution** — break a multi-node workflow's cost down per agent node

See [ROADMAP.md](ROADMAP.md) for the full plan.

---

For the technical implementation of rate limiting, see [ARCHITECTURE.md](ARCHITECTURE.md) § "API key & rate-limiting layer". For how to create and manage keys, see [CONTRIBUTING.md](CONTRIBUTING.md) or run `/keys` in the terminal.
