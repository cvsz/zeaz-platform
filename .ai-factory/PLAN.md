# Cloudflare Infrastructure & Tunnel Audit Fix

Align Cloudflare tunnel configuration with the canonical apps-port-plan.json.

## Tasks
### Phase 1: Audit & Analysis
- [ ] 1. Identify missing entries in `infra/cloudflare/config/tunnels.yml` from `configs/platform/apps-port-plan.json`.
- [ ] 2. Identify stale/misconfigured entries in `infra/cloudflare/config/tunnels.yml` (wrong ports/unused domains).

### Phase 2: Configuration Update
- [ ] 3. Update `infra/cloudflare/config/tunnels.yml` to match the canonical port plan.
- [ ] 4. Ensure `api.zeaz.dev` and `ztrader.zeaz.dev` ports are correctly mapped (8088 and 3016 respectively).
- [ ] 5. Add missing apps (`zcino`, `factory`, `zdash`, `release`).

### Phase 3: Final Verification
- [ ] 6. Run tunnel configuration validation script (`infra/cloudflare/scripts/validate-cloudflare-config.sh`).
