/**
 * Modules — client-safe registry of toggleable context tools.
 *
 * A Module is a capability the CLI "connects" to. When active, a module injects
 * a context sentence into the system prompt so zLM 1.0 reasons as if it has
 * that tool available. Modules are composed by the Connector.
 *
 * Safe to import from both client and server code (no SDK imports).
 */

export type ModuleId =
  | "filesystem"
  | "git"
  | "npm"
  | "regex"
  | "http"
  | "json"
  | "sql"
  | "docker";

export type ModuleCategory = "context" | "data" | "infra" | "tooling";

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  command: string;
  icon: string; // lucide icon name
  category: ModuleCategory;
  tagline: string;
  description: string;
  /** Context injected into the system prompt when this module is active. */
  context: string;
}

export const MODULES: ModuleMeta[] = [
  {
    id: "filesystem",
    name: "Filesystem",
    command: "/module filesystem",
    icon: "FolderTree",
    category: "context",
    tagline: "Project file awareness",
    description:
      "Treats the prompt as living inside a real project. Asks for or assumes file paths and a typical structure.",
    context:
      "MODULE [filesystem] ACTIVE: You have read access to the user's project tree. When relevant, reference concrete file paths (e.g. src/lib/db.ts) and assume a standard structure for the detected stack. If a path is ambiguous, state your assumption before proceeding.",
  },
  {
    id: "git",
    name: "Git",
    command: "/module git",
    icon: "GitBranch",
    category: "context",
    tagline: "Repository context",
    description:
      "Adds git awareness — branches, commits, diffs, and merge strategy.",
    context:
      "MODULE [git] ACTIVE: You have repository context. Reference branches, commits, and diffs where useful. Prefer small, reviewable commits and suggest the appropriate git workflow (feature branch, rebase vs merge) when relevant.",
  },
  {
    id: "npm",
    name: "Packages",
    command: "/module npm",
    icon: "Package",
    category: "tooling",
    tagline: "Dependency-aware",
    description:
      "Recommends exact, current package versions and install commands.",
    context:
      "MODULE [npm] ACTIVE: You know the project's dependencies. When recommending a library, give the exact install command (npm/pnpm/yarn/bun) and pin a current major version. Note bundle-size or peer-dep implications.",
  },
  {
    id: "regex",
    name: "Regex",
    command: "/module regex",
    icon: "Regex",
    category: "tooling",
    tagline: "Pattern tester",
    description:
      "Provides a regex tester mindset — always include test cases for patterns.",
    context:
      "MODULE [regex] ACTIVE: You have a regex tester. For any pattern, provide it in a ```regex block and include 3-5 matching/non-matching test cases in a table. Explain capture groups and flag any catastrophic backtracking risk.",
  },
  {
    id: "http",
    name: "HTTP",
    command: "/module http",
    icon: "Globe",
    category: "data",
    tagline: "Request modeling",
    description:
      "Models HTTP requests — shows curl equivalents, status codes, and headers.",
    context:
      "MODULE [http] ACTIVE: You can model HTTP requests. When describing an API call, show the method, path, headers, and body, plus a curl/fetch example. State expected status codes and error semantics.",
  },
  {
    id: "json",
    name: "JSON",
    command: "/module json",
    icon: "Braces",
    category: "data",
    tagline: "Schema & validation",
    description:
      "Validates JSON output and documents schemas.",
    context:
      "MODULE [json] ACTIVE: You have a JSON validator. When emitting JSON, ensure it is valid and parseable. For data shapes, provide a TypeScript interface or JSON Schema alongside the example payload.",
  },
  {
    id: "sql",
    name: "SQL",
    command: "/module sql",
    icon: "Database",
    category: "data",
    tagline: "Schema-aware queries",
    description:
      "Writes schema-aware SQL with indexes and explains the plan.",
    context:
      "MODULE [sql] ACTIVE: You have SQL context. Write dialect-appropriate, injection-safe queries (parameterized). Suggest indexes for the access patterns and briefly note the expected query plan. Define the assumed schema if not given.",
  },
  {
    id: "docker",
    name: "Docker",
    command: "/module docker",
    icon: "Container",
    category: "infra",
    tagline: "Containerization",
    description:
      "Provides Dockerfiles, compose, and image-size guidance.",
    context:
      "MODULE [docker] ACTIVE: You have containerization context. Provide multi-stage Dockerfiles, a compose snippet if useful, and call out image-size, layer-caching, and secret-handling concerns.",
  },
];

export const MODULE_MAP = new Map(MODULES.map((m) => [m.id, m]));

export const MODULE_CATEGORIES: { id: ModuleCategory; label: string }[] = [
  { id: "context", label: "Context" },
  { id: "tooling", label: "Tooling" },
  { id: "data", label: "Data" },
  { id: "infra", label: "Infra" },
];

export function getModule(id: string): ModuleMeta | undefined {
  return MODULE_MAP.get(id as ModuleId);
}
