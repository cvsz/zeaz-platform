# Codex Prompt — Implement Cloudflare Hostname Routing for zeaz-platform

Role:
You are Codex running inside `/home/zeazdev/zeaz-platform`.

Objective:
Implement the requested Cloudflare routing update using repo-native patterns.

Important repo facts to respect:
- Current Docker Compose root includes `infra/traefik/compose.yaml` and `infra/cloudflare/compose.yaml`.
- Current Cloudflare connector runs `cloudflare/cloudflared` and mounts `infra/cloudflare/config.yml`.
- Current Traefik listens internally and is intended to be reached through Cloudflare Tunnel.
- Keep free/no-cost guardrails.

Tasks:
1. Create `configs/domain-map.zeaz-platform.json` from the requested app/domain map.
2. Update `infra/cloudflare/config.yml` to include all hostnames from the map, all pointing to `http://traefik:80`.
3. Keep the final ingress rule as `service: http_status:404`.
4. Add `scripts/cloudflare/validate-zeaz-domain-map.py`.
5. Add `scripts/cloudflare/generate-zeaz-cloudflared-config.py`.
6. Add `scripts/cloudflare/plan-zeaz-dns-records.sh` with dry-run default.
7. Add Makefile targets:
   - `zeaz-cloudflare-map-validate`
   - `zeaz-cloudflare-config-generate`
   - `zeaz-cloudflare-dns-plan`
   - `zeaz-cloudflare-dns-apply`
   - `zeaz-cloudflare-verify-hosts`
8. Add docs:
   - `docs/ZEAZ_CLOUDFLARE_ROUTING_RUNBOOK.md`
   - `docs/ZEAZ_CLOUDFLARE_ACCESS_MATRIX.md`
   - `docs/ZEAZ_CLOUDFLARE_RELEASE_EVIDENCE_TEMPLATE.md`

Safety:
- Do not touch secrets.
- Do not commit `.env*`.
- Do not use Cloudflare Global API Key.
- Do not enable paid features.
- Do not apply DNS changes unless explicit confirmation variables are present.
- Keep backward compatibility for existing important hostnames when possible.

Validation commands:
```bash
python3 scripts/cloudflare/validate-zeaz-domain-map.py configs/domain-map.zeaz-platform.json
python3 scripts/cloudflare/generate-zeaz-cloudflared-config.py configs/domain-map.zeaz-platform.json > /tmp/zeaz-cloudflared.yml
cloudflared tunnel ingress validate /tmp/zeaz-cloudflared.yml || true
make yaml-validate
make validate-env
make tunnel-validation
```

Final response must include:
- summary of changes
- exact files changed
- commands run
- validation output
- rollback commands
