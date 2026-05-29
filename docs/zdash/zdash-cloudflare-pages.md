# zDash Cloudflare Pages Deployment

This document describes Cloudflare Pages deployment for the React/Vite zDash app under `apps/zdash`.

## Local development

```bash
cd apps/zdash
npm install
npm run dev
```

## Production build

```bash
cd apps/zdash
npm install
npm run lint
npm run build
```

Build output:

```text
apps/zdash/dist
```

## Cloudflare Pages settings

| Setting | Value |
|---|---|
| Project name | `zdash` |
| Production branch | `main` |
| Build command | `npm install && npm run build` |
| Build output directory | `dist` |
| Root directory | `apps/zdash` |
| Node version | `22` |

## Required GitHub Actions secrets

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare token with Pages deployment permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

## Manual deployment

```bash
cd apps/zdash
npm install
npm run lint
npm run build
npx wrangler pages project create zdash --production-branch=main || true
npx wrangler pages deploy dist --project-name=zdash --branch=main --commit-dirty=true
```
