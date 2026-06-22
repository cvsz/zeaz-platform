import { runStream } from "./glm";
import type { ChatMessage } from "./zlm-modes";

/**
 * Agents generator — server-only.
 *
 * Uses GLM to generate custom agent definitions from a description.
 * Produces a ready-to-use agent with planner + executor prompts.
 */

export interface GeneratedAgent {
  name: string;
  id: string;
  tagline: string;
  description: string;
  plannerPrompt: string;
  executorPrompt: string;
  maxSteps: number;
}

export type AgentGenEvent =
  | { type: "delta"; content: string }
  | { type: "done"; agent: GeneratedAgent }
  | { type: "error"; content: string };

/** Generate a custom agent definition, streaming the raw output. */
export async function* generateAgent(
  description: string,
  model?: string | null,
): AsyncGenerator<AgentGenEvent, void, unknown> {
  const systemPrompt = `You are an agent designer. Given a description, generate a complete multi-step agent definition.

Respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "name": "<human-readable name>",
  "id": "<kebab-case id>",
  "tagline": "<one-line description>",
  "description": "<2-3 sentence description of what the agent does>",
  "plannerPrompt": "<instructions for the planning phase — how to break the goal into steps>",
  "executorPrompt": "<instructions for executing each step>",
  "maxSteps": <number 3-8>
}

Make the prompts specific and actionable. The planner should produce a JSON array of steps. The executor should produce complete output for each step.`;

  const messages: ChatMessage[] = [
    { role: "user", content: `Design an agent for: ${description}` },
  ];

  let acc = "";
  try {
    for await (const delta of runStream(systemPrompt, messages, model ?? null)) {
      acc += delta;
      yield { type: "delta", content: delta };
    }
  } catch (err) {
    yield { type: "error", content: err instanceof Error ? err.message : "Generation failed" };
    return;
  }

  try {
    const start = acc.indexOf("{");
    const end = acc.lastIndexOf("}");
    if (start === -1 || end === -1) {
      yield { type: "error", content: "Could not parse agent JSON" };
      return;
    }
    const parsed = JSON.parse(acc.slice(start, end + 1));
    const agent: GeneratedAgent = {
      name: String(parsed.name ?? "Custom Agent"),
      id: String(parsed.id ?? "custom-agent"),
      tagline: String(parsed.tagline ?? ""),
      description: String(parsed.description ?? ""),
      plannerPrompt: String(parsed.plannerPrompt ?? ""),
      executorPrompt: String(parsed.executorPrompt ?? ""),
      maxSteps: Math.max(3, Math.min(8, typeof parsed.maxSteps === "number" ? parsed.maxSteps : 5)),
    };
    yield { type: "done", agent };
  } catch {
    yield { type: "error", content: "Failed to parse agent JSON" };
  }
}

/** Agent generation templates. */
export const AGENT_TEMPLATES: { label: string; description: string; text: string }[] = [
  {
    label: "Data Pipeline Builder",
    description: "Designs and builds data ETL pipelines",
    text: "An agent that designs and builds data ETL pipelines: extracts from sources, transforms data, and loads to destinations",
  },
  {
    label: "UI Component Creator",
    description: "Creates React UI components from specs",
    text: "An agent that creates production-ready React + TypeScript UI components with tests, stories, and documentation",
  },
  {
    label: "Migration Specialist",
    description: "Migrates code between frameworks/versions",
    text: "An agent that migrates codebases between frameworks or versions, handling breaking changes and producing migration guides",
  },
  {
    label: "Performance Optimizer",
    description: "Profiles and optimizes application performance",
    text: "An agent that profiles application performance, identifies bottlenecks, and implements optimizations with benchmarks",
  },
  {
    label: "DevOps Automator",
    description: "Sets up CI/CD, Docker, and infrastructure",
    text: "An agent that sets up CI/CD pipelines, Docker configurations, and infrastructure-as-code from project requirements",
  },
];
