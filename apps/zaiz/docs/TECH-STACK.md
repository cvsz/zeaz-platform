# TECH STACK

> Every technology in zLM-CLI, what it does, and why it was chosen.

## Core framework

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **Next.js** | 16.1+ | Web framework (App Router) | Server-side API routes for AI logic, React Server Components, file-based routing. The only user-visible route is `/`. |
| **React** | 19 | UI library | Concurrent rendering, hooks. The terminal is a single client component (`"use client"`) with rich state. |
| **TypeScript** | 5 | Type safety | Strict typing throughout. Client-safe vs server-only types are split across files to enforce the SDK boundary. |

## Styling & UI

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **Tailwind CSS** | 4 | Utility-first styling | Design-token system in `globals.css` (glassmorphism, gradient borders, glow effects, animations). Mobile-first responsive. |
| **shadcn/ui** | New York | Component library | Full component set in `src/components/ui/` (button, dialog, tabs, etc.). Prefered over building from scratch. |
| **lucide-react** | 0.525 | Icons | Tree-shakeable icon set. Resolved by name via `icon.tsx` so registries stay icon-agnostic. |
| **tw-animate-css** | 1.0 | Animation utilities | Base animations layered with custom keyframes in `globals.css`. |
| **tailwind-merge** | 3 | Class deduplication | Powers the `cn()` helper for conditional class merging. |
| **clsx** | 2 | Conditional classes | Paired with `tailwind-merge` in `cn()`. |

## AI & streaming

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **z-ai-web-dev-sdk** | 0.0.18 | zLM 1.0 model access | Server-only. Provides `chat.completions.create({ stream: true })`. Returns raw SSE byte stream — parsed by `parseSseStream()` in `glm.ts`. Also exposes `audio.tts.create`, `audio.asr.create`, `images.generate`, `videos.generate`, and `functions.invoke("web_search" / "page_reader")`. **20 cloud models + 1 local (`ZLM-1.0 Local`)** = 21 total. |
| **zai.audio.tts.create()** | (SDK) | Text-to-speech | 7 voices (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo) covering EN/TH/ZH personas. Used by `src/lib/voice.ts` and `/api/voice?action=tts`. |
| **zai.audio.asr.create()** | (SDK) | Speech-to-text | Transcribes audio uploaded from the browser `MediaRecorder`. Used by `/api/voice?action=asr` for push-to-talk. |
| **MediaRecorder API** | (browser) | Audio capture | Client-side microphone capture for ASR push-to-talk. Audio chunks are sent as multipart to `/api/voice?action=asr`. |
| **PromptPay (EMVCo QR)** | (local) | Thai QR payments | Self-contained QR payload generator (`src/lib/promptpay.ts`) — Tag 29 + CRC-16 Tag 63. No external payment gateway needed. |
| **Agent Workflows (DAG)** | (local) | Multi-agent orchestration | `src/lib/workflows.ts` + `workflow-runner.ts` walks a dependency graph of agents in topological order. 3 presets: Full-Stack Feature, Bug Fix Pipeline, Code Quality. |
| **OWASP Security Scanner** | (local) | Static vulnerability scanning | `src/lib/security-scanner.ts` runs 20+ RegExp rules across every source file in `src/`, flagging hardcoded secrets, SQL injection, XSS, SSRF, weak crypto, CORS issues, etc. Findings are severity-tagged (critical / high / medium / low / info). Exposed via `/api/security`, `make security`, and the Security panel. |
| **Voice Commander** | (browser + SDK) | Hands-free command dispatch | The mic button in the input bar captures audio via the `MediaRecorder` API, sends it to `zai.audio.asr.create()` for transcription, then `src/lib/voice-commands.ts` (client-safe) parses the transcript into a slash command, mode switch, panel open, or prompt submission. |
| **Local Media Generator** | (local) | Offline SVG / WAV / ASCII / video | `src/lib/local-media.ts` (ZLM-1.0 Local) generates SVG images (palette-detected), WAV beep melodies, ASCII-frame animations, and text-frame video sequences with zero API calls. Used when the active model is `ZLM-1.0 Local` or when the internet toggle is off. |
| **GLM Prompt/Agent Generators** | (SDK) | AI-assisted authoring | `src/lib/prompt-gen.ts` and `src/lib/agent-gen.ts` ask GLM to emit a structured JSON object (prompt: title + systemPrompt + userTemplate + tips; agent: planner/executor prompts + maxSteps) from a one-line description. Streams via `/api/prompt-gen` and `/api/agent-gen`. |
| **react-markdown** | 10 | Markdown rendering | Renders GLM's markdown output. GFM plugin adds tables/strikethrough/task-lists. |
| **remark-gfm** | 4 | GFM support | Tables, autolinks, strikethrough for markdown. |
| **react-syntax-highlighter** | 15 | Code highlighting | Prism-based syntax highlighting with the `oneDark` theme, tuned for the terminal palette. |

## Data & state

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **Prisma ORM** | 6.11 | Database access | PostgreSQL client. Schema in `prisma/schema.prisma`. **10 models**: `User`, `Post`, `ApiKey`, `PaymentOrder`, `Role`, `ApiKeyRole`, `UserProfile`, `UsageRecord`, `Memory`, `Invoice`. |
| **@prisma/client** | 6.11 | Generated client | Auto-generated from schema. Singleton via `src/lib/db.ts`. |
| **PostgreSQL** | (system) | Database | File-based at `postgresql://localhost:5432/glm_cli`. No external DB process needed. |
| **React hooks** | (built-in) | Client state | `useState`/`useCallback`/`useRef`/`useEffect`. No external state library — the terminal is a single component tree. |
| **localStorage** | (browser) | Active API key | Stores the active `X-API-Key` so it persists across reloads. |

## Forms & interaction

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **react-hook-form** | 7 | Form management | Available for complex forms (currently the terminal uses controlled inputs). |
| **zod** | 4 | Schema validation | Available for runtime validation (used conceptually in `plan.ts`'s `parsePlan()`). |
| **@hookform/resolvers** | 5 | Zod resolver | Bridges react-hook-form and zod. |
| **cmdk** | 1 | Command palette | Available for `Cmd+K` palette (roadmap). |
| **sonner** | 2 | Toast notifications | Available via `<Toaster />` in the layout. |
| **vaul** | 1 | Drawer component | Mobile sidebar drawer. |

## Visualization & rich UI

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **framer-motion** | 12 | Animations | Available for advanced transitions (currently CSS animations are used for the terminal). |
| **recharts** | 2 | Charts | Available for usage analytics (roadmap: token/cost meter). |
| **@tanstack/react-table** | 8 | Data tables | Available for key management tables. |
| **@tanstack/react-query** | 5 | Server state | Available for caching API key list (currently direct fetch). |
| **react-resizable-panels** | 3 | Resizable panels | Available for adjustable sidebar width. |
| **embla-carousel-react** | 8 | Carousels | Available (unused currently). |

## Radix UI primitives (via shadcn/ui)

The full set of `@radix-ui/react-*` packages power the shadcn/ui components:

`accordion`, `alert-dialog`, `aspect-ratio`, `avatar`, `checkbox`, `collapsible`, `context-menu`, `dialog`, `dropdown-menu`, `hover-card`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `slider`, `slot`, `switch`, `tabs`, `toast`, `toggle`, `toggle-group`, `tooltip`.

## Auth & crypto

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **next-auth** | 4 | Authentication | Available for user auth (currently API keys are used for access control). |
| **Node.js crypto** | (built-in) | Key hashing | `createHash("sha256")` for API key hashing. `randomBytes` for key generation. |
| **next-themes** | 0.4 | Dark/light mode | Available (the terminal is dark-only by design). |
| **next-intl** | 4 | Internationalization | Available for i18n (currently English-only). |

## Build & tooling

| Tech | Version | Role | Why |
| --- | --- | --- | --- |
| **Bun** | latest | Runtime + package manager | Fast install, runs `next dev` + scripts. Used by the Makefile. |
| **ESLint** | 9 | Linting | `eslint-config-next` + project rules. The quality gate (`make lint`). |
| **PostCSS** | (via @tailwindcss/postcss) | CSS processing | Tailwind 4 integration. |
| **sharp** | 0.34 | Image optimization | Next.js image optimization. |

## Infrastructure

| Tech | Role | Why |
| --- | --- | --- |
| **Caddy** | Gateway (port 81 → 3000) | Reverse proxy with `XTransformPort` query support for mini-services on other ports. Config in `Caddyfile`. |
| **Make** | Build lifecycle | `make install/start/stop/restart/status/logs/lint/clean/db-push/db-generate/db-reset/check-os/check-deps/build/package/security/test` — **17 user-facing targets**, cross-platform (macOS / Linux / WSL auto-detected). Manages the dev server as a background process via `setsid`. |
| **scripts/** | Validation | **4 shell scripts**: `tech-stack-scaner.sh` (scan runtime/deps/framework/routes/components), `validate-env.sh` (validate `.env` / `.z-ai-config` / `node_modules` / DB / Prisma), `validate-network.sh` (test localhost / z.ai API / npm / GitHub / DNS), `validate-workers.sh` (check dev server / mini-services / PIDs / processes). |
| **PostgreSQL** | Database | Embedded, file-based at `postgresql://localhost:5432/glm_cli`. No external DB process. |
| **.dev/** | Runtime state | `server.pid`, `mini-services.pids`, `key-config.json` (the `requireKey` toggle). |
| **settings.json** | Global config | 25+ workspace / safety / editor / visual / performance options. Read/written by `settings.ts` + `/api/settings`. |

## Dev dependencies

| Tech | Version | Role |
| --- | --- | --- |
| `@tailwindcss/postcss` | 4 | PostCSS plugin for Tailwind |
| `@types/react` / `@types/react-dom` | 19 | TypeScript types |
| `bun-types` | 1.3 | Bun runtime types |
| `eslint` | 9 | Linter |
| `eslint-config-next` | 16 | Next.js ESLint rules |
| `tailwindcss` | 4 | Core Tailwind |
| `tw-animate-css` | 1.3 | Animation utilities |
| `typescript` | 5 | TypeScript compiler |

## Dependency graph (high level)

```
Next.js 16
├── React 19
├── Tailwind CSS 4
│   ├── shadcn/ui (New York) — 45+ components
│   │   └── @radix-ui/react-* (20+ packages)
│   ├── lucide-react
│   └── tailwind-merge + clsx
├── z-ai-web-dev-sdk (server-only)
│   ├── chat.completions.create (zLM 1.0 streaming, 20 cloud models)
│   ├── audio.tts.create (7-voice TTS)
│   ├── audio.asr.create (speech-to-text)
│   ├── images.generate (text-to-image)
│   ├── videos.generate (text-to-video, polling)
│   └── functions.invoke("web_search" / "page_reader")
├── local-model.ts (ZLM-1.0 Local offline heuristic engine)
├── local-media.ts (offline SVG / WAV / ASCII / frames)
├── PromptPay (local EMVCo TLV QR + CRC16-CCITT)
├── Payment Gateway (4 plans: Starter $0 / Pro $19 / Team $49 / Enterprise $199)
├── Agent Workflows (DAG runner, 3 presets)
├── OWASP Security Scanner (20+ RegExp rules, local)
├── Voice Commander (MediaRecorder + ASR + voice-commands.ts parser)
├── GLM Prompt + Agent Generators (prompt-gen.ts + agent-gen.ts)
├── Memory Mechanism (GLM auto-extraction + importance 1–5 + 30-day decay)
├── GDPR Privacy (privacy.ts — inventory + JSON export + erase)
├── Cloud Connectors (gdrive.ts + gmail.ts + outlook.ts, OAuth2 ready)
├── Task Manager (tasks.ts) + Conversation Manager (conversations.ts)
├── Settings (settings.json, 25+ options)
├── Prisma 6 + @prisma/client
│   └── PostgreSQL (10 models: User, Post, ApiKey, PaymentOrder, Role,
│              ApiKeyRole, UserProfile, UsageRecord, Memory, Invoice)
├── react-markdown + remark-gfm
├── react-syntax-highlighter (Prism, oneDark)
├── framer-motion
├── next-auth (available)
├── next-themes (available)
├── sonner (toasts)
└── vaul (drawer)
```

## Version policy

- **Next.js**: Stay on 16+ (App Router required). No downgrade.
- **React**: Stay on 19+ (concurrent features used).
- **TypeScript**: Stay on 5+ (strict mode).
- **z-ai-web-dev-sdk**: Track latest (chat + audio + image + video + functions streaming behaviors are stable).
- **Prisma**: Track 6+ (PostgreSQL provider). Schema has 10 models.
- **PromptPay**: The EMVCo QR spec is stable; CRC16-CCITT implementation is local and frozen.
- **OWASP scanner**: RegExp-based (no AST parsing) — cheap and stable. New rules added to `security-scanner.ts` as new vulnerability patterns emerge.
- **Voice Commander**: Depends on the same `MediaRecorder` + `zai.audio.asr.create()` building blocks as push-to-talk; transcript parsing is client-side and pure-functional in `voice-commands.ts`.
- **Local model**: `local-model.ts` heuristic engine and `local-media.ts` SVG/WAV/ASCII generators must stay offline — no SDK calls.
- **Cloud connectors**: Drive/Gmail/Outlook ship in mock mode by default; real OAuth2 is a config flip.
- All other deps: Dependabot handles minor/patch weekly; Next.js and TypeScript majors are ignored to avoid breaking changes.

---

For how these pieces fit together, see [ARCHITECTURE.md](ARCHITECTURE.md) and [SYSTEM-ARCHITECTURE-DIAGRAM.md](SYSTEM-ARCHITECTURE-DIAGRAM.md).
