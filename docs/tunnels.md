# Tunnel Ingress (F4)

Source of truth: `tunnels/config.yaml`.

## Runtime requirements
- `PRIMARY_DOMAIN` must be set.
- `ORIGIN_HOSTS` must supply origin targets for all required host labels.
- Tunnel secrets/tokens must never be committed.

## Ingress model
- Each required hostname maps to `service_from_origin_hosts`.
- `ORIGIN_HOSTS` is the only source of origin targets.
- Fallback route is explicit `http_status:404`.

## Dry-run/offline validation
- `bash scripts/tunnel-validate.sh --offline`
- `bash scripts/tunnel-validate.sh --dry-run`

## Rollback notes
1. Revert `tunnels/config.yaml`.
2. Restart connector with previous validated configuration.
3. Re-run offline validation before promoting traffic.
