# AI Gateway integration

`workers-ai/ai-gateway.yaml` defines declarative gateway controls.

Required environment variables:
- `CF_ACCOUNT_ID`
- `CF_AI_GATEWAY_SLUG`
- provider API key via external secret manager.

Recommended slug values:
- `zcodex-ci-self-healing`
- `cloudflare-platform-ai-gateway`
