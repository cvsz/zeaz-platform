/**
 * Client-safe GLM CLI modes & types.
 *
 * This module contains NO server-only imports (no z-ai-web-dev-sdk), so it is
 * safe to import from client components. The SDK-backed streaming logic lives
 * in `src/lib/glm.ts` (server-only).
 */

export type CliMode =
  | "chat"
  | "explain"
  | "debug"
  | "generate"
  | "review"
  | "optimize";

export interface CliModeMeta {
  id: CliMode;
  label: string;
  command: string;
  description: string;
  hint: string;
  accent: string;
}

/** Modes surfaced in the CLI command palette / `help` output. */
export const CLI_MODES: CliModeMeta[] = [
  {
    id: "chat",
    label: "Chat",
    command: "/chat",
    description: "General coding Q&A — ask anything about programming.",
    hint: "Ask any coding question",
    accent: "text-emerald-400",
  },
  {
    id: "explain",
    label: "Explain",
    command: "/explain",
    description: "Walk through how a piece of code or concept works.",
    hint: "Explain code or a concept",
    accent: "text-sky-300",
  },
  {
    id: "debug",
    label: "Debug",
    command: "/debug",
    description: "Find the root cause of a bug and propose a fix.",
    hint: "Find and fix a bug",
    accent: "text-rose-400",
  },
  {
    id: "generate",
    label: "Generate",
    command: "/generate",
    description: "Produce clean, production-ready code from a spec.",
    hint: "Generate code from a spec",
    accent: "text-amber-300",
  },
  {
    id: "review",
    label: "Review",
    command: "/review",
    description: "Review code for bugs, security, and best practices.",
    hint: "Review code for issues",
    accent: "text-violet-300",
  },
  {
    id: "optimize",
    label: "Optimize",
    command: "/optimize",
    description: "Improve performance, readability, and structure.",
    hint: "Optimize code performance",
    accent: "text-teal-300",
  },
];

export const MODE_COMMANDS = new Map(CLI_MODES.map((m) => [m.command, m.id]));

export const VALID_MODES: CliMode[] = CLI_MODES.map((m) => m.id);

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
