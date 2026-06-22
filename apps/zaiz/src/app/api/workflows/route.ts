import { NextRequest } from "next/server";
import { streamWorkflow } from "@/lib/workflow-runner";
import { WORKFLOWS, type WorkflowEvent } from "@/lib/workflows";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** GET /api/workflows — list available workflows */
export async function GET() {
  return Response.json({ workflows: WORKFLOWS });
}

/** POST /api/workflows { workflowId, input, skill?, modules?, workspace?, model? } — stream NDJSON */
export async function POST(req: NextRequest) {
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return jsonError(auth.error ?? "Unauthorized", auth.status);
  }

  let body: { workflowId?: string; input?: string; skill?: string | null; modules?: string[]; workspace?: string | null; model?: string | null };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  const workflowId = typeof body.workflowId === "string" ? body.workflowId : "";
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (!workflowId || !input) {
    return jsonError("`workflowId` and `input` are required.", 400);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: WorkflowEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(evt) + "\n"));
      };
      try {
        for await (const evt of streamWorkflow(workflowId, input, {
          skill: body.skill ?? null,
          modules: body.modules ?? [],
          workspace: body.workspace ?? null,
          model: body.model ?? null,
        })) {
          send(evt);
          if (evt.type === "error") break;
        }
      } catch (err) {
        send({ type: "error", content: err instanceof Error ? err.message : "Workflow failed." });
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
