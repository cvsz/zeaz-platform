# CLAUDE.md

> Operating instructions for Anthropic Claude (Claude Code, Claude in Cursor, etc.) working in this repository.

This file tells Claude how to navigate, build, test, and modify zLM-CLI safely. **Read it before making changes.**

For the full ruleset shared across all AI agents, read [`AGENTS.md`](AGENTS.md) first — this file adds Claude-specific notes on top.

## Project at a glance

zLM-CLI is a Next.js 16 (App Router) web app that renders a browser-based coding terminal powered by the z.ai zLM 1.0 model. The only user-visible route is `/` (`src/app/page.tsx`). **32 API routes** do the AI, voice, media, billing, security, and tooling work server-side:

```
admin, agent, agent-gen, billing, cli, conversations, dashboard, gdrive,
gmail, image, keys, mcp, memory, outlook, payments, permissions, plan,
privacy, profile, promptpay, prompt-gen, research, route, sandbox,
search, security, settings, tasks, usage, video, voice, workflows
```

The full v1.0 feature inventory: **6 CLI modes + 10 Skills + 8 Modules + 3 Agents + Connector pipeline + Coding Plans + Agent Workflows (3 presets) + streamed NDJSON + 20 GLM cloud models + ZLM-1.0 Local (21 total)**, **TTS (7 voices) + ASR + Voice Commander**, **Image + Video + Local Media (SVG/WAV/ASCII, offline)**, **PromptPay + Payment Gateway (4 plans) + Billing + API Keys + Token tracking**, **User Profiles + RBAC (13×4) + Dashboard + Internet/Memory toggles + Require-key gate**, **Memory CRUD + Auto-extraction + Context injection + Decay pruning**, **Web Search + Page Reader + Research + Sandbox + MCP Connector + Security Scanner (OWASP 20+ rules)**, **Prompts Generator + Agents Generator**, **Google Drive + Gmail + Outlook connectors**, **GDPR Data & Privacy (inventory + export + erase)**, **Task Manager + Conversation Manager + Settings + Admin Control Panel**, **Cross-platform Makefile (17 targets) + 4 validation scripts**, **24 sidebar tabs + 43+ slash commands + Glassmorphic UI**.

## Claude-specific constraints

### 1. Use your tools, don't paste code
When asked to implement something, use the Write/Edit/MultiEdit tools to create or modify files directly. Do not paste code blocks for the human to copy. If you're in a CLI context, write files to disk.

### 2. Read before you write
Always Read a file before editing it. The project is large (217+ files) — targeted reads prevent breaking existing patterns. Use Grep/Glob to find the right file first.

### 3. Server/client boundary is critical
`z-ai-web-dev-sdk` is Node-only (uses `fs/promises`). Never import these server-only files from client components:
- `src/lib/glm.ts` — SDK, prompt composition, streaming
- `src/lib/local-model.ts` — ZLM-1.0 Local heuristic engine
- `src/lib/voice.ts` — TTS/ASR SDK calls
- `src/lib/media.ts` — image/video SDK calls
- `src/lib/workflow-runner.ts` — agent DAG orchestration
- `src/lib/security-scanner.ts` — filesystem scanning
- `src/lib/api-keys.ts` — key validation, rate limiting
- `src/lib/billing.ts` — profile, invoices
- `src/lib/usage.ts` — token tracking
- `src/lib/memory.ts` + `memory-mechanism.ts` — DB access + GLM auto-extraction
- `src/lib/mcp-runner.ts` — child_process
- `src/lib/web-tools.ts` — web search/reader
- `src/lib/prompt-gen.ts` + `agent-gen.ts` — GLM-backed generators (server-only)
- `src/lib/privacy.ts` — GDPR inventory + export/erase
- `src/lib/gdrive.ts` + `gmail.ts` + `outlook.ts` — cloud connectors (OAuth2)
- `src/lib/db.ts` — Prisma client

Client-safe files (importable from `"use client"` components): `zlm-modes.ts`, `skills.ts`, `modules.ts`, `agents.ts`, `workflows.ts`, `plan.ts`, `connector.ts`, `models.ts`, `media-types.ts`, `web-tools-client.ts`, `api-keys-client.ts`, `mcp-commands.ts`, `promptpay.ts`, `payments.ts` (types only), `permissions.ts` (types only), `voice-commands.ts`, `local-media.ts`, `local-model.ts` (types only — actual heuristic is server-only), `settings.ts`, `tasks.ts`, `conversations.ts`, `utils.ts`.

### 4. Streaming protocol
All AI routes emit **NDJSON** (one JSON per line). The SDK's `stream: true` returns raw SSE bytes — `parseSseStream()` in `glm.ts` handles the framing. Do not assume the SDK yields parsed objects.

### 5. The Connector pipeline
Every prompt flows through `composeSystemPrompt()`:
```
[base] → [mode] → [skill] → [modules] → [workspace] → [model routing]
```
When `model === "zlm-1.0-local"`, the local heuristic model runs instead of the SDK — no API call.

### 6. Verification loop
After changes:
1. `make lint` → zero errors
2. `make status` → server running
3. Read `dev.log` tail → no runtime errors
4. Verify the page renders (not blank)

"It compiles" is never done. Verify interactivity.

## How to run things

```bash
make install    # deps + Prisma + DB (seeds default RBAC roles)
make start      # dev server (background, port 3000)
make stop       # stop it
make restart    # stop + start
make status     # is it running?
make lint       # ESLint
make security   # run the OWASP security scanner
make test       # pre-commit gate: lint + type-check
make check-os   # detect macOS / Linux / WSL
make check-deps # verify bun + git are installed
make build      # cross-platform production build (Next.js standalone)
make package    # create download/zlm-cli-source.zip
make db-reset   # destructive DB reset + re-push schema
make logs       # tail dev.log
make help       # all targets
```

Validation scripts in `scripts/`:
```bash
scripts/tech-stack-scaner.sh    # scan runtime, deps, framework, routes, components
scripts/validate-env.sh         # validate .env, .z-ai-config, node_modules, DB, Prisma
scripts/validate-network.sh     # test localhost, z.ai API, npm, GitHub, DNS
scripts/validate-workers.sh     # check dev server, mini-services, PIDs, processes
```

The Makefile now supports cross-platform builds (macOS/Linux/WSL). See [`INSTALLER_OS_REQUIREMENTS.md`](INSTALLER_OS_REQUIREMENTS.md) for OS-specific setup.

## Repository layout (key files)

```
src/
  app/api/          32 routes (admin, agent, agent-gen, billing, cli,
                    conversations, dashboard, gdrive, gmail, image,
                    keys, mcp, memory, outlook, payments, permissions,
                    plan, privacy, profile, promptpay, prompt-gen,
                    research, route, sandbox, search, security,
                    settings, tasks, usage, video, voice, workflows)
  components/terminal/  29 components + terminal shell (24 sidebar tabs)
  components/ui/        45+ shadcn/ui components
  lib/              41 files (server-only + client-safe)
prisma/             10 models (User, Post, ApiKey, PaymentOrder, Role,
                    ApiKeyRole, UserProfile, UsageRecord, Memory, Invoice)
scripts/            4 validation scripts (tech-stack-scaner,
                    validate-env, validate-network, validate-workers)
Makefile            17 user-facing targets (cross-platform macOS/Linux/WSL)
```

## Adding common things

### A new API route
1. Create `src/app/api/<name>/route.ts`
2. Add `export const runtime = "nodejs"` + `export const dynamic = "force-dynamic"`
3. If it needs auth: `const auth = await validateRequest(extractApiKey(req)); if (!auth.ok) return ...`
4. If it streams: use `ReadableStream` + `TextEncoder`, frame as NDJSON

### A new sidebar panel
1. Create `src/components/terminal/<name>-panel.tsx`
2. Add to `SidebarTab` type in `sidebar.tsx`
3. Add a `TabButton` + panel render in `sidebar.tsx`
4. Add a slash command in `terminal.tsx`'s `runLocalCommand()`

### A new security scan rule
1. Add to the `RULES` array in `src/lib/security-scanner.ts`
2. Each rule needs: id, rule name, severity, category, description, RegExp pattern, recommendation

## Claude's strengths in this repo

- **Large-file editing**: The `terminal.tsx` file is 2000+ lines. Use MultiEdit for multiple targeted changes.
- **Pattern matching**: The security scanner uses RegExp rules — Claude is good at writing precise patterns.
- **Documentation**: Claude excels at writing clear, structured docs. Use the existing doc style (tables, code blocks, bold headers).

## If you get stuck

- **`Module not found: fs/promises`** → A client component imports a server-only file. Split types into a client-safe file.
- **Streaming returns empty** → You're reading raw SSE bytes instead of parsing. Use `parseSseStream()` from `glm.ts`.
- **`make start` fails** → Read `tail -30 dev.log`. Usually a syntax error or port conflict.
- **Prisma "table does not exist"** → Run `make db-push` or `bun run db:push --force-reset`.
- **Rate limit (429)** → The require-key gate is on without a valid key. Check the Keys panel.

## Be honest

If you cannot verify something, say so. Do not claim success based on a clean build alone. The standard of done is: lints clean, server up, page renders, core interactions work.
