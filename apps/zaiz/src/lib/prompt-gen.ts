import { runStream } from "./glm";
import type { ChatMessage } from "./zlm-modes";

/**
 * Prompts generator — server-only.
 *
 * Uses GLM to generate optimized prompts based on a user's description.
 * Produces ready-to-use system prompts, few-shot examples, and structured
 * prompt templates.
 */

export interface GeneratedPrompt {
  title: string;
  systemPrompt: string;
  userTemplate: string;
  tips: string[];
}

export type PromptEvent =
  | { type: "delta"; content: string }
  | { type: "done"; prompt: GeneratedPrompt }
  | { type: "error"; content: string };

/** Generate an optimized prompt from a description, streaming the raw output. */
export async function* generatePrompt(
  description: string,
  model?: string | null,
): AsyncGenerator<PromptEvent, void, unknown> {
  const systemPrompt = `You are an expert prompt engineer. Given a description, generate an optimized, production-ready prompt.

Respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "title": "<short title>",
  "systemPrompt": "<the full system prompt to use — detailed, with rules and output format>",
  "userTemplate": "<a user message template with {placeholder} variables>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Make the systemPrompt specific, actionable, and include:
- Role definition
- Clear rules (numbered)
- Output format specification
- Edge case handling

Keep it under 500 words total.`;

  const messages: ChatMessage[] = [
    { role: "user", content: `Generate a prompt for: ${description}` },
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

  // Parse the JSON
  try {
    const start = acc.indexOf("{");
    const end = acc.lastIndexOf("}");
    if (start === -1 || end === -1) {
      yield { type: "error", content: "Could not parse generated prompt" };
      return;
    }
    const parsed = JSON.parse(acc.slice(start, end + 1));
    const prompt: GeneratedPrompt = {
      title: String(parsed.title ?? "Untitled Prompt"),
      systemPrompt: String(parsed.systemPrompt ?? ""),
      userTemplate: String(parsed.userTemplate ?? ""),
      tips: Array.isArray(parsed.tips) ? parsed.tips.map(String) : [],
    };
    yield { type: "done", prompt };
  } catch {
    yield { type: "error", content: "Failed to parse prompt JSON" };
  }
}

/** Prompt templates the user can start from. */
export const PROMPT_TEMPLATES: { label: string; description: string; text: string }[] = [
  {
    label: "Code Reviewer",
    description: "Review code for bugs, security, and best practices",
    text: "A senior code reviewer that finds bugs, security issues, and style problems in code, organized by severity",
  },
  {
    label: "API Designer",
    description: "Design REST/GraphQL APIs from requirements",
    text: "An API designer that takes a feature description and produces a complete API spec with endpoints, schemas, and examples",
  },
  {
    label: "Test Writer",
    description: "Generate comprehensive test suites",
    text: "A test engineer that writes thorough test suites covering happy paths, edge cases, and failure modes",
  },
  {
    label: "Doc Writer",
    description: "Generate documentation from code",
    text: "A technical writer that generates clear developer documentation including JSDoc, README sections, and API references",
  },
  {
    label: "SQL Optimizer",
    description: "Optimize SQL queries and schemas",
    text: "A database expert that optimizes SQL queries, suggests indexes, and explains query plans",
  },
  {
    label: "Security Auditor",
    description: "Audit code for vulnerabilities",
    text: "An application security engineer that finds vulnerabilities using OWASP categories and provides fixes",
  },
];
