# zsp-aitool — Shopee Affiliate AI Studio

`apps/zsp-aitool` is a Thai-first Shopee Affiliate AI Studio for content generation, product management, and affiliate marketing automation. Also known as Studio (`studio.zeaz.dev`).

## Stack

- **Frontend**: Next.js 15.5 App Router, React 18, Tailwind CSS 3
- **Backend**: Next.js API routes, Prisma 5.22 ORM
- **Database**: PostgreSQL 16 (container: `postgres:16-alpine`)
- **Testing**: Vitest v4 (355 tests across 110 files)
- **Validation**: Zod schemas

## Database — 23 tables

User, Organization, OrgMembership, Product, ProductImage, ProductDuplicateGroup,
AffiliateLink, ContentGeneration, ContentTemplate, PromptPreset, PlatformPost,
OCRJob, SimilarProduct, AIContentQueueJob, CsvImportJob, APIUsageLog,
HyperFrameRenderJob, HyperFrameRenderShare, FeedbackSubmission, UserSetting,
ShopeeAffiliateIngestion, ShopeeAffiliateSocialDraft, `_prisma_migrations`

## API Modules

admin, auth, ai, products, templates, ocr, export, content-history,
hyperframes, imports, integrations (shopee), feedback, settings, usage

## Dashboard Pages

generator, products, templates, ocr, similar, export-center, content-history,
hyperframes (renders, batch, ops/queue), settings, shopee-affiliate, admin

## Development

```bash
pnpm install
pnpm prisma:generate
pnpm dev          # starts on http://127.0.0.1:3001
pnpm typecheck    # TypeScript check
pnpm test         # Vitest
pnpm build        # Production build
```

## Platform contract

- Primary hostname: `zaiz.zeaz.dev` / `studio.zeaz.dev`
- Default local port: `3001`
- Secrets must stay in local environment files or approved secret stores and must not be committed.

