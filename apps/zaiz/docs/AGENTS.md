# AGENTS.md

> Operating instructions for AI coding agents (Claude, Cursor, Copilot, etc.) working in this repository.

This file tells an autonomous coding agent how to navigate, build, test, and modify zLM-CLI safely. **Read it before making changes.**

## Project at a glance

zLM-CLI is a Next.js 16 (App Router) web app that renders a browser-based coding terminal powered by the z.ai zLM 1.0 model. The only user-visible route is `/` (`src/app/page.tsx`). **32 streaming / REST API routes** do the AI, voice, media, payment, billing, memory, security, generation, search, sandbox, connectors, privacy, tasks, conversations, settings, and admin work server-side:

```
admin, agent, agent-gen, billing, cli, conversations, dashboard, gdrive,
gmail, image, keys, mcp, memory, outlook, payments, permissions, plan,
privacy, profile, promptpay, prompt-gen, research, route, sandbox,
search, security, settings, tasks, usage, video, voice, workflows
```

The complete v1.0 feature inventory includes: **6 CLI modes + 10 Skills + 8 Modules + 3 Agents + Connector pipeline + Coding Plans + Agent Workflows (3 presets) + streamed NDJSON responses + 20 GLM cloud models + ZLM-1.0 Local (offline)**, **TTS (7 voices) + ASR (Push-to-Talk) + Voice Commander**, **Image + Video generation + Local Media (SVG/WAV/ASCII, offline)**, **PromptPay (Thai QR) + Payment Gateway (4 plans) + Billing + API Keys (sha256) + Token tracking**, **User Profiles + RBAC (13 keys × 4 roles) + Dashboard + Internet/Memory toggles + Require-key gate**, **Memory System + Auto-extraction + Context injection + Decay pruning**, **Web Search + Page Reader + Research Tools + Sandbox + MCP CLI Connector + Security Scanner (OWASP Top 10, 20+ rules)**, **Prompts Generator + Agents Generator**, **Google Drive + Gmail + Outlook connectors**, **GDPR Data & Privacy (inventory + export + erase)**, **Task Manager + Conversation Manager + Settings + Admin Control Panel**, **Cross-platform Makefile (17 targets) + 4 validation scripts**, **24 sidebar tabs + 43+ slash commands + Glassmorphic UI**.

> Claude-specific guidance lives in [`CLAUDE.md`](CLAUDE.md); Gemini-specific guidance lives in [`GEMINI.md`](GEMINI.md). Both layer on top of this file.

## Non-negotiable rules

1. **Next.js 16 + TypeScript only.** Do not migrate to a different framework or downgrade.
2. **`z-ai-web-dev-sdk` is server-only.** It uses Node's `fs/promises` and will crash the client bundle. Never import these **server-only** files from a client component:
   - `src/lib/glm.ts` — SDK, prompt composition, streaming
   - `src/lib/local-model.ts` — ZLM-1.0 Local heuristic engine
   - `src/lib/voice.ts` — TTS/ASR SDK calls
   - `src/lib/media.ts` — image/video SDK calls
   - `src/lib/workflow-runner.ts` — agent DAG orchestration
   - `src/lib/billing.ts` — invoices + plan limits
   - `src/lib/usage.ts` — token tracking + toggles
   - `src/lib/memory.ts` — memory CRUD (DB)
   - `src/lib/memory-mechanism.ts` — GLM-based memory auto-extraction
   - `src/lib/sandbox.ts` — isolated JS execution
   - `src/lib/mcp-runner.ts` — shell command runner
   - `src/lib/web-tools.ts` — web search + reader
   - `src/lib/security-scanner.ts` — OWASP filesystem scanner
   - `src/lib/prompt-gen.ts` — GLM prompt generator
   - `src/lib/agent-gen.ts` — GLM agent definition generator
   - `src/lib/api-keys.ts` — key validation, rate limiting
   - `src/lib/privacy.ts` — GDPR data inventory + export/erase
   - `src/lib/gdrive.ts` — Google Drive connector (OAuth2)
   - `src/lib/gmail.ts` — Google Gmail connector (OAuth2)
   - `src/lib/outlook.ts` — Outlook/Microsoft Graph connector (OAuth2)
   - `src/lib/db.ts` — Prisma client

   **Client-safe** files (importable from `"use client"` components): `zlm-modes.ts`, `skills.ts`, `modules.ts`, `agents.ts`, `workflows.ts`, `permissions.ts`, `promptpay.ts`, `payments.ts`, `mcp-commands.ts`, `web-tools-client.ts`, `plan.ts`, `connector.ts`, `api-keys-client.ts`, `voice-commands.ts`, `local-media.ts`, `media-types.ts`, `models.ts`, `settings.ts`, `tasks.ts`, `conversations.ts`, `utils.ts`.
3. **Only `/` is user-visible.** Do not add other page routes. API routes go in `src/app/api/`.
4. **Port 3000 only.** The dev server must run on port 3000.
5. **Never run `bun run build`.** Use `bun run lint` to check quality. Use `make start` / `make status` to manage the server.
6. **API requests use relative paths.** If you add mini-services, use `?XTransformPort=<port>` query params — never absolute `http://localhost:<port>` URLs. WebSocket connections use `io("/?XTransformPort=<port>")` with path `/`.
7. **No indigo/blue as primary colors.** The terminal palette is emerald-based.
8. **Sticky footer required.** The input bar is the footer and must stick to the bottom.
9. **RBAC before rate-limit before processing.** New routes that gate access should call `hasPermission(key, permission)` (from `permissions.ts`) before `validateRequest()`. Use one of the 13 permission keys; do not invent new ones without adding them to the registry.
10. **PromptPay is local-only.** Do not introduce a third-party payment SDK into the PromptPay path. The QR payload + CRC-16 must stay in `src/lib/promptpay.ts`.
11. **ZLM-1.0 Local must stay offline.** Do not wire it to any API call. The heuristic engine in `glm.ts` runs without network.

## How to run things

```bash
make install   # deps + Prisma + DB schema
make start     # start dev server (background, idempotent)
make stop      # stop it
make restart   # stop + start
make status    # is it running? PID? port?
make logs      # tail dev.log
make lint      # ESLint (the quality gate)
make security  # run the OWASP security scanner via /api/security (NEW)
make test      # lint + type-check pre-commit gate (NEW)
make check-os  # detect OS + arch (macOS / Linux / WSL) (NEW)
make build     # cross-platform production build (NEW)
make package   # create download/zlm-cli-source.zip (NEW)
```

The dev server writes to `dev.log`. **Always read the tail of `dev.log` after code changes** to catch runtime errors. Read only the most recent lines — the file grows.

## Repository layout

```
src/
  app/
    api/{cli,agent,plan,workflows,voice,image,video,promptpay,
         payments,billing,keys,profile,dashboard,usage,memory,
         permissions,admin,mcp,search,research,sandbox,security,
         prompt-gen,agent-gen,settings,tasks,conversations,
         gdrive,gmail,outlook,privacy,route}/route.ts   # 32 routes
    layout.tsx                       # root layout (fonts, metadata, Toaster)
    page.tsx                         # the terminal (ONLY route)
  components/terminal/               # 29 components
    terminal.tsx       # main shell — state, slash commands, render loop
    sidebar.tsx        # 24 tabs
    model-selector.tsx # 20 GLM models + ZLM-1.0 Local (21 total)
    plan-view.tsx      # interactive Coding Plan roadmap
    agent-view.tsx     # agent plan checklist + streaming steps
    workflows-panel.tsx# multi-agent DAG visualization
    voice-panel.tsx    # TTS playback + ASR push-to-talk + mic commander
    promptpay-panel.tsx# Thai QR code generator
    dashboard-panel.tsx# overview (profile/usage/billing/toggles)
    memory-panel.tsx   # per-user memory CRUD
    permissions-panel.tsx # RBAC matrix
    admin-panel.tsx    # admin dashboard + key mgmt
    payments-panel.tsx # plan checkout + credits
    media-panel.tsx    # image + video generation
    search-panel.tsx   # web search
    research-panel.tsx # reader + summarization
    sandbox-panel.tsx  # isolated JS execution
    keys-panel.tsx     # API key CRUD
    mcp-panel.tsx      # MCP shell connector
    security-panel.tsx # OWASP scanner findings UI
    generators-panel.tsx # /gen-prompt + /gen-agent UI
    settings-panel.tsx # settings.json editor (25+ options)
    tasks-panel.tsx    # task manager
    conversations-panel.tsx # save/load/delete conversations
    connectors-panel.tsx # Drive + Gmail + Outlook hub
    privacy-panel.tsx  # GDPR data inventory + export/erase
    code-block.tsx     # Prism syntax highlight + copy button
    markdown.tsx       # GFM renderer (react-markdown + remark-gfm)
    icon.tsx           # lucide icon name → component resolver
  components/ui/                    # 45+ shadcn/ui components
  lib/                              # 41 files (server-only + client-safe)
    glm.ts             # SERVER-ONLY: ZAI SDK, composeSystemPrompt, streamCompletion, streamAgent, generatePlan, ZLM-1.0 heuristic dispatch
    local-model.ts     # SERVER-ONLY: ZLM-1.0 Local heuristic engine (pattern matching)
    zlm-modes.ts       # client-safe: 6 modes metadata
    skills.ts          # client-safe: 10 skills registry
    modules.ts         # client-safe: 8 modules registry
    agents.ts          # client-safe: 3 agents + PlanStep/AgentEvent types
    workflows.ts       # client-safe: 3 presets + DAG types
    workflow-runner.ts # SERVER-ONLY: topological DAG execution
    models.ts          # 20 GLM models + ZLM-1.0 Local (21 total)
    voice.ts           # SERVER-ONLY: zai.audio.tts/asr.create wrappers
    voice-commands.ts  # client-safe: parses ASR transcript → slash / mode / panel / submit
    media.ts           # SERVER-ONLY: image/video generation
    local-media.ts     # client-safe: offline SVG/WAV/ASCII/frame generator (ZLM-1.0 Local)
    media-types.ts     # client-safe: media type definitions
    promptpay.ts       # EMVCo QR + CRC-16 (client-safe)
    payments.ts        # 4 plans + checkout + credits (client-safe)
    billing.ts         # SERVER-ONLY: invoices + plan limits
    usage.ts           # SERVER-ONLY: per-request token tracking + toggles
    memory.ts          # SERVER-ONLY: per-user memory CRUD
    memory-mechanism.ts# SERVER-ONLY: GLM auto-extract + importance + decay
    permissions.ts     # 13 permission keys + 4 role presets (client-safe)
    sandbox.ts         # SERVER-ONLY: isolated JS execution
    mcp-commands.ts    # allowlisted shell commands (client-safe)
    mcp-runner.ts      # SERVER-ONLY: MCP runner + approval gate
    web-tools.ts       # SERVER-ONLY: web search + reader
    web-tools-client.ts# client-safe web-tool types
    security-scanner.ts# SERVER-ONLY: OWASP Top 10 scanner (20+ rules)
    prompt-gen.ts      # SERVER-ONLY: GLM prompt generator
    agent-gen.ts       # SERVER-ONLY: GLM agent definition generator
    plan.ts            # client-safe: CodingPlan schema + parsePlan()
    connector.ts       # client-safe: pipeline composition + describePipeline()
    settings.ts        # client-safe: settings.json schema + helpers (25+ options)
    tasks.ts           # client-safe: task types + helpers
    conversations.ts   # client-safe: conversation types + helpers
    privacy.ts         # SERVER-ONLY: GDPR data inventory + export/erase
    gdrive.ts          # SERVER-ONLY: Google Drive connector (OAuth2 ready, mock default)
    gmail.ts           # SERVER-ONLY: Google Gmail connector (OAuth2 ready)
    outlook.ts         # SERVER-ONLY: Outlook/Microsoft Graph connector (OAuth2 ready)
    api-keys.ts        # SERVER-ONLY: key CRUD, validation, rate limiting
    api-keys-client.ts # client-safe: key types + localStorage helpers
    db.ts              # Prisma client (singleton)
    utils.ts           # cn() (clsx + tailwind-merge)
prisma/schema.prisma   # 10 models: User, Post, ApiKey, PaymentOrder, Role,
                       #   ApiKeyRole, UserProfile, UsageRecord, Memory, Invoice
Makefile               # 17 user-facing targets (cross-platform)
scripts/               # 4 validation scripts
  tech-stack-scaner.sh
  validate-env.sh
  validate-network.sh
  validate-workers.sh
```

## The Connector pipeline

Every prompt is assembled by `composeSystemPrompt()` in `glm.ts`:

```
[BASE_SYSTEM_PROMPT] + [MODE_PROMPTS[mode]] + [skill.systemPrompt] + [modules[].context] + [workspaceBlock(workspace)]
```

When you add a new mode/skill/module, update **both** the registry (`zlm-modes.ts`/`skills.ts`/`modules.ts`) and any UI that lists them (header badges, sidebar, `/help` text, `EXAMPLE_PROMPTS`).

## Streaming protocol

All AI routes emit NDJSON. Each line is a JSON object:

```
{"type":"delta","content":"..."}      # incremental text
{"type":"plan","plan":{...}}           # /api/plan only — parsed structure
{"type":"step_start","index":N,...}    # /api/agent
{"type":"delta","index":N,"content":..}# /api/agent
{"type":"step_end","index":N}
{"type":"node_start","id":"...","agent":"..."}  # /api/workflows (DAG node begins)
{"type":"node_end","id":"..."}                  # /api/workflows (DAG node completes)
{"type":"done"}
{"type":"error","content":"..."}
```

Non-streaming routes (e.g. `/api/voice`, `/api/promptpay`, `/api/image`, `/api/video`, `/api/keys`, `/api/payments`, `/api/billing`, `/api/profile`, `/api/dashboard`, `/api/usage`, `/api/memory`, `/api/permissions`, `/api/admin`, `/api/mcp`, `/api/search`, `/api/research`, `/api/sandbox`, `/api/security`, `/api/settings`, `/api/tasks`, `/api/conversations`, `/api/gdrive`, `/api/gmail`, `/api/outlook`, `/api/privacy`) return JSON bodies. `/api/prompt-gen` and `/api/agent-gen` stream NDJSON (deltas + a final `done` event with the parsed JSON object).

**Important SDK detail:** `zai.chat.completions.create({ stream: true })` returns a raw `ReadableStream<Uint8Array>` of **SSE-encoded bytes** (`data: {...}\n\ndata: [DONE]`), NOT parsed objects. `glm.ts` has a `parseSseStream()` helper that buffers by newline and extracts `choices[0].delta.content`. Do not assume the stream yields objects directly. The same SDK instance also exposes `zai.audio.tts.create()` and `zai.audio.asr.create()` for the Voice routes — those do NOT use SSE; they return audio bytes / transcribed text respectively.

## When making changes

### Adding a CLI mode
1. Add the id to `CliMode` and `CLI_MODES` in `zlm-modes.ts`.
2. Add a `MODE_PROMPTS[mode]` entry in `glm.ts`.
3. Update `/help` and `/about` text in `terminal.tsx`.

### Adding a skill
1. Add to `SKILLS` in `skills.ts` (id, name, command, icon, tagline, description, systemPrompt, examples).
2. Add the icon name to `icon.tsx`'s `ICONS` map.
3. Update `/help` text.

### Adding a module
1. Add to `MODULES` in `modules.ts` (id, name, command, icon, category, tagline, description, context).
2. Add the icon to `icon.tsx`.
3. The Connector auto-includes active modules via `composeSystemPrompt()`.

### Adding an agent
1. Add to `AGENTS` in `agents.ts` (id, name, command, icon, tagline, description, plannerPrompt, executorPrompt, maxSteps, defaultSkill).
2. Add the icon to `icon.tsx`.
3. `streamAgent()` in `glm.ts` handles orchestration automatically.

### Adding a workflow preset
1. Add to `WORKFLOW_PRESETS` in `workflows.ts` (id, name, nodes, edges, defaultSkill).
2. The `workflow-runner.ts` walks the DAG in topological order automatically.
3. Add the icon to `icon.tsx`.

### Adding an API route
1. Create `src/app/api/<name>/route.ts` with `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`.
2. If it gates access, call `validateRequest(extractApiKey(req))` first; if it needs RBAC, call `hasPermission(key, "<permission>")` from `permissions.ts`.
3. If it streams, frame events as `JSON.stringify(evt) + "\n"`.
4. Add the route name to the list in `README.md` / `ARCHITECTURE.md` / `SYSTEM-ARCHITECTURE-DIAGRAM.md`.
5. Add a slash command in `terminal.tsx` if user-facing.

### Adding a slash command
1. Add a `case "/your-command":` in `runLocalCommand()` in `terminal.tsx`.
2. Return `true` if handled locally, `false` to fall through to GLM.
3. Update `/help` text.

### Adding a permission key
1. Add to `PERMISSION_KEYS` in `permissions.ts`.
2. Decide which of the 4 role presets (admin / developer / viewer / guest) should grant it by default.
3. Update `/permissions` panel rendering if the UI groups keys.

### Adding a TTS voice
1. Confirm the voice id is supported by `zai.audio.tts.create()` (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo).
2. Add to the voice picker in `voice-panel.tsx`.

### Adding a payment plan
1. Add to `PLANS` in `payments.ts` (id, name, price, credits, rateLimitPerHour, permissions).
2. Update the Payments panel rendering.

### Adding a security scan rule
1. Append an entry to the `RULES` array in `src/lib/security-scanner.ts` — each rule needs `{ id, rule, severity, category, description, pattern: RegExp, recommendation }`.
2. Use severity `critical` for secrets/RCE, `high` for injection, `medium` for misconfig, `low` for hygiene, `info` for style.
3. The scanner walks `src/**/*.{ts,tsx,js,jsx,json,env}` automatically — no other wiring needed.

### Adding a generated-prompt / generated-agent template
1. The prompt generator lives in `prompt-gen.ts` and the agent generator in `agent-gen.ts`. Both call GLM with a strict JSON system prompt and stream the raw output back to the client.
2. To change the JSON shape, update the system prompt string in the generator AND the `GeneratedPrompt` / `GeneratedAgent` interface.
3. The `generators-panel.tsx` parses the final `done` event and renders the structured result.

## UI/UX standards

- **Color system**: Tailwind built-in variables. The terminal uses an emerald palette on `#07090a`. No indigo/blue as primary.
- **Components**: prefer existing `src/components/ui/*` (shadcn) over building from scratch.
- **Responsive**: mobile-first. The sidebar is a drawer on `<lg`, persistent on `lg+`.
- **Sticky footer**: the input bar is `<footer>` and must stick to the bottom; content scrolls above it.
- **Long lists**: `max-h-*` + `overflow-y-auto` + `.terminal-scroll` class for custom scrollbars.
- **Accessibility**: semantic HTML (`main`, `header`, `footer`), ARIA labels on icon buttons, keyboard nav (`↑/↓` history, `Enter` send, `Shift+Enter` newline, `Ctrl+L` clear).

## Verification checklist

Before declaring a task done:

1. `make lint` passes (zero errors).
2. `make status` shows the server running.
3. The tail of `dev.log` shows no runtime errors after your change.
4. The `/` route returns 200 and renders (not a blank screen).
5. Core interactions work: type a prompt → streams a response; `/help` renders; mode/skill/module toggles work.
6. The footer sticks to the bottom on short content and is pushed down on long content.

Do not claim "it compiles" as done. The dev server being up is not sufficient — verify interactivity.

## Prisma

- Schema lives in `prisma/schema.prisma`.
- Run `bun run db:push` (or `make db-push`) after schema changes.
- Import the client: `import { db } from "@/lib/db"`.
- Prisma schema primitive types cannot be lists — use a JSON string or a relation for arrays.

## Things to avoid

- Do not add `bun run build` to any workflow.
- Do not create extra page routes — only `/`.
- Do not import `z-ai-web-dev-sdk`, `src/lib/glm.ts`, or any other SERVER-ONLY lib (`local-model.ts`, `voice.ts`, `media.ts`, `workflow-runner.ts`, `billing.ts`, `usage.ts`, `memory.ts`, `memory-mechanism.ts`, `sandbox.ts`, `mcp-runner.ts`, `web-tools.ts`, `security-scanner.ts`, `prompt-gen.ts`, `agent-gen.ts`, `api-keys.ts`, `privacy.ts`, `gdrive.ts`, `gmail.ts`, `outlook.ts`, `db.ts`) from client code.
- Do not write absolute URLs (`http://localhost:3000/...`) in fetch/WebSocket calls — use relative paths only.
- Do not use indigo/blue as the primary color.
- Do not create documentation files unless explicitly asked.
- Do not write test files unless asked.
- Do not introduce a third-party payment SDK into the PromptPay path — keep it local (EMVCo + CRC-16).
- Do not wire `ZLM-1.0 Local` to any network call — it must stay offline. This includes `local-model.ts` (chat heuristic) and `local-media.ts` (SVG/WAV/ASCII generation); neither must ever call the SDK.
- Do not invent new RBAC permission keys ad hoc — add them to `permissions.ts` and assign them to role presets.
- Do not weaken the security scanner by skipping rules or suppressing severity tags — findings must surface to the user.
- Do not bypass the `/privacy` GDPR inventory when adding a new user-scoped Prisma model — update `privacy.ts` so the new model's data is included in inventory + export + erase.
