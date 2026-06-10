# OpenWork

Last updated: 2026-06-10

`apps/openwork` is the OpenWork stack imported into `cvsz/zeaz-platform`. It is an open-source cowork / agent desktop-style platform and keeps its own monorepo tooling, packages, docs, and app structure.

## Stack

| Layer | Stack |
|---|---|
| Workspace | Node / pnpm monorepo |
| Packages | `packages/` |
| Apps | `apps/`, `ee/` |
| Tooling | Turbo, Makefile, package-lock/pnpm-lock |
| Docs | `docs/`, `prds/`, `examples/` |
| Route intent | `openwork.zeaz.dev` |

## Scope rule

This README documents only `apps/openwork`. Do not mix zOffice, zDash, zWallet, or web commands into this stack.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/openwork
pnpm install
pnpm dev
```

If npm is required for the current checkout:

```bash
npm install
npm run dev
```

## Build

```bash
pnpm build
```

## Important files

```text
package.json
pnpm-workspace.yaml
turbo.json
Makefile
apps/
ee/
packages/
docs/
examples/
scripts/
SECURITY.md
SUPPORT.md
```

## Security notes

- Do not commit provider API keys or local desktop secrets.
- Keep enterprise/ee configuration isolated.
- Route exposure should be controlled through platform Cloudflare configs.
