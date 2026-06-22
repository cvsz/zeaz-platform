/**
 * Agents — client-safe registry of multi-step autonomous agents.
 *
 * An Agent takes a goal, produces a JSON plan of steps, then executes each
 * step with zLM 1.0 — streaming progress live. The orchestration lives in the
 * server-only `streamAgent` generator (`src/lib/glm.ts`); this file holds the
 * agent presets (persona + planner prompt + executor framing).
 *
 * Safe to import from both client and server code (no SDK imports).
 */

import type { SkillId } from "./skills";
import type { ModuleId } from "./modules";

export type AgentId = "architect" | "bug-hunter" | "refactorer";

export interface AgentMeta {
  id: AgentId;
  name: string;
  command: string;
  icon: string; // lucide icon name
  tagline: string;
  description: string;
  /** Persona + planner instructions. */
  plannerPrompt: string;
  /** Framing prepended to each step execution. */
  executorPrompt: string;
  maxSteps: number;
  defaultSkill?: SkillId;
}

export const AGENTS: AgentMeta[] = [
  {
    id: "architect",
    name: "Architect",
    command: "/agent architect",
    icon: "DraftingCompass",
    tagline: "Designs & scaffolds a project",
    description:
      "Plans the file/module layout for a project from a spec, then generates each piece in sequence.",
    plannerPrompt:
      "You are the ARCHITECT agent. Given a goal, produce a build plan: an ordered list of independent, concrete steps that together deliver the goal. Each step should produce a tangible artifact (a file, a function, a config). Limit to the most important steps (<= 6). Do not write the code yet — just plan.",
    executorPrompt:
      "EXECUTE this single step from the plan. Produce the complete artifact for THIS step only (full code in a fenced block with the right language). Be concrete and copy-pasteable. Do not repeat other steps.",
    maxSteps: 6,
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    command: "/agent bug-hunter",
    icon: "Bug",
    tagline: "Reproduce → isolate → fix",
    description:
      "Systematically reproduces a bug, isolates the root cause, writes a failing test, and ships the fix.",
    plannerPrompt:
      "You are the BUG-HUNTER agent. Given a bug report, produce a diagnostic plan: (1) reproduce, (2) isolate root cause, (3) write a failing test, (4) implement the fix, (5) verify & note regressions. Each step is one item. Limit to <= 5 steps. Do not solve yet — just plan.",
    executorPrompt:
      "EXECUTE this single diagnostic step. Produce concrete output for THIS step only (a reproduction case, a hypothesis, a test, or a fix as a code block). Be precise and minimal.",
    maxSteps: 5,
    defaultSkill: "code-review",
  },
  {
    id: "refactorer",
    name: "Refactorer",
    command: "/agent refactorer",
    icon: "Layers",
    tagline: "Multi-step safe refactor",
    description:
      "Plans a refactor into safe, behavior-preserving steps, then executes each with before/after diffs.",
    plannerPrompt:
      "You are the REFACTORER agent. Given code + a goal, produce a refactor plan as small, safe, behavior-preserving steps (extract, rename, move, inline). Order by dependency. Limit to <= 6 steps. Do not refactor yet — just plan.",
    executorPrompt:
      "EXECUTE this single refactor step. Show the before/after for THIS step only as code blocks. State the behavior you preserved and any risk the human should verify.",
    maxSteps: 6,
    defaultSkill: "refactor",
  },
];

export const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));

export function getAgent(id: string): AgentMeta | undefined {
  return AGENT_MAP.get(id as AgentId);
}

/** A planned step (returned by the planner). */
export interface PlanStep {
  title: string;
  detail: string;
}

/** Per-step runtime state surfaced to the UI. */
export interface AgentStepState {
  index: number;
  title: string;
  detail: string;
  status: "pending" | "running" | "done" | "error";
  content: string;
}

/** Wire events emitted by /api/agent (NDJSON). */
export type AgentEvent =
  | { type: "plan"; steps: PlanStep[] }
  | { type: "step_start"; index: number; title: string }
  | { type: "delta"; index: number; content: string }
  | { type: "step_end"; index: number }
  | { type: "done" }
  | { type: "error"; content: string };

/** Shared config passed to the agent backend. */
export interface AgentConfig {
  agentType: AgentId;
  goal: string;
  activeSkill?: SkillId | null;
  activeModules: ModuleId[];
  workspace?: string | null;
}
