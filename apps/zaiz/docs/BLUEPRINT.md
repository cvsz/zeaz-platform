# BLUEPRINT

> The design blueprint for zLM-CLI — what it is, who it's for, and the principles that govern every decision.

## Purpose

zLM-CLI is a **browser-based coding terminal** that pairs the z.ai zLM 1.0 model with a composable pipeline of modes, skills, modules, agents, and structured plans. It exists to collapse the distance between *having a coding question* and *getting a runnable, well-reasoned answer* — without leaving the conversation, without context-switching to an IDE, and without copy-pasting between tabs.

## The problem it solves

Developers working with LLMs today face friction:

1. **Context fragmentation** — code lives in the editor, the prompt lives in a chat tab, the output lives in a third place. Synthesizing them is manual.
2. **No structure** — free-form chat produces free-form answers. There's no enforced shape for a code review, a bug diagnosis, or an implementation plan.
3. **No composable intelligence** — you can't layer "act as a security auditor" on top of "also consider my database schema" on top of "and produce a step-by-step plan." Each request starts from scratch.
4. **No access control** — sharing an AI endpoint with a team means unlimited usage and no per-user limits.

zLM-CLI addresses all four.

## Who it's for

| Audience | How they use it |
| --- | --- |
| **Individual developers** | Quick Q&A, code generation, debugging help in a terminal-native UX |
| **Team leads** | Generate structured implementation plans to share with the team; enforce review rigor via skills |
| **API consumers** | Use the `/api/cli`, `/api/agent`, `/api/plan` endpoints behind rate-limited API keys |
| **AI tinkerers** | Experiment with the composable pipeline (mode + skill + modules + workspace + agent) to shape model behavior |

## The eight pillars

### 1. Terminal-native UX
The interface is a terminal, not a chat bubble. Keyboard-first (`↑/↓` history, `Enter` send, `Ctrl+L` clear, slash commands, `Cmd+K` palette planned). Mouse interactions are shortcuts. The aesthetic is a retro-futuristic dark terminal — emerald on near-black, glassmorphic chrome (`glass`, `grad-border`, `glow`), ambient grid, custom scrollbars. A mic button in the input bar hands control to the Voice Commander when the user prefers to speak. 24 sidebar tabs organize every feature without leaving the keyboard.

### 2. Composable pipeline (the Connector)
Every prompt is assembled from independent layers before reaching zLM 1.0 (or ZLM-1.0 Local):

```
[base CLI persona] → [mode] → [skill] → [modules] → [workspace] → [agent] → [memory] → zLM 1.0
```

Each layer is optional and independently toggleable. Adding a skill doesn't touch the modules system. This is the architectural heart of the project.

### 3. Structured outputs
Where it matters, zLM-CLI enforces structure:
- **Coding Plans** — strict JSON (phases → files → steps, risks, acceptance), parsed and validated, rendered as an interactive roadmap
- **Agent plans** — JSON step arrays, executed sequentially with streaming
- **Agent Workflows** — multi-agent DAGs (3 presets: Full-Stack Feature, Bug Fix Pipeline, Code Quality) where nodes consume their predecessors' output in topological order
- **Code review** — severity-tagged (Critical / Warning / Nit)
- **Generated prompts & agents** — GLM emits a strict JSON shape (title + systemPrompt + userTemplate + tips, or plannerPrompt + executorPrompt + maxSteps) that the Generators panel renders and lets the user edit before saving
- **Streamed responses** — NDJSON wire protocol with SSE parsing on the server

Structure enables UI affordances (checklists, progress bars, execute-phase buttons, DAG visualization) that free-form prose cannot.

### 4. Server-side intelligence
All AI logic lives in `src/lib/glm.ts` (server-only). The client is a thin streaming consumer. This keeps credentials safe, allows heavy prompt composition, and centralizes the SSE-parsing logic. The `z-ai-web-dev-sdk` is never imported client-side. The same SDK instance also powers TTS (`audio.tts.create`), ASR (`audio.asr.create`), image generation, video generation, the prompt/agent generators, and the memory-extraction mechanism. The `local-model.ts` heuristic engine short-circuits the SDK path for `ZLM-1.0 Local`.

### 5. Access control, billing & payments
Three layers protect and monetize the API:
- **API Keys** (sha256-hashed) with a `requireKey` toggle and per-hour rate limits (in-memory sliding window). Usage is tracked per key.
- **RBAC** — 13 permission keys × 4 role presets (admin / developer / viewer / guest). Routes can check `hasPermission(key, permission)` before executing.
- **Payments + Billing** — 4 plans (Starter $0, Pro $19, Team $49, Enterprise $199), mock checkout, credits, invoices, plan-based limits. **PromptPay** provides a self-contained Thai QR payment method (EMVCo TLV payload + CRC16-CCITT) with no third-party gateway.

### 6. Voice & multimodal interaction
The terminal isn't limited to text. It speaks and listens:
- **TTS** — 7 voices via `zai.audio.tts.create()`, played through `<audio>` in the Voice panel
- **ASR / Push-to-Talk** — browser `MediaRecorder` captures audio → `zai.audio.asr.create()` transcribes → text drops into the prompt input
- **Voice Commander** — the same mic button can route the transcript through `voice-commands.ts`, which parses spoken instructions into slash commands, mode switches, panel opens, or prompt submissions (hands-free operation)
- **Image generation** — text-to-image via z.ai; auto-falls back to local SVG when `model=zlm-1.0-local`
- **Video generation** — text-to-video with async task + polling via `zai.video.generations`
- **Local Media** — when offline (or `ZLM-1.0 Local` is active), `local-media.ts` generates SVG images, WAV beep melodies, ASCII-frame animations, and text-frame video sequences with zero API calls

### 7. Persistent context & user profile
zLM-CLI remembers. The **Memory System** stores per-user memories (fact / preference / note / context with importance); when the memory toggle is on, relevant memories are injected into the system prompt. The **Memory Mechanism** (`memory-mechanism.ts`) auto-extracts memories from conversation turns via GLM, scores each one's importance (1–5), and a decay pass prunes low-value entries over time — so the memory store stays fresh without manual curation. The **Profile + Login** flow auto-creates a profile on first API-key login and tracks plan + credits. The **Dashboard** ties it together with profile, usage stats, billing, and toggles for internet access and memory injection. **Conversation Manager** (`/save`, `/load <id>`) persists chat history to Prisma. **Task Manager** (`/tasks`) tracks todos with priorities, statuses, and tags.

### 8. Built-in security, code quality & privacy
zLM-CLI doesn't just generate code — it audits it and respects your data. The **Security Scanner** (`security-scanner.ts`) walks every source file in `src/` and applies 20+ OWASP Top 10 RegExp rules, flagging hardcoded secrets, SQL injection, XSS, SSRF, weak crypto, CORS issues, and more. Findings are severity-tagged (critical / high / medium / low / info) and surface in the Sec panel, the `/security` slash command, or `make security` from the CLI. The Makefile's `make test` target runs lint + type-check as a pre-commit gate, so quality is enforced at three layers: at write time (lint), at scan time (OWASP), and at submit time (CI). The **Privacy module** (`privacy.ts`) implements GDPR rights: data inventory (Article 15), JSON export (Article 20), and full erasure (Article 17) across every user-scoped Prisma table.

## Success criteria

zLM-CLI succeeds when:

- A developer can describe a feature and get a **structured plan** in under 30 seconds
- Clicking "execute phase" on a plan produces **copy-pasteable code** for that phase
- Switching a **skill** visibly changes the *shape* of the response (e.g. security-audit → severity tags)
- An **agent** can reproduce a bug, isolate it, write a failing test, and ship a fix — all autonomously
- A **workflow** can chain `architect → frontend-dev → backend-dev → tester → reviewer` and produce a coherent multi-file deliverable
- A user can **talk to the terminal** (push-to-talk) and hear GLM's response spoken back
- A user can **pay for credits** via PromptPay QR (or mock checkout) and see the credits land in their profile
- A team lead can **gate the API** behind keys + RBAC roles and trust that no single user can exceed their quota or access an unpermitted route
- Switching to **ZLM-1.0 Local** keeps the terminal usable when the network or API quota is down — and `local-media.ts` still produces SVG images, WAV melodies, ASCII animations, and text-frame video offline
- A user can say **"open permissions"**, **"switch to debug mode"**, or **"generate a code-reviewer prompt"** out loud and the Voice Commander routes it correctly
- Running `/security` (or `make security`) surfaces real vulnerabilities in the codebase with severity tags and file:line locations — and the user can ask GLM to draft a fix
- The **Memory Mechanism** auto-extracts useful facts across turns without bloating the store (low-importance entries decay away)
- The user can **save and reload** a conversation (`/save`, `/load <id>`) and pick up exactly where they left off
- The user can **manage tasks** (`/tasks`) with priorities and statuses alongside the chat that produced them
- The user can **inspect, export, or erase** all their personal data via `/privacy` (GDPR rights 15 / 20 / 17)
- The user can **connect Google Drive / Gmail / Outlook** and list/search/read items in the Connectors hub
- The user can **tune 25+ settings** (`/settings`) across workspace, safety, editor, visual, and performance

## Non-goals

zLM-CLI is **not**:
- An IDE replacement (it doesn't edit files on disk — yet)
- A general-purpose chatbot (it's tuned for coding)
- A model training/fine-tuning platform
- A multi-tenant SaaS (it's a single-instance app with optional key gating)

## Evolution path

See [ROADMAP.md](ROADMAP.md) for the milestone plan. The trajectory is: structured plans → virtual filesystem → live preview → agent tool-use → collaboration → deployment.

---

*This blueprint is the source of truth for "should we build this?" decisions. When in doubt, refer back to the eight pillars.*
