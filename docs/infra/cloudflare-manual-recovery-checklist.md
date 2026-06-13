# Cloudflare Manual Recovery Checklist

## DR-SC-01: DNS Misroute
1. **[READ-ONLY CHECK]** Verify record in Cloudflare Dashboard | DevOps Team | Access to CF | Screenshot of current state
2. **[READ-ONLY CHECK]** Locate last known good git SHA | Dev Team | Git history | Git commit ID
3. **[MANUAL]** Authorize emergency revert | DevOps Lead | Verified failure | Email/Chat confirmation
4. **[MANUAL]** Apply repository state fix | DevOps Team | Authorization | Phase 16 evidence entry

## DR-SC-02: Worker Route Collision
1. **[READ-ONLY CHECK]** Run `infra/cloudflare/scripts/scan-workers-routes.sh` | Dev Team | Local repo | Scanner output
2. **[READ-ONLY CHECK]** Inspect Cloudflare Workers Dashboard | DevOps Team | Access to CF | Screenshot of overlapping routes
3. **[MANUAL]** Authorize route deletion/fix | DevOps Lead | Identification of overlap | Sign-off
4. **[MANUAL]** Deploy corrected route | Dev Team | Validated config | Deployment log snippet

## DR-SC-03: Tunnel Outage
1. **[READ-ONLY CHECK]** Run `systemctl status cloudflared` | DevOps Team | Host access | Service status output
2. **[READ-ONLY CHECK]** Check Tunnel logs (Redacted) | DevOps Team | Host access | Log tail (no secrets)
3. **[MANUAL]** Restart service if unauthorized (Decision) | DevOps Lead | Prerequisite check | Evidence of restart
4. **[MANUAL]** Authorize new token generation (Suspected leak) | Security Team | Leaked token context | New Tunnel ID reference

## DR-SC-04: Credential Leak
1. **[READ-ONLY CHECK]** Search repository for exposed token | Security Team | Git history | Grep result
2. **[MANUAL]** Deactivate compromised token in CF Dashboard | Security Team | CF Access | Deactivation confirmation
3. **[MANUAL]** Generate replacement token | Security Team | Deactivation complete | Placeholder reference in repo
4. **[MANUAL]** Update local secrets (Redacted) | DevOps Team | Authorization | Signed commit of redacted placeholder

## DR-SC-05: Terraform State Drift
1. **[READ-ONLY CHECK]** Run `tofu plan` or `terraform plan` | DevOps Team | Tofu/Terraform CLI | Plan output snippet
2. **[READ-ONLY CHECK]** Compare plan against live runtime | DevOps Team | Live access | Drift report
3. **[MANUAL]** Resolve drift via state import or config fix | DevOps Lead | Authorization | Phase 16 evidence

## DR-SC-06: Access Policy Lockout
1. **[READ-ONLY CHECK]** Verify user in Zero Trust logs | Security Team | CF Access | Log snippet
2. **[READ-ONLY CHECK]** Review active Access Policies | Security Team | CF Access | Policy definition screenshot
3. **[MANUAL]** Temporary policy bypass (Break-Glass) | Security Team | Authorization | Approval reference
4. **[MANUAL]** Restore original policy after fix | Security Team | Verification | Verification results

## DR-SC-07: Production Rollback Required
1. **[READ-ONLY CHECK]** Refer to `docs/infra/cloudflare-phase13-runtime-rollback-evidence.md` | DevOps Team | Phase 13 | Reference ID
2. **[MANUAL]** Execute Phase 13 Rollback Runbook | DevOps Team | Emergency Auth | Evidence archive entry

## DR-SC-08: Evidence Archive Unavailable
1. **[READ-ONLY CHECK]** Verify storage backend accessibility | DevOps Team | Storage access | Connection test output
2. **[READ-ONLY CHECK]** Check backup of evidence archive | DevOps Team | Backup access | Restore feasibility check
3. **[MANUAL]** Temporary evidence storage allocation | DevOps Lead | Primary failure | New location link
4. **[MANUAL]** Synchronize archives after restoration | DevOps Team | Restore complete | Sync log
