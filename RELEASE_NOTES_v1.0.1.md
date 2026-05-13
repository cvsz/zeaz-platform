# v1.0.1-platform-stable

Stable Cloudflare platform baseline with CI compatibility fixes.

## Validation status

- Terraform validation: passed
- Terraform drift detection: no drift detected
- GitOps F7 workflow policy: passed
- YAML validation: passed
- Compatibility Makefile targets: passed
- Working tree: clean

## Enabled baseline resources

- Cloudflare DNS records
- Cloudflare Tunnel
- Cloudflare Workers
- Cloudflare R2 bucket
- Cloudflare D1 database

## Feature-gated resources

- WAF resources are disabled unless `ENABLE_WAF=true` or `TF_VAR_enable_waf=true`.
- Zero Trust and SAML resources are disabled unless `ENABLE_ZERO_TRUST=true` or `TF_VAR_enable_zero_trust=true`.

## CI compatibility fixes

Added compatibility targets for older and PR workflow names:

- `validate-agent`
- `policy-test`
- `sbom-generation`
- `sbom-validate`
- `security-validate`
- `tunnel-validation`
- `waf-validation`

`tunnel-validation` now skips safely when `ORIGIN_HOSTS` is not configured in pull request contexts.

`waf-validation` now skips safely when WAF is disabled.

## Release tag

- Tag: `v1.0.1-platform-stable`
- Baseline commit: `3df21a9f40d523ded82c21258ac46094e6803df4`
