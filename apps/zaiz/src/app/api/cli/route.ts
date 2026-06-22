import { NextRequest } from "next/server";
import {
  streamCompletion,
  type ChatMessage,
  type CliMode,
} from "@/lib/glm";
import type { SkillId } from "@/lib/skills";
import type { ModuleId } from "@/lib/modules";
import { VALID_MODEL_IDS } from "@/lib/models";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * zLM 1.0 Coding CLI — streaming endpoint.
 *
 * POST /api/cli
 * body: {
 *   messages: ChatMessage[],
 *   mode: CliMode,
 *   skill?: SkillId,
 *   modules?: ModuleId[],
 *   workspace?: string,
 *   model?: string
 * }
 *
 * Response: NDJSON stream:
 *   {"type":"delta","content":"..."}
 *   {"type":"done"}
 *   {"type":"error","content":"..."}
 */
const VALID_MODES = ["chat", "explain", "debug", "generate", "review", "optimize"];
const VALID_SKILLS = [
  "code-review", "refactor", "add-tests", "generate-docs", "security-audit",
  "performance-audit", "commit-message", "explain-architecture", "migrate", "format-code",
];
const VALID_MODULES = [
  "filesystem", "git", "npm", "regex", "http", "json", "sql", "docker",
];

export async function POST(req: NextRequest) {
  // API key validation (only enforces if require-key is enabled).
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return jsonError(auth.error ?? "Unauthorized", auth.status);
  }

  let body: {
    messages?: ChatMessage[];
    mode?: CliMode;
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

  const { messages, mode, skill, modules, workspace, model } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError("`messages` must be a non-empty array.", 400);
  }

  const finalMode: CliMode = (mode && VALID_MODES.includes(mode) ? mode : "chat") as CliMode;
  const finalSkill: SkillId | null =
    skill && VALID_SKILLS.includes(skill as string) ? (skill as SkillId) : null;
  const finalModules: ModuleId[] = Array.isArray(modules)
    ? (modules.filter((m) => VALID_MODULES.includes(m as string)) as ModuleId[])
    : [];
  const finalWorkspace: string | null =
    typeof workspace === "string" && workspace.trim().length > 0
      ? workspace.slice(0, 12000)
      : null;
  const finalModel: string | null =
    typeof model === "string" && VALID_MODEL_IDS.includes(model) ? model : null;

  const cleanMessages: ChatMessage[] = messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        for await (const delta of streamCompletion(cleanMessages, {
          mode: finalMode,
          skill: finalSkill,
          modules: finalModules,
          workspace: finalWorkspace,
          model: finalModel,
        })) {
          send({ type: "delta", content: delta });
        }
        send({ type: "done" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown streaming error.";
        send({ type: "error", content: message });
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
