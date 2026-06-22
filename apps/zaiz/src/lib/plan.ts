/**
 * GLM Coding Plan — client-safe types & schema.
 *
 * A CodingPlan is a structured implementation roadmap that zLM 1.0 produces
 * from a task description. It is NOT free-form markdown — it's strict JSON
 * matching the schema below, so the UI can render an interactive roadmap
 * (phases → files → steps) and the user can check off progress and execute
 * individual phases.
 *
 * Safe to import from both client and server code (no SDK imports).
 */

export type FileAction = "create" | "modify" | "delete";

export type Complexity = "low" | "medium" | "high";

/** A file touched by a phase. */
export interface PlanFile {
  path: string;
  action: FileAction;
  reason: string;
}

/** A single actionable step within a phase. */
export interface PlanStep {
  title: string;
  detail: string;
}

/** A phase = a coherent chunk of work that delivers a milestone. */
export interface PlanPhase {
  id: string;
  name: string;
  goal: string;
  files: PlanFile[];
  steps: PlanStep[];
  /** IDs of phases that must complete first. */
  dependencies: string[];
}

/** The full plan document. */
export interface CodingPlan {
  title: string;
  summary: string;
  complexity: Complexity;
  stack: string[];
  phases: PlanPhase[];
  risks: string[];
  acceptance: string[];
}

/** Wire events emitted by /api/plan (NDJSON). */
export type PlanEvent =
  | { type: "delta"; content: string }
  | { type: "plan"; plan: CodingPlan }
  | { type: "done" }
  | { type: "error"; content: string };

/** The exact schema instructions injected into the system prompt server-side. */
export const PLAN_SCHEMA_INSTRUCTIONS = `You are operating in PLAN mode. Produce a structured coding implementation plan as STRICT JSON — no markdown, no code fences, no commentary, no prose before or after. The JSON MUST match this TypeScript shape exactly:

{
  "title": string,                      // short imperative title for the whole task
  "summary": string,                    // 1-2 sentence overview of the approach
  "complexity": "low" | "medium" | "high",
  "stack": string[],                    // languages/frameworks/libs involved, e.g. ["TypeScript","React","Postgres"]
  "phases": [
    {
      "id": string,                     // short kebab-case id, e.g. "schema"
      "name": string,                   // human-readable phase name
      "goal": string,                   // what this phase delivers (one sentence)
      "files": [
        { "path": string, "action": "create" | "modify" | "delete", "reason": string }
      ],
      "steps": [
        { "title": string, "detail": string }   // concrete, imperative, ordered
      ],
      "dependencies": string[]          // ids of phases that must finish first; [] if none
    }
  ],
  "risks": string[],                    // top risks/gotchas, each one sentence
  "acceptance": string[]                // criteria that must be true when done
}

Rules:
- Output ONLY the JSON object. Start with { and end with }.
- 2-6 phases. Each phase 1-6 files and 2-6 steps.
- Order phases by dependency (earlier phases first).
- File paths must be concrete and relative (e.g. "src/lib/auth.ts"), never invented.
- Steps must be concrete and runnable/verifiable, not vague.
- Keep strings short and information-dense. No emoji.`;

/** Try to parse a CodingPlan from raw model output. Returns null on failure. */
export function parsePlan(raw: string): CodingPlan | null {
  if (!raw) return null;
  // Find the outermost JSON object.
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = raw.slice(start, end + 1);
  let obj: unknown;
  try {
    obj = JSON.parse(slice);
  } catch {
    return null;
  }
  return normalizePlan(obj);
}

/** Validate + coerce a parsed object into a CodingPlan, or return null. */
function normalizePlan(obj: unknown): CodingPlan | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;

  const title = typeof o.title === "string" ? o.title : "";
  const summary = typeof o.summary === "string" ? o.summary : "";
  const complexity: Complexity =
    o.complexity === "low" || o.complexity === "medium" || o.complexity === "high"
      ? (o.complexity as Complexity)
      : "medium";

  const stack = Array.isArray(o.stack)
    ? o.stack.filter((s): s is string => typeof s === "string")
    : [];

  const phases: PlanPhase[] = Array.isArray(o.phases)
    ? o.phases
        .map((p, i) => normalizePhase(p, i))
        .filter((p): p is PlanPhase => p !== null)
    : [];

  const risks = Array.isArray(o.risks)
    ? o.risks.filter((s): s is string => typeof s === "string")
    : [];
  const acceptance = Array.isArray(o.acceptance)
    ? o.acceptance.filter((s): s is string => typeof s === "string")
    : [];

  if (!title || phases.length === 0) return null;

  return { title, summary, complexity, stack, phases, risks, acceptance };
}

function normalizePhase(p: unknown, index: number): PlanPhase | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;

  const id =
    typeof o.id === "string" && o.id.trim()
      ? o.id
      : `phase-${index + 1}`;
  const name = typeof o.name === "string" ? o.name : `Phase ${index + 1}`;
  const goal = typeof o.goal === "string" ? o.goal : "";

  const files: PlanFile[] = Array.isArray(o.files)
    ? o.files
        .map((f) => normalizeFile(f))
        .filter((f): f is PlanFile => f !== null)
    : [];

  const steps: PlanStep[] = Array.isArray(o.steps)
    ? o.steps
        .map((s) => normalizeStep(s))
        .filter((s): s is PlanStep => s !== null)
    : [];

  const dependencies = Array.isArray(o.dependencies)
    ? o.dependencies.filter((s): s is string => typeof s === "string")
    : [];

  if (steps.length === 0 && files.length === 0) return null;

  return { id, name, goal, files, steps, dependencies };
}

function normalizeFile(f: unknown): PlanFile | null {
  if (!f || typeof f !== "object") return null;
  const o = f as Record<string, unknown>;
  const path = typeof o.path === "string" ? o.path : "";
  const action: FileAction =
    o.action === "create" || o.action === "modify" || o.action === "delete"
      ? (o.action as FileAction)
      : "create";
  const reason = typeof o.reason === "string" ? o.reason : "";
  if (!path) return null;
  return { path, action, reason };
}

function normalizeStep(s: unknown): PlanStep | null {
  if (!s || typeof s !== "object") return null;
  const o = s as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title : "";
  const detail = typeof o.detail === "string" ? o.detail : "";
  if (!title) return null;
  return { title, detail };
}
