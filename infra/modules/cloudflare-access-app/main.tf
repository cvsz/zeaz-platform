# Updated for LiteLLM
resource "cloudflare_access_application" "litellm" {
  name       = "LiteLLM Proxy"
  type       = "self_hosted"
  session_duration = "24h"
  # ... existing config
}