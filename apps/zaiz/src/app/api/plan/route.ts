import { NextRequest } from "next/server";
import { generatePlan, type PlanEvent } from "@/lib/glm";
import type { SkillId } from "@/lib/skills";
import type { ModuleId } from "@/lib/modules";
import { VALID_MODEL_IDS } from "@/lib/models";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * zLM 1.0 Coding CLI — Coding Plan endpoint.
 *
 * POST /api/plan
 * body: {
 *   task: string,
 *   skill?: SkillId,
 *   modules?: ModuleId[],
 *   workspace?: string,
 *   model?: string
 * }
 *
 * Response: NDJSON stream of PlanEvent:
 *   {"type":"delta","content":"..."}   — raw JSON tokens (progress)
 *   {"type":"plan","plan":{...}}        — parsed structured plan
 *   {"type":"done"}
 *   {"type":"error","content":"..."}
 */
const VALID_SKILLS = [
  "code-review", "refactor", "add-tests", "generate-docs", "security-audit",
  "performance-audit", "commit-message", "explain-architecture", "migrate", "format-code",
];
const VALID_MODULES = ["filesystem", "git", "npm", "regex", "http", "json", "sql", "docker"];

export async function POST(req: NextRequest) {
  // API key validation (only enforces if require-key is enabled).
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return jsonError(auth.error ?? "Unauthorized", auth.status);
  }

  let body: {
    task?: string;
    skill?: SkillId | null;
    modules?: ModuleId[];
    workspace?: string | null;
    model?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const { task } = body;
  if (!task || typeof task !== "string" || task.trim().length === 0) {
    return jsonError("`task` is required.", 400);
  }

  const finalSkill: SkillId | null =
    body.skill && VALID_SKILLS.includes(body.skill as string) ? (body.skill as SkillId) : null;
  const finalModules: ModuleId[] = Array.isArray(body.modules)
    ? (body.modules.filter((m) => VALID_MODULES.includes(m as string)) as ModuleId[])
    : [];
  const finalWorkspace: string | null =
    typeof body.workspace === "string" && body.workspace.trim().length > 0
      ? body.workspace.slice(0, 12000)
      : null;
  const finalModel: string | null =
    typeof body.model === "string" && VALID_MODEL_IDS.includes(body.model) ? body.model : null;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: PlanEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(evt) + "\n"));
      };

      try {
        for await (const evt of generatePlan({
          task: task.slice(0, 4000),
          skill: finalSkill,
          modules: finalModules,
          workspace: finalWorkspace,
          model: finalModel,
        })) {
          send(evt);
          if (evt.type === "error") break;
        }
      } catch (err) {
        send({
          type: "error",
          content: err instanceof Error ? err.message : "Unknown plan error.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
