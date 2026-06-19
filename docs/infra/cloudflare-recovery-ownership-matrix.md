# Cloudflare Recovery Ownership Matrix

| ID | Scenario Name | Primary Owner | Backup Owner | Escalation | SLA Start | SLA Resolve |
|----|---------------|---------------|--------------|------------|-----------|-------------|
| DR-SC-01 | DNS Misroute | `<DEVOPS_TEAM>` | `<DEV_TEAM>` | `<ENG_MGR>` | 15m | 60m |
| DR-SC-02 | Worker Collision | `<DEV_TEAM>` | `<DEVOPS_TEAM>` | `<ENG_MGR>` | 30m | 90m |
| DR-SC-03 | Tunnel Outage | `<DEVOPS_TEAM>` | `<INFRA_TEAM>` | `<ENG_MGR>` | 10m | 45m |
| DR-SC-04 | Credential Leak | `<SECURITY_TEAM>` | `<DEVOPS_TEAM>` | `<CTO>` | 5m | 30m |
| DR-SC-05 | Terraform Drift | `<DEVOPS_TEAM>` | `<SRE_TEAM>` | `<ENG_MGR>` | 1h | 4h |
| DR-SC-06 | Access Lockout | `<SECURITY_TEAM>` | `<DEVOPS_TEAM>` | `<CTO>` | 15m | 60m |
| DR-SC-07 | Prod Rollback | `<DEVOPS_TEAM>` | `<DEV_TEAM>` | `<ENG_MGR>` | 15m | 45m |
| DR-SC-08 | Archive Failure | `<DEVOPS_TEAM>` | `<SRE_TEAM>` | `<ENG_MGR>` | 2h | 8h |

## Roles & Contacts

- **DEVOPS_TEAM**: `<ON-CALL-DEVOPS-ID>`
- **DEV_TEAM**: `<ON-CALL-DEV-ID>`
- **SECURITY_TEAM**: `<ON-CALL-SECURITY-ID>`
- **ENG_MGR**: `<ON-CALL-ENG-MGR-ID>`
- **CTO**: `<EMERGENCY-CTO-CHANNEL>`

*Note: All identifiers refer to the current on-call rotation defined in the platform's paging system.*
