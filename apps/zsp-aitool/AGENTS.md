# AGENTS.md — zsp-aitool / Studio

Repository: cvsz/zsp-aitool
Product: Thai-first Shopee Affiliate AI Studio / ZSP AI Tool
Local origin: http://127.0.0.1:3001
Public edge: https://studio.zeaz.dev

## Bootstrap Workflow

To bootstrap the agent environment for the current runtime, use the unified script:

```bash
./scripts/bootstrap.sh <runtime>
```

Supported runtimes: `gemini`, `claude`, `codex`.

## Maintenance & Remediation

- If `health` check fails, run `./scripts/bootstrap.sh gemini` first.
- Consolidate local patches where possible to reduce `patch-*.js` dependency.
- Always validate with `make validate` after structural changes.

## Stack
- **Frontend**: Next.js 15.5 App Router, React 18, Tailwind CSS 3
- **Backend**: Next.js API routes, Prisma 5.22 ORM
- **Database**: PostgreSQL 16 (docker-compose: postgres:16-alpine, local: psql 16.14)
- **Testing**: Vitest v4, 355 tests (110 files), jsdom env
- **Validation**: Zod schemas
- **Video**: HyperFrames render worker integration

## Database — 23 tables
User, Organization, OrgMembership, Product, ProductImage, ProductDuplicateGroup,
AffiliateLink, ContentGeneration, ContentTemplate, PromptPreset, PlatformPost,
OCRJob, SimilarProduct, AIContentQueueJob, CsvImportJob, APIUsageLog,
HyperFrameRenderJob, HyperFrameRenderShare, FeedbackSubmission, UserSetting,
ShopeeAffiliateIngestion, ShopeeAffiliateSocialDraft, _prisma_migrations

## Hard rules
- Do not change production port 3001.
- Do not change Cloudflare, DNS, tunnel, or systemd config without explicit approval.
- Do not expose DATABASE_URL, secrets, tokens, API keys, /var/lib, outputPath, internal render paths, or raw stack traces.
- Do not use dangerouslySetInnerHTML for user-controlled content.
- Do not add frontend controls that run systemctl.
- Do not run npm audit fix --force.
- Do not upgrade Next.js or Prisma major versions without approval.
- All commits must use GPG signing via `scripts/git/gpg-loopback.sh commit -m "message"`.
  Do not run raw `git commit` — use the script to unlock the key with loopback pinentry.
- Use `scripts/git/gpg-loopback.sh push` and `scripts/git/gpg-loopback.sh pull` to unlock
  the GPG agent before the operation (push/pull don't sign but the agent must be warm).

## Verification (run after changes)
python3 -m json.tool package.json
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run test
npm run build
npm run health
