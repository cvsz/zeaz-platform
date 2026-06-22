# Contributing to zLM-CLI

Thanks for your interest in improving zLM-CLI! This guide covers setup, conventions, and the PR process.

## 📋 Prerequisites

- [Bun](https://bun.sh) (runtime + package manager)
- Node.js 18+ (Bun manages this, but some tooling may need it)
- Git

## 🚀 Dev setup

```bash
git clone https://github.com/zai/zlm-cli.git
cd zlm-cli
make install   # bun install + prisma generate + prisma db push
make start     # start dev server (background, port 3000)
make status    # confirm it's running
```

The server is now live at `http://localhost:3000`. Check `make logs` to tail output.

> **Note:** `make start` is idempotent — it won't start a duplicate if one is already running. Use `make stop` or `make restart` to manage it.

## 🧭 Daily workflow

```bash
git checkout -b feat/my-feature
# ... make changes ...
make lint       # MUST pass — zero ESLint errors
make restart    # pick up changes (or rely on Fast Refresh)
# verify in the browser
git commit -m "feat: add X"
git push
# open a PR
```

### Commit message conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add security-audit skill
fix: parse SSE stream correctly for token deltas
docs: update README quickstart
refactor: split client-safe types into zlm-modes.ts
chore: bump dependencies
```

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `chore:` — tooling, deps, config
- `test:` — tests (we don't currently have a test suite, but welcome additions)

Keep the summary ≤ 50 chars, imperative mood. Add a body for the *why* if non-trivial.

## 🏗 Architecture overview

Read [`AGENTS.md`](AGENTS.md) for the full guide. The short version:

- **Only `/` is user-visible.** New UI goes in `src/app/page.tsx` or its components.
- **`z-ai-web-dev-sdk` is server-only.** Never import these server-only libs from client code: `glm.ts`, `local-model.ts`, `voice.ts`, `media.ts`, `workflow-runner.ts`, `billing.ts`, `usage.ts`, `memory.ts`, `memory-mechanism.ts`, `sandbox.ts`, `mcp-runner.ts`, `web-tools.ts`, `security-scanner.ts`, `prompt-gen.ts`, `agent-gen.ts`, `api-keys.ts`, `privacy.ts`, `gdrive.ts`, `gmail.ts`, `outlook.ts`. Client-safe types live in `src/lib/{zlm-modes,skills,modules,agents,workflows,permissions,promptpay,payments,mcp-commands,web-tools-client,plan,connector,api-keys-client,voice-commands,local-media,media-types,settings,tasks,conversations,models,utils}.ts`.
- **The Connector pipeline** composes `[mode]+[skill]+[modules]+[workspace]+[agent]` (+ memories, if the memory toggle is on — memories are auto-extracted by `memory-mechanism.ts` after each turn) into the system prompt. Adding a layer means updating a registry + the UI that lists it.
- **32 API routes** — `admin, agent, agent-gen, billing, cli, conversations, dashboard, gdrive, gmail, image, keys, mcp, memory, outlook, payments, permissions, plan, privacy, profile, promptpay, prompt-gen, research, route, sandbox, search, security, settings, tasks, usage, video, voice, workflows`. Streaming routes (`cli`, `agent`, `plan`, `workflows`, `prompt-gen`, `agent-gen`) emit `{"type":"delta","content":"..."}` NDJSON lines; the rest return JSON bodies.
- **RBAC before rate-limit before processing.** Gated routes call `hasPermission(key, permission)` from `permissions.ts` (13 keys × 4 roles: admin / developer / viewer / guest) before `validateRequest()`.
- **ZLM-1.0 Local is offline.** When the model is `ZLM-1.0 Local`, `composeSystemPrompt()` short-circuits to a heuristic engine — no SDK calls. The same applies to `local-media.ts` (offline SVG/WAV/ASCII generation).
- **Security scanner runs locally.** `security-scanner.ts` walks `src/` and applies 20+ OWASP RegExp rules. Invoke via `/security`, `make security`, or the Sec sidebar tab.

## 📏 Code conventions

### TypeScript
- Strict mode. No `any` without a comment justifying it.
- Prefer `interface` for object shapes, `type` for unions.
- Export types alongside values from registry files.

### Styling
- Tailwind CSS 4 + shadcn/ui. Prefer existing `src/components/ui/*` over custom builds.
- **No indigo/blue as primary.** The terminal palette is emerald on `#07090a`.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Mobile-first responsive. The sidebar is a drawer on `<lg`, persistent on `lg+`.
- The input bar is a sticky `<footer>` — it must stick to the bottom and never overlap content.

### Components
- `"use client"` directive at the top of any component using hooks/browser APIs.
- Server-only logic (SDK, DB) stays in route handlers or `src/lib/glm.ts`.
- Lucide icons via the `Icon` resolver in `src/components/terminal/icon.tsx` — add new icon names to the `ICONS` map there.

### API routes
- `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`.
- Stream via `ReadableStream` + `TextEncoder`, framing each event as `JSON.stringify(evt) + "\n"`.
- Validate input; return `400` with `{ error: string }` for bad requests.
- Never write absolute URLs in `fetch` — relative paths only.

### Prisma
- Schema in `prisma/schema.prisma`. Run `make db-push` after changes.
- Import the client: `import { db } from "@/lib/db"`.
- Primitive types cannot be lists — use a JSON string or a relation.

## ➕ Adding common things

### A new skill
1. Add to `SKILLS` in `src/lib/skills.ts` (id, name, command, icon, tagline, description, systemPrompt, examples).
2. Add the icon to `src/components/terminal/icon.tsx`.
3. Update `/help` text in `terminal.tsx`.

### A new module
1. Add to `MODULES` in `src/lib/modules.ts` (id, name, command, icon, category, tagline, description, context).
2. Add the icon to `icon.tsx`.
3. The Connector auto-includes active modules — no other wiring needed.

### A new agent
1. Add to `AGENTS` in `src/lib/agents.ts` (id, name, command, icon, tagline, description, plannerPrompt, executorPrompt, maxSteps, defaultSkill).
2. Add the icon to `icon.tsx`.
3. `streamAgent()` in `glm.ts` handles orchestration automatically.

### A new workflow preset
1. Add to `WORKFLOW_PRESETS` in `src/lib/workflows.ts` (id, name, nodes, edges, defaultSkill).
2. `workflow-runner.ts` walks the DAG in topological order automatically.
3. Add the icon to `icon.tsx`.

### A new API route
1. Create `src/app/api/<name>/route.ts` with `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`.
2. If it gates access, call `validateRequest(extractApiKey(req))`; if it needs RBAC, call `hasPermission(key, "<permission>")` from `permissions.ts`.
3. If it streams, frame events as `JSON.stringify(evt) + "\n"`.
4. Add the route name to the lists in `README.md` / `ARCHITECTURE.md` / `SYSTEM-ARCHITECTURE-DIAGRAM.md` / `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` (the canonical list now has 32 routes).
5. Add a slash command in `terminal.tsx` if user-facing.

### A new slash command
1. Add a `case "/your-command":` in `runLocalCommand()` in `terminal.tsx`.
2. Return `true` if handled locally; `false` to fall through to GLM.
3. Update `/help` text.

### A new sidebar tab
1. Create `src/components/terminal/<name>-panel.tsx`.
2. Add the id to the `SidebarTab` union in `sidebar.tsx`.
3. Add a `TabButton` + panel render in `sidebar.tsx`.
4. Add a slash command in `terminal.tsx`'s `runLocalCommand()`.

### A new RBAC permission key
1. Add to `PERMISSION_KEYS` in `src/lib/permissions.ts`.
2. Decide which of the 4 role presets (admin / developer / viewer / guest) should grant it by default.
3. Update the `/permissions` panel rendering if the UI groups keys.

### A new TTS voice
1. Confirm the voice id is supported by `zai.audio.tts.create()` (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo).
2. Add to the voice picker in `voice-panel.tsx`.

### A new payment plan
1. Add to `PLANS` in `payments.ts` (id, name, price, credits, rateLimitPerHour, permissions).
2. Update the Payments panel rendering.

### A new security scan rule
1. Append an entry to the `RULES` array in `src/lib/security-scanner.ts` — each rule needs `{ id, rule, severity, category, description, pattern: RegExp, recommendation }`.
2. Use severity `critical` for secrets/RCE, `high` for injection, `medium` for misconfig, `low` for hygiene, `info` for style.
3. The scanner walks `src/**/*.{ts,tsx,js,jsx,json,env}` automatically — no other wiring needed.

### A new model
1. Add to `MODELS` in `src/lib/models.ts` (id, label, category, tagline, description, capabilities, speed, context).
2. If it's a local/offline model, add the heuristic in `src/lib/local-model.ts` (or `local-media.ts` for media).
3. The Model Selector dropdown picks it up automatically — grouped by `MODEL_CATEGORIES`.

### A new Prisma model
1. Add to `prisma/schema.prisma`. The schema currently has 10 models: `User`, `Post`, `ApiKey`, `PaymentOrder`, `Role`, `ApiKeyRole`, `UserProfile`, `UsageRecord`, `Memory`, `Invoice`.
2. Run `make db-push` (or `make db-reset` for destructive).
3. Import the client: `import { db } from "@/lib/db"`.
4. If it's user-scoped, add it to the `/privacy` data inventory + export/erase flows in `src/lib/privacy.ts`.

### A new settings.json option
1. Add to the schema in `src/lib/settings.ts` (one of: workspace, safety, editor, visual, performance sections — 25+ options currently).
2. Add the input control to `settings-panel.tsx`.
3. The `/api/settings` route reads/writes the file via `settings.ts` helpers.

### A new MCP shell command
1. Add to the allowlist in `src/lib/mcp-commands.ts`.
2. If it's a write/destructive command (e.g. `rm`, `git push`), ensure it triggers the approval gate in `mcp-runner.ts`.

### A new cloud connector (e.g. Slack, Notion)
1. Create `src/lib/<service>.ts` (mock mode default; OAuth2-ready for production).
2. Create `src/app/api/<service>/route.ts`.
3. Add a panel + tab in `sidebar.tsx` and a slash command in `terminal.tsx`.
4. Surface in the Connectors hub (`connectors-panel.tsx`).

## ✅ Before opening a PR

- [ ] `make lint` passes (zero errors)
- [ ] `make status` shows the server running
- [ ] The tail of `dev.log` shows no runtime errors after your change
- [ ] The `/` route renders (not a blank screen)
- [ ] Core interactions work: a prompt streams a response; `/help` renders; mode/skill/module toggles work
- [ ] The footer sticks to the bottom on short content and is pushed down on long content
- [ ] You've tested on both mobile and desktop widths
- [ ] **`make security` reports no new critical/high findings** introduced by your change (if it does, fix them or document the false positive)
- [ ] **`make test` passes** (lint + type-check pre-commit gate)
- [ ] Commit messages follow Conventional Commits
- [ ] If you added a feature, update `CHANGELOG.md` under `[Unreleased]` (or `[1.0.0]` if it's part of the v1.0 release)

## 🐛 Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- What you expected
- What happened
- Steps to reproduce
- The active pipeline (run `/pipeline` and paste the output)
- Relevant `dev.log` tail

## 💡 Suggesting features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Check the [roadmap](ROADMAP.md) first to see if it's already planned.

## 🤖 AI-assisted contributions

We welcome PRs co-authored with AI tools. If you use one:
- Read [`AGENTS.md`](AGENTS.md) (and [`CLAUDE.md`](CLAUDE.md) if using Claude, or [`GEMINI.md`](GEMINI.md) if using Gemini) — they contain project-specific constraints.
- Verify the change yourself; don't paste unverified AI output.
- "It compiles" is not sufficient — confirm interactivity works in the browser.

## 📜 Code of conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Be kind, be patient, be excellent to each other.

## Questions?

Open a [discussion](https://github.com/zai/zlm-cli/discussions). We're happy to help.
