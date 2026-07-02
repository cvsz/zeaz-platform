"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TerminalSquare,
  Trash2,
  Info,
  ChevronDown,
  Square,
  CornerDownLeft,
  Zap,
  PanelLeft,
  Sparkles,
  Plug,
  Workflow,
  Bot,
  ClipboardList,
  KeyRound,
  Image as ImageIcon,
  LayoutDashboard,
  Mic,
  Loader2,
} from "lucide-react";
import { Markdown } from "./markdown";
import { AgentView } from "./agent-view";
import { PlanView } from "./plan-view";
import { ModelSelector } from "./model-selector";
import { Sidebar, type SidebarTab } from "./sidebar";
import { CLI_MODES, type CliMode } from "@/lib/zlm-modes";
import { SKILLS, type SkillId } from "@/lib/skills";
import { MODULES, type ModuleId } from "@/lib/modules";
import { AGENTS, type AgentId, type AgentStepState, type PlanStep } from "@/lib/agents";
import type { CodingPlan, PlanPhase } from "@/lib/plan";
import { DEFAULT_MODEL_ID, MODELS } from "@/lib/models";
import { getActiveKey } from "@/lib/api-keys-client";
import { parseVoiceCommand } from "@/lib/voice-commands";
import {
  describePipeline,
  pipelineSummary,
  type PipelineConfig,
} from "@/lib/connector";
import { cn } from "@/lib/utils";

interface TerminalEntry {
  id: string;
  kind: "user" | "assistant" | "system" | "agent" | "plan";
  content: string;
  mode?: CliMode;
  streaming?: boolean;
  error?: boolean;
  // agent-specific
  agentName?: string;
  agentGoal?: string;
  agentPlan?: PlanStep[] | null;
  agentSteps?: AgentStepState[];
  agentDone?: boolean;
  agentError?: string | null;
  // plan-specific
  planTask?: string;
  planData?: CodingPlan | null;
  planProgress?: boolean[][];
  planError?: string | null;
  executingPhaseId?: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_BANNER = `
 ██████╗ ██╗     ██╗      ██████╗ ██████╗ ███████╗███╗   ██╗
 ██╔══██╗██║     ██║     ██╔═══██╗██╔══██╗██╔════╝████╗  ██║
 ██████╔╝██║     ██║     ██║   ██║██████╔╝█████╗  ██╔██╗ ██║
 ██╔═══╝ ██║     ██║     ██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║
 ██║     ██║     ██║     ╚██████╔╝██║  ██║███████╗██║ ╚████║
 ╚═╝     ╚═╝     ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
`;

const ABOUT_TEXT = `**zLM-CLI** — a full-stack coding terminal powered by the z.ai **zLM 1.0** model, extended with **Skills**, **Modules**, **Agents**, a **Connector** pipeline, and **Coding Plan**.

- **Stack**: Next.js 16 (App Router) · TypeScript · Tailwind CSS · z-ai-web-dev-sdk
- **Backend**: \`/api/cli\` (single-turn) + \`/api/agent\` (multi-step) + \`/api/plan\` (structured plans)
- **Modes**: \`/chat\` \`/explain\` \`/debug\` \`/generate\` \`/review\` \`/optimize\`
- **Skills**: ${SKILLS.length} expert personas — \`/skills\` or use the sidebar
- **Modules**: ${MODULES.length} context tools — \`/modules\` or use the sidebar
- **Agents**: ${AGENTS.length} multi-step agents — \`/agent <goal>\`
- **Coding Plan**: \`/plan <task>\` generates a structured implementation roadmap (phases → files → steps) you can check off and execute phase-by-phase
- **Connector**: composes \`[mode]+[skill]+[modules]+[workspace]+[agent]\` → zLM 1.0
- **Models**: ${MODELS.length} GLM models in the header dropdown — \`/model\` to list, \`/model <id>\` to switch
- **API Keys**: \`/keys\` to generate rate-limited access keys and toggle the require-key gate
- **Media Studio**: \`/media\` for AI image + video generation (text-to-image, text-to-video)
- **Admin Panel**: \`/admin\` for dashboard stats, key management, and system config
- **MCP CLI Connector**: \`/mcp\` for allowlisted shell commands (git, build, lint, docker) — no raw shell access
- **Payment Gateway**: \`/pay\` for plans, checkout, and credits
- **Web Search**: \`/search\` for live web results + page reader
- **Research Tools**: \`/research\` to read + summarize web pages with GLM
- **Sandbox**: \`/sandbox\` for safe isolated JS execution
- **Permissions**: \`/permissions\` for role-based access control (RBAC)
- **Dashboard**: \`/dashboard\` for profile, usage, billing, and internet/memory toggles
- **Memory**: \`/memory\` for persistent facts + context per user
- **Login**: \`/login <api-key>\` to authenticate; \`/logout\` to clear
- **Voice**: \`/voice\` for text-to-speech (7 voices) + push-to-talk (speech-to-text)
- **Workflows**: \`/workflow\` for multi-agent DAGs (architect → generate → review → test)
- **PromptPay**: \`/promptpay\` for Thai QR payment code generation
- **Generators**: \`/gen-prompt\` and \`/gen-agent\` — AI-powered prompt + agent creation
- **Voice Commander**: mic button in the input bar — speak commands like "switch to debug", "open dashboard", "clear"
- **Local Media Model**: ZLM-1.0 Local generates images (SVG), audio (WAV), animations (ASCII) offline
- **Memory Mechanism**: auto-extracts facts from conversations and injects them into prompts
- **Security Scanner**: \`/security\` — OWASP Top 10 vulnerability scanner (20+ rules)
- **Settings**: \`/settings\` — advanced customization (workspace, safety, editor, visual, performance via \`settings.json\`)
- **Task Manager**: \`/tasks\` — create, track, and complete project tasks
- **Conversation Manager**: \`/save\` and \`/load <id>\` — save and load conversations
- **Connectors**: \`/connectors\` — Google Drive, Gmail, Outlook/Live Mail integration
- **Data & Privacy**: \`/privacy\` — GDPR data inventory, export, and right to erasure
- **Validation Scripts**: \`scripts/tech-stack-scaner.sh\`, \`validate-env.sh\`, \`validate-network.sh\`, \`validate-workers.sh\`
- **Shortcuts**: \`↑/↓\` history · \`Enter\` send · \`Shift+Enter\` newline · \`Ctrl+L\` clear

Type \`/help\` to see all commands, or open the sidebar (top-left) to browse Skills & Modules.`;

const HELP_TEXT = `**Available commands**

| Command | Action |
| --- | --- |
| \`/help\` | Show this help screen |
| \`/features\` | Show the complete feature inventory |
| \`/clear\` | Clear the terminal |
| \`/about\` | About zLM-CLI |
| \`/mode\` | Show the active mode |
| \`/chat\` \`/explain\` \`/debug\` \`/generate\` \`/review\` \`/optimize\` | Switch mode (or append a prompt) |
| \`/skills\` | List all skills |
| \`/skill <id>\` | Activate a skill (e.g. \`/skill code-review\`) |
| \`/skill off\` | Deactivate the current skill |
| \`/skill <id> <prompt>\` | Run one prompt with a skill |
| \`/modules\` | List all modules |
| \`/module <id>\` | Toggle a module on/off |
| \`/module off\` | Deactivate all modules |
| \`/agent\` | Show agent status / toggle agent mode on |
| \`/agent <type>\` | Select an agent: \`architect\` \`bug-hunter\` \`refactorer\` |
| \`/agent off\` | Turn agent mode off |
| \`/agent <goal>\` | Run the active agent on a goal |
| \`/connect code <paste>\` | Connect a code snippet as workspace context |
| \`/connect show\` | Show the connected workspace |
| \`/disconnect\` | Clear the connected workspace |
| \`/pipeline\` | Show the active pipeline composition |
| \`/model\` | List all available GLM models |
| \`/model <id>\` | Switch model (e.g. \`/model zlm-4.5-flash\`) — or use the header dropdown |
| \`/keys\` | Open the API Keys panel (generate, rate-limit, revoke) |
| \`/media\` | Open the Media Studio (image + video generation) |
| \`/admin\` | Open the Admin Control Panel (dashboard, stats, key management) |
| \`/mcp\` | Open the MCP CLI Connector (allowlisted shell commands) |
| \`/pay\` | Open the Payment Gateway (plans, checkout, credits) |
| \`/search\` | Open Web Search (live results + page reader) |
| \`/research\` | Open Research Tools (read + summarize web pages) |
| \`/sandbox\` | Open the Sandbox (safe JS execution) |
| \`/permissions\` | Open Permissions (role-based access control) |
| \`/dashboard\` | Open the Dashboard (profile, usage, billing overview) |
| \`/memory\` | Open the Memory System (persistent facts per user) |
| \`/login <api-key>\` | Login with an API key (creates profile) |
| \`/logout\` | Clear the active API key |
| \`/voice\` | Open Voice (text-to-speech + push-to-talk ASR) |
| \`/workflow\` | Open Agent Workflows (multi-agent DAGs) |
| \`/promptpay\` | Open PromptPay QR generator (Thai payments) |
| \`/gen-prompt\` | Open the Prompts Generator (AI-powered prompt creation) |
| \`/gen-agent\` | Open the Agents Generator (AI-powered agent creation) |
| \`/security\` | Open the Security Scanner (OWASP Top 10 vulnerability scan) |
| \`/settings\` | Open Settings (workspace, safety, editor, visual, performance) |
| \`/tasks\` | Open the Task Manager (create, track, complete tasks) |
| \`/conversations\` | Open Conversation Manager (save, load, delete chats) |
| \`/connectors\` | Open Connectors (Google Drive, Gmail, Outlook) |
| \`/privacy\` | Open Data & Privacy (GDPR: export, delete, inventory) |
| \`/save\` | Save the current conversation |
| \`/load <id>\` | Load a saved conversation |
| \`/plan <task>\` | Generate a structured GLM Coding Plan (phases → files → steps) |
| \`/plan\` | Show plan-mode status & usage |

**Tips**
- Slash commands run locally; everything else is sent to zLM 1.0.
- Append text after a mode/skill/agent command to run it in one shot.
- \`/plan <task>\` renders an interactive roadmap — check off steps and click **execute phase** to generate each phase's code.
- Open the sidebar to browse & toggle Skills, Modules, and the Pipeline visually.`;

const EXAMPLE_PROMPTS: { mode: CliMode; text: string }[] = [
  { mode: "generate", text: "Write a debounce hook in React with TypeScript" },
  { mode: "debug", text: "Why does my useEffect run twice in development?" },
  { mode: "explain", text: "Explain how JavaScript's event loop works" },
  { mode: "review", text: "Review: function sum(a,b){return a+b}" },
  { mode: "optimize", text: "Optimize: O(n²) duplicate finder in an array" },
  { mode: "chat", text: "Compare PostgreSQL vs MongoDB for a SaaS app" },
];

const PLAN_EXAMPLES: string[] = [
  "Build a JWT auth system with login, signup, and protected routes in Next.js",
  "Create a rate-limited REST API for a URL shortener with Redis",
  "Add dark mode to an existing React app with a theme toggle and persistence",
  "Set up a CI/CD pipeline with GitHub Actions for a TypeScript library",
];

let idCounter = 0;
const uid = () => `e${++idCounter}`;

function modeMeta(mode: CliMode) {
  return CLI_MODES.find((m) => m.id === mode)!;
}

export function Terminal() {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CliMode>("chat");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showJump, setShowJump] = useState(false);

  // New pipeline state
  const [activeSkill, setActiveSkill] = useState<SkillId | null>(null);
  const [activeModules, setActiveModules] = useState<ModuleId[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("skills");

  // Voice commander state
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const voiceMediaRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const stickRef = useRef(true);

  const pipeline: PipelineConfig = useMemo(
    () => ({
      mode,
      skill: activeSkill,
      modules: activeModules,
      workspace,
      agent: activeAgent,
    }),
    [mode, activeSkill, activeModules, workspace, activeAgent],
  );

  const pipelineSummaryText = useMemo(
    () => pipelineSummary(pipeline),
    [pipeline],
  );

  // Seed welcome message on mount.
  useLayoutEffect(() => {
    setEntries([
      { id: uid(), kind: "system", content: WELCOME_BANNER },
      { id: uid(), kind: "system", content: ABOUT_TEXT },
    ]);
  }, []);

  // Auto-resize the textarea.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 168) + "px";
  }, [input]);

  // Track whether the user is pinned to the bottom.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distance < 80;
    setShowJump(distance > 240);
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    stickRef.current = true;
    setShowJump(false);
  }, []);

  useEffect(() => {
    if (stickRef.current) {
      scrollToBottom();
    }
  }, [entries, scrollToBottom]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /** Build fetch headers, injecting the active API key if one is set. */
  const authHeaders = useCallback(
    (extra: Record<string, string> = {}) => {
      const key = getActiveKey();
      const h: Record<string, string> = { ...extra };
      if (key) h["X-API-Key"] = key;
      return h;
    },
    [],
  );

  const pushEntry = useCallback((entry: TerminalEntry) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<TerminalEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }, []);

  /* ---------------- pipeline mutators ---------------- */

  const toggleSkill = useCallback(
    (id: SkillId) => {
      setActiveSkill((cur) => (cur === id ? null : id));
    },
    [],
  );

  const toggleModule = useCallback((id: ModuleId) => {
    setActiveModules((cur) =>
      cur.includes(id) ? cur.filter((m) => m !== id) : [...cur, id],
    );
  }, []);

  const toggleAgent = useCallback((id: AgentId) => {
    setActiveAgent((cur) => (cur === id ? null : id));
  }, []);

  const clearWorkspace = useCallback(() => setWorkspace(null), []);

  const openSidebar = useCallback((tab: SidebarTab) => {
    setSidebarTab(tab);
    setSidebarOpen(true);
  }, []);

  const runPlanRef = useRef<((task: string) => Promise<void>) | null>(null);
  const runAgentRef = useRef<((goal: string, agentType: AgentId) => Promise<void>) | null>(null);

  /* ---------------- local slash commands ---------------- */

  const runLocalCommand = useCallback(
    (raw: string): boolean => {
      const trimmed = raw.trim();
      const tokens = trimmed.split(/\s+/);
      const cmd = (tokens[0] || "").toLowerCase();
      const rest = tokens.slice(1).join(" ");

      switch (cmd) {
        case "/help":
          pushEntry({ id: uid(), kind: "system", content: HELP_TEXT });
          return true;
        case "/clear":
          setEntries([]);
          return true;
        case "/about":
          pushEntry({ id: uid(), kind: "system", content: ABOUT_TEXT });
          return true;
        case "/features": {
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**zLM-CLI — Complete Feature Inventory**

**Core AI**
- 6 CLI modes (chat, explain, debug, generate, review, optimize)
- 10 expert Skills (code-review, refactor, add-tests, security-audit, etc.)
- 8 context Modules (filesystem, git, npm, regex, http, json, sql, docker)
- 3 multi-step Agents (architect, bug-hunter, refactorer)
- Connector pipeline: \`[mode]+[skill]+[modules]+[workspace]+[agent]\` → zLM 1.0
- 20 GLM models + 1 local model (ZLM-1.0 Local — offline, no API)
- Token-by-token streaming (NDJSON + SSE parsing)
- Structured Coding Plans (phases → files → steps, risks, acceptance)
- Agent Workflows (multi-agent DAGs: full-stack, bug-fix, code-quality)

**Voice & Media**
- Text-to-Speech (7 voices: tongtong, chuichui, xiaochen, jam, kazi, douji, luodo)
- Push-to-Talk / ASR (speech-to-text via MediaRecorder)
- Voice Commander (speak commands → parse → route)
- Image generation (z.ai API + local SVG offline)
- Video generation (async task + polling)
- Local media model (SVG art, WAV melodies, ASCII animations)

**Payments & Billing**
- Payment Gateway (4 plans: Starter/Pro/Team/Enterprise)
- PromptPay QR generator (Thai EMVCo QR with CRC16)
- Billing system (invoices, plan-based limits, credits)
- API key rate limiting (sliding 1-hour window)

**User & Access**
- API Keys (sha256-hashed, CRUD, rate limits, require-key gate)
- User Profiles (login via API key, plan, credits, tokens)
- RBAC Permissions (13 permission keys, 4 role presets)
- Dashboard (profile, usage stats, billing, toggles)
- Internet on/off toggle per user
- Memory on/off toggle per user

**Memory & Context**
- Memory system (fact/preference/note/context, importance 1-5)
- Auto-extraction (GLM scans conversations, stores persistent facts)
- Context injection (memories composed into system prompt)
- Decay pruning (low-importance memories pruned after 30 days)

**Tools & Research**
- Web Search (live results via z.ai SDK)
- Page Reader (extract content from any URL)
- Research Tools (read + GLM-powered summarization)
- Sandbox (safe isolated JS execution, allowlisted builtins)
- MCP CLI Connector (allowlisted shell commands, approval gate)
- Security Scanner (20+ OWASP Top 10 rules)

**Generators**
- Prompts Generator (GLM creates optimized system prompts)
- Agents Generator (GLM creates custom agent definitions)

**Connectors**
- Google Drive (list, search, read files — OAuth2 ready)
- Google Gmail (list, search, read emails)
- Outlook / Live Mail (list, search, read via Microsoft Graph)

**Data & Privacy (GDPR)**
- Data inventory (see all stored data per user)
- Export all data as JSON (right to portability)
- Delete all data (right to erasure)

**Management**
- Task Manager (create, track, complete — priorities, statuses, tags)
- Conversation Manager (save, load, delete conversations)
- Settings (\`settings.json\` — workspace, safety, editor, visual, performance)
- Admin Control Panel (dashboard, stats, key management, registry)

**Build & Validation**
- Cross-platform Makefile (macOS/Linux/WSL detection)
- \`make install/start/stop/restart/status/build/package/security/test\`
- Validation scripts: \`tech-stack-scaner.sh\`, \`validate-env.sh\`, \`validate-network.sh\`, \`validate-workers.sh\`

**Counts**
- **32** API routes
- **41** lib files
- **29** terminal components
- **24** sidebar tabs
- **43+** slash commands
- **20+1** models (20 cloud GLM + 1 local)
- **10** Prisma models
- **14** documentation files`,
          });
          return true;
        }
        case "/mode":
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Active mode: **\`${mode}\`** — ${modeMeta(mode).description}`,
          });
          return true;
        case "/skills":
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Skills** (${SKILLS.length})\n\n${SKILLS.map(
              (s) =>
                `- \`/skill ${s.id}\` — **${s.name}**: ${s.tagline}${
                  activeSkill === s.id ? " *(active)*" : ""
                }`,
            ).join("\n")}`,
          });
          return true;
        case "/skill": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Usage: \`/skill <id>\` or \`/skill <id> <prompt>\` or \`/skill off\`. Active: **${
                activeSkill ?? "none"
              }**`,
            });
            return true;
          }
          if (arg === "off") {
            setActiveSkill(null);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Skill deactivated. Mode **\`${mode}\`** remains active.`,
            });
            return true;
          }
          const first = arg.split(/\s+/)[0];
          const promptRest = arg.slice(first.length).trim();
          const skill = SKILLS.find((s) => s.id === first);
          if (!skill) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Unknown skill \`${first}\`. Try \`/skills\` to list them.`,
            });
            return true;
          }
          setActiveSkill(skill.id);
          if (promptRest) {
            pushEntry({
              id: uid(),
              kind: "user",
              content: promptRest,
              mode,
            });
            void runCompletion(promptRest);
            return true;
          }
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Skill **\`${skill.id}\`** activated. ${skill.tagline}.`,
          });
          return true;
        }
        case "/modules":
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Modules** (${MODULES.length})${
              activeModules.length
                ? ` · active: ${activeModules.map((m) => `\`${m}\``).join(", ")}`
                : ""
            }\n\n${MODULES.map(
              (m) =>
                `- \`/module ${m.id}\` — **${m.name}**: ${m.tagline}${
                  activeModules.includes(m.id) ? " *(active)*" : ""
                }`,
            ).join("\n")}`,
          });
          return true;
        case "/module": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Usage: \`/module <id>\` to toggle, or \`/module off\`. Active: ${
                activeModules.length
                  ? activeModules.map((m) => `\`${m}\``).join(", ")
                  : "none"
              }`,
            });
            return true;
          }
          if (arg === "off") {
            setActiveModules([]);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `All modules deactivated.`,
            });
            return true;
          }
          const mod = MODULES.find((m) => m.id === arg);
          if (!mod) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Unknown module \`${arg}\`. Try \`/modules\` to list them.`,
            });
            return true;
          }
          const willActivate = !activeModules.includes(mod.id);
          toggleModule(mod.id);
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Module **\`${mod.id}\`** ${willActivate ? "connected" : "disconnected"}.`,
          });
          return true;
        }
        case "/agent": {
          const arg = rest.trim();
          if (!arg) {
            // Toggle agent mode on (default architect) or show status.
            if (activeAgent) {
              pushEntry({
                id: uid(),
                kind: "system",
                content: `Agent mode is **on** (\`${activeAgent}\`). Use \`/agent <goal>\` to run, or \`/agent off\` to disable. Agents: ${AGENTS.map(
                  (a) => `\`${a.id}\``,
                ).join(", ")}.`,
              });
            } else {
              setActiveAgent("architect");
              pushEntry({
                id: uid(),
                kind: "system",
                content: `Agent mode **on** (\`architect\`). Type a goal and press Enter to run a plan→execute loop. Switch with \`/agent <type>\`. Types: ${AGENTS.map(
                  (a) => `\`${a.id}\``,
                ).join(", ")}.`,
              });
            }
            return true;
          }
          if (arg === "off") {
            setActiveAgent(null);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Agent mode **off**. Prompts now run as single-turn completions.`,
            });
            return true;
          }
          const first = arg.split(/\s+/)[0];
          const goalRest = arg.slice(first.length).trim();
          const agentMatch = AGENTS.find((a) => a.id === first);
          if (agentMatch) {
            setActiveAgent(agentMatch.id);
            if (goalRest) {
              pushEntry({
                id: uid(),
                kind: "user",
                content: goalRest,
                mode,
              });
              void runAgentRef.current(goalRest, agentMatch.id);
              return true;
            }
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Agent **\`${agentMatch.id}\`** selected. ${agentMatch.tagline}. Now type a goal and press Enter (or use \`/agent <goal>\`).`,
            });
            return true;
          }
          // No type matched → treat the whole arg as a goal with the active agent.
          if (activeAgent) {
            pushEntry({ id: uid(), kind: "user", content: arg, mode });
            void runAgentRef.current(arg, activeAgent);
            return true;
          }
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Unknown agent \`${first}\`. Types: ${AGENTS.map(
              (a) => `\`${a.id}\``,
            ).join(", ")}.`,
          });
          return true;
        }
        case "/connect": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Usage: \`/connect code <paste>\` to connect a code snippet as workspace context, or \`/connect show\`.`,
            });
            return true;
          }
          if (arg.startsWith("show")) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: workspace
                ? `**Connected workspace** (${workspace.length} chars):\n\n\`\`\`\n${workspace.slice(0, 2000)}${workspace.length > 2000 ? "\n…(truncated)" : ""}\n\`\`\``
                : `No workspace connected. Use \`/connect code <paste>\`.`,
            });
            return true;
          }
          if (arg.startsWith("code ")) {
            const snippet = arg.slice(5).trim();
            if (!snippet) {
              pushEntry({
                id: uid(),
                kind: "system",
                content: `No code provided. Usage: \`/connect code <paste>\`.`,
              });
              return true;
            }
            setWorkspace(snippet);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Workspace **connected** (${snippet.length} chars). It will be injected into every prompt. Use \`/disconnect\` to clear.`,
            });
            return true;
          }
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Unknown /connect target. Use \`/connect code <paste>\` or \`/connect show\`.`,
          });
          return true;
        }
        case "/disconnect":
          setWorkspace(null);
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Workspace disconnected.`,
          });
          return true;
        case "/pipeline": {
          const stages = describePipeline(pipeline);
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Active pipeline**\n\n${stages
              .map(
                (s, i) =>
                  `${i + 1}. **${s.label}** — ${s.value}${
                    s.active ? "" : " *(inactive)*"
                  }`,
              )
              .join("\n")}\n\nResolved: \`${pipelineSummaryText}\``,
          });
          return true;
        }
        case "/model": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `**Model** — current: \`${model}\`\n\nSwitch via the model dropdown in the header (top-right), or \`/model <id>\`.\n\nAvailable models:\n${MODELS.map(
                (m) =>
                  `- \`${m.id}\` — **${m.label}**: ${m.tagline}${
                    m.id === model ? " *(active)*" : ""
                  }`,
              ).join("\n")}`,
            });
            return true;
          }
          const target = MODELS.find(
            (m) => m.id === arg || m.label.toLowerCase() === arg.toLowerCase(),
          );
          if (target) {
            setModel(target.id);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `Model switched to **\`${target.id}\`** — ${target.tagline}.`,
            });
            return true;
          }
          pushEntry({
            id: uid(),
            kind: "system",
            content: `Unknown model \`${arg}\`. Run \`/model\` to list all available models.`,
          });
          return true;
        }
        case "/keys": {
          openSidebar("keys");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**API Keys** — opened the Keys panel in the sidebar.\n\n- Generate keys with a name + rate limit\n- Toggle **Require API key** to gate all backend requests\n- When enabled, every request must carry a valid \`X-API-Key\` header\n- Keys are hashed (sha256) in the DB; the raw key is shown only once at creation\n- Rate limiting is a sliding 1-hour window per key\n\nThe active key for this session is stored in localStorage and sent automatically on every request.`,
          });
          return true;
        }
        case "/media": {
          openSidebar("media");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Media Studio** — opened the Media panel in the sidebar.\n\n- **Image generation** — describe an image, pick a size, generate (returns a downloadable PNG)\n- **Video generation** — describe a scene, pick size/quality/duration, generate (polls until the video is ready, then streams it)\n\nBoth use the z.ai GLM image/video models. The active API key (if set) is sent automatically.`,
          });
          return true;
        }
        case "/admin": {
          openSidebar("admin");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Admin Control Panel** — opened the Admin dashboard.\n\n- **Stats** — key counts, total usage, rate-limit totals, registry breakdown\n- **Require-key toggle** — gate all AI endpoints behind API keys\n- **Top keys by usage** — leaderboard\n- **Key management** — revoke or delete any key\n- **Registry** — models, skills, modules, agents, modes counts\n\nUse the refresh button to reload stats.`,
          });
          return true;
        }
        case "/mcp": {
          openSidebar("mcp");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**MCP CLI Connector** — opened the MCP panel.\n\nThe AI can only request operations by name. The server resolves each to a fixed command + args and runs it with \`shell: false\` — no raw shell access.\n\n**Allowlisted commands:**\n- **Git (read):** \`git_status\`, \`git_branch\`, \`git_diff\`, \`git_log\`\n- **Build (write):** \`install\`, \`build\`\n- **Lint (read):** \`lint\`, \`typecheck\`\n- **Docker (read):** \`docker_ps\`, \`docker_compose_config\`\n\n**Security model:**\n- Read commands auto-run on click\n- Write commands show an approval gate before executing\n- Unknown commands are rejected with 403\n- Every command has a timeout (default 30s)\n\nClick any command in the panel to run it. Output streams live (stdout/stderr/exit code).`,
          });
          return true;
        }
        case "/pay": {
          openSidebar("payments");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Payment Gateway** — opened the Payments panel.\n\n- Choose a plan (Starter/Pro/Team/Enterprise)\n- Enter your email and checkout\n- Mock provider processes instantly; credits granted\n- View recent orders and revenue stats`,
          });
          return true;
        }
        case "/search": {
          openSidebar("search");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Web Search** — opened the Search panel.\n\nSearch the web live and read page content. Results include title, snippet, host, and a "read page" button to extract the full text.`,
          });
          return true;
        }
        case "/research": {
          openSidebar("research");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Research Tools** — opened the Research panel.\n\n- **Read** any web page and extract its content\n- **Summarize** the content with GLM (streamed) — optionally focus on a specific query\n\nGreat for digesting long articles or documentation.`,
          });
          return true;
        }
        case "/sandbox": {
          openSidebar("sandbox");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Sandbox** — opened the Sandbox panel.\n\nRun JavaScript in an isolated scope with safe builtins only (JSON, Math, Date, Array, console, etc.). No \`require\`, \`process\`, fs, or network. Use \`return\` for a return value. Try the example snippets.`,
          });
          return true;
        }
        case "/permissions": {
          openSidebar("permissions");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Permissions** — opened the Permissions panel.\n\nRole-based access control (RBAC). Define roles with permission sets (cli:stream, media:generate, mcp:execute, admin:manage, etc.). Assign roles to API keys to control what each key can do.\n\nPresets: admin, developer, viewer, guest.`,
          });
          return true;
        }
        case "/dashboard": {
          openSidebar("dashboard");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Dashboard** — opened the Dashboard panel.\n\nLogin with your API key to see:\n- Profile (plan, credits, tokens used)\n- Usage stats (24h / 7d, by endpoint)\n- Internet + memory toggles\n- Platform billing stats\n\nUse \`/login <api-key>\` to login from the terminal.`,
          });
          return true;
        }
        case "/memory": {
          openSidebar("memory");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Memory System** — opened the Memory panel.\n\nStore persistent facts, preferences, notes, and context per API key. Memories survive across sessions and can be injected into prompts.\n\n- Categories: fact, preference, note, context\n- Importance 1-5 (stars)\n- Clear all or delete individual memories\n\nRequires login via the Dashboard tab first.`,
          });
          return true;
        }
        case "/login": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `**Login** — usage: \`/login <api-key>\`\n\nLogs you in with an API key, creating a profile if needed. Your profile tracks plan, credits, tokens, and enables the dashboard + memory system.\n\nGenerate a key first via the Keys tab (\`/keys\`), then login here.`,
            });
            return true;
          }
          // Perform login
          pushEntry({ id: uid(), kind: "user", content: `/login ${arg.slice(0, 8)}…`, mode });
          (async () => {
            try {
              const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", apiKey: arg }),
              });
              if (!res.ok) throw new Error("Login failed");
              const profile = await res.json();
              const { setActiveKey } = await import("@/lib/api-keys-client");
              setActiveKey(arg, profile.name ?? undefined);
              pushEntry({
                id: uid(),
                kind: "system",
                content: profile.hasProfile
                  ? `**Logged in** as ${profile.name ?? "Anonymous"} (plan: ${profile.plan}, credits: ${profile.credits}). Dashboard + memory now available.`
                  : `Login failed — no profile created.`,
              });
            } catch {
              pushEntry({
                id: uid(),
                kind: "system",
                content: `**Login failed.** Check your API key and try again.`,
              });
            }
          })();
          return true;
        }
        case "/logout": {
          import("@/lib/api-keys-client").then(({ setActiveKey }) => {
            setActiveKey(null);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `**Logged out.** API key cleared from this session.`,
            });
          });
          return true;
        }
        case "/voice": {
          openSidebar("voice");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Voice** — opened the Voice panel.\n\n- **Text → Speech (TTS):** type text, pick a voice, generate audio (WAV)\n- **Push to Talk (ASR):** hold the mic button, speak, get a transcript\n\n7 voices available: tongtong, chuichui, xiaochen, jam, kazi, douji, luodo.\nSpeed range: 0.5–2.0. Max 1024 chars per TTS request.`,
          });
          return true;
        }
        case "/workflow": {
          openSidebar("workflows");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Agent Workflows** — opened the Workflows panel.\n\nMulti-agent DAGs that collaborate in sequence. Each node uses a different agent + mode and passes its output downstream.\n\n**Presets:**\n- **Full-Stack Feature** — Architect → Generate → Review → Test\n- **Bug Fix Pipeline** — Reproduce → Fix → Verify\n- **Code Quality** — Review → Refactor → Document\n\nPick a workflow, describe the task, and run. Each node streams live.`,
          });
          return true;
        }
        case "/promptpay": {
          openSidebar("promptpay");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**PromptPay** — opened the PromptPay panel.\n\nGenerate a Thai PromptPay QR code for payments. Enter a phone number (e.g. 0812345678) or National ID (13 digits), optionally an amount in THB. The QR payload follows the EMVCo TLV format with CRC16-CCITT checksum.`,
          });
          return true;
        }
        case "/gen-prompt": {
          openSidebar("generators");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Prompts Generator** — opened the Generators panel.\n\nDescribe the prompt you need and GLM generates an optimized, production-ready system prompt with:\n- Role definition + clear rules\n- Output format specification\n- A user message template with \`{placeholders}\`\n- Tips for best results\n\nTemplates: Code Reviewer, API Designer, Test Writer, Doc Writer, SQL Optimizer, Security Auditor.`,
          });
          return true;
        }
        case "/gen-agent": {
          openSidebar("generators");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Agents Generator** — opened the Generators panel (Agent tab).\n\nDescribe the agent you need and GLM generates a complete agent definition with:\n- Name, id, tagline, description\n- Planner prompt (breaks goal into steps)\n- Executor prompt (runs each step)\n- Max steps (3-8)\n\nTemplates: Data Pipeline Builder, UI Component Creator, Migration Specialist, Performance Optimizer, DevOps Automator.`,
          });
          return true;
        }
        case "/security": {
          openSidebar("security");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Security Scanner** — opened the Security panel.\n\nScans all source files for vulnerabilities using 20+ OWASP Top 10 rules:\n- **Critical**: hardcoded secrets, SQL injection, eval(), shell injection\n- **High**: XSS (dangerouslySetInnerHTML, innerHTML), SSRF, open redirects\n- **Medium**: weak crypto (MD5, Math.random), CORS wildcard, insecure headers\n- **Low**: console.log with sensitive data, security TODOs, debug mode\n- **Info**: HTTP Basic Auth\n\nClick "Run security scan" to scan the entire project.`,
          });
          return true;
        }
        case "/settings": {
          openSidebar("settings");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Settings** — opened the Settings panel.\n\nAdvanced customization via \`settings.json\`:\n- **Workspace**: default mode, model, auto-save, max history\n- **Safety**: require API key, sandbox, MCP approval, max code length\n- **Editor**: font size, tab size, word wrap, line numbers\n- **Visual**: theme, accent color, animations, glow, grid, compact mode\n- **Performance**: stream batch size, max concurrent, cache, token counting\n\nChanges are saved to \`.dev/settings.json\`.`,
          });
          return true;
        }
        case "/tasks": {
          openSidebar("tasks");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Task Manager** — opened the Tasks panel.\n\nCreate, track, and complete project tasks:\n- Priorities: low, medium, high, urgent\n- Statuses: todo, in-progress, done, blocked\n- Tags for categorization\n- Stats: total/todo/active/done/blocked\n\nTasks are saved per API key.`,
          });
          return true;
        }
        case "/conversations":
        case "/chats": {
          openSidebar("conversations");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Conversations** — opened the Conversations panel.\n\nSave and load conversations per API key:\n- \`/save\` — save the current conversation\n- \`/load <id>\` — load a saved conversation\n- View, delete, and manage saved chats\n\nConversations are stored in \`.dev/conversations/<keyHash>/\`.`,
          });
          return true;
        }
        case "/connectors":
        case "/connect": {
          openSidebar("connectors");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Connectors** — opened the Connectors panel.\n\nConnect to external services:\n- **Google Drive** — list, search, and read files\n- **Gmail** — list, search, and read emails\n- **Outlook / Live Mail** — list, search, and read emails\n\nAll connectors work in demo mode (mock data) without real credentials. To connect for real, set the appropriate environment variables (GOOGLE_CLIENT_ID, OUTLOOK_CLIENT_ID, etc.).`,
          });
          return true;
        }
        case "/privacy":
        case "/data": {
          openSidebar("privacy");
          pushEntry({
            id: uid(),
            kind: "system",
            content: `**Data & Privacy** — opened the Privacy panel (GDPR).\n\n- **Data Inventory** — see exactly what data is stored for your API key\n- **Export Data** — download all your data as JSON (right to portability)\n- **Delete All** — permanently erase all your data (right to erasure)\n\nCovers: API key, profile, usage records, memories, invoices, roles, conversations, tasks, and settings.`,
          });
          return true;
        }
        case "/save": {
          const key = getActiveKey();
          if (!key) {
            pushEntry({ id: uid(), kind: "system", content: "*(Login first to save conversations — use /login <api-key>)*" });
            return true;
          }
          // Gather current conversation entries
          const convMessages = entries
            .filter((e) => (e.kind === "user" || e.kind === "assistant") && e.content.trim())
            .slice(-50)
            .map((e) => ({ role: e.kind === "user" ? "user" : "assistant", content: e.content, mode: e.mode }));
          if (convMessages.length === 0) {
            pushEntry({ id: uid(), kind: "system", content: "*(No conversation to save yet.)*" });
            return true;
          }
          const title = convMessages[0]?.content.slice(0, 60) ?? "Untitled";
          fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-API-Key": key },
            body: JSON.stringify({ title, messages: convMessages, model, mode }),
          }).then((res) => res.json()).then((conv) => {
            pushEntry({ id: uid(), kind: "system", content: `**Saved** — "${conv.title}" (${conv.messages.length} messages). ID: \`${conv.id}\`\n\nLoad with: \`/load ${conv.id}\`` });
          }).catch(() => {
            pushEntry({ id: uid(), kind: "system", content: "*(Failed to save conversation.)*" });
          });
          return true;
        }
        case "/load": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({ id: uid(), kind: "system", content: `Usage: \`/load <conversation-id>\`\n\nList saved conversations with \`/conversations\`.` });
            return true;
          }
          const key = getActiveKey();
          if (!key) {
            pushEntry({ id: uid(), kind: "system", content: "*(Login first to load conversations.)*" });
            return true;
          }
          fetch(`/api/conversations?load=${encodeURIComponent(arg)}`, { headers: { "X-API-Key": key } })
            .then((res) => res.ok ? res.json() : Promise.reject(new Error("Not found")))
            .then((conv) => {
              setEntries(conv.messages.map((m: { role: string; content: string; mode?: string }, i: number) => ({
                id: `loaded-${i}`,
                kind: m.role === "user" ? "user" : "assistant",
                content: m.content,
                mode: m.mode,
              })));
              pushEntry({ id: uid(), kind: "system", content: `**Loaded** — "${conv.title}" (${conv.messages.length} messages, model: ${conv.model}).` });
            })
            .catch(() => {
              pushEntry({ id: uid(), kind: "system", content: `*(Conversation not found: ${arg})*` });
            });
          return true;
        }
        case "/plan": {
          const arg = rest.trim();
          if (!arg) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `**GLM Coding Plan** — generates a structured implementation roadmap (phases → files → steps, risks, acceptance) for a task.\n\nUsage: \`/plan <task description>\`\n\nExamples:\n${PLAN_EXAMPLES.map(
                (p) => `- \`/plan ${p}\``,
              ).join("\n")}\n\nThe plan respects your active pipeline (${
                activeSkill ?? "no skill"
              }, ${activeModules.length} module${
                activeModules.length === 1 ? "" : "s"
              }${workspace ? ", workspace connected" : ""}). After it renders, check off steps and click **execute phase** to generate each phase's code.`,
            });
            return true;
          }
          pushEntry({ id: uid(), kind: "user", content: arg, mode });
          void runPlanRef.current?.(arg);
          return true;
        }
        default: {
          const targetMode = CLI_MODES.find((m) => m.command === cmd)?.id;
          if (targetMode) {
            setMode(targetMode);
            if (rest) {
              pushEntry({
                id: uid(),
                kind: "user",
                content: rest,
                mode: targetMode,
              });
              void runCompletion(rest);
            } else {
              pushEntry({
                id: uid(),
                kind: "system",
                content: `Switched to **\`${targetMode}\`** mode. ${modeMeta(targetMode).hint}.`,
              });
            }
            return true;
          }
          return false;
        }
      }
    },
    [mode, activeSkill, activeModules, activeAgent, workspace, model, pipeline, pipelineSummaryText, pushEntry, toggleModule],
  );

  /* ---------------- completion (single turn) ---------------- */

  const buildMessages = useCallback(
    (currentUserText: string): ChatMessage[] => {
      const prior: ChatMessage[] = entries
        .filter(
          (e) =>
            (e.kind === "user" || e.kind === "assistant") &&
            !e.error &&
            e.content.trim().length > 0,
        )
        .slice(-12)
        .map((e) => ({
          role: e.kind === "user" ? "user" : "assistant",
          content: e.content,
        }));
      return [...prior, { role: "user", content: currentUserText }];
    },
    [entries],
  );

  const runCompletion = useCallback(
    async (userText: string) => {
      const assistantId = uid();
      pushEntry({
        id: assistantId,
        kind: "assistant",
        content: "",
        mode,
        streaming: true,
      });

      setIsStreaming(true);
      stickRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      const messages = buildMessages(userText);
      let acc = "";

      try {
        const res = await fetch("/api/cli", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            messages,
            mode,
            skill: activeSkill,
            modules: activeModules,
            workspace,
            model,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Request failed (${res.status}).`;
          try {
            const errJson = await res.json();
            if (errJson?.error) detail = errJson.error;
          } catch {
            /* ignore */
          }
          updateEntry(assistantId, {
            streaming: false,
            error: true,
            content: `**Error:** ${detail}`,
          });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            let evt: { type?: string; content?: string };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "delta" && evt.content) {
              acc += evt.content;
              updateEntry(assistantId, { content: acc });
            } else if (evt.type === "error") {
              updateEntry(assistantId, {
                streaming: false,
                error: true,
                content: `**Stream error:** ${evt.content ?? "unknown"}`,
              });
              return;
            } else if (evt.type === "done") {
              updateEntry(assistantId, {
                streaming: false,
                content: acc || "*(empty response)*",
              });
              return;
            }
          }
        }

        updateEntry(assistantId, {
          streaming: false,
          content: acc || "*(connection closed)*",
        });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          updateEntry(assistantId, {
            streaming: false,
            content: acc ? `${acc}\n\n*(aborted)*` : "*(aborted)*",
          });
          return;
        }
        updateEntry(assistantId, {
          streaming: false,
          error: true,
          content: `**Error:** ${(err as Error)?.message ?? "unknown failure"}`,
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [buildMessages, mode, activeSkill, activeModules, workspace, pushEntry, updateEntry],
  );

  /* ---------------- agent (multi-step) ---------------- */

  const runAgent = useCallback(
    async (goal: string, agentType: AgentId) => {
      const agentMeta = AGENTS.find((a) => a.id === agentType)!;
      const entryId = uid();
      pushEntry({
        id: entryId,
        kind: "agent",
        content: "",
        mode,
        agentName: agentMeta.name,
        agentGoal: goal,
        agentPlan: null,
        agentSteps: [],
        agentDone: false,
        agentError: null,
        streaming: true,
      });

      setIsStreaming(true);
      stickRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      const priorMessages = buildMessages("");

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            agentType,
            goal,
            skill: activeSkill ?? agentMeta.defaultSkill ?? null,
            modules: activeModules,
            workspace,
            model,
            priorMessages,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Request failed (${res.status}).`;
          try {
            const errJson = await res.json();
            if (errJson?.error) detail = errJson.error;
          } catch {
            /* ignore */
          }
          updateEntry(entryId, {
            streaming: false,
            agentDone: false,
            agentError: detail,
          });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let plan: PlanStep[] | null = null;
        let steps: AgentStepState[] = [];

        const syncSteps = () => updateEntry(entryId, { agentSteps: [...steps] });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            let evt: {
              type?: string;
              steps?: PlanStep[];
              index?: number;
              title?: string;
              content?: string;
            };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "plan" && Array.isArray(evt.steps)) {
              plan = evt.steps;
              steps = evt.steps.map((s, i) => ({
                index: i,
                title: s.title,
                detail: s.detail,
                status: "pending",
                content: "",
              }));
              updateEntry(entryId, { agentPlan: plan, agentSteps: [...steps] });
            } else if (evt.type === "step_start" && typeof evt.index === "number") {
              if (steps[evt.index]) {
                steps[evt.index] = {
                  ...steps[evt.index],
                  status: "running",
                  title: evt.title || steps[evt.index].title,
                };
                syncSteps();
              }
            } else if (evt.type === "delta" && typeof evt.index === "number") {
              if (steps[evt.index]) {
                steps[evt.index].content += evt.content || "";
                syncSteps();
              }
            } else if (evt.type === "step_end" && typeof evt.index === "number") {
              if (steps[evt.index]) {
                steps[evt.index].status = "done";
                syncSteps();
              }
            } else if (evt.type === "error") {
              updateEntry(entryId, {
                streaming: false,
                agentDone: false,
                agentError: evt.content ?? "unknown error",
              });
              return;
            } else if (evt.type === "done") {
              updateEntry(entryId, {
                streaming: false,
                agentDone: true,
                agentSteps: [...steps],
              });
              return;
            }
          }
        }

        updateEntry(entryId, {
          streaming: false,
          agentDone: true,
          agentSteps: [...steps],
        });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          updateEntry(entryId, {
            streaming: false,
            agentDone: false,
            agentError: "aborted",
          });
          return;
        }
        updateEntry(entryId, {
          streaming: false,
          agentDone: false,
          agentError: (err as Error)?.message ?? "unknown failure",
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [buildMessages, mode, activeSkill, activeModules, workspace, pushEntry, updateEntry],
  );

  /* ---------------- coding plan (structured) ---------------- */

  const runPlan = useCallback(
    async (task: string) => {
      const entryId = uid();
      pushEntry({
        id: entryId,
        kind: "plan",
        content: "",
        mode,
        planTask: task,
        planData: null,
        planProgress: [],
        planError: null,
        executingPhaseId: null,
        streaming: true,
      });

      setIsStreaming(true);
      stickRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            task,
            skill: activeSkill,
            modules: activeModules,
            workspace,
            model,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Request failed (${res.status}).`;
          try {
            const errJson = await res.json();
            if (errJson?.error) detail = errJson.error;
          } catch {
            /* ignore */
          }
          updateEntry(entryId, {
            streaming: false,
            planError: detail,
          });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            let evt: {
              type?: string;
              content?: string;
              plan?: CodingPlan;
            };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "plan" && evt.plan) {
              const plan = evt.plan;
              updateEntry(entryId, {
                planData: plan,
                planProgress: plan.phases.map((p) =>
                  p.steps.map(() => false),
                ),
                streaming: false,
              });
            } else if (evt.type === "error") {
              updateEntry(entryId, {
                streaming: false,
                planError: evt.content ?? "unknown error",
              });
              return;
            } else if (evt.type === "done") {
              updateEntry(entryId, { streaming: false });
              return;
            }
          }
        }

        updateEntry(entryId, { streaming: false });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          updateEntry(entryId, {
            streaming: false,
            planError: "aborted",
          });
          return;
        }
        updateEntry(entryId, {
          streaming: false,
          planError: (err as Error)?.message ?? "unknown failure",
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [mode, activeSkill, activeModules, workspace, pushEntry, updateEntry],
  );

  useEffect(() => {
    runAgentRef.current = runAgent;
  }, [runAgent]);

  useEffect(() => {
    runPlanRef.current = runPlan;
  }, [runPlan]);

  /** Toggle a plan step's completion state (interactive checklist). */
  const togglePlanStep = useCallback(
    (entryId: string, phaseIndex: number, stepIndex: number) => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          const progress = (e.planProgress ?? []).map((phase) => [...phase]);
          while (progress.length <= phaseIndex) progress.push([]);
          const phaseSteps = progress[phaseIndex];
          while (phaseSteps.length <= stepIndex) phaseSteps.push(false);
          phaseSteps[stepIndex] = !phaseSteps[stepIndex];
          return { ...e, planProgress: progress };
        }),
      );
    },
    [],
  );

  /**
   * Variant of runCompletion that lets a caller pick the mode and notifies a
   * plan entry when the phase execution finishes (clears executingPhaseId).
   */
  const runCompletionWith = useCallback(
    async (
      userText: string,
      useMode: CliMode,
      planEntryId?: string,
      phaseId?: string,
    ) => {
      const assistantId = uid();
      pushEntry({
        id: assistantId,
        kind: "assistant",
        content: "",
        mode: useMode,
        streaming: true,
      });

      setIsStreaming(true);
      stickRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;

      const messages = buildMessages(userText);
      let acc = "";

      const clearPhase = () => {
        if (planEntryId && phaseId) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === planEntryId ? { ...e, executingPhaseId: null } : e,
            ),
          );
        }
      };

      try {
        const res = await fetch("/api/cli", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            messages,
            mode: useMode,
            skill: activeSkill,
            modules: activeModules,
            workspace,
            model,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Request failed (${res.status}).`;
          try {
            const errJson = await res.json();
            if (errJson?.error) detail = errJson.error;
          } catch {
            /* ignore */
          }
          updateEntry(assistantId, {
            streaming: false,
            error: true,
            content: `**Error:** ${detail}`,
          });
          clearPhase();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line) continue;
            let evt: { type?: string; content?: string };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "delta" && evt.content) {
              acc += evt.content;
              updateEntry(assistantId, { content: acc });
            } else if (evt.type === "error") {
              updateEntry(assistantId, {
                streaming: false,
                error: true,
                content: `**Stream error:** ${evt.content ?? "unknown"}`,
              });
              clearPhase();
              return;
            } else if (evt.type === "done") {
              updateEntry(assistantId, {
                streaming: false,
                content: acc || "*(empty response)*",
              });
              clearPhase();
              return;
            }
          }
        }

        updateEntry(assistantId, {
          streaming: false,
          content: acc || "*(connection closed)*",
        });
        clearPhase();
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          updateEntry(assistantId, {
            streaming: false,
            content: acc ? `${acc}\n\n*(aborted)*` : "*(aborted)*",
          });
          clearPhase();
          return;
        }
        updateEntry(assistantId, {
          streaming: false,
          error: true,
          content: `**Error:** ${(err as Error)?.message ?? "unknown failure"}`,
        });
        clearPhase();
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [buildMessages, activeSkill, activeModules, workspace, pushEntry, updateEntry],
  );

  /** Execute a plan phase: send its goal + steps to GLM via /api/cli as a generate prompt. */
  const executePlanPhase = useCallback(
    async (entryId: string, phase: PlanPhase) => {
      const prompt = `Implement this phase of the coding plan.

PHASE: ${phase.name}
GOAL: ${phase.goal}

${phase.steps.length > 0 ? `STEPS:\n${phase.steps.map((s, i) => `${i + 1}. ${s.title} — ${s.detail}`).join("\n")}` : ""}

${phase.files.length > 0 ? `FILES:\n${phase.files.map((f) => `- [${f.action}] ${f.path} — ${f.reason}`).join("\n")}` : ""}

Generate complete, production-ready code for every file in this phase. Use fenced code blocks with the correct language and the full file path in a comment at the top of each block.`;

      // Mark the phase as executing on the plan entry.
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, executingPhaseId: phase.id } : e,
        ),
      );

      // Push a user entry + run a normal completion so the code streams in.
      pushEntry({
        id: uid(),
        kind: "user",
        content: `execute phase: ${phase.name}`,
        mode: "generate",
      });

      // Temporarily run the completion with mode=generate + same pipeline.
      await runCompletionWith(prompt, "generate", entryId, phase.id);
    },
    [pushEntry, runCompletionWith],
  );

  /* ---------------- submit ---------------- */

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setHistoryIndex(-1);
    setHistory((h) => [...h, text]);

    if (text.startsWith("/")) {
      const handled = runLocalCommand(text);
      if (handled) return;
    }

    // If an agent is active, route the prompt to the agent runner.
    if (activeAgent) {
      pushEntry({ id: uid(), kind: "user", content: text, mode });
      void runAgentRef.current(text, activeAgent);
      return;
    }

    pushEntry({ id: uid(), kind: "user", content: text, mode });
    void runCompletion(text);
  }, [input, isStreaming, mode, activeAgent, pushEntry, runCompletion, runAgent, runLocalCommand]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** Voice commander: record → transcribe → parse → route command. */
  const handleVoiceCommand = useCallback(async () => {
    if (voiceBusy) return;

    // If already listening, stop and transcribe
    if (voiceListening && voiceMediaRef.current) {
      voiceMediaRef.current.stop();
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        setVoiceListening(false);
        setVoiceBusy(true);
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const res = await fetch("/api/voice", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
              },
              body: JSON.stringify({ action: "asr", audioBase64: base64 }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error ?? "ASR failed");

            const transcript = (data.text ?? "").trim();
            if (!transcript) {
              pushEntry({ id: uid(), kind: "system", content: "*(voice: empty transcript)*" });
              return;
            }

            // Parse the voice command
            const cmd = parseVoiceCommand(transcript);
            pushEntry({
              id: uid(),
              kind: "system",
              content: `🎤 **Voice command:** \`${transcript}\`\n→ ${cmd.label}`,
            });

            // Route the command
            if (cmd.action === "slash" && cmd.command) {
              runLocalCommand(cmd.command + (cmd.text ? ` ${cmd.text.replace(cmd.command, "").trim()}` : ""));
            } else if (cmd.action === "mode" && cmd.command) {
              runLocalCommand(cmd.command);
            } else if (cmd.action === "panel" && cmd.command) {
              runLocalCommand(cmd.command);
            } else if (cmd.action === "submit" && cmd.text) {
              setInput(cmd.text);
              setTimeout(() => submit(), 100);
            }
          } catch (e) {
            pushEntry({
              id: uid(),
              kind: "system",
              content: `*(voice error: ${e instanceof Error ? e.message : "failed"})*`,
            });
          } finally {
            setVoiceBusy(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      voiceMediaRef.current = recorder;
      setVoiceListening(true);
    } catch {
      pushEntry({ id: uid(), kind: "system", content: "*(microphone access denied)*" });
    }
  }, [voiceListening, voiceBusy, pushEntry, runLocalCommand, submit]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setEntries([]);
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === "ArrowUp") {
        if (history.length === 0) return;
        e.preventDefault();
        const next =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(next);
        setInput(history[next]);
        return;
      }
      if (e.key === "ArrowDown") {
        if (history.length === 0 || historyIndex === -1) return;
        e.preventDefault();
        const next = historyIndex + 1;
        if (next >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(next);
          setInput(history[next]);
        }
      }
    },
    [history, historyIndex, submit],
  );

  const hasConversation = entries.some(
    (e) => e.kind === "user" || e.kind === "assistant" || e.kind === "agent",
  );

  const promptLabel = useMemo(
    () => `zlm@cli:~/${mode}${activeSkill ? `/skill:${activeSkill}` : ""}$`,
    [mode, activeSkill],
  );

  return (
    <div
      className="flex h-dvh min-h-screen bg-[#06080a] text-zinc-200"
      onClick={focusInput}
    >
      {/* Ambient glow + grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(16,185,129,0.12), transparent 55%), radial-gradient(80% 60% at 100% 100%, rgba(139,92,246,0.06), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none fixed inset-0 z-0 opacity-40"
      />

      {/* Sidebar — persistent on lg, drawer on smaller */}
      <div
        className={cn(
          "relative z-20 shrink-0 transition-all duration-200",
          "hidden lg:block",
          sidebarOpen ? "w-72" : "w-0",
        )}
      >
        {sidebarOpen && (
          <Sidebar
            tab={sidebarTab}
            onTabChange={setSidebarTab}
            activeSkill={activeSkill}
            onToggleSkill={toggleSkill}
            activeModules={activeModules}
            onToggleModule={toggleModule}
            activeAgent={activeAgent}
            onToggleAgent={toggleAgent}
            workspace={workspace}
            onClearWorkspace={clearWorkspace}
            pipeline={pipeline}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] border-r border-emerald-500/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              tab={sidebarTab}
              onTabChange={setSidebarTab}
              activeSkill={activeSkill}
              onToggleSkill={toggleSkill}
              activeModules={activeModules}
              onToggleModule={toggleModule}
              activeAgent={activeAgent}
              onToggleAgent={toggleAgent}
              workspace={workspace}
              onClearWorkspace={clearWorkspace}
              pipeline={pipeline}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Title bar */}
        <header className="glass relative z-10 flex items-center gap-2 border-b border-emerald-500/10 px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen((o) => !o);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
              sidebarOpen
                ? "bg-emerald-500/15 text-emerald-300 glow-emerald"
                : "text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-300",
            )}
            title="Toggle panel"
            aria-label="Toggle panel"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/70 shadow-sm shadow-rose-500/30 transition-transform hover:scale-110" />
            <span className="h-3 w-3 rounded-full bg-amber-400/70 shadow-sm shadow-amber-400/30 transition-transform hover:scale-110" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70 shadow-sm shadow-emerald-500/30 transition-transform hover:scale-110" />
          </div>
          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400/20 to-emerald-400/[0.03]">
              <TerminalSquare className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="font-mono text-xs font-medium tracking-tight text-zinc-300">
              GLM&nbsp;5.2
            </span>
            <span className="font-mono text-xs text-zinc-600">·</span>
            <span className="font-mono text-xs text-zinc-500">Coding CLI</span>
          </div>

          {/* Model selector */}
          <div className="ml-auto">
            <ModelSelector value={model} onChange={setModel} />
          </div>

          {/* Pipeline badges */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("skills");
              }}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                activeSkill
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-transparent text-zinc-500 hover:border-emerald-500/20 hover:text-zinc-300",
              )}
              title="Skills"
            >
              <Sparkles className="h-3 w-3" />
              {activeSkill ?? "skill"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("modules");
              }}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                activeModules.length
                  ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
                  : "border-transparent text-zinc-500 hover:border-emerald-500/20 hover:text-zinc-300",
              )}
              title="Modules"
            >
              <Plug className="h-3 w-3" />
              {activeModules.length ? `${activeModules.length} mods` : "mods"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("pipeline");
              }}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                activeAgent
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                  : "border-transparent text-zinc-500 hover:border-emerald-500/20 hover:text-zinc-300",
              )}
              title="Pipeline / Agents"
            >
              {activeAgent ? <Bot className="h-3 w-3" /> : <Workflow className="h-3 w-3" />}
              {activeAgent ?? "pipe"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pushEntry({
                  id: uid(),
                  kind: "system",
                  content: `**GLM Coding Plan** — generates a structured implementation roadmap (phases → files → steps, risks, acceptance) for a task.\n\nUsage: \`/plan <task description>\`\n\nExamples:\n${PLAN_EXAMPLES.map(
                    (p) => `- \`/plan ${p}\``,
                  ).join("\n")}`,
                });
              }}
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 font-mono text-[11px] text-zinc-500 transition-colors hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-300"
              title="GLM Coding Plan"
            >
              <ClipboardList className="h-3 w-3" />
              plan
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("keys");
              }}
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 font-mono text-[11px] text-zinc-500 transition-colors hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
              title="API Keys"
            >
              <KeyRound className="h-3 w-3" />
              keys
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("media");
              }}
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 font-mono text-[11px] text-zinc-500 transition-colors hover:border-fuchsia-400/30 hover:bg-fuchsia-400/10 hover:text-fuchsia-300"
              title="Media Studio"
            >
              <ImageIcon className="h-3 w-3" />
              media
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("admin");
              }}
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 font-mono text-[11px] text-zinc-500 transition-colors hover:border-sky-400/30 hover:bg-sky-400/10 hover:text-sky-300"
              title="Admin Panel"
            >
              <LayoutDashboard className="h-3 w-3" />
              admin
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openSidebar("mcp");
              }}
              className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 font-mono text-[11px] text-zinc-500 transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
              title="MCP CLI Connector"
            >
              <TerminalSquare className="h-3 w-3" />
              mcp
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pushEntry({ id: uid(), kind: "system", content: ABOUT_TEXT });
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300"
              title="About"
              aria-label="About"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEntries([]);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
              title="Clear (Ctrl+L)"
              aria-label="Clear"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Output */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="terminal-scroll relative flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5"
        >
          <div className="mx-auto max-w-4xl">
            {entries.map((entry) =>
              entry.kind === "agent" ? (
                <AgentView
                  key={entry.id}
                  agentName={entry.agentName ?? "Agent"}
                  goal={entry.agentGoal ?? ""}
                  plan={entry.agentPlan ?? null}
                  steps={entry.agentSteps ?? []}
                  done={entry.agentDone ?? false}
                  error={entry.agentError ?? null}
                />
              ) : entry.kind === "plan" ? (
                <PlanView
                  key={entry.id}
                  task={entry.planTask ?? ""}
                  plan={entry.planData ?? null}
                  planning={entry.streaming === true && !entry.planData}
                  error={entry.planError ?? null}
                  progress={entry.planProgress ?? []}
                  onToggleStep={(pi, si) => togglePlanStep(entry.id, pi, si)}
                  onExecutePhase={(phase) =>
                    executePlanPhase(entry.id, phase)
                  }
                  executingPhaseId={entry.executingPhaseId ?? null}
                />
              ) : (
                <EntryView
                  key={entry.id}
                  entry={entry}
                  promptLabel={promptLabel}
                />
              ),
            )}

            {!hasConversation && (
              <ExamplePrompts
                onPick={(p) => {
                  setMode(p.mode);
                  pushEntry({
                    id: uid(),
                    kind: "user",
                    content: p.text,
                    mode: p.mode,
                  });
                  void runCompletion(p.text);
                }}
              />
            )}

            <div className="h-2" />
          </div>
        </div>

        {/* Jump-to-bottom */}
        {showJump && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollToBottom(true);
            }}
            className="glass anim-fade-in absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-emerald-500/25 px-3.5 py-1.5 font-mono text-[11px] font-medium text-emerald-300 shadow-xl shadow-emerald-500/10 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-emerald-500/20 active:scale-95"
          >
            <ChevronDown className="h-3 w-3" /> jump to bottom
          </button>
        )}

        {/* Input bar (sticky footer) */}
        <footer className="glass-strong relative z-10 border-t border-emerald-500/10">
          <div className="mx-auto max-w-4xl px-3 py-3 sm:px-5">
            {/* Active pipeline indicator */}
            {(activeSkill || activeModules.length > 0 || workspace || activeAgent) && (
              <div className="mb-2.5 flex flex-wrap items-center gap-1.5 anim-fade-in">
                {activeSkill && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                    <Sparkles className="h-2.5 w-2.5" />
                    {activeSkill}
                  </span>
                )}
                {activeModules.map((m) => (
                  <span
                    key={m}
                    className="flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[10px] text-sky-300"
                  >
                    <Plug className="h-2.5 w-2.5" />
                    {m}
                  </span>
                ))}
                {workspace && (
                  <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 font-mono text-[10px] text-violet-300">
                    ws:{workspace.length}
                  </span>
                )}
                {activeAgent && (
                  <span className="flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                    <Bot className="h-2.5 w-2.5" />
                    agent:{activeAgent}
                  </span>
                )}
              </div>
            )}

            <div
              className={cn(
                "grad-border flex items-end gap-2.5 rounded-2xl bg-[#07090a]/70 px-4 py-3 transition-all duration-300",
                isStreaming
                  ? "grad-border-focus glow-emerald"
                  : "focus-within:grad-border-focus focus-within:glow-emerald",
              )}
            >
              <span className="select-none pb-0.5 font-mono text-[13px] font-medium text-emerald-400">
                {promptLabel}
              </span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                placeholder={
                  isStreaming
                    ? activeAgent
                      ? "Agent running…"
                      : "zLM 1.0 is responding…"
                    : activeAgent
                      ? `Describe a goal for the ${activeAgent} agent…`
                      : "Ask zLM 1.0, or type /help · /skills · /modules · /agent"
                }
                className="terminal-scroll max-h-[168px] flex-1 resize-none bg-transparent py-0.5 font-mono text-[13.5px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              {/* Voice commander mic button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVoiceCommand();
                }}
                disabled={voiceBusy}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-xl border px-2.5 py-2 transition-all duration-200 active:scale-95 disabled:opacity-40",
                  voiceListening
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-300 animate-pulse"
                    : voiceBusy
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : "border-sky-400/25 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20",
                )}
                title={voiceListening ? "Recording… tap to stop" : voiceBusy ? "Transcribing…" : "Voice command"}
                aria-label="Voice command"
              >
                {voiceBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
              </button>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopStreaming();
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 font-mono text-[12px] font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/20 active:scale-95"
                >
                  <Square className="h-3 w-3 fill-current" /> stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    submit();
                  }}
                  disabled={!input.trim()}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3.5 py-2 font-mono text-[12px] font-medium text-emerald-300 transition-all duration-200 hover:from-emerald-500/25 hover:to-emerald-500/10 active:scale-95 disabled:cursor-not-allowed disabled:from-transparent disabled:to-transparent disabled:opacity-30"
                >
                  <CornerDownLeft className="h-3 w-3" /> {activeAgent ? "run agent" : "run"}
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] text-zinc-600">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {activeAgent ? "agent" : model} · streaming
              </span>
              <span className="hidden truncate pl-2 text-zinc-700 sm:inline">
                {pipelineSummaryText}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- sub components ---------- */

function EntryView({
  entry,
  promptLabel,
}: {
  entry: TerminalEntry;
  promptLabel: string;
}) {
  if (entry.kind === "user") {
    return (
      <div className="mb-4 anim-fade-in-up">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="select-none font-mono text-[13px] font-medium text-emerald-400">
            {promptLabel}
          </span>
          {entry.mode && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-emerald-400/60">
              {entry.mode}
            </span>
          )}
        </div>
        <pre className="mt-1 whitespace-pre-wrap break-words pl-1 font-mono text-[13.5px] leading-relaxed text-zinc-100">
          {entry.content}
        </pre>
      </div>
    );
  }

  if (entry.kind === "system") {
    const isAscii = entry.content.includes("█") || entry.content.includes("╗");
    if (isAscii) {
      return (
        <pre className="mb-4 overflow-x-auto terminal-scroll font-mono text-[10px] leading-tight text-emerald-500/70 sm:text-[11px]">
          {entry.content.trim()}
        </pre>
      );
    }
    return (
      <div className="mb-4 grad-border rounded-xl bg-gradient-to-br from-amber-400/[0.05] to-transparent px-4 py-3 anim-fade-in-up">
        <Markdown content={entry.content} />
      </div>
    );
  }

  // assistant
  return (
    <div className="mb-5 anim-fade-in-up">
      <div className="mb-1.5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/25 to-emerald-400/[0.05]">
          <span className="font-mono text-[9px] font-bold text-emerald-300">AI</span>
        </div>
        <span className="font-mono text-[11px] font-semibold tracking-wide text-emerald-300">
          zLM 1.0
        </span>
        {entry.mode && (
          <span className="rounded-full border border-zinc-700/50 bg-zinc-800/30 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-zinc-500">
            {entry.mode}
          </span>
        )}
        {entry.streaming && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/70">
            <span className="inline-flex gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-400 anim-pulse-dot [animation-delay:0ms]" />
              <span className="h-1 w-1 rounded-full bg-emerald-400 anim-pulse-dot [animation-delay:200ms]" />
              <span className="h-1 w-1 rounded-full bg-emerald-400 anim-pulse-dot [animation-delay:400ms]" />
            </span>
            thinking
          </span>
        )}
      </div>
      <div
        className={cn(
          "grad-border overflow-hidden rounded-xl px-4 py-3.5",
          entry.error
            ? "bg-gradient-to-br from-rose-500/[0.06] to-transparent"
            : "bg-gradient-to-br from-emerald-500/[0.04] to-transparent",
        )}
      >
        {entry.content ? (
          <Markdown content={entry.content} />
        ) : entry.streaming ? (
          <span className="inline-block h-4 w-2 anim-blink bg-emerald-400/80 align-middle" />
        ) : (
          <span className="text-zinc-600">…</span>
        )}
      </div>
    </div>
  );
}

function ExamplePrompts({
  onPick,
}: {
  onPick: (p: { mode: CliMode; text: string }) => void;
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/15" />
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
          try an example
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/15" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {EXAMPLE_PROMPTS.map((p) => {
          const m = modeMeta(p.mode);
          return (
            <button
              key={p.text}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPick(p);
              }}
              className="group grad-border rounded-xl bg-[#0a0f0d]/50 px-3.5 py-3 text-left transition-all duration-200 hover:bg-emerald-500/[0.05] hover:shadow-lg hover:shadow-emerald-500/5 active:scale-[0.98]"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className={cn("font-mono text-[10px] font-medium uppercase tracking-wide", m.accent)}>
                  {m.command}
                </span>
                <span className="h-px flex-1 bg-zinc-800" />
                <CornerDownLeft className="h-2.5 w-2.5 text-zinc-700 transition-colors group-hover:text-emerald-400/60" />
              </div>
              <div className="font-mono text-[12.5px] leading-snug text-zinc-400 transition-colors group-hover:text-zinc-100">
                {p.text}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
