# LiteLLM Issue 284 Gap Matrix

Source issue: <https://github.com/cvsz/zeaz-platform/issues/284>

## Summary

The repository already contains AI gateway primitives, Cloudflare policy
artifacts, Traefik runtime configuration, and monitoring assets. What is still
missing is a single repo-native LiteLLM service boundary with its own runtime,
ops scripts, and delivery artifacts.

## Matrix

| Area | Issue Requirement | Current Evidence | Status | Gap |
| --- | --- | --- | --- | --- |
| Service boundary | `services/litellm/` | New scaffold in `services/litellm/` | Partial | No app-specific implementation logic yet beyond scaffold |
| PostgreSQL | Backend store | `infra/ai-runtime/compose.yaml` has Postgres primitive | Partial | Not previously attached to LiteLLM directly |
| Redis | Cache | `infra/ai-runtime/compose.yaml` has Redis primitive | Partial | Not previously attached to LiteLLM directly |
| Prometheus | Metrics | `monitoring/prometheus/*`, new `services/litellm/monitoring/prometheus.yml` | Partial | Needs service-specific metric coverage and alerts |
| Grafana | Dashboards | Existing platform dashboards, new starter dashboard | Partial | Needs LiteLLM operational panels and alert thresholds |
| Health checks | Service health | Existing validation patterns, new `healthcheck.sh` | Partial | Needs live container verification in deployed environment |
| Backup/restore | Service runbooks/scripts | Existing platform scripts, new service scripts | Partial | Needs drill evidence and retention policy |
| Cloudflare Zero Trust | Gateway protection | Cloudflare docs/modules/policies present, `services/litellm/policies/access-policy.yaml` added | Partial | Upstream Access app/policy is still not applied in a live environment |
| Traefik ingress | Ingress routing | `infra/traefik/compose.yaml` exists, `services/litellm/docker-compose.traefik.yaml` added | Partial | Routing contract exists, but the service is not mounted into the running proxy yet |
| Provider routing | OpenAI/Gemini/Anthropic/DeepSeek | New LiteLLM config includes all four | Partial | No live credential validation or routing tests yet |
| Virtual keys | Team-scoped access | No direct service implementation found | Missing | Need key model and storage design |
| Team quotas | Quotas | `workers-ai/quota-policy.yaml`, `policies/llm_gateway.yaml`, `services/litellm/policies/quota-policy.yaml` | Partial | Need a runtime adapter that calls repo billing services before each request |
| Rate limiting | Abuse control | Platform policies and edge guidance exist | Partial | Need service-level enforcement contract |
| Stripe billing | Billing integration | `apps/zdash` and other apps have Stripe patterns | Partial | No LiteLLM billing path |
| Usage metering | Metering | `apps/zdash/backend/app/billing/usage_meter.py` pattern exists | Partial | No LiteLLM usage event schema |
| Customer portal | SaaS ops | Existing billing UI patterns in `apps/zdash` | Partial | No LiteLLM customer portal wiring |
| Multi-tenant RBAC | Tenant isolation | Repo-wide Zero Trust/RBAC guidance exists | Partial | Need LiteLLM tenant/team role model |
| Audit logs | Change and usage audit | Existing audit patterns in apps | Partial | Need LiteLLM audit event schema and retention |
| Helm chart | K8s delivery | Helm patterns exist elsewhere in repo | Missing | Need LiteLLM chart |
| Terraform module | Infra delivery | Terraform modules exist elsewhere in repo | Missing | Need LiteLLM-specific module or environment integration |

## Recommended Order

1. Finish Phase 1 runtime and validation for `services/litellm/`
2. Add Traefik + Zero Trust routing contract
3. Add quota, audit, and tenant model
4. Add billing/metering/customer portal integration
5. Add Helm/Terraform delivery artifacts
