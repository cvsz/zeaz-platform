# Changelog

All notable changes to **zLM-CLI** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Database migrated from SQLite to PostgreSQL** — the datasource provider is now `postgresql` instead of `sqlite`. The `DATABASE_URL` env var uses the `postgresql://` connection string format. New `make db-setup` target automatically starts a PostgreSQL Docker container. All 10 Prisma models are compatible (using `String` types throughout).

### Planned
- WebSocket-based collaborative sessions
- Virtual filesystem + live preview for plan execution
- Real Stripe checkout replacement for the mock gateway
- Voice streaming (TTS streams as the model generates)
- Security auto-fix agents (turn findings into agent-runnable tasks)

## [1.0.0] — 2025-01-XX — FIRST STABLE RELEASE

This is the v1.0 release. The full feature inventory below is now shipped and stable.

### Added — Management layer
- **Task Manager** — create, track, complete tasks with priorities (low/medium/high/urgent), statuses (todo/in_progress/done/blocked), tags, and stats. New `src/lib/tasks.ts`, `src/app/api/tasks/route.ts`, `src/components/terminal/tasks-panel.tsx`. Slash commands: `/tasks`.
- **Conversation Manager** — save (`/save`), load (`/load <id>`), delete Prisma-backed conversations. New `src/lib/conversations.ts`, `src/app/api/conversations/route.ts`, `src/components/terminal/conversations-panel.tsx`. Slash commands: `/save`, `/load`, `/conversations` (alias `/chats`).
- **Settings** — `settings.json` with workspace, safety, editor, visual, performance sections (25+ options). New `src/lib/settings.ts`, `src/app/api/settings/route.ts`, `src/components/terminal/settings-panel.tsx`. Slash command: `/settings`.
- **Admin Control Panel** — dashboard with stats, key management, registry breakdown. New `src/components/terminal/admin-panel.tsx` (the existing `/api/admin` endpoint feeds it). Slash command: `/admin`.

### Added — Build & validation
- **4 validation scripts** under `scripts/`:
  - `scripts/tech-stack-scaner.sh` — scan runtime, deps, framework, routes, components.
  - `scripts/validate-env.sh` — validate `.env`, `.z-ai-config`, `node_modules`, DB, Prisma.
  - `scripts/validate-network.sh` — test localhost, z.ai API, npm, GitHub, DNS.
  - `scripts/validate-workers.sh` — check dev server, mini-services, PIDs, processes.
- **Cross-platform Makefile finalized** — 17 user-facing targets (`install`, `start`, `stop`, `restart`, `status`, `logs`, `lint`, `clean`, `db-push`, `db-generate`, `db-reset`, `check-os`, `check-deps`, `build`, `package`, `security`, `test`) with macOS / Linux / WSL auto-detection.

### Added — Professional UI/UX
- **Glassmorphic design system** — glass, grad-border, glow, ambient grid, custom scrollbars in `globals.css`.
- **Emerald-on-dark terminal aesthetic** finalized.
- **24 sidebar tabs** — added Tasks, Chats (Conversations), Settings alongside the previous 21.
- **43+ slash commands** — added `/tasks`, `/save`, `/load`, `/conversations`, `/chats`, `/settings`, `/privacy`, `/data`, `/connectors`, `/features`.
- **Syntax-highlighted code blocks** with copy buttons (Prism, `oneDark`).
- **GFM markdown rendering** (react-markdown + remark-gfm).
- **Model selector dropdown** — searchable, 21 models grouped by category (Flagship / Fast / Balanced / Long context / Vision / Legacy / Local).
- **Voice Commander mic button** in the input bar.

### Added — Data & Privacy (GDPR)
- **Data inventory** — see all stored data per user (profile, memories, usage, invoices, conversations, tasks).
- **Export all data as JSON** — GDPR right to portability.
- **Delete all data** — GDPR right to erasure. New `src/lib/privacy.ts`, `src/app/api/privacy/route.ts`, `src/components/terminal/privacy-panel.tsx`. Slash command: `/privacy` (alias `/data`).

### Changed
- Model registry expanded to **20 GLM cloud models + 1 local model (21 total)**.
- API surface finalized at **32 routes** (added `settings`, `tasks`, `conversations`).
- Sidebar finalized at **24 tabs** (added Settings, Tasks, Chats).
- Slash commands finalized at **43+**.
- Prisma schema finalized at **10 models** (User, Post, ApiKey, PaymentOrder, Role, ApiKeyRole, UserProfile, UsageRecord, Memory, Invoice).
- Full `.github/` templates refreshed (CI workflow, issue templates, PR template, SECURITY, CODEOWNERS, dependabot config).
- 14 documentation files (5 root + 9 in `docs/`) all updated to reflect the v1.0 inventory.

### Final counts (v1.0)
- 32 API routes
- 41 lib files (server-only + client-safe)
- 29 terminal components (+ 45 shadcn/ui components)
- 24 sidebar tabs
- 43+ slash commands
- 21 models (20 cloud + 1 local)
- 10 Prisma models
- 4 validation scripts
- 17 Makefile targets
- 14 documentation files
- 8 design pillars (see BLUEPRINT.md)

## [0.9.0] — 2025-01-XX

### Added
- **Google Drive Connector** — list, search, read Drive files (mock mode + real OAuth2 ready). New `src/app/api/gdrive/route.ts`, surfaced in the `/connectors` hub.
- **Google Gmail Connector** — list, search, read emails. New `src/app/api/gmail/route.ts`, surfaced in the `/connectors` hub.
- **Outlook/Live Mail Connector** — list, search, read emails via Microsoft Graph. New `src/app/api/outlook/route.ts`, surfaced in the `/connectors` hub.
- **Data & Privacy** — GDPR toolkit: data inventory, export all user data as JSON, delete all user data (right to erasure). New `src/app/api/privacy/route.ts` and `/privacy` panel. Slash command: `/privacy`.
- **Sidebar expanded to 24 tabs** — added Drive, Gmail, Outlook, Connectors, Privacy alongside the existing 19.
- **API surface expanded to 32 routes** — added `gdrive`, `gmail`, `outlook`, `connectors`, `privacy` (full list: admin, agent, agent-gen, billing, cli, connectors, dashboard, gdrive, gmail, image, keys, mcp, memory, outlook, payments, permissions, plan, privacy, profile, promptpay, prompt-gen, research, route, sandbox, search, security, usage, video, voice, workflows).
- New slash commands: `/connectors`, `/privacy`.

### Changed
- README, ROADMAP docs updated to reflect the 32-route / 24-tab surface and the new connectors + privacy features.

## [0.8.0] — 2025-01-XX

### Added
- **Security Scanner** — OWASP Top 10 static vulnerability scanner with 20+ RegExp rules (critical / high / medium / low / info). Scans every source file in the repo for hardcoded secrets, SQL injection, XSS, SSRF, weak crypto, CORS issues, and more. New `src/lib/security-scanner.ts`, `src/app/api/security/route.ts`, `src/components/terminal/security-panel.tsx`. Slash command: `/security`. Makefile target: `make security`.
- **CLAUDE.md** — a new root-level agent instructions file (alongside `AGENTS.md` and `GEMINI.md`) with Claude-specific operating constraints, repository layout, and "adding common things" recipes (incl. how to add a new security scan rule).
- **Memory Mechanism** — GLM-based auto-extraction layer that sits on top of the existing Memory model. After a conversation turn, `src/lib/memory-mechanism.ts` calls GLM to extract up to 5 memories (content + category + importance 1–5), persists them, and a decay pass prunes low-importance stale entries. Relevant high-importance memories are injected into the next system prompt.
- **Prompts Generator** — GLM generates an optimized system prompt (title + system prompt + user template + tips array) from a natural-language description. New `src/lib/prompt-gen.ts`, `src/app/api/prompt-gen/route.ts`, `src/components/terminal/generators-panel.tsx`. Slash command: `/gen-prompt`.
- **Agents Generator** — GLM generates a complete custom agent definition (name, id, tagline, description, plannerPrompt, executorPrompt, maxSteps) from a description. New `src/lib/agent-gen.ts`, `src/app/api/agent-gen/route.ts` (shares the `generators-panel.tsx` UI). Slash command: `/gen-agent`.
- **Voice Commander** — speak commands hands-free. The mic button in the input bar captures audio via `MediaRecorder`, ASR transcribes it via `zai.audio.asr.create()`, and `src/lib/voice-commands.ts` parses the transcript into a slash command, mode switch, panel open, or prompt submission. New `src/lib/voice-commands.ts` (client-safe).
- **Local Media Model** — fully-offline generation (no API calls) powered by `ZLM-1.0 Local`. New `src/lib/local-media.ts` generates SVG images (palette-detected), WAV beep melodies, ASCII-frame animations, and text-frame video sequences. Zero cost, zero latency, full privacy — usable without internet.
- **Updated Makefile** — now cross-platform with macOS / Linux / WSL auto-detection (`make check-os`). New targets: `check-os`, `check-deps`, `build` (Next.js standalone production build), `package` (creates `download/zlm-cli-source.zip`), `security` (runs the OWASP scanner via `/api/security`), `test` (lint + type-check pre-commit gate), `db-reset` (destructive DB reset + re-push).
- **Sidebar expanded to 19 tabs** — added Gen (Generators) and Sec (Security) alongside the existing 17.
- **API surface expanded to 25 routes** — added `security`, `prompt-gen`, `agent-gen` (full list: admin, agent, agent-gen, billing, cli, dashboard, image, keys, mcp, memory, payments, permissions, plan, profile, promptpay, prompt-gen, research, route, sandbox, search, security, usage, video, voice, workflows).
- New slash commands: `/security`, `/gen-prompt`, `/gen-agent`.

### Changed
- The Makefile now detects `Darwin` / `Linux` / WSL (via `/proc/version` Microsoft check) and uses platform-appropriate port-check commands (`lsof` on macOS, `ss` on Linux/WSL).
- `terminal.tsx` input bar gains a mic button that routes through `voice-commands.ts` for spoken-command dispatch.
- The `Memory System` panel and `composeSystemPrompt()` now consume memories produced by the new `memory-mechanism.ts` extractor (in addition to manually-added memories).
- README, AGENTS, GEMINI, CONTRIBUTING, ARCHITECTURE, BLUEPRINT, TECH-STACK, SYSTEM-ARCHITECTURE-DIAGRAM, INSTALLER_OS_REQUIREMENTS, and ROADMAP docs all updated to reflect the 25-route / 19-tab surface and the new features.

## [0.7.0] — 2025-01-XX

### Added
- **PromptPay** — Thai QR payment code generator. New `src/lib/promptpay.ts` (EMVCo payload + CRC-16 Tag 63), `src/app/api/promptpay/route.ts`, and `src/components/terminal/promptpay-panel.tsx`. Slash command: `/promptpay <phone> <amount>`.
- **Agent Workflows** — multi-agent DAG system where agents collaborate in sequence. New `src/lib/workflows.ts` (presets + DAG types), `src/lib/workflow-runner.ts` (topological execution), `src/app/api/workflows/route.ts`, and `src/components/terminal/workflows-panel.tsx`. 3 presets: **Full-Stack Feature**, **Bug Fix Pipeline**, **Code Quality**. Slash command: `/workflow`.
- **Voice (TTS)** — text-to-speech with 7 voices (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo) via `zai.audio.tts.create()`. New `src/lib/voice.ts`, `src/app/api/voice/route.ts?action=tts`, and `src/components/terminal/voice-panel.tsx`. Slash command: `/voice`.
- **Voice (ASR / Push-to-Talk)** — speech-to-text via `zai.audio.asr.create()` with browser `MediaRecorder` for capture. Endpoint: `/api/voice?action=asr`.
- **Billing** — invoices, plan-based limits, billing stats. New `src/lib/billing.ts` and `src/app/api/billing/route.ts`.
- **Usage Tracking** — per-request token tracking, internet on/off toggle, memory toggle. New `src/lib/usage.ts` and `src/app/api/usage/route.ts`.
- **Memory System** — persistent per-user memories (fact / preference / note / context with importance). New `src/lib/memory.ts`, `src/app/api/memory/route.ts`, and `src/components/terminal/memory-panel.tsx`. Slash command: `/memory`.
- **User Profile + Login** — login via API key, auto-creates profile, plan + credits tracking. New `src/app/api/profile/route.ts`. Slash commands: `/login`, `/logout`.
- **Dashboard** — overview panel with profile, usage stats, billing, internet/memory toggles. New `src/app/api/dashboard/route.ts` and `src/components/terminal/dashboard-panel.tsx`. Slash command: `/dashboard`.
- **Permissions (RBAC)** — 13 permission keys, 4 role presets (admin / developer / viewer / guest). New `src/lib/permissions.ts`, `src/app/api/permissions/route.ts`, and `src/components/terminal/permissions-panel.tsx`. Slash command: `/permissions`.
- **Payment Gateway** — 4 plans (Starter / Pro / Team / Enterprise), mock checkout, credits. New `src/lib/payments.ts`, `src/app/api/payments/route.ts`, and `src/components/terminal/payments-panel.tsx`. Slash command: `/pay`.
- **Web Search** — live web search + page reader via z.ai SDK. New `src/lib/web-tools.ts` + `src/lib/web-tools-client.ts`, `src/app/api/search/route.ts`, and `src/components/terminal/search-panel.tsx`. Slash command: `/search`.
- **Research Tools** — read web pages + GLM-powered summarization. New `src/app/api/research/route.ts` and `src/components/terminal/research-panel.tsx`. Slash command: `/research`.
- **Sandbox** — safe isolated JS execution (no `require` / `process` / `fs`). New `src/lib/sandbox.ts`, `src/app/api/sandbox/route.ts`, and `src/components/terminal/sandbox-panel.tsx`. Slash command: `/sandbox`.
- **MCP CLI Connector** — allowlisted shell commands with approval gate. New `src/lib/mcp-commands.ts`, `src/lib/mcp-runner.ts`, `src/app/api/mcp/route.ts`, and `src/components/terminal/mcp-panel.tsx`. Slash command: `/mcp`.
- **Image Generation** — text-to-image via z.ai. New `src/lib/media.ts`, `src/app/api/image/route.ts`, and updated `media-panel.tsx`. Slash command: `/media`.
- **Video Generation** — text-to-video with polling. New `src/app/api/video/route.ts`.
- **Admin Panel** — dashboard with stats, key management. New `src/app/api/admin/route.ts` and `src/components/terminal/admin-panel.tsx`. Slash command: `/admin`.
- **Model Selector (19 + 1)** — expanded dropdown to 19 GLM cloud models plus **ZLM-1.0 Local** (an offline heuristic engine — no API calls). Slash command: `/model`.
- **Sidebar expanded to 17 tabs** — Home (Dashboard), Skills, Modules, Pipeline, Keys, Media, Admin, MCP, Pay, Search, Research, Sandbox, Perms, Memory, Voice, Flows (Workflows), Pay QR (PromptPay).
- **API surface expanded to 22 routes** — admin, agent, billing, cli, dashboard, image, keys, mcp, memory, payments, permissions, plan, profile, promptpay, research, route, sandbox, search, usage, video, voice, workflows.
- 13 new slash commands: `/voice`, `/workflow`, `/promptpay`, `/dashboard`, `/memory`, `/login`, `/logout`, `/permissions`, `/sandbox`, `/search`, `/research`, `/mcp`, `/pay`, `/admin`, `/keys`, `/media`, `/model`, `/plan`.

### Changed
- `composeSystemPrompt()` in `glm.ts` now short-circuits to the offline heuristic engine when `model === "ZLM-1.0 Local"`.
- Request lifecycle in `/api/cli` now records per-request token counts via `usage.ts` (fire-and-forget).
- Sidebar (`sidebar.tsx`) reorganized into 17 labeled tabs with icon-only + label modes.
- Model dropdown (`model-selector.tsx`) updated to surface the local model in a separate group.

## [0.6.0] — 2025-01-XX

### Added
- **API Keys** — sha256-hashed keys, rate limiting, `require-key` gate. New `src/lib/api-keys.ts`, `src/lib/api-keys-client.ts`, `src/app/api/keys/route.ts`, and `src/components/terminal/keys-panel.tsx`.
- **Model selector** — 19 GLM models in a searchable dropdown (`src/lib/models.ts`, `src/components/terminal/model-selector.tsx`).
- Slash commands `/keys` and `/model`.

## [0.5.0] — 2025-01-XX

### Added
- **GLM Coding Plan** — `/plan <task>` generates a structured JSON implementation roadmap (phases → files → steps, risks, acceptance criteria) rendered as an interactive checklist with per-phase code execution.
  - New `src/lib/plan.ts` with `CodingPlan` schema, `PLAN_SCHEMA_INSTRUCTIONS`, and `parsePlan()`.
  - New `src/app/api/plan/route.ts` streaming endpoint.
  - New `src/components/terminal/plan-view.tsx` interactive roadmap with progress bar, expandable phases, file lists, step toggles, and "execute phase" buttons.
- **Makefile** with `install`, `start`, `stop`, `restart`, `status`, `logs`, `clean`, `lint`, `db-push`, `db-generate`, and mini-service management targets.
- Project documentation: `README.md`, `AGENTS.md`, `GEMINI.md`, `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.
- GitHub community templates: issue templates (bug report, feature request), PR template, CI workflow, `SECURITY.md`, `CODEOWNERS`, `FUNDING.yml`, issue template config.

## [0.4.0] — 2025-01-XX

### Added
- **Skills** — 10 expert personas (`code-review`, `refactor`, `add-tests`, `generate-docs`, `security-audit`, `performance-audit`, `commit-message`, `explain-architecture`, `migrate`, `format-code`) in `src/lib/skills.ts`.
- **Modules** — 8 toggleable context tools (`filesystem`, `git`, `npm`, `regex`, `http`, `json`, `sql`, `docker`) in `src/lib/modules.ts`, grouped by category (Context / Tooling / Data / Infra).
- **Agents** — 3 multi-step agents (`architect`, `bug-hunter`, `refactorer`) with plan→execute orchestration.
  - New `src/lib/agents.ts` client-safe registry.
  - New `streamAgent()` generator in `src/lib/glm.ts` (planner produces JSON step list, executor runs each step with streaming).
  - New `src/app/api/agent/route.ts` streaming endpoint.
  - New `src/components/terminal/agent-view.tsx` rendering plan checklist + streaming step outputs.
- **Connector pipeline** — `src/lib/connector.ts` composes `[mode]+[skill]+[modules]+[workspace]+[agent]` into the system prompt. `/pipeline` command + sidebar Pipeline tab visualize the active composition.
- **Connected workspace** — `/connect code <paste>` injects a code snippet into every prompt as context.
- Collapsible sidebar (persistent on desktop, drawer on mobile) with Skills / Modules / Pipeline tabs.
- Header pipeline badges (skill / mods / pipe / plan) and footer active-layer chips.
- 12 new slash commands: `/skills`, `/skill`, `/modules`, `/module`, `/agent`, `/connect`, `/disconnect`, `/pipeline`.

### Changed
- `composeSystemPrompt()` in `glm.ts` now merges skill + modules + workspace layers (previously mode-only).
- `/api/cli` route accepts `skill`, `modules`, `workspace` in the request body.
- `terminal.tsx` rewritten with pipeline state, sidebar, and agent/plan entry rendering.

## [0.3.0] — 2025-01-XX

### Fixed
- **Streaming now works.** The `z-ai-web-dev-sdk`'s `stream: true` returns a raw `ReadableStream<Uint8Array>` of SSE-encoded bytes (`data: {...}\n\ndata: [DONE]`), not parsed objects. Added `parseSseStream()` in `glm.ts` to buffer by newline and extract `choices[0].delta.content`. Previously responses came back empty.

### Changed
- Split client-safe types into `src/lib/zlm-modes.ts` so client components never import the server-only `glm.ts` (which would crash the client bundle with `Module not found: fs/promises`).

## [0.2.0] — 2025-01-XX

### Added
- **6 CLI modes** — `chat`, `explain`, `debug`, `generate`, `review`, `optimize` with mode-specific system prompts.
- **Streaming `/api/cli` endpoint** — NDJSON protocol (`delta` / `done` / `error`).
- Terminal UI with ASCII banner, prompt `glm@cli:~/<mode>$`, auto-growing input, `↑/↓` history, `Ctrl+L` clear, slash commands, stop/abort, jump-to-bottom.
- Syntax-highlighted code blocks (Prism) with copy buttons.
- GFM markdown renderer (react-markdown + remark-gfm).
- Slash commands: `/help`, `/clear`, `/about`, `/mode`, plus one-shot mode commands (`/debug <prompt>`).
- Example prompt chips for first-run.
- Custom emerald-tinted scrollbars.

## [0.1.0] — 2025-01-XX

### Added
- Initial Next.js 16 + TypeScript 5 scaffold with Tailwind CSS 4 and shadcn/ui.
- `z-ai-web-dev-sdk` dependency installed.
- Prisma ORM configured with PostgreSQL.
- Basic project structure (`src/app`, `src/lib`, `src/components/ui`).

[Unreleased]: https://github.com/zai/zlm-cli/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zai/zlm-cli/releases/tag/v1.0.0
[0.9.0]: https://github.com/zai/zlm-cli/releases/tag/v0.9.0
[0.8.0]: https://github.com/zai/zlm-cli/releases/tag/v0.8.0
[0.7.0]: https://github.com/zai/zlm-cli/releases/tag/v0.7.0
[0.6.0]: https://github.com/zai/zlm-cli/releases/tag/v0.6.0
[0.5.0]: https://github.com/zai/zlm-cli/releases/tag/v0.5.0
[0.4.0]: https://github.com/zai/zlm-cli/releases/tag/v0.4.0
[0.3.0]: https://github.com/zai/zlm-cli/releases/tag/v0.3.0
[0.2.0]: https://github.com/zai/zlm-cli/releases/tag/v0.2.0
[0.1.0]: https://github.com/zai/zlm-cli/releases/tag/v0.1.0
