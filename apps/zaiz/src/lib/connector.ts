/**
 * Connector — the composition pipeline that assembles the final system prompt
 * and execution route from the active CLI config.
 *
 * Pipeline:
 *   [base CLI prompt] + [mode] + [skill] + [modules] + [workspace] + [agent]
 *     |
 *     v
 *   zLM 1.0  (single turn via /api/cli  OR  plan→execute via /api/agent)
 *
 * This file is client-safe (no SDK imports) so the UI can describe & visualize
 * the pipeline identically to how the server assembles it.
 */

import type { CliMode } from "./zlm-modes";
import type { SkillId } from "./skills";
import type { ModuleId } from "./modules";
import type { AgentId } from "./agents";

export interface PipelineConfig {
  mode: CliMode;
  skill: SkillId | null;
  modules: ModuleId[];
  workspace: string | null;
  agent: AgentId | null;
}

export interface PipelineStage {
  id: string;
  label: string;
  value: string;
  active: boolean;
}

/** Describe the active pipeline as ordered stages for visualization. */
export function describePipeline(cfg: PipelineConfig): PipelineStage[] {
  return [
    {
      id: "base",
      label: "zLM 1.0 core",
      value: "coding terminal persona",
      active: true,
    },
    {
      id: "mode",
      label: "Mode",
      value: cfg.mode,
      active: true,
    },
    {
      id: "skill",
      label: "Skill",
      value: cfg.skill ?? "—",
      active: cfg.skill !== null,
    },
    {
      id: "modules",
      label: "Modules",
      value:
        cfg.modules.length === 0
          ? "—"
          : `${cfg.modules.length} active: ${cfg.modules.join(", ")}`,
      active: cfg.modules.length > 0,
    },
    {
      id: "workspace",
      label: "Workspace",
      value: cfg.workspace ? `${cfg.workspace.length} chars connected` : "—",
      active: cfg.workspace !== null,
    },
    {
      id: "agent",
      label: "Agent",
      value: cfg.agent ?? "—",
      active: cfg.agent !== null,
    },
  ];
}

/** Human-readable one-line summary of the pipeline (for the header badge). */
export function pipelineSummary(cfg: PipelineConfig): string {
  const parts: string[] = [cfg.mode];
  if (cfg.skill) parts.push(cfg.skill);
  if (cfg.modules.length) parts.push(`${cfg.modules.length}M`);
  if (cfg.workspace) parts.push("ws");
  if (cfg.agent) parts.push(`agent:${cfg.agent}`);
  return parts.join(" · ");
}

/**
 * Build the **workspace context block** injected into the system prompt when a
 * code snippet is connected. Shared by both the /api/cli and /api/agent routes
 * (server side re-implements the same string; kept here as the source of truth).
 */
export function workspaceBlock(workspace: string): string {
  return `CONNECTED WORKSPACE — the following code is the user's current context. Treat it as authoritative and reference it by name/line when answering.

\`\`\`
${workspace.slice(0, 12000)}
\`\`\``;
}

/** The full module-context block (joined) injected into the system prompt. */
export function moduleBlock(modules: ModuleId[]): string {
  // Lazily resolve module context strings; avoids importing the full registry
  // text at module-eval time on the client for non-UI callers.
  // The actual text lives in modules.ts; we import it dynamically is overkill,
  // so we re-export a helper from there instead via the server assembler.
  // This client-side helper is only used for preview; the server assembles the
  // real prompt in glm.ts.
  return modules.length
    ? `ACTIVE MODULES: ${modules.join(", ")}`
    : "";
}
