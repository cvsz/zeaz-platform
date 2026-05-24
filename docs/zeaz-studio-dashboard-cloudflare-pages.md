# ZeaZ Studio Dashboard Cloudflare Pages Deployment

This document describes the Cloudflare Pages deployment for the React/Vite ZeaZ Studio dashboard under `apps/zeaz-studio-dashboard`.

## Local development

```bash
cd apps/zeaz-studio-dashboard
npm install
npm run dev
```

## Production build

```bash
cd apps/zeaz-studio-dashboard
npm install
npm run lint
npm run build
```

Build output:

```text
apps/zeaz-studio-dashboard/dist
```

## Cloudflare Pages settings

| Setting | Value |
|---|---|
| Project name | `zeaz-studio-dashboard` |
| Production branch | `master` |
| Build command | `npm install && npm run build` |
| Build output directory | `dist` |
| Root directory | `apps/zeaz-studio-dashboard` |
| Node version | `22` |

## Required GitHub Actions secrets

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare token with Pages deployment permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

Use the GitHub CLI from a secure local shell. Do not paste real values into committed files.

```bash
# Login once if needed
gh auth login

# Set the Cloudflare account ID
printf '%s' '<your-cloudflare-account-id>' \
  | gh secret set CLOUDFLARE_ACCOUNT_ID --repo cvsz/zeaz-platform

# Set the Cloudflare API token
printf '%s' '<your-cloudflare-api-token>' \
  | gh secret set CLOUDFLARE_API_TOKEN --repo cvsz/zeaz-platform

# Verify names only. This does not print secret values.
gh secret list --repo cvsz/zeaz-platform
```

For PowerShell:

```powershell
# Login once if needed
gh auth login

# Set the Cloudflare account ID
'<your-cloudflare-account-id>' | gh secret set CLOUDFLARE_ACCOUNT_ID --repo cvsz/zeaz-platform

# Set the Cloudflare API token
'<your-cloudflare-api-token>' | gh secret set CLOUDFLARE_API_TOKEN --repo cvsz/zeaz-platform

# Verify names only. This does not print secret values.
gh secret list --repo cvsz/zeaz-platform
```

## Manual deployment

```bash
cd apps/zeaz-studio-dashboard
npm install
npm run lint
npm run build
npx wrangler pages project create zeaz-studio-dashboard --production-branch=master || true
npx wrangler pages deploy dist --project-name=zeaz-studio-dashboard --branch=master --commit-dirty=true
```
