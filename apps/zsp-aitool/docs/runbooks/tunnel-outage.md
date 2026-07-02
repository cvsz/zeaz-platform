# DR Runbook: Cloudflare Tunnel Outage

## Summary
The connection between studio.zeaz.dev and the local origin http://127.0.0.1:3001 is severed.

## Severity Matrix
- Severity: CRITICAL
- Impact: Service Unavailable

## Immediate Containment
1. Verify origin health locally
2. Check Cloudflare Dashboard Tunnel status.
3. Check cloudflared process on host

## Recovery
1. Restart tunnel
2. Verify connectivity.
