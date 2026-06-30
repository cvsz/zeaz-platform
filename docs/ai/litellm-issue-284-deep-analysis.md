# LiteLLM Issue 284 Deep Analysis

## Billing Integration Reuse

The strongest reusable billing implementation in the repository is `apps/zdash`.

Useful references:

- `apps/zdash/backend/app/billing/stripe_adapter.py`
- `apps/zdash/backend/app/billing/usage_meter.py`
- `apps/zdash/backend/app/billing/plan_catalog.py`
- `apps/zdash/backend/app/billing/entitlement_service.py`

What to reuse conceptually:

- provider adapter abstraction
- usage record model
- secret-safe metadata sanitization
- billing-disabled fail-safe behavior
- billing portal session pattern

What not to copy blindly:

- `zdash` organization/workspace semantics may not match LiteLLM tenant/team/key
- LiteLLM usage units will likely be token- and request-based, not generic
  application events

Recommended LiteLLM billing model:

- billable subject: tenant
- optional sub-scope: team
- usage dimensions:
  - input_tokens
  - output_tokens
  - cached_tokens
  - requests
  - provider_cost_usd
- event source:
  - completion
  - embeddings
  - moderation
  - image_generation

## Zero Trust And Routing Reuse

The strongest reusable routing and security foundation is split between:

- `infra/traefik/compose.yaml`
- `workers-ai/ai-gateway.yaml`
- `policies/llm_gateway.yaml`
- `apps/zveo/apps/api-gateway/src/config.ts`
- `apps/zveo/apps/api-gateway/src/server.ts`

What to reuse conceptually:

- strict env parsing
- shared-secret or file-backed secret loading
- readiness/liveness patterns
- rate-limiter and audit logger boundaries
- Prometheus scrape annotations and route hardening

Recommended LiteLLM route shape:

- internal service name: `litellm`
- internal port: `4000`
- public hostname candidate: `llm.zeaz.dev`
- protected ops hostname candidate: `llm-ops.zeaz.dev`

Recommended Zero Trust split:

- `llm.zeaz.dev`: service-to-service and tenant API traffic
- `llm-ops.zeaz.dev`: admin UI, dashboards, and key management

Recommended trust tiers:

- `llm-admin`
- `llm-ops`
- `llm-billing`
- `llm-tenant-admin`
- `llm-tenant-developer`
- `llm-audit`

## Architecture Recommendation

Do not embed billing, Zero Trust, and routing logic directly inside LiteLLM
configuration files.

Instead:

1. keep LiteLLM as the provider-routing runtime
2. keep Traefik and Cloudflare as ingress/security layers
3. add a thin ZeaZ control-plane wrapper later for:
   - virtual keys
   - tenant/team quota state
   - audit log persistence
   - billing and entitlements

That keeps issue `#284` aligned with the repository's current architecture and
avoids creating a second overlapping gateway stack.
