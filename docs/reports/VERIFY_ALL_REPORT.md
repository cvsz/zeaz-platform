# Verify All Report

Generated: 2026-06-09 15:57:26Z

## Implemented

- Added `scripts/verify/verify-all.sh`.
- The verifier checks local tool availability, compose config, PostgreSQL/Redis connectivity where tools are present, canonical ports, local app health, domain reachability (optional), env file presence, unsafe placeholders, and Cloudflare config.
- JSON output is written to `reports/verify/latest.json` (gitignored runtime report path).
