# Tunnel Automation (F4.2)

## Configuration Source
- Runtime config: `tunnels/config.yaml`.
- Validation script: `scripts/tunnel-validate.sh`.

## Security
- Tunnel secrets are not committed.
- `TUNNEL_TOKEN` must be supplied via environment or secret manager at runtime.

## Ingress Mapping
- Includes ingress mapping for all platform domains.
- Default fallback route is `http_status:404`.

## Failover
- `failover_origins` map defines primary and DR upstream origins per hostname.
- Health checks are configured for `/healthz` with strict intervals/timeouts.
