# zLM-CLI

> A full-stack, browser-based coding terminal powered by the **zeaz-platform zai zLM 1.0** model — with Skills, Modules, Agents, Workflows, Voice (TTS/ASR) + Voice Commander, PromptPay, Billing, Memory (CRUD + auto-extraction), a Security Scanner, Prompt/Agent Generators, an offline Local model, a Connector pipeline, structured Coding Plans, Cloud Data Connectors (Google Drive, Gmail, Outlook), GDPR Data & Privacy tools, Task & Conversation managers, Settings, and **20 cloud + 1 local model (21 total)**.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

zLM-CLI turns your browser into a developer terminal. Ask zLM 1.0 to generate code, debug an error, review a PR, plan a feature, or run a multi-step agent — all streamed token-by-token into a retro terminal UI. Beyond chat, you can generate images and video, run multi-agent workflows, talk to the terminal with voice, pay with Thai PromptPay QR codes, manage API keys + billing, scan your codebase for OWASP vulnerabilities, generate optimized prompts and custom agents, persist conversations and tasks, and even run an offline local model — including fully-offline image/audio/animation/video generation.

## ✨ Features

### Core AI
- **6 CLI modes** — `/chat` `/explain` `/debug` `/generate` `/review` `/optimize`
- **10 Skills** — expert personas (`code-review`, `refactor`, `add-tests`, `generate-docs`, `security-audit`, `performance-audit`, `commit-message`, `explain-architecture`, `migrate`, `format-code`) that sharpen GLM for a specific task
- **8 Modules** — toggleable context tools (`filesystem`, `git`, `npm`, `regex`, `http`, `json`, `sql`, `docker`) injected into every prompt
- **3 Agents** — multi-step `architect`, `bug-hunter`, `refactorer` that plan → execute with live streaming
- **Connector pipeline** — composes `[mode]+[skill]+[modules]+[workspace]+[agent]` → zLM 1.0 (or ZLM-1.0 Local)
- **Coding Plan** — `/plan <task>` produces a structured JSON roadmap (phases → files → steps, risks, acceptance) with an interactive checklist and per-phase code execution
- **Agent Workflows** — multi-agent DAGs where nodes collaborate in topological order (`/workflow`). 3 presets: Full-Stack Feature, Bug Fix Pipeline, Code Quality
- **Model Selector** — 20 GLM cloud models + 1 local model (`ZLM-1.0 Local`) in a searchable dropdown (21 total)
- **Local Model** — `ZLM-1.0 Local` runs offline with a heuristic engine (no API calls)
- **Token streaming** — every response streams live via NDJSON with SSE parsing
- **Connected workspace** — paste code with `/connect code <snippet>` and it becomes GLM's context

### Voice & Media
- **TTS** — text-to-speech with 7 voices (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo) via `zai.audio.tts.create()` (`/voice`)
- **ASR / Push-to-Talk** — speech-to-text via `zai.audio.asr.create()` with browser `MediaRecorder`
- **Voice Commander** — speak commands hands-free; the mic button in the input bar captures audio, ASR transcribes it, and `src/lib/voice-commands.ts` parses the transcript into a slash command, mode switch, panel open, or prompt submission
- **Image generation** — text-to-image via z.ai (`/image`); auto-falls back to local SVG when `model=zlm-1.0-local`
- **Video generation** — text-to-video with async task + polling via `zai.video.generations` (`/video`)
- **Local media** — fully-offline generation (no API calls) via `src/lib/local-media.ts` powered by `ZLM-1.0 Local`: SVG art, WAV beep melodies, ASCII-frame animations, and text-frame video sequences

### Payments & Billing
- **PromptPay** — Thai QR payment code generator (EMVCo TLV payload + CRC16-CCITT Tag 63) (`/promptpay`)
- **Payment Gateway** — 4 plans (Starter $0, Pro $19, Team $49, Enterprise $199), mock checkout, credits (`/payments`)
- **Billing** — invoices, plan-based limits, billing stats (`/billing`)
- **API Keys** — sha256-hashed keys, rate limiting (sliding 1hr window), `require-key` gate (`/keys`)
- **Token tracking** — per-request input/output tokens + usage records (visible in Dashboard)

### User & Access
- **User Profiles** — login via API key, auto-creates profile, tracks plan + credits (`/profile`, `/login`)
- **RBAC Permissions** — 13 permission keys × 4 role presets (admin / developer / viewer / guest) (`/permissions`)
- **Dashboard** — overview with profile, usage stats, billing, internet/memory toggles (`/dashboard`)
- **Internet on/off toggle** — per-user, blocks all external/web-search/research routes when off (air-gapped mode)
- **Memory on/off toggle** — per-user, controls whether memories are injected into the system prompt
- **Require-key gate** — toggle to enforce API key on all endpoints (`/keys`)

### Memory & Context
- **Memory System** — persistent per-user memories (`fact` / `preference` / `note` / `context` with importance 1-5) (`/memory`)
- **Auto-extraction** — GLM scans conversations, extracts up to 5 facts per turn, scores importance 1-5 (`memory-mechanism.ts`)
- **Context injection** — relevant high-importance memories composed into the system prompt
- **Decay pruning** — low-importance memories pruned after 30 days to keep the store fresh

### Tools & Research
- **Web Search** — live results via `zai.functions.invoke("web_search")` (`/search`)
- **Page Reader** — extract content from any URL via `zai.functions.invoke("page_reader")` (`/search`)
- **Research Tools** — read web pages + GLM-powered summarization (streamed) (`/research`)
- **Sandbox** — safe isolated JS execution (allowlisted builtins, no `require`/`process`/`fs`) (`/sandbox`)
- **MCP CLI Connector** — allowlisted shell commands (git, build, lint, docker), approval gate for writes (`/mcp`)
- **Security Scanner** — 20+ OWASP Top 10 rules (critical / high / medium / low / info) on every source file (`/security`, `make security`)

### Generators
- **Prompts Generator** — GLM creates an optimized system prompt (title + system prompt + user template + tips) from a description (`/gen-prompt`)
- **Agents Generator** — GLM creates a custom agent definition (planner + executor prompts + maxSteps) from a description (`/gen-agent`)

### Connectors
- **Google Drive** — list, search, read Drive files (OAuth2 ready, mock mode default) (`/connectors`, `/api/gdrive`)
- **Google Gmail** — list, search, read emails (OAuth2 ready) (`/connectors`, `/api/gmail`)
- **Outlook/Live Mail** — list, search, read emails via Microsoft Graph (OAuth2 ready) (`/connectors`, `/api/outlook`)

### Data & Privacy
- **Data inventory** — see all stored data per user (`/privacy`)
- **Export all data as JSON** — GDPR right to portability
- **Delete all data** — GDPR right to erasure

### Management
- **Task Manager** — create, track, complete tasks with priorities, statuses, tags, and stats (`/tasks`)
- **Conversation Manager** — save (`/save`), load (`/load <id>`), delete conversations (Prisma-backed)
- **Settings** — `settings.json` with workspace, safety, editor, visual, performance sections (25+ options) (`/settings`)
- **Admin Control Panel** — dashboard with stats, key management, registry breakdown (`/admin`)

### UX
- **24 sidebar tabs** — Home (Dashboard), Skills, Modules, Pipeline, Keys, Media, Admin, MCP, Pay, Search, Research, Sandbox, Perms, Memory, Voice, Flows (Workflows), Pay QR (PromptPay), Gen (Generators), Sec (Security), Drive, Gmail, Outlook, Connectors, Privacy, Settings, Tasks, Chats (Conversations)
- **43+ slash commands** — `/help` `/skills` `/modules` `/agent` `/plan` `/pipeline` `/connect` `/voice` `/workflow` `/promptpay` `/dashboard` `/memory` `/login` `/permissions` `/sandbox` `/search` `/research` `/mcp` `/pay` `/admin` `/keys` `/model` `/security` `/gen-prompt` `/gen-agent` `/settings` `/tasks` `/save` `/load` `/conversations` `/connectors` `/privacy` …
- **32 API routes** — admin, agent, agent-gen, billing, cli, conversations, dashboard, gdrive, gmail, image, keys, mcp, memory, outlook, payments, permissions, plan, privacy, profile, promptpay, prompt-gen, research, route, sandbox, search, security, settings, tasks, usage, video, voice, workflows
- **Glassmorphic design system** — glass, grad-border, glow, animations
- **Emerald-on-dark terminal aesthetic** with ambient grid
- **Responsive** — desktop sidebar + mobile drawer, sticky footer, custom scrollbars
- **Syntax-highlighted code blocks** with copy buttons (Prism)
- **GFM markdown rendering** (react-markdown + remark-gfm)
- **Model selector dropdown** — searchable, 21 models, grouped by category

## 🚀 Quickstart

```bash
make install   # install deps + generate Prisma client + push DB schema
make start     # start the dev server (background, idempotent)
make status    # check it's running
```

Then open the **Preview Panel** (or `http://localhost:3000`).

Type a coding question, or try:

```
/help                                    # see all commands
/skill code-review                       # activate a skill
/module regex                            # connect a module
/plan Build a JWT auth system in Next.js # generate a structured plan
/agent bug-hunter TypeError: x is not a function   # run a multi-step agent
/workflow Full-Stack Feature: add a settings page  # multi-agent DAG
/voice Hello world                       # speak text aloud (TTS)
/promptpay 0812345678 100.50             # generate a Thai QR code
/login zlm-xxxxxxxx                      # log in with an API key
/dashboard                               # overview of profile, usage, billing
/memory add preference:dark mode         # store a memory
/model ZLM-1.0 Local                     # switch to offline local model
/security                                # scan the repo for OWASP issues
/gen-prompt a code reviewer for Solidity contracts  # generate an optimized prompt
/gen-agent a release-notes drafter       # generate a custom multi-step agent
/save                                    # save the current conversation
/tasks                                   # open the task manager
/settings                                # open the settings panel
/privacy                                 # GDPR data inventory + export/erase
```

## 🛠 Makefile targets (cross-platform: macOS / Linux / WSL — 17 targets)

| Target | Action |
| --- | --- |
| `make install` | Install deps + generate Prisma client + push DB schema + seed default roles |
| `make start` | Start dev server (+ mini-services) in the background |
| `make stop` | Stop dev server (+ mini-services) |
| `make restart` | Stop then start |
| `make status` | Show running state, ports, PIDs |
| `make logs` | Tail `dev.log` |
| `make lint` | Run ESLint |
| `make clean` | Remove `.next` cache + build artifacts |
| `make db-push` | Push Prisma schema to DB |
| `make db-generate` | Generate Prisma client |
| `make db-reset` | Reset DB and re-push schema (destructive) |
| `make check-os` | Detect and report OS + arch (macOS / Linux / WSL) |
| `make check-deps` | Verify required tools (bun, git) are installed |
| `make build` | Cross-platform production build (Next.js standalone) |
| `make package` | Create a distributable source zip (`download/zlm-cli-source.zip`) |
| `make security` | Run the OWASP security scanner via `POST /api/security` |
| `make test` | Pre-commit gate: lint + type-check |

Run `make help` for the full list.

## 🧪 Validation scripts (`scripts/`)

| Script | Purpose |
| --- | --- |
| `scripts/tech-stack-scaner.sh` | Scan runtime, deps, framework, routes, components |
| `scripts/validate-env.sh` | Validate `.env`, `.z-ai-config`, `node_modules`, DB, Prisma |
| `scripts/validate-network.sh` | Test localhost, z.ai API, npm, GitHub, DNS |
| `scripts/validate-workers.sh` | Check dev server, mini-services, PIDs, processes |

## 🏗 Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── cli/route.ts            # single-turn streaming (NDJSON)
│   │   ├── agent/route.ts          # multi-step plan→execute (NDJSON)
│   │   ├── plan/route.ts           # structured Coding Plan (NDJSON)
│   │   ├── workflows/route.ts      # multi-agent DAG orchestration (NDJSON)
│   │   ├── prompt-gen/route.ts     # GLM prompt generator (NDJSON)
│   │   ├── agent-gen/route.ts      # GLM agent definition generator (NDJSON)
│   │   ├── voice/route.ts          # TTS + ASR (zai.audio.tts/asr.create)
│   │   ├── image/route.ts          # text-to-image (or local SVG offline)
│   │   ├── video/route.ts          # text-to-video (polling)
│   │   ├── promptpay/route.ts      # Thai QR payment generator
│   │   ├── payments/route.ts       # plan checkout + credits
│   │   ├── billing/route.ts        # invoices + plan limits
│   │   ├── keys/route.ts           # API key CRUD + config
│   │   ├── profile/route.ts        # user profile + login
│   │   ├── dashboard/route.ts      # overview aggregate
│   │   ├── usage/route.ts          # per-request token tracking + toggles
│   │   ├── memory/route.ts         # persistent per-user memories
│   │   ├── permissions/route.ts    # RBAC keys + role presets
│   │   ├── admin/route.ts          # admin stats + key mgmt
│   │   ├── mcp/route.ts            # allowlisted shell commands
│   │   ├── search/route.ts         # live web search + reader
│   │   ├── research/route.ts       # web pages + GLM summarization
│   │   ├── sandbox/route.ts        # isolated JS execution
│   │   ├── security/route.ts       # OWASP scanner (POST → findings)
│   │   ├── settings/route.ts       # settings.json read/write
│   │   ├── tasks/route.ts          # task CRUD + stats
│   │   ├── conversations/route.ts  # save/load/delete conversations
│   │   ├── gdrive/route.ts         # Google Drive connector
│   │   ├── gmail/route.ts          # Google Gmail connector
│   │   ├── outlook/route.ts        # Outlook/Microsoft Graph connector
│   │   ├── privacy/route.ts        # GDPR data inventory + export/erase
│   │   ├── route.ts                # health check
│   ├── layout.tsx
│   └── page.tsx                    # the terminal (only user-visible route)
├── components/
│   ├── terminal/                   # 29 components + terminal shell
│   │   ├── terminal.tsx            # main CLI shell, state, slash commands
│   │   ├── sidebar.tsx             # 24 tabs
│   │   ├── model-selector.tsx      # 20 GLM models + ZLM-1.0 Local
│   │   ├── plan-view.tsx           # interactive plan roadmap
│   │   ├── agent-view.tsx          # agent plan + step streaming
│   │   ├── workflows-panel.tsx     # multi-agent DAG visualization
│   │   ├── voice-panel.tsx         # TTS playback + ASR push-to-talk + mic commander
│   │   ├── promptpay-panel.tsx     # Thai QR code generator
│   │   ├── dashboard-panel.tsx     # overview (profile/usage/billing/toggles)
│   │   ├── memory-panel.tsx        # per-user memory CRUD
│   │   ├── permissions-panel.tsx   # RBAC key + role matrix
│   │   ├── admin-panel.tsx         # admin dashboard + key management
│   │   ├── payments-panel.tsx      # plan checkout + credits
│   │   ├── media-panel.tsx         # image + video generation
│   │   ├── search-panel.tsx        # live web search
│   │   ├── research-panel.tsx      # web reader + summarization
│   │   ├── sandbox-panel.tsx       # isolated JS execution UI
│   │   ├── keys-panel.tsx          # API key CRUD
│   │   ├── mcp-panel.tsx           # MCP shell connector
│   │   ├── security-panel.tsx      # OWASP scanner UI (findings + severity filters)
│   │   ├── generators-panel.tsx    # /gen-prompt + /gen-agent UI
│   │   ├── settings-panel.tsx      # settings.json editor (25+ options)
│   │   ├── tasks-panel.tsx         # task manager (priorities, statuses, tags)
│   │   ├── conversations-panel.tsx # save/load/delete conversations
│   │   ├── connectors-panel.tsx    # Drive + Gmail + Outlook hub
│   │   ├── privacy-panel.tsx       # GDPR data inventory + export/erase
│   │   ├── code-block.tsx          # syntax-highlighted + copy
│   │   ├── markdown.tsx            # GFM renderer
│   │   └── icon.tsx                # lucide icon resolver
│   └── ui/                         # 45+ shadcn/ui components
└── lib/                            # 41 files (server-only + client-safe)
    ├── glm.ts                      # SERVER-ONLY: ZAI SDK, prompt composition, streamAgent, generatePlan
    ├── local-model.ts              # SERVER-ONLY: ZLM-1.0 Local heuristic engine
    ├── zlm-modes.ts                # client-safe: 6 CLI modes
    ├── skills.ts                   # client-safe: 10 expert skills
    ├── modules.ts                  # client-safe: 8 context modules
    ├── agents.ts                   # client-safe: 3 agents + types
    ├── workflows.ts                # client-safe: 3 workflow presets + DAG types
    ├── workflow-runner.ts          # SERVER-ONLY: topological DAG execution
    ├── models.ts                   # 20 GLM cloud models + ZLM-1.0 Local
    ├── voice.ts                    # SERVER-ONLY: TTS/ASR helpers (zai.audio.*.create)
    ├── voice-commands.ts           # client-safe: parses ASR transcript → slash / mode / panel / submit
    ├── media.ts                    # SERVER-ONLY: image/video generation helpers
    ├── local-media.ts              # client-safe: offline SVG / WAV / ASCII / frame-sequence generator (ZLM-1.0 Local)
    ├── media-types.ts              # client-safe: media type definitions
    ├── promptpay.ts                # Thai PromptPay QR payload generator (client-safe)
    ├── payments.ts                 # plan catalog + checkout + credits (client-safe)
    ├── billing.ts                  # SERVER-ONLY: invoices + plan limits
    ├── api-keys.ts                 # SERVER-ONLY: key CRUD, validation, rate limiting
    ├── api-keys-client.ts          # client-safe: key types + localStorage helpers
    ├── usage.ts                    # SERVER-ONLY: per-request token tracking + toggles
    ├── memory.ts                   # SERVER-ONLY: per-user memory CRUD
    ├── memory-mechanism.ts         # SERVER-ONLY: GLM-based auto-extraction, importance scoring, decay pruning
    ├── permissions.ts              # client-safe: 13 permission keys + 4 role presets
    ├── sandbox.ts                  # SERVER-ONLY: isolated JS execution (vm-style)
    ├── mcp-commands.ts             # allowlist of shell commands (client-safe)
    ├── mcp-runner.ts               # SERVER-ONLY: MCP runner with approval gate
    ├── web-tools.ts                # SERVER-ONLY: web search + reader
    ├── web-tools-client.ts         # client-safe web-tool types
    ├── security-scanner.ts         # SERVER-ONLY: OWASP scanner rules + runner
    ├── prompt-gen.ts               # SERVER-ONLY: GLM prompt generator
    ├── agent-gen.ts                # SERVER-ONLY: GLM agent definition generator
    ├── plan.ts                     # client-safe: CodingPlan schema + parser
    ├── connector.ts                # client-safe: pipeline composition
    ├── settings.ts                 # settings.json schema + helpers (client-safe)
    ├── tasks.ts                    # task types + helpers (client-safe)
    ├── conversations.ts            # conversation types + helpers (client-safe)
    ├── privacy.ts                  # SERVER-ONLY: GDPR data inventory + export/erase
    ├── gdrive.ts                   # Google Drive connector (OAuth2 ready, mock default)
    ├── gmail.ts                    # Google Gmail connector (OAuth2 ready)
    ├── outlook.ts                  # Outlook/Microsoft Graph connector (OAuth2 ready)
    ├── db.ts                       # Prisma client
    └── utils.ts                    # cn() helper
```

### The Connector pipeline

Every prompt flows through a composed system prompt before reaching zLM 1.0:

```
[base CLI persona] → [mode] → [skill] → [modules] → [workspace] → [agent] → [memory] → zLM 1.0 (or ZLM-1.0 Local)
```

The `/pipeline` command (or the Pipeline tab in the sidebar) visualizes the active composition. If the active model is `ZLM-1.0 Local`, the pipeline short-circuits to the offline heuristic engine — no SDK calls.

### Streaming protocol

All AI routes emit **NDJSON** (newline-delimited JSON):

```
{"type":"delta","content":"..."}            # incremental text
{"type":"plan","plan":{...}}                # parsed structure (plan route)
{"type":"step_start","index":N,...}         # agent step begins
{"type":"node_start","id":"...","agent":"..."}  # workflow DAG node begins
{"type":"done"}
{"type":"error","content":"..."}
```

The SDK's `stream: true` returns a raw `ReadableStream` of SSE-encoded bytes; `src/lib/glm.ts` parses it line-by-line (`data: {...}\n\ndata: [DONE]`) into content deltas.

### Data flows

- **Voice TTS**: client sends text → `POST /api/voice?action=tts` → `zai.audio.tts.create()` returns audio bytes → client plays via `<audio>`.
- **Voice ASR (Push-to-Talk)**: client records with `MediaRecorder` → `POST /api/voice?action=asr` (multipart audio) → `zai.audio.asr.create()` transcribes → text returned to the prompt input.
- **Voice Commander**: the mic button in the input bar triggers ASR; the transcript is fed to `voice-commands.ts` which matches it against slash-command / mode-switch / panel-open patterns. If it matches, the action runs locally (e.g. `/permissions` opens the Perms tab); otherwise the text is submitted as a prompt.
- **Workflows**: client picks a preset + goal → `POST /api/workflows` → `workflow-runner.ts` walks the DAG, calling `streamCompletion` for each agent node in topological order → NDJSON events (`node_start` / `delta` / `node_end` / `done`) stream back.
- **PromptPay**: client sends phone + amount → `POST /api/promptpay` → `src/lib/promptpay.ts` builds the EMVCo QR payload (Tag 29 + CRC Tag 63) → returns a PNG data URL rendered in the PromptPay panel.
- **Security Scan**: client invokes `/security` (or `make security`) → `POST /api/security` → `security-scanner.ts` walks `src/`, applies 20+ OWASP rules (secrets, SQLi, XSS, SSRF, weak crypto, CORS, …) → returns `{ filesScanned, findings[], summary{critical,high,medium,low,info}, durationMs }`.
- **Memory Mechanism**: on the conclusion of a conversation turn, `memory-mechanism.ts` calls GLM to extract up to 5 memories (content + category + importance 1–5); relevant high-importance memories are injected into the next system prompt; a periodic decay pass prunes low-importance stale entries.
- **Prompt/Agent Generation**: client sends a description → `/api/prompt-gen` or `/api/agent-gen` → GLM streams a JSON object (system prompt + template + tips, or agent planner/executor prompts + maxSteps) → `GeneratorsPanel` renders the structured result with copy buttons.
- **Connectors (Drive/Gmail/Outlook)**: client lists/searches/reads → corresponding `/api/{gdrive,gmail,outlook}` route → connector lib (mock mode default, OAuth2 ready for production) → returns items.
- **Privacy**: `/api/privacy` aggregates all user data (profile, memories, usage, invoices, conversations, tasks) → JSON export or full erase.
- **Local model**: when `model=zlm-1.0-local`, `/api/cli` short-circuits to `local-model.ts`; `/api/image` short-circuits to `local-media.ts` (SVG). Zero API calls.

## 🗄 Data model (Prisma — 10 models)

`User`, `Post`, `ApiKey`, `PaymentOrder`, `Role`, `ApiKeyRole`, `UserProfile`, `UsageRecord`, `Memory`, `Invoice`

See `prisma/schema.prisma` for the full schema.

## 🧰 Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) — glassmorphic design system
- **AI**: `z-ai-web-dev-sdk` (zLM 1.0) — server-side only
- **Voice**: `zai.audio.tts.create()` (TTS, 7 voices) + `zai.audio.asr.create()` (ASR) + browser `MediaRecorder`; Voice Commander parses transcripts client-side via `voice-commands.ts`
- **Media**: text-to-image + text-to-video (polling) via z.ai; fully-offline SVG / WAV / ASCII / frame-sequence generation via `local-media.ts` (ZLM-1.0 Local)
- **Payments**: PromptPay (EMVCo QR payload + CRC-16), 4-plan gateway with credits
- **Workflows**: DAG runner with 3 presets (Full-Stack Feature, Bug Fix Pipeline, Code Quality)
- **Security**: OWASP Top 10 static scanner with 20+ RegExp rules in `security-scanner.ts`
- **Generators**: GLM-backed prompt generator (`prompt-gen.ts`) and agent definition generator (`agent-gen.ts`)
- **Memory**: per-user memory CRUD (`memory.ts`) + GLM-based auto-extraction / importance scoring / decay pruning (`memory-mechanism.ts`)
- **RBAC**: 13 permission keys × 4 role presets (admin/developer/viewer/guest)
- **Sandbox**: isolated JS execution (no `require`/`process`/`fs`)
- **DB**: Prisma ORM (PostgreSQL) — 10 models
- **State**: React hooks (client) — no external state library needed
- **Icons**: lucide-react
- **Markdown**: react-markdown + remark-gfm + react-syntax-highlighter (Prism)

## 🤖 AI skills used

This project is built on the z.ai skills platform:

- **LLM** — chat completions, streaming, multi-turn (powers the whole CLI)
- See [`skills/`](skills/) for the full skill catalog

> `z-ai-web-dev-sdk` MUST be used in backend code only. It is never imported client-side — client-safe types live in `zlm-modes.ts` / `skills.ts` / `modules.ts` / `agents.ts` / `plan.ts` / `connector.ts`.

## 📚 Documentation

- [CHANGELOG](CHANGELOG.md) — version history
- [ROADMAP](ROADMAP.md) — what's next
- [CONTRIBUTING](CONTRIBUTING.md) — how to contribute
- [docs/AGENTS.md](docs/AGENTS.md) — instructions shared across AI coding agents
- [docs/CLAUDE.md](docs/CLAUDE.md) — Claude-specific agent instructions
- [docs/GEMINI.md](docs/GEMINI.md) — Gemini-specific agent guidance
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layers, data flow, design decisions
- [docs/BLUEPRINT.md](docs/BLUEPRINT.md) — design blueprint & pillars
- [docs/TECH-STACK.md](docs/TECH-STACK.md) — full technology list
- [docs/SYSTEM-ARCHITECTURE-DIAGRAM.md](docs/SYSTEM-ARCHITECTURE-DIAGRAM.md) — visual diagrams
- [docs/TOKENOMICS.md](docs/TOKENOMICS.md) — usage economics
- [docs/INSTALLER_OS_REQUIREMENTS.md](docs/INSTALLER_OS_REQUIREMENTS.md) — install & OS requirements

## 📦 Project scripts

```bash
bun run dev        # start dev server (port 3000)
bun run lint       # ESLint
bun run db:push    # prisma db push
bun run db:generate# prisma generate
```

## 📄 License

MIT © zeaz. See [LICENSE](LICENSE).

---
