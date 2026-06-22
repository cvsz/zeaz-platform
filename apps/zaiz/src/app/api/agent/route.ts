import { NextRequest } from "next/server";
import { streamAgent, type AgentEvent, type ChatMessage } from "@/lib/glm";
import type { AgentId } from "@/lib/agents";
import type { SkillId } from "@/lib/skills";
import type { ModuleId } from "@/lib/modules";
import { VALID_MODEL_IDS } from "@/lib/models";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * zLM 1.0 Coding CLI — agent endpoint (multi-step plan → execute).
 *
 * POST /api/agent
 * body: {
 *   agentType: AgentId,
 *   goal: string,
 *   skill?: SkillId,
 *   modules?: ModuleId[],
 *   workspace?: string,
 *   model?: string,
 *   priorMessages?: ChatMessage[]
 * }
 *
 * Response: NDJSON stream of AgentEvent:
 *   {"type":"plan","steps":[{title,detail},...]}
 *   {"type":"step_start","index":N,"title":"..."}
 *   {"type":"delta","index":N,"content":"..."}
 *   {"type":"step_end","index":N}
 *   {"type":"done"}
 *   {"type":"error","content":"..."}
 */
const VALID_AGENTS = ["architect", "bug-hunter", "refactorer"];
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
    agentType?: AgentId;
    goal?: string;
    skill?: SkillId | null;
    modules?: ModuleId[];
    workspace?: string | null;
    model?: string | null;
    priorMessages?: ChatMessage[];
  };

  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const { agentType, goal } = body;

  if (!agentType || !VALID_AGENTS.includes(agentType as string)) {
    return jsonError("`agentType` must be one of: architect, bug-hunter, refactorer.", 400);
  }
  if (!goal || typeof goal !== "string" || goal.trim().length === 0) {
    return jsonError("`goal` is required.", 400);
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
  const priorMessages: ChatMessage[] = Array.isArray(body.priorMessages)
    ? body.priorMessages
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: AgentEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(evt) + "\n"));
      };

      try {
        for await (const evt of streamAgent({
          agentType: agentType as AgentId,
          goal: goal.slice(0, 4000),
          skill: finalSkill,
          modules: finalModules,
          workspace: finalWorkspace,
          model: finalModel,
          priorMessages,
        })) {
          send(evt);
          if (evt.type === "error") break;
        }
      } catch (err) {
        send({
          type: "error",
          content: err instanceof Error ? err.message : "Unknown agent error.",
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
