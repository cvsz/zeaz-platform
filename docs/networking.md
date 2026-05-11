# Networking Guardrails (F4.3)

## Origin Allowlist
Origin traffic must only target declared service names and DR peers defined in `tunnels/config.yaml`.

## Egress Policy Notes
- Tunnel connector egress should be limited to Cloudflare Tunnel control/data plane.
- Origin egress should be restricted to required dependencies only.

## Tunnel Health Validation
- Run `bash scripts/tunnel-validate.sh --offline` during CI.
- Run without `--offline` for DNS and runtime environment checks.

## DNS Propagation Checks
- Validate host resolution for every platform FQDN post-deploy.
- Roll forward only after all required hostnames resolve.

## Rollback Steps
1. Re-apply previous known-good Terraform state.
2. Restore previous `dns/records.yaml` and `tunnels/config.yaml` from Git.
3. Re-run tunnel validation and DNS checks.
4. Validate application health endpoints before reopening traffic.
