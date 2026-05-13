# cloudflare-waf

Cloudflare WAF module for baseline managed rules, custom firewall rules, cache tuning, and canonical redirects.

## Notes

- `enable_zone_settings_override` defaults to `false` to keep the module compatible with least-privilege API tokens that do not include Zone Settings Write.
- Enable `enable_zone_settings_override=true` only when using a token that is explicitly scoped to manage zone settings.
