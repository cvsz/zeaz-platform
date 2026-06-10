# zAcademy

Last updated: 2026-06-10

`apps/zAcademy` is the academy / learning SaaS platform stack inside `cvsz/zeaz-platform`.

## Stack

| Layer | Stack |
|---|---|
| Workspace | Node / pnpm monorepo |
| App areas | `apps/`, `packages/`, `services/` |
| Automation | `automation/`, `scripts/`, `Makefile` |
| Architecture docs | `architecture/`, `docs/` |
| Testing | `tests/` |

## Scope rule

This README documents only `apps/zAcademy`. Keep zAcademy commands and dependencies separate from zOffice, zDash, zWallet, and other app stacks.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zAcademy
pnpm install
pnpm dev
```

If npm is used in the current environment:

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
packages/
services/
automation/
architecture/
docs/
tests/
```

## Security notes

- Do not commit LMS/customer secrets or `.env` files.
- Keep academy-specific services isolated inside this app path.
- Use platform Cloudflare routing only through root-level configs.
