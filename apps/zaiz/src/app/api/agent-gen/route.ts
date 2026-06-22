import { NextRequest } from "next/server";
import { generateAgent, AGENT_TEMPLATES, type AgentGenEvent } from "@/lib/agent-gen";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/agent-gen — list templates */
export async function GET() {
  return Response.json({ templates: AGENT_TEMPLATES });
}

/** POST /api/agent-gen { description, model? } — stream NDJSON */
export async function POST(req: NextRequest) {
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) return jsonError(auth.error ?? "Unauthorized", auth.status);

  let body: { description?: string; model?: string | null };
  try { body = await req.json(); } catch { return jsonError("Invalid JSON.", 400); }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description) return jsonError("`description` is required.", 400);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: AgentGenEvent) => controller.enqueue(encoder.encode(JSON.stringify(evt) + "\n"));
      try {
        for await (const evt of generateAgent(description, body.model ?? null)) {
          send(evt);
          if (evt.type === "error") break;
        }
      } catch (err) {
        send({ type: "error", content: err instanceof Error ? err.message : "Failed" });
      } finally { controller.close(); }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { "Content-Type": "application/json" } });
}
