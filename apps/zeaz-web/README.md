# ZeaZ Web

Last updated: 2026-06-28

`apps/zeaz-web` is the main ZeaZ public web frontend inside `cvsz/zeaz-platform`.

## Stack

| Layer | Stack |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind/PostCSS project assets |
| Package manager | npm / pnpm lockfiles present |
| Route intent | `www.zeaz.dev`, `zeaz.dev` |

## Scope rule

This README documents only `apps/zeaz-web`. Do not mix commands from `apps/api`, `apps/zoffice`, `apps/zdash`, or other app stacks.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zeaz-web
npm install
npm run dev
```

Open the local Next.js dev URL printed by the command.

## Build

```bash
cd /home/zeazdev/zeaz-platform/apps/zeaz-web
npm run build
```

## Important files

```text
next.config.ts
package.json
src/
public/
tsconfig.json
```

## Security notes

- Do not commit `.env.local` or real provider secrets.
- Keep this app focused on the public web frontend.
- Platform routing and Cloudflare settings live at repo root/config docs, not inside this app unless explicitly required.
