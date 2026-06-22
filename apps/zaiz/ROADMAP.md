# Roadmap

> Where zLM-CLI is heading. This is a living document — priorities shift based on feedback.

## Vision

zLM-CLI is the fastest way to go from **idea → running code** in your browser. It pairs the z.ai zLM 1.0 model with a terminal-native UX and a composable pipeline (modes, skills, modules, agents, workflows, plans) — plus voice (TTS/ASR) with a Voice Commander, media generation (cloud + offline local media), an OWASP security scanner, GLM-backed prompt/agent generators, payments + billing, memory (CRUD + auto-extraction), RBAC, GDPR data & privacy tools, task + conversation managers, settings, cloud data connectors (Google Drive, Gmail, Outlook), and 21 models (20 cloud + 1 local) — so developers can think, write, debug, talk, scan, generate, pay, and ship without leaving the conversation.

The north star: **a coding partner that plans like a senior engineer, executes like a fast junior, listens and speaks when you want it to, audits its own output for security issues, and never makes you context-switch.**

---

## 🎯 Now (v1.0 — current — STABLE)

The v1.0 release. Everything below is shipped and stable.

### Core AI
- [x] **6 CLI modes** (`/chat`, `/explain`, `/debug`, `/generate`, `/review`, `/optimize`)
- [x] **10 Skills** (code-review, refactor, add-tests, generate-docs, security-audit, performance-audit, commit-message, explain-architecture, migrate, format-code)
- [x] **8 Modules** (filesystem, git, npm, regex, http, json, sql, docker)
- [x] **3 Agents** (architect, bug-hunter, refactorer) with plan→execute orchestration
- [x] **Connector pipeline** — `[mode]+[skill]+[modules]+[workspace]+[agent]` → zLM 1.0
- [x] **Coding Plan** (`/plan`) with interactive checklist + per-phase execution
- [x] **Agent Workflows** — multi-agent DAGs with 3 presets (`/workflow`)
- [x] **Model Selector** — 20 GLM cloud models + ZLM-1.0 Local (21 total)
- [x] **Local model** — `ZLM-1.0 Local` runs offline via heuristic engine
- [x] **Streamed responses** — NDJSON protocol with SSE parsing

### Voice & Media
- [x] **TTS** — 7 voices via `zai.audio.tts.create()` (`/voice`)
- [x] **ASR / Push-to-Talk** — `zai.audio.asr.create()` + browser `MediaRecorder`
- [x] **Voice Commander** — speak slash commands / mode switches / panel opens via `voice-commands.ts`
- [x] **Image generation** — text-to-image via z.ai; local SVG offline when `model=zlm-1.0-local` (`/image`)
- [x] **Video generation** — async task + polling via `zai.video.generations` (`/video`)
- [x] **Local media** — offline SVG art, WAV melodies, ASCII animations via `local-media.ts` (ZLM-1.0 Local)

### Payments & Billing
- [x] **Payment Gateway** — 4 plans (Starter $0, Pro $19, Team $49, Enterprise $199), mock checkout, credits (`/payments`)
- [x] **PromptPay** — Thai QR payment (EMVCo TLV + CRC16-CCITT) (`/promptpay`)
- [x] **Billing** — invoices, plan limits, credits tracking (`/billing`)
- [x] **API Keys** — sha256-hashed, CRUD, rate limiting (sliding 1hr window) (`/keys`)
- [x] **Token tracking** — per-request input/output tokens, usage records (`/usage`)

### User & Access
- [x] **User Profiles** — login via API key, auto-create, plan + credits tracking (`/profile`, `/login`)
- [x] **RBAC Permissions** — 13 permission keys, 4 role presets (admin/developer/viewer/guest) (`/permissions`)
- [x] **Dashboard** — profile, usage stats, billing, internet/memory toggles (`/dashboard`)
- [x] **Internet on/off toggle** per user
- [x] **Memory on/off toggle** per user
- [x] **Require-key gate** — toggle to enforce API key on all endpoints

### Memory & Context
- [x] **Memory System** — persistent per-user (fact/preference/note/context, importance 1-5) (`/memory`)
- [x] **Auto-extraction** — GLM scans conversations, stores persistent facts automatically (`memory-mechanism.ts`)
- [x] **Context injection** — memories composed into system prompt
- [x] **Decay pruning** — low-importance memories pruned after 30 days

### Tools & Research
- [x] **Web Search** — live results via `zai.functions.invoke("web_search")` (`/search`)
- [x] **Page Reader** — extract content from any URL via `zai.functions.invoke("page_reader")` (`/search`)
- [x] **Research Tools** — read + GLM-powered summarization (streamed) (`/research`)
- [x] **Sandbox** — safe isolated JS execution (allowlisted builtins, no require/process/fs) (`/sandbox`)
- [x] **MCP CLI Connector** — allowlisted shell commands (git, build, lint, docker), approval gate for writes (`/mcp`)
- [x] **Security Scanner** — 20+ OWASP Top 10 rules (critical/high/medium/low/info) (`/security`, `make security`)

### Generators
- [x] **Prompts Generator** — GLM creates optimized system prompts from descriptions (`/gen-prompt`)
- [x] **Agents Generator** — GLM creates custom agent definitions (planner + executor prompts) (`/gen-agent`)

### Connectors
- [x] **Google Drive** — list, search, read files (OAuth2 ready, mock mode default) (`/connectors`)
- [x] **Google Gmail** — list, search, read emails (OAuth2 ready) (`/connectors`)
- [x] **Outlook/Live Mail** — list, search, read emails via Microsoft Graph (OAuth2 ready) (`/connectors`)

### Data & Privacy
- [x] **Data inventory** — see all stored data per user (`/privacy`)
- [x] **Export all data as JSON** — GDPR right to portability
- [x] **Delete all data** — GDPR right to erasure

### Management
- [x] **Task Manager** — create, track, complete (priorities, statuses, tags, stats) (`/tasks`)
- [x] **Conversation Manager** — save (`/save`), load (`/load <id>`), delete conversations
- [x] **Settings** — `settings.json` (workspace, safety, editor, visual, performance — 25+ options) (`/settings`)
- [x] **Admin Control Panel** — dashboard, stats, key management, registry breakdown (`/admin`)

### Build & Validation
- [x] **Cross-platform Makefile** — macOS/Linux/WSL detection, 17 targets
- [x] **4 validation scripts** in `scripts/` (tech-stack-scaner, validate-env, validate-network, validate-workers)

### Professional UI/UX
- [x] **Glassmorphic design system** (glass, grad-border, glow, animations)
- [x] **Emerald-on-dark terminal aesthetic** with ambient grid
- [x] **Responsive** — desktop sidebar + mobile drawer
- [x] **24 sidebar tabs**, **43+ slash commands**, **32 API routes**, **10 Prisma models**
- [x] Syntax-highlighted code blocks with copy, GFM markdown rendering
- [x] Searchable model selector (21 models), Voice Commander mic button
- [x] Full `.github/` templates (CI, issue templates, PR template, SECURITY, CODEOWNERS, dependabot)

---

## 🚀 Next (v1.1)

Make plans and agents actually do work in a real environment.

- [ ] **Virtual filesystem** — plans write to an in-browser FS (OPFS / IndexedDB); `execute phase` applies diffs, not just prints code
- [ ] **Live preview** — generated Next.js/React code renders in a sandboxed iframe beside the terminal
- [ ] **Agent tool-use** — agents can call tools (read file, run test, search) within the plan→execute loop, not just generate text
- [ ] **Diff view** — phase execution shows a unified diff against the workspace, with accept/reject
- [ ] **Plan templates** — seed `/plan` with reusable templates (CRUD app, auth, API, CLI tool)
- [ ] **Workflow composer** — visual DAG editor for custom multi-agent workflows (beyond the 3 presets)
- [ ] **Real Stripe checkout** — replace the mock payment gateway with live Stripe
- [ ] **Voice streaming** — TTS streams as the model generates (no wait-for-complete)
- [ ] **Security auto-fix agents** — turn OWASP scanner findings into agent-runnable fix tasks
- [ ] **Keyboard command palette** — `Cmd+K` to browse modes/skills/agents/workflows
- [ ] **Error recovery** — auto-retry on stream failure with backoff
- [ ] **Export** — download a plan, agent run, workflow, or conversation as Markdown

---

## 🔮 Later (v1.2–v1.3)

Collaboration and depth.

- [ ] **Multi-file projects** — manage a whole project tree, not just a workspace snippet
- [ ] **Shared sessions** — WebSocket-based collaborative editing (mini-service on a side port)
- [ ] **Branching conversations** — fork a thread to explore alternatives without losing the original
- [ ] **Custom skills/modules** — users define their own via a YAML/JSON editor in the sidebar
- [ ] **Token + cost meter** — show usage per turn and per session (parses SDK `usage` field)
- [ ] **Offline mode** — cache common completions; queue sends when reconnecting (ZLM-1.0 Local is already offline-capable)
- [ ] **Memory search & semantic recall** — vector-indexed memories for relevance-ranked injection
- [ ] **Custom RBAC roles** — user-defined roles beyond admin/developer/viewer/guest
- [ ] **Multilingual voice** — expand TTS/ASR beyond the 7 voices to cover more locales
- [ ] **Real Google/Microsoft OAuth2** — wire Drive/Gmail/Outlook connectors to live credentials
- [ ] **PromptPay bank webhook** — automate credit posting when a Thai bank confirms a payment

---

## 🌊 Future (v1.4+)

- [ ] **VS Code extension** — bring the zLM-CLI terminal into the editor
- [ ] **Git integration** — commit generated code, open PRs, resolve conflicts
- [ ] **Test generation + execution** — agents write tests and run them in a sandbox, reporting pass/fail back into the plan
- [ ] **Deployment** — one-click deploy generated apps to Vercel/Cloudflare
- [ ] **Plugin SDK** — third-party skills/modules/agents/workflows via a typed registry
- [ ] **Team workspaces** — shared skills, modules, plan templates, and memories across an org
- [ ] **Realtime voice chat** — bidirectional voice mode (no push-to-talk button)
- [ ] **Workflow marketplace** — share and import community DAG presets

---

## 🧭 Guiding principles

1. **Terminal-native.** The UX stays keyboard-first. Mouse interactions are shortcuts, not the primary path.
2. **Composable, not monolithic.** Modes, skills, modules, agents, workflows, plans, and memories are independent layers the Connector assembles. Adding one shouldn't require touching the others.
3. **Server does the thinking.** The client is a thin streaming consumer. AI logic stays in `glm.ts` (server-only) so credentials and heavy logic never leak.
4. **Honest by default.** If the model can't do something, say so. No fabricated APIs, no invented file paths. Plans are structured JSON so they can be validated, not free-form prose.
5. **Fast feedback.** Everything streams. A plan appears as it's drafted; an agent's steps render live. Never make the user stare at a spinner for 30s with no signal.
6. **Offline-friendly.** `ZLM-1.0 Local` + `local-media.ts` keep the terminal usable (chat + SVG art + WAV melodies + ASCII animations) without network or quota.
7. **Privacy-first.** GDPR data inventory, export, and erasure are built in — not bolted on. Memory + internet toggles let users control what's stored and sent.
8. **Secure by default.** OWASP scanner runs locally on every source file. RBAC gates every sensitive route. API keys are sha256-hashed.

---

## 🤝 Influencing the roadmap

Open a [discussion](https://github.com/zai/zlm-cli/discussions) or upvote an issue with the `roadmap` label. We prioritize based on:

- Number of 👍 on an issue
- Whether a feature unblocks multiple other features
- Alignment with the guiding principles above

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose changes.
