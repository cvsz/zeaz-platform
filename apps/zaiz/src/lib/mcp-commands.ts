/**
 * MCP CLI Connector — client-safe allowlist registry + types.
 *
 * The AI never gets raw shell access. It can only request operations by name;
 * the server resolves the name to a fixed command + args and executes it with
 * `shell: false`. Write/destructive commands require human approval.
 *
 * Safe to import from both client and server code (no SDK / child_process).
 */

export type CommandCategory =
  | "git"
  | "build"
  | "test"
  | "lint"
  | "docker"
  | "infra"
  | "meta";

export type CommandRisk = "read" | "write";

export interface CommandProfile {
  /** Unique key the AI requests, e.g. `git_status`. */
  name: string;
  /** Human label. */
  label: string;
  description: string;
  category: CommandCategory;
  /** `read` = safe to auto-run; `write` = needs human approval. */
  risk: CommandRisk;
  /** The binary to execute. */
  command: string;
  /** Fixed args — never interpolated from user input. */
  args: string[];
  /** Working directory (relative to workspace or absolute). */
  cwd?: string;
  /** Kill after N ms. */
  timeoutMs?: number;
  /** Short tag for the UI. */
  tag: string;
}

/** The allowlist. Adding a command here is the ONLY way the AI can run it. */
export const ALLOWED_COMMANDS: CommandProfile[] = [
  // --- git (read) ---
  {
    name: "git_status",
    label: "Git Status",
    description: "Show short working-tree status.",
    category: "git",
    risk: "read",
    command: "git",
    args: ["status", "--short"],
    timeoutMs: 10000,
    tag: "git",
  },
  {
    name: "git_branch",
    label: "Git Branch",
    description: "Show the current branch name.",
    category: "git",
    risk: "read",
    command: "git",
    args: ["branch", "--show-current"],
    timeoutMs: 10000,
    tag: "git",
  },
  {
    name: "git_diff",
    label: "Git Diff",
    description: "Show a stat summary of unstaged changes.",
    category: "git",
    risk: "read",
    command: "git",
    args: ["diff", "--stat"],
    timeoutMs: 10000,
    tag: "git",
  },
  {
    name: "git_log",
    label: "Git Log",
    description: "Show the last 10 commits.",
    category: "git",
    risk: "read",
    command: "git",
    args: ["log", "--oneline", "-10"],
    timeoutMs: 10000,
    tag: "git",
  },

  // --- build / test / lint (write — they mutate node_modules / dist) ---
  {
    name: "install",
    label: "Install Deps",
    description: "Install dependencies (bun install).",
    category: "build",
    risk: "write",
    command: "bun",
    args: ["install"],
    timeoutMs: 120000,
    tag: "install",
  },
  {
    name: "lint",
    label: "Lint",
    description: "Run ESLint.",
    category: "lint",
    risk: "read",
    command: "bun",
    args: ["run", "lint"],
    timeoutMs: 60000,
    tag: "lint",
  },
  {
    name: "typecheck",
    label: "Type Check",
    description: "Run TypeScript compiler in --noEmit mode.",
    category: "lint",
    risk: "read",
    command: "bunx",
    args: ["tsc", "--noEmit"],
    timeoutMs: 60000,
    tag: "tsc",
  },
  {
    name: "build",
    label: "Build",
    description: "Build the project (next build). Heavy — write op.",
    category: "build",
    risk: "write",
    command: "bun",
    args: ["run", "build"],
    timeoutMs: 300000,
    tag: "build",
  },

  // --- docker (read) ---
  {
    name: "docker_ps",
    label: "Docker PS",
    description: "List running containers.",
    category: "docker",
    risk: "read",
    command: "docker",
    args: ["ps", "--format", "table {{.Names}}\t{{.Status}}\t{{.Ports}}"],
    timeoutMs: 15000,
    tag: "docker",
  },
  {
    name: "docker_compose_config",
    label: "Compose Config",
    description: "Validate and print the composed docker config.",
    category: "docker",
    risk: "read",
    command: "docker",
    args: ["compose", "config"],
    timeoutMs: 15000,
    tag: "compose",
  },

  // --- meta ---
  {
    name: "list_cli_commands",
    label: "List Commands",
    description: "List all allowlisted CLI commands (meta).",
    category: "meta",
    risk: "read",
    command: "",
    args: [],
    timeoutMs: 1000,
    tag: "meta",
  },
];

export const COMMAND_MAP = new Map(ALLOWED_COMMANDS.map((c) => [c.name, c]));

export const COMMAND_CATEGORIES: { id: CommandCategory; label: string }[] = [
  { id: "git", label: "Git" },
  { id: "build", label: "Build" },
  { id: "test", label: "Test" },
  { id: "lint", label: "Lint" },
  { id: "docker", label: "Docker" },
  { id: "infra", label: "Infra" },
  { id: "meta", label: "Meta" },
];

export function getCommand(name: string): CommandProfile | undefined {
  return COMMAND_MAP.get(name);
}

export const VALID_COMMAND_NAMES = ALLOWED_COMMANDS.map((c) => c.name);

/** Wire events for /api/mcp execute (NDJSON). */
export type McpEvent =
  | { type: "start"; command: string; label: string }
  | { type: "stdout"; content: string }
  | { type: "stderr"; content: string }
  | { type: "done"; exitCode: number | null; durationMs: number }
  | { type: "error"; content: string };

/** Result of a command execution. */
export interface CommandResult {
  ok: boolean;
  commandName: string;
  command: string;
  args: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: string;
}
