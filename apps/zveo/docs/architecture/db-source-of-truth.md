# DB source-of-truth unification

## Decision
Yes. **Drizzle schema + Drizzle migrations are the canonical source of truth** for PostgreSQL structure.

## `db/schema.sql` preservation plan
- `db/schema.sql` is preserved as a compatibility artifact for operators and audit/review workflows.
- `db/schema.sql` is no longer used as a container bootstrap source.
- It is aligned with Drizzle-managed tables to reduce historical drift.

## Docker Compose initialization safety
- PostgreSQL starts first.
- A one-shot `db-migrate` service runs `pnpm db:migrate` against PostgreSQL.
- A one-shot `db-seed` service runs `pnpm db:seed` after migrations.
- API/worker services wait for `db-migrate` to complete successfully.

## Migration generation and application
- `pnpm db:generate` generates migration SQL from `packages/db/src/schema.ts`.
- `pnpm db:migrate` applies migrations from `db/migrations`.
- `pnpm db:check` validates schema/migration configuration.
- `pnpm db:studio` opens Drizzle Studio for local inspection.

This provides one authoritative schema definition while preserving SQL artifacts for review and operations.
