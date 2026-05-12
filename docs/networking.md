# Networking Guardrails (F4)

Policy file: `policies/network.yaml`.

## Controls
- Domain suffix validation against `PRIMARY_DOMAIN`.
- Required ingress mapping validation for all platform hostnames.
- No committed tunnel secrets.
- `ORIGIN_HOSTS`-backed origin mapping with DR expectations.

## Validation workflow
1. `bash scripts/tunnel-validate.sh --offline`
2. `python3 -m pytest tests/test_dns_records.py tests/test_tunnel_config.py`
3. `make tf-validate`

## Change rollback
- Use Git rollback for DNS and tunnel config files.
- Re-apply prior infrastructure state.
- Re-validate DNS and ingress before restoring production traffic.
