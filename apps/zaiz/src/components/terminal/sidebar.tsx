"use client";

import { useMemo } from "react";
import { Check, Sparkles, Plug, Workflow, X, KeyRound, Image as ImageIcon, LayoutDashboard, TerminalSquare, CreditCard, Search, FlaskConical, ShieldCheck, Brain, Mic, QrCode, Wand2, Shield, Settings, CheckSquare, MessageSquare, HardDrive, Lock } from "lucide-react";
import { SKILLS, type SkillId } from "@/lib/skills";
import {
  MODULES,
  MODULE_CATEGORIES,
  type ModuleId,
  type ModuleCategory,
} from "@/lib/modules";
import { AGENTS, type AgentId } from "@/lib/agents";
import {
  describePipeline,
  pipelineSummary,
  type PipelineConfig,
} from "@/lib/connector";
import { Icon } from "./icon";
import { KeysPanel } from "./keys-panel";
import { MediaPanel } from "./media-panel";
import { AdminPanel } from "./admin-panel";
import { McpPanel } from "./mcp-panel";
import { PaymentsPanel } from "./payments-panel";
import { SearchPanel } from "./search-panel";
import { ResearchPanel } from "./research-panel";
import { SandboxPanel } from "./sandbox-panel";
import { PermissionsPanel } from "./permissions-panel";
import { DashboardPanel } from "./dashboard-panel";
import { MemoryPanel } from "./memory-panel";
import { VoicePanel } from "./voice-panel";
import { WorkflowsPanel } from "./workflows-panel";
import { PromptPayPanel } from "./promptpay-panel";
import { GeneratorsPanel } from "./generators-panel";
import { SecurityPanel } from "./security-panel";
import { SettingsPanel } from "./settings-panel";
import { TasksPanel } from "./tasks-panel";
import { ConversationsPanel } from "./conversations-panel";
import { ConnectorsPanel } from "./connectors-panel";
import { PrivacyPanel } from "./privacy-panel";
import { cn } from "@/lib/utils";

export type SidebarTab = "skills" | "modules" | "pipeline" | "keys" | "media" | "admin" | "mcp" | "payments" | "search" | "research" | "sandbox" | "permissions" | "dashboard" | "memory" | "voice" | "workflows" | "promptpay" | "generators" | "security" | "settings" | "tasks" | "conversations" | "connectors" | "privacy";

interface SidebarProps {
  tab: SidebarTab;
  onTabChange: (t: SidebarTab) => void;
  activeSkill: SkillId | null;
  onToggleSkill: (id: SkillId) => void;
  activeModules: ModuleId[];
  onToggleModule: (id: ModuleId) => void;
  activeAgent: AgentId | null;
  onToggleAgent: (id: AgentId) => void;
  workspace: string | null;
  onClearWorkspace: () => void;
  pipeline: PipelineConfig;
  onClose: () => void;
}

export function Sidebar(props: SidebarProps) {
  const {
    tab,
    onTabChange,
    activeSkill,
    onToggleSkill,
    activeModules,
    onToggleModule,
    activeAgent,
    onToggleAgent,
    workspace,
    onClearWorkspace,
    pipeline,
    onClose,
  } = props;

  const stages = useMemo(() => describePipeline(pipeline), [pipeline]);
  const summary = useMemo(() => pipelineSummary(pipeline), [pipeline]);

  return (
    <aside className="glass-strong flex h-full w-full flex-col border-r border-emerald-500/10 text-zinc-200">
      {/* Tab header */}
      <div className="flex items-center gap-0.5 border-b border-emerald-500/10 px-2 pt-2">
        <TabButton
          active={tab === "dashboard"}
          onClick={() => onTabChange("dashboard")}
          icon={<LayoutDashboard className="h-3.5 w-3.5" />}
          label="Home"
        />
        <TabButton
          active={tab === "skills"}
          onClick={() => onTabChange("skills")}
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="Skills"
          count={activeSkill ? 1 : 0}
        />
        <TabButton
          active={tab === "modules"}
          onClick={() => onTabChange("modules")}
          icon={<Plug className="h-3.5 w-3.5" />}
          label="Modules"
          count={activeModules.length}
        />
        <TabButton
          active={tab === "pipeline"}
          onClick={() => onTabChange("pipeline")}
          icon={<Workflow className="h-3.5 w-3.5" />}
          label="Pipeline"
        />
        <TabButton
          active={tab === "keys"}
          onClick={() => onTabChange("keys")}
          icon={<KeyRound className="h-3.5 w-3.5" />}
          label="Keys"
        />
        <TabButton
          active={tab === "media"}
          onClick={() => onTabChange("media")}
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          label="Media"
        />
        <TabButton
          active={tab === "admin"}
          onClick={() => onTabChange("admin")}
          icon={<LayoutDashboard className="h-3.5 w-3.5" />}
          label="Admin"
        />
        <TabButton
          active={tab === "mcp"}
          onClick={() => onTabChange("mcp")}
          icon={<TerminalSquare className="h-3.5 w-3.5" />}
          label="MCP"
        />
        <TabButton
          active={tab === "payments"}
          onClick={() => onTabChange("payments")}
          icon={<CreditCard className="h-3.5 w-3.5" />}
          label="Pay"
        />
        <TabButton
          active={tab === "search"}
          onClick={() => onTabChange("search")}
          icon={<Search className="h-3.5 w-3.5" />}
          label="Search"
        />
        <TabButton
          active={tab === "research"}
          onClick={() => onTabChange("research")}
          icon={<FlaskConical className="h-3.5 w-3.5" />}
          label="Research"
        />
        <TabButton
          active={tab === "sandbox"}
          onClick={() => onTabChange("sandbox")}
          icon={<FlaskConical className="h-3.5 w-3.5" />}
          label="Sandbox"
        />
        <TabButton
          active={tab === "permissions"}
          onClick={() => onTabChange("permissions")}
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Perms"
        />
        <TabButton
          active={tab === "memory"}
          onClick={() => onTabChange("memory")}
          icon={<Brain className="h-3.5 w-3.5" />}
          label="Memory"
        />
        <TabButton
          active={tab === "voice"}
          onClick={() => onTabChange("voice")}
          icon={<Mic className="h-3.5 w-3.5" />}
          label="Voice"
        />
        <TabButton
          active={tab === "workflows"}
          onClick={() => onTabChange("workflows")}
          icon={<Workflow className="h-3.5 w-3.5" />}
          label="Flows"
        />
        <TabButton
          active={tab === "promptpay"}
          onClick={() => onTabChange("promptpay")}
          icon={<QrCode className="h-3.5 w-3.5" />}
          label="Pay QR"
        />
        <TabButton
          active={tab === "generators"}
          onClick={() => onTabChange("generators")}
          icon={<Wand2 className="h-3.5 w-3.5" />}
          label="Gen"
        />
        <TabButton
          active={tab === "security"}
          onClick={() => onTabChange("security")}
          icon={<Shield className="h-3.5 w-3.5" />}
          label="Sec"
        />
        <TabButton
          active={tab === "settings"}
          onClick={() => onTabChange("settings")}
          icon={<Settings className="h-3.5 w-3.5" />}
          label="Config"
        />
        <TabButton
          active={tab === "tasks"}
          onClick={() => onTabChange("tasks")}
          icon={<CheckSquare className="h-3.5 w-3.5" />}
          label="Tasks"
        />
        <TabButton
          active={tab === "conversations"}
          onClick={() => onTabChange("conversations")}
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="Chats"
        />
        <TabButton
          active={tab === "connectors"}
          onClick={() => onTabChange("connectors")}
          icon={<HardDrive className="h-3.5 w-3.5" />}
          label="Connect"
        />
        <TabButton
          active={tab === "privacy"}
          onClick={() => onTabChange("privacy")}
          icon={<Lock className="h-3.5 w-3.5" />}
          label="Privacy"
        />
        <button
          type="button"
          onClick={onClose}
          className="ml-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-emerald-500/10 hover:text-emerald-300 lg:hidden"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="terminal-scroll flex-1 overflow-y-auto p-3">
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "skills" && (
          <SkillsPanel
            activeSkill={activeSkill}
            onToggle={onToggleSkill}
          />
        )}
        {tab === "modules" && (
          <ModulesPanel
            activeModules={activeModules}
            onToggle={onToggleModule}
          />
        )}
        {tab === "pipeline" && (
          <PipelinePanel
            stages={stages}
            summary={summary}
            activeAgent={activeAgent}
            onToggleAgent={onToggleAgent}
            workspace={workspace}
            onClearWorkspace={onClearWorkspace}
          />
        )}
        {tab === "keys" && <KeysPanel />}
        {tab === "media" && <MediaPanel />}
        {tab === "admin" && <AdminPanel />}
        {tab === "mcp" && <McpPanel />}
        {tab === "payments" && <PaymentsPanel />}
        {tab === "search" && <SearchPanel />}
        {tab === "research" && <ResearchPanel />}
        {tab === "sandbox" && <SandboxPanel />}
        {tab === "permissions" && <PermissionsPanel />}
        {tab === "memory" && <MemoryPanel />}
        {tab === "voice" && <VoicePanel />}
        {tab === "workflows" && <WorkflowsPanel />}
        {tab === "promptpay" && <PromptPayPanel />}
        {tab === "generators" && <GeneratorsPanel />}
        {tab === "security" && <SecurityPanel />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "tasks" && <TasksPanel />}
        {tab === "conversations" && <ConversationsPanel />}
        {tab === "connectors" && <ConnectorsPanel />}
        {tab === "privacy" && <PrivacyPanel />}
      </div>

      {/* Footer summary */}
      <div className="border-t border-emerald-500/10 bg-[#07090a]/40 px-3 py-2.5">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
          active pipeline
        </div>
        <div className="mt-0.5 truncate font-mono text-[11px] text-emerald-300/80">
          {summary}
        </div>
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-2 font-mono text-[11px] transition-all duration-200",
        active
          ? "text-emerald-300"
          : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      {icon}
      {label}
      {typeof count === "number" && count > 0 && (
        <span className="ml-0.5 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-300">
          {count}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
      {children}
    </div>
  );
}

function SkillsPanel({
  activeSkill,
  onToggle,
}: {
  activeSkill: SkillId | null;
  onToggle: (id: SkillId) => void;
}) {
  return (
    <div>
      <SectionLabel>expert personas · {SKILLS.length}</SectionLabel>
      <p className="mb-3 text-[11.5px] leading-relaxed text-zinc-500">
        A skill sharpens zLM 1.0 for a specific task. Pick one to layer it onto
        every prompt. Toggle off to return to plain mode.
      </p>
      <div className="space-y-1.5">
        {SKILLS.map((s) => {
          const active = activeSkill === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggle(s.id)}
              className={cn(
                "group flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                active
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-emerald-500/10 bg-[#07090a]/40 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                  active
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-emerald-500/10 text-zinc-400 group-hover:text-emerald-300",
                )}
              >
                <Icon name={s.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "font-mono text-[12px] font-medium",
                      active ? "text-emerald-200" : "text-zinc-200",
                    )}
                  >
                    {s.name}
                  </span>
                  {active && (
                    <Check className="h-3 w-3 text-emerald-400" />
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                  {s.tagline}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModulesPanel({
  activeModules,
  onToggle,
}: {
  activeModules: ModuleId[];
  onToggle: (id: ModuleId) => void;
}) {
  return (
    <div>
      <SectionLabel>context tools · {MODULES.length}</SectionLabel>
      <p className="mb-3 text-[11.5px] leading-relaxed text-zinc-500">
        Modules inject capability context into the system prompt. Toggle any
        combination — the Connector composes them into the pipeline.
      </p>
      {MODULE_CATEGORIES.map((cat) => (
        <div key={cat.id} className="mb-3">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            {cat.label}
          </div>
          <div className="space-y-1">
            {MODULES.filter((m) => m.category === (cat.id as ModuleCategory)).map(
              (m) => {
                const active = activeModules.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onToggle(m.id)}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                      active
                        ? "border-sky-400/40 bg-sky-400/10"
                        : "border-emerald-500/10 bg-[#07090a]/40 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                        active
                          ? "border-sky-400/40 bg-sky-400/15 text-sky-300"
                          : "border-emerald-500/10 text-zinc-400 group-hover:text-emerald-300",
                      )}
                    >
                      <Icon name={m.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "font-mono text-[12px]",
                          active ? "text-sky-200" : "text-zinc-200",
                        )}
                      >
                        {m.name}
                      </span>
                      <span className="ml-2 text-[10.5px] text-zinc-500">
                        {m.tagline}
                      </span>
                    </span>
                    {active && (
                      <Check className="h-3 w-3 shrink-0 text-sky-400" />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelinePanel({
  stages,
  summary,
  activeAgent,
  onToggleAgent,
  workspace,
  onClearWorkspace,
}: {
  stages: ReturnType<typeof describePipeline>;
  summary: string;
  activeAgent: AgentId | null;
  onToggleAgent: (id: AgentId) => void;
  workspace: string | null;
  onClearWorkspace: () => void;
}) {
  return (
    <div>
      <SectionLabel>connector · composition</SectionLabel>
      <p className="mb-3 text-[11.5px] leading-relaxed text-zinc-500">
        The Connector assembles every prompt through this pipeline before it
        reaches zLM 1.0.
      </p>

      {/* Pipeline flow */}
      <div className="space-y-1.5">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px]",
                  stage.active
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : "border-zinc-700 text-zinc-600",
                )}
              >
                {i + 1}
              </span>
              {i < stages.length - 1 && (
                <span className="h-3 w-px bg-emerald-500/20" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-[11px] font-medium",
                    stage.active ? "text-zinc-200" : "text-zinc-600",
                  )}
                >
                  {stage.label}
                </span>
              </div>
              <div
                className={cn(
                  "truncate font-mono text-[10.5px]",
                  stage.active ? "text-emerald-300/70" : "text-zinc-700",
                )}
              >
                {stage.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div className="mt-4 rounded-lg border border-emerald-500/10 bg-[#07090a]/40 p-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            workspace
          </span>
          {workspace && (
            <button
              type="button"
              onClick={onClearWorkspace}
              className="font-mono text-[10px] text-rose-400/70 hover:text-rose-300"
            >
              disconnect
            </button>
          )}
        </div>
        <div className="mt-1 font-mono text-[11px] text-zinc-400">
          {workspace
            ? `${workspace.length} chars connected`
            : "nothing connected — use /connect code <paste>"}
        </div>
      </div>

      {/* Agent selector */}
      <div className="mt-4">
        <SectionLabel>agents · multi-step</SectionLabel>
        <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
          An agent plans steps then executes each with zLM 1.0. Toggle one on,
          then run a goal with{" "}
          <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">
            /agent &lt;goal&gt;
          </code>
          .
        </p>
        <div className="space-y-1.5">
          {AGENTS.map((a) => {
            const active = activeAgent === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onToggleAgent(a.id)}
                className={cn(
                  "group flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                  active
                    ? "border-amber-400/40 bg-amber-400/10"
                    : "border-emerald-500/10 bg-[#07090a]/40 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                    active
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
                      : "border-emerald-500/10 text-zinc-400 group-hover:text-amber-300",
                  )}
                >
                  <Icon name={a.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "font-mono text-[12px] font-medium",
                        active ? "text-amber-200" : "text-zinc-200",
                      )}
                    >
                      {a.name}
                    </span>
                    {active && (
                      <Check className="h-3 w-3 text-amber-400" />
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                    {a.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-2.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          resolved
        </div>
        <div className="mt-1 break-all font-mono text-[10.5px] text-emerald-300/70">
          {summary}
        </div>
      </div>
    </div>
  );
}
