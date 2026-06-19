# Cloudflare Restore Evidence Template

## Incident Summary
- **Incident ID**: `<INCIDENT-ID>`
- **Scenario Type**: `<DR-SC-XX>`
- **Incident Start (UTC)**: `<YYYY-MM-DD HH:MM>`
- **Recovery Complete (UTC)**: `<YYYY-MM-DD HH:MM>`
- **Recovery Owner**: `<NAME>`

## Recovery Actions
| Timestamp (UTC) | Action Description | Evidence Reference |
|-----------------|--------------------|--------------------|
| HH:MM | Initial detection via Synthetic Monitor | Dashboard link/screenshot |
| HH:MM | Authorization received from `<OWNER>` | Email/Ticket ID |
| HH:MM | Reverted configuration to git SHA `<SHA>` | Git diff snippet |
| HH:MM | Applied fix via manual verification | Tool output |

## Verification Results
- **Service Restored**: `[YES/NO]`
- **Restored Services List**:
  - `service1.zeaz.dev`
  - `service2.zeaz.dev`
- **Verification Method**: `<DIG_CURL_BROWSER>`
- **Verification Evidence**: `<LOG_OR_SCREENSHOT_PATH>`

## Rollback Details
- **Rollback Used**: `[YES/NO]`
- **Phase 13 Reference**: `<ID>`
- **Phase 16 Evidence Archive ID**: `<ID>`

## Post-Recovery
- **Review Board Notified**: `[YES/NO]`
- **Approver Sign-off**: `<NAME>`
- **Post-DR Review Scheduled**: `<YYYY-MM-DD>`
