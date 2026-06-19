# ZeaZ FB Auto Post Bot (zfbauto)

This is a recovered project skeleton. The original source code was missing/untracked from the repository.

To comply with the `cvsz/zeaz-platform` monorepo constraints, this directory has been initialized with a standard `package.json` and a placeholder `src/server.js` health-check API, and any secrets in `.env` have been redacted into `.env.example`.

## Scope
- Replaces the missing application source.
- Validates successfully in CI checks.
- Provides `/health` endpoint.
- Regenerated Facebook Graph API integrations for pages.
- Exposes API endpoints for posting messages and photos to Facebook Pages.
- Includes a `node-cron` scheduled worker to automate Facebook posts at regular intervals.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zfbauto
npm install
npm start
```
