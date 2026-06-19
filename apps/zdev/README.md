# VDev

VDev is a Zeaz-branded, browser-based all-in-one development environment product surface under `apps/zdev`. It presents a secure, offline-safe landing experience for a future code-server-backed workspace.

## What is included

- Responsive glassmorphism landing page for VDev.
- Feature cards for all-in-one development, web-based access, versatile tooling, and collaboration.
- Workflow section explaining access, stack selection, coding, and real-time sharing.
- Local-only readiness checklist for workspace launch planning.
- Security-first messaging that keeps credentials and production runtime configuration outside this static app.

## Run locally

```bash
cd apps/zdev
npm run start
```

Then open <http://127.0.0.1:4181/apps/zdev/>.

## Validate

```bash
cd apps/zdev
npm run validate
```

## Safety model

- Offline by default; the app makes no network or API calls.
- No secrets, Cloudflare IDs, tunnel tokens, code-server credentials, origin addresses, or webhook URLs are committed.
- Checklist state is stored only in browser localStorage and must not contain secrets.
- Production deployment requires separate Zero Trust, identity, runtime isolation, and secret-management review.
