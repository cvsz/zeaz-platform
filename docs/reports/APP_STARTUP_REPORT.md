# App Startup Report

Generated: 2026-06-09 UTC

## Completed

- Added lifecycle scripts under `scripts/start/`:
  - `start-all-apps.sh`
  - `stop-all-apps.sh`
  - `restart-all-apps.sh`
  - `check-all-apps.sh`
- The startup script is intentionally conservative and starts the newly normalized canonical `zLinebot` service only by default. Large imported apps should be started through app-specific install/build procedures after dependencies are present.
- The health-check script probes canonical local ports and records unavailable apps without exposing secrets.

## Environment Limitations

Local app dependencies were not installed globally and existing apps are heterogeneous imported projects, so full multi-app startup is documented as an operator follow-up rather than forced in this refactor.
