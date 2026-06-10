# zLinebot Merge Report

Generated: 2026-06-09 UTC

## Completed

- Inspected canonical `apps/zLinebot` and attempted to locate requested source directories `apps/zLinebot-automos`, `apps/zlttbots`, and `apps/zttlbots`.
- The requested source directories were not present in the repository snapshot, so no missing source behavior was invented.
- Created a safe canonical Node.js scaffold under `apps/zLinebot` with modular directories for bots, handlers, webhooks, services, config, database, routes, workers, and utils.
- Added `GET /health` and `POST /webhook/line`.
- LINE secrets are environment-based only.

## Canonical Runtime

- Port: `4113`
- Service: internal bot service
- Env keys: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LINE_WEBHOOK_SECRET`, `DATABASE_URL`, `PORT`
