# AI Gateway Integration

The AI gateway configuration is defined in `workers-ai/ai-gateway.yaml` and validated with `scripts/validate-ai-gateway.sh`.

## Required runtime variables

- `CF_ACCOUNT_ID`
- `CF_AI_GATEWAY_SLUG` (recommended: `cloudflare-platform-ai-gateway`)
- Provider keys (`OPENAI_API_KEY`) from secret manager only.

`CF_AI_GATEWAY_SLUG` must be supplied by CI variables or runtime environment, never committed to source control as a secret.

## Controls implemented

- Retry and timeout controls.
- Quota policy binding (`workers-ai/quota-policy.yaml`).
- Abuse controls for prompt-injection and PII handling.
- Structured validation logs for CI/CD.
