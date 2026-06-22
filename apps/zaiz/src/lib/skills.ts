/**
 * Skills — client-safe registry of expert coding personas.
 *
 * A Skill is a named, specialized system-prompt layer that sharpens zLM 1.0
 * for a specific task. Skills are composable on top of the base CLI modes and
 * modules via the Connector (see `connector.ts`).
 *
 * Safe to import from both client and server code (no SDK imports).
 */

export type SkillId =
  | "code-review"
  | "refactor"
  | "add-tests"
  | "generate-docs"
  | "security-audit"
  | "performance-audit"
  | "commit-message"
  | "explain-architecture"
  | "migrate"
  | "format-code";

export interface SkillMeta {
  id: SkillId;
  name: string;
  command: string;
  icon: string; // lucide icon name
  tagline: string;
  description: string;
  /** Specialized instructions appended to the system prompt when active. */
  systemPrompt: string;
  examples: string[];
}

export const SKILLS: SkillMeta[] = [
  {
    id: "code-review",
    name: "Code Review",
    command: "/skill code-review",
    icon: "ShieldCheck",
    tagline: "Strict, severity-tagged review",
    description:
      "Review code like a senior staff engineer. Find bugs, security holes, and style issues, ranked by severity.",
    systemPrompt:
      "SKILL: code-review. Act as a strict staff-level reviewer. Organize findings under **Critical**, **Warning**, and **Nit**. For each: quote the line, explain the risk and blast radius, then give a corrected code block. End with a one-line verdict (Approve / Request changes / Block) and the top 3 things to fix first.",
    examples: [
      "Review this auth middleware for issues",
      "Audit this SQL query layer",
    ],
  },
  {
    id: "refactor",
    name: "Refactor",
    command: "/skill refactor",
    icon: "Wrench",
    tagline: "Restructure without behavior change",
    description:
      "Improve structure, naming, and design while preserving behavior. Show before/after and list behavioral guarantees.",
    systemPrompt:
      "SKILL: refactor. Refactor the code without changing observable behavior. (1) State what smells you're fixing. (2) Show the refactored code in one block. (3) List each change with the design principle it serves. (4) Explicitly call out any behavior you intentionally preserved and any you'd flag for the human to verify.",
    examples: [
      "Refactor this 200-line function into smaller units",
      "Convert this class to functional style",
    ],
  },
  {
    id: "add-tests",
    name: "Add Tests",
    command: "/skill add-tests",
    icon: "FlaskConical",
    tagline: "Generate a test suite",
    description:
      "Produce a thorough test suite covering happy paths, edge cases, and failure modes. Pick the right framework.",
    systemPrompt:
      "SKILL: add-tests. Generate a complete test suite. Choose the idiomatic framework for the language (Vitest/Jest for JS, pytest for Python, etc.). Cover: happy path, boundary values, error/invalid input, and one regression-style test. Use describe/it grouping and clear arrange-act-assert. Add a short note on coverage gaps you couldn't fill.",
    examples: [
      "Add tests for this debounce hook",
      "Write pytest cases for this parser",
    ],
  },
  {
    id: "generate-docs",
    name: "Generate Docs",
    command: "/skill generate-docs",
    icon: "BookOpen",
    tagline: "JSDoc, READMEs, API docs",
    description:
      "Write clear developer documentation — JSDoc/TSDoc comments, README sections, or API references.",
    systemPrompt:
      "SKILL: generate-docs. Write precise developer documentation. For functions/types emit TSDoc/JSDoc with @param, @returns, @throws, and a usage example. For modules produce a README section with purpose, install, usage, and options as a table. Keep prose minimal and examples runnable.",
    examples: [
      "Write TSDoc for this utility module",
      "Generate a README for this CLI tool",
    ],
  },
  {
    id: "security-audit",
    name: "Security Audit",
    command: "/skill security-audit",
    icon: "Lock",
    tagline: "Find vulnerabilities",
    description:
      "Threat-model the code and surface injection, auth, crypto, and secret-handling risks with concrete fixes.",
    systemPrompt:
      "SKILL: security-audit. Act as an application security engineer. Map the attack surface, then list findings by severity (Critical/High/Medium/Low) using OWASP categories. For each: the vulnerable line, the attack scenario, and a minimal fix as a code block. Note any input-validation, authz, or secret-management gaps. Never suggest disabling security controls.",
    examples: [
      "Audit this login endpoint",
      "Check this file-upload handler for path traversal",
    ],
  },
  {
    id: "performance-audit",
    name: "Performance Audit",
    command: "/skill performance-audit",
    icon: "Gauge",
    tagline: "Find perf bottlenecks",
    description:
      "Identify complexity, allocation, and I/O bottlenecks. Provide measured expectations and faster alternatives.",
    systemPrompt:
      "SKILL: performance-audit. Find performance bottlenecks. For each: the line, the complexity (Big-O) or cost, why it's slow, and an optimized code block. Rank by expected impact. Where relevant, suggest caching, batching, lazy loading, or algorithmic swaps. Include a micro-benchmark sketch for the top item.",
    examples: [
      "Why is this render loop slow?",
      "Optimize this data pipeline",
    ],
  },
  {
    id: "commit-message",
    name: "Commit Message",
    command: "/skill commit-message",
    icon: "GitCommitHorizontal",
    tagline: "Conventional commits",
    description:
      "Turn a diff or change description into clean Conventional Commits messages.",
    systemPrompt:
      "SKILL: commit-message. Produce Conventional Commits messages. Output a primary commit (type(scope): summary) plus 0-3 logical follow-up commits if the change should be split. Keep summaries <= 50 chars, imperative mood. Add a body explaining the why for the primary commit. Offer the final messages in a ```bash code block ready to paste.",
    examples: [
      "Write commits for: added retry logic to fetcher",
      "Draft a commit for this diff",
    ],
  },
  {
    id: "explain-architecture",
    name: "Explain Architecture",
    command: "/skill explain-architecture",
    icon: "Network",
    tagline: "System design walkthrough",
    description:
      "Explain how a system fits together — components, data flow, boundaries, and trade-offs.",
    systemPrompt:
      "SKILL: explain-architecture. Explain the architecture as you would to a new senior hire. Cover: components & responsibilities, data flow (request and async), boundaries/interfaces, persistence, and the key trade-offs/risks. Use an ASCII or mermaid diagram where it helps. End with the 3 places you'd look first if something broke.",
    examples: [
      "Explain a typical Next.js App Router architecture",
      "Walk through how a JWT auth flow fits together",
    ],
  },
  {
    id: "migrate",
    name: "Migrate",
    command: "/skill migrate",
    icon: "ArrowLeftRight",
    tagline: "Migrate code & APIs",
    description:
      "Migrate code across versions, frameworks, or languages. Show the migration and list breaking changes.",
    systemPrompt:
      "SKILL: migrate. Migrate the given code to the target version/framework/language. Show the migrated code in one block, then list every breaking change you handled and any behavior that differs. Flag anything that needs manual attention (deprecated APIs, config changes, runtime differences). Provide the install/migration shell commands in a ```bash block.",
    examples: [
      "Migrate this JS to strict TypeScript",
      "Migrate Next.js pages router to App Router",
    ],
  },
  {
    id: "format-code",
    name: "Format Code",
    command: "/skill format-code",
    icon: "AlignLeft",
    tagline: "Consistent style",
    description:
      "Apply consistent formatting and style. State the style rules applied and output clean code.",
    systemPrompt:
      "SKILL: format-code. Apply consistent formatting and style to the code. Output the formatted code in one block. Then list the style rules you enforced (indentation, quotes, semis, line length, naming, import order) and any style decisions the human should confirm. Don't change logic.",
    examples: [
      "Format and lint this file",
      "Standardize this messy module",
    ],
  },
];

export const SKILL_MAP = new Map(SKILLS.map((s) => [s.id, s]));

export function getSkill(id: string): SkillMeta | undefined {
  return SKILL_MAP.get(id as SkillId);
}
