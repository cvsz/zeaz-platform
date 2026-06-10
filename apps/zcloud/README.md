# zcloud

zcloud is a Zeaz-branded CloudPanel operations cockpit for turning the CloudPanel v2 documentation structure into a release-ready operator surface. It does **not** install CloudPanel, apply infrastructure, store credentials, or execute remote commands.

## What is included

- Cloud provider launch matrix for AWS, DigitalOcean, Hetzner, Google Compute Engine, Microsoft Azure, Oracle Cloud, Vultr, and generic virtual machines.
- Workload blueprints for WordPress, PHP frameworks, Node.js with PM2, Python with uWSGI, static HTML, reverse proxy sites, and database-backed applications.
- Security runbook covering firewall boundaries, 2FA, Basic Auth, updates, backups, least-privilege site users, and TLS hygiene.
- CLI command catalog with safe parameterized patterns and no production credentials.
- Guided readiness checklist with local-only state in the browser.

## Run locally

```bash
cd apps/zcloud
npm run validate
npm run start
```

Then open <http://127.0.0.1:4177>. The root `index.html` is the runnable entrypoint; `public/index.html` mirrors it for static-hosting adapters and uses `public/src` as a symlink to the source assets.

## Safety model

- Offline by default; no API calls are made.
- No secrets, Cloudflare IDs, CloudPanel credentials, webhook URLs, tunnel tokens, or production origins are committed.
- Installer and CLI commands are shown as operator references only; users must verify upstream docs and execute manually in their own environment.
- The app uses localStorage only for non-sensitive checklist state.

## Upstream references

See [`IMPORT_SOURCE.md`](IMPORT_SOURCE.md) for the reviewed upstream documentation path and attribution notes.
