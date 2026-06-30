import ZAI from "z-ai-web-dev-sdk";
import { type ChatMessage, type CliMode } from "./zlm-modes";
import { SKILL_MAP, type SkillId } from "./skills";
import { MODULE_MAP, type ModuleId } from "./modules";
import { AGENT_MAP, type AgentId, type AgentMeta, type PlanStep } from "./agents";
import { workspaceBlock } from "./connector";
import { generateLocalResponse, isLocalModel, tokenize } from "./local-model";
import {
  PLAN_SCHEMA_INSTRUCTIONS,
  parsePlan,
  type CodingPlan,
} from "./plan";

/**
 * zLM 1.0 Coding CLI — server-only helper.
 *
 * Responsibilities:
 *  - own the single shared ZAI (zLM 1.0) instance
 *  - compose the system prompt from the active pipeline
 *      [base] + [mode] + [skill] + [modules] + [workspace]
 *  - stream single-turn completions (streamCompletion)
 *  - run multi-step agents: plan → execute each step (streamAgent)
 *
 * z-ai-web-dev-sdk is Node-only (uses fs/promises), so this file MUST never be
 * imported from client code. Client components import from the client-safe
 * registries (skills/modules/agents/connector) instead.
 */

export type { CliMode, CliModeMeta, ChatMessage } from "./zlm-modes";
export type { SkillId, SkillMeta } from "./skills";
export type { ModuleId, ModuleMeta } from "./modules";
export type { AgentId, AgentMeta, PlanStep, AgentStepState } from "./agents";
export type {
  CodingPlan,
  PlanPhase,
  PlanFile,
  PlanStep as PlanTaskStep,
  FileAction,
  Complexity,
} from "./plan";

const BASE_SYSTEM_PROMPT = `You are **zLM-CLI**, an elite pair-programmer running inside a terminal, powered by the z.ai zLM 1.0 model.

You help developers think, write, debug, and ship code. Follow these rules strictly:

1. **Be a senior engineer.** Precise, pragmatic, no fluff. Lead with the answer, then justify it.
2. **Code first, prose second.** When the user asks for code, return runnable code in a fenced block with the correct language tag. Prefer complete, copy-pasteable snippets over fragments.
3. **Use the terminal voice.** You are a CLI tool. Keep prose tight. Use short sentences, imperative mood, and bullet points. No emoji unless asked.
4. **Show shell commands** in \`\`\`bash blocks when relevant (install deps, run tests, git, etc.).
5. **Always state assumptions** and call out edge cases, security implications, and trade-offs.
6. **When debugging**, identify the root cause before proposing a fix. Show the minimal failing case and the corrected code.
7. **Cite file paths / function names** when referencing specific code.
8. **Markdown only.** Use headings, lists, inline \`code\`, tables, and fenced code blocks. Never invent libraries or APIs — if unsure, say so.
9. Keep responses focused; if the question is broad, give a structured overview then offer to go deeper.

You are running on the z.ai platform. Your knowledge is current; be honest about cutoffs.`;

const MODE_PROMPTS: Record<CliMode, string> = {
  chat: "",
  explain:
    "MODE: explain. Break the subject down for another engineer. Cover what it does, how it works step by step, why it's designed that way, and any gotchas. Annotate code line-by-line when useful.",
  debug:
    "MODE: debug. The user is reporting a problem. (1) State the most likely root cause. (2) Show how to confirm it. (3) Provide the minimal fix as a code block. (4) Note regressions to watch for. If you need more info, ask up to two focused questions.",
  generate:
    "MODE: generate. Produce complete, production-ready code that satisfies the spec. Include types, error handling, and a short usage example. Briefly explain key decisions after the code.",
  review:
    "MODE: review. Act as a strict code reviewer. Organize findings by severity (Critical / Warning / Nit). For each issue: quote the relevant line, explain the risk, and suggest a fix as a code block. End with an overall verdict.",
  optimize:
    "MODE: optimize. Improve the given code for performance, readability, and structure. Show the optimized version in a code block, then list concrete before/after improvements (e.g. complexity, allocations, clarity).",
};

export interface ComposeOptions {
  mode: CliMode;
  skill?: SkillId | null;
  modules?: ModuleId[];
  workspace?: string | null;
  model?: string | null;
}

/** Compose the full system prompt from the active pipeline stages. */
export function composeSystemPrompt(opts: ComposeOptions): string {
  const parts: string[] = [BASE_SYSTEM_PROMPT];

  const modeExtra = MODE_PROMPTS[opts.mode];
  if (modeExtra) parts.push(modeExtra);

  if (opts.skill) {
    const skill = SKILL_MAP.get(opts.skill);
    if (skill) parts.push(skill.systemPrompt);
  }

  if (opts.modules && opts.modules.length > 0) {
    const moduleCtx = opts.modules
      .map((id) => MODULE_MAP.get(id)?.context)
      .filter((c): c is string => Boolean(c));
    if (moduleCtx.length > 0) {
      parts.push(moduleCtx.join("\n\n"));
    }
  }

  if (opts.workspace && opts.workspace.trim().length > 0) {
    parts.push(workspaceBlock(opts.workspace));
  }

  return parts.join("\n\n");
}

/** Back-compat: build a prompt from just a mode. */
export function buildSystemPrompt(mode: CliMode): string {
  return composeSystemPrompt({ mode });
}

let zaiPromise: Promise<ZAI> | null = null;

/** Lazily create and reuse a single ZAI (zLM 1.0) instance. */
export function getZAI(): Promise<ZAI> {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise;
}

interface StreamChunk {
  choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
}

/**
 * Parse a Server-Sent-Events byte stream into content deltas.
 *
 * The z-ai-web-dev-sdk returns (for `stream: true`) a Web `ReadableStream`
 * whose chunks are SSE-encoded bytes, e.g.:
 *   data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n
 *   data: [DONE]\n\n
 */
async function* parseSseStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line || line.startsWith(":")) continue; // keep-alive / comment
        if (line === "data: [DONE]") return;
        if (line.startsWith("data:")) {
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const parsed: StreamChunk = JSON.parse(jsonStr);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              yield delta;
            }
          } catch {
            // Ignore malformed lines — SSE framing can split JSON across reads,
            // but because we buffer per-line this should be rare.
          }
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
}

/** Run a single streaming completion against GLM (or the local model), yielding content deltas. */
export async function* runStream(
  systemPrompt: string,
  messages: ChatMessage[],
  model?: string | null,
): AsyncGenerator<string, void, unknown> {
  // --- Local model: no API call, heuristic response, simulated streaming ---
  if (isLocalModel(model)) {
    const lastPrompt = messages[messages.length - 1]?.content || "";
    const response = await generateLocalResponse(model || "local", lastPrompt, systemPrompt);
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? " " : "");
      yield chunk;
      // Small delay to simulate streaming (20ms per chunk).
      await new Promise((r) => setTimeout(r, 20));
    }
    return;
  }

  // --- Cloud model: use the z.ai SDK ---
  const zai = await getZAI();

  const payloadMessages = [
    { role: "assistant" as const, content: systemPrompt },
    ...messages,
  ];

  const body: Record<string, unknown> = {
    messages: payloadMessages,
    stream: true,
    thinking: { type: "disabled" },
  };
  if (model) body.model = model;

  const result = await zai.chat.completions.create(body as Parameters<typeof zai.chat.completions.create>[0]);

  if (result && typeof (result as ReadableStream<Uint8Array>).getReader === "function") {
    yield* parseSseStream(result as ReadableStream<Uint8Array>);
    return;
  }

  // Defensive fallback: parsed async-iterable chunks.
  for await (const chunk of result as AsyncIterable<StreamChunk>) {
    const delta = chunk?.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/** Collect a full completion (non-streaming helper for the planner). */
async function completeOnce(
  systemPrompt: string,
  messages: ChatMessage[],
  model?: string | null,
): Promise<string> {
  let acc = "";
  for await (const delta of runStream(systemPrompt, messages, model)) {
    acc += delta;
  }
  return acc;
}

/**
 * Stream a single-turn CLI completion with the full composed pipeline.
 */
export async function* streamCompletion(
  messages: ChatMessage[],
  opts: ComposeOptions,
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = composeSystemPrompt(opts);
  yield* runStream(systemPrompt, messages, opts.model ?? null);
}

/* ------------------------------------------------------------------ *
 * Coding Plan — structured implementation roadmap
 * ------------------------------------------------------------------ */

export interface PlanRunOptions {
  task: string;
  skill?: SkillId | null;
  modules?: ModuleId[];
  workspace?: string | null;
  model?: string | null;
}

export type PlanEvent =
  | { type: "delta"; content: string }
  | { type: "plan"; plan: CodingPlan }
  | { type: "done" }
  | { type: "error"; content: string };

/**
 * Generate a structured CodingPlan for a task.
 *
 * Streams raw JSON deltas as zLM 1.0 writes them (for a progress signal),
 * then yields a final `plan` event with the parsed + validated structure.
 * If JSON parsing fails, yields an `error` event instead.
 */
export async function* generatePlan(
  opts: PlanRunOptions,
): AsyncGenerator<PlanEvent, void, unknown> {
  const basePrompt = composeSystemPrompt({
    mode: "chat",
    skill: opts.skill ?? null,
    modules: opts.modules ?? [],
    workspace: opts.workspace ?? null,
    model: opts.model ?? null,
  });

  const systemPrompt = `${basePrompt}\n\n${PLAN_SCHEMA_INSTRUCTIONS}`;

  const userMessage: ChatMessage = {
    role: "user",
    content: `Produce a coding implementation plan for this task:\n\n${opts.task}`,
  };

  let acc = "";
  try {
    for await (const delta of runStream(systemPrompt, [userMessage], opts.model ?? null)) {
      acc += delta;
      yield { type: "delta", content: delta };
    }
  } catch (err) {
    yield {
      type: "error",
      content: `Plan generation failed: ${
        err instanceof Error ? err.message : "unknown"
      }`,
    };
    return;
  }

  const plan = parsePlan(acc);
  if (!plan) {
    yield {
      type: "error",
      content:
        "Could not parse a valid plan from the model output. Try rephrasing the task or running /plan again.",
    };
    return;
  }

  yield { type: "plan", plan };
  yield { type: "done" };
}

/* ------------------------------------------------------------------ *
 * Agents — multi-step plan → execute
 * ------------------------------------------------------------------ */

export interface AgentRunOptions {
  agentType: AgentId;
  goal: string;
  skill?: SkillId | null;
  modules?: ModuleId[];
  workspace?: string | null;
  model?: string | null;
  /** Prior conversation (for context continuity). */
  priorMessages?: ChatMessage[];
}

export type AgentEvent =
  | { type: "plan"; steps: PlanStep[] }
  | { type: "step_start"; index: number; title: string }
  | { type: "delta"; index: number; content: string }
  | { type: "step_end"; index: number }
  | { type: "done" }
  | { type: "error"; content: string };

/** Extract the first JSON array `[...]` from a model response. */
function extractJsonArray(text: string): unknown[] | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Ask the planner for an ordered step list. */
async function planAgent(
  agent: AgentMeta,
  goal: string,
  opts: AgentRunOptions,
): Promise<PlanStep[]> {
  const systemPrompt = composeSystemPrompt({
    mode: "chat",
    skill: opts.skill ?? agent.defaultSkill ?? null,
    modules: opts.modules ?? [],
    workspace: opts.workspace ?? null,
    model: opts.model ?? null,
  });

  const plannerSystem = `${systemPrompt}\n\n${agent.plannerPrompt}\n\nRespond with ONLY a JSON array. Each element: {"title": "<short imperative>", "detail": "<one sentence>"}. No prose, no code fences, no commentary. Maximum ${agent.maxSteps} items.`;

  const raw = await completeOnce(plannerSystem, [
    { role: "user", content: `Goal: ${goal}` },
  ], opts.model ?? null);

  const arr = extractJsonArray(raw);
  if (!arr) {
    // Fallback: a single step that just executes the goal directly.
    return [
      {
        title: "Execute goal",
        detail: "The planner did not return a parseable plan; executing directly.",
      },
    ];
  }

  const steps: PlanStep[] = arr
    .map((item) => {
      if (item && typeof item === "object") {
        const o = item as { title?: unknown; detail?: unknown };
        return {
          title: typeof o.title === "string" ? o.title : "Untitled step",
          detail: typeof o.detail === "string" ? o.detail : "",
        };
      }
      return null;
    })
    .filter((s): s is PlanStep => s !== null)
    .slice(0, agent.maxSteps);

  return steps.length > 0
    ? steps
    : [{ title: "Execute goal", detail: "Empty plan; executing directly." }];
}

/**
 * Run an agent: plan the steps, then execute each step with zLM 1.0, yielding
 * AgentEvent objects the route handler frames as NDJSON.
 */
export async function* streamAgent(
  opts: AgentRunOptions,
): AsyncGenerator<AgentEvent, void, unknown> {
  const agent = AGENT_MAP.get(opts.agentType);
  if (!agent) {
    yield { type: "error", content: `Unknown agent: ${opts.agentType}` };
    return;
  }

  // 1) Plan
  let steps: PlanStep[];
  try {
    steps = await planAgent(agent, opts.goal, opts);
  } catch (err) {
    yield {
      type: "error",
      content: `Planning failed: ${err instanceof Error ? err.message : "unknown"}`,
    };
    return;
  }

  yield { type: "plan", steps };

  // 2) Execute each step
  const systemPrompt = composeSystemPrompt({
    mode: "chat",
    skill: opts.skill ?? agent.defaultSkill ?? null,
    modules: opts.modules ?? [],
    workspace: opts.workspace ?? null,
    model: opts.model ?? null,
  });

  const executorSystem = `${systemPrompt}\n\n${agent.executorPrompt}`;

  const stepResults: { title: string; detail: string; output: string }[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    yield { type: "step_start", index: i, title: step.title };

    const priorContext =
      stepResults.length > 0
        ? `\n\nPrevious steps completed:\n${stepResults
            .map(
              (s, idx) =>
                `${idx + 1}. ${s.title}\n   ${s.output.slice(0, 600)}`,
            )
            .join("\n")}`
        : "";

    const stepMessages: ChatMessage[] = [
      ...(opts.priorMessages ?? []),
      {
        role: "user",
        content: `GOAL: ${opts.goal}\n\nSTEP ${i + 1}/${steps.length}: ${step.title}\n${step.detail}${priorContext}\n\nExecute step ${i + 1} now.`,
      },
    ];

    let acc = "";
    try {
      for await (const delta of runStream(executorSystem, stepMessages, opts.model ?? null)) {
        acc += delta;
        yield { type: "delta", index: i, content: delta };
      }
    } catch (err) {
      yield {
        type: "error",
        content: `Step ${i + 1} failed: ${
          err instanceof Error ? err.message : "unknown"
        }`,
      };
      return;
    }

    stepResults.push({
      title: step.title,
      detail: step.detail,
      output: acc,
    });
    yield { type: "step_end", index: i };
  }

  yield { type: "done" };
}
