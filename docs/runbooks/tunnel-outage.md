# Runbook: Tunnel Outage

## Severity matrix
- P0: Full outage of all subdomains.
- P1: Partial outage affecting core services (Auth, AI).

## Detection Signals
- High latency or connection timeouts to proxied applications.

## Immediate Containment
- Verify status with `cloudflared tunnel status`.

## Recovery
- Restart tunnel process.

## Rollback
- Revert recent tunnel configuration changes if applicable.

## Forensic collection
- Collect cloudflared logs for investigation.

## Recovery validation
- Confirm service connectivity and log stability.

## Postmortem template
- Record incident details, root cause, and follow-up actions.
