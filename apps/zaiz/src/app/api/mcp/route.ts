import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_COMMANDS, type McpEvent } from "@/lib/mcp-commands";
import { resolveCommand, streamAllowedCommand } from "@/lib/mcp-runner";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * MCP CLI Connector endpoint.
 *
 * GET  /api/mcp              — list allowlisted commands
 * POST /api/mcp              — execute a command
 *   body: { command: string, approve?: boolean }
 *
 * POST streams NDJSON:
 *   {"type":"start","command":"git_status","label":"Git Status"}
 *   {"type":"stdout","content":"..."}
 *   {"type":"stderr","content":"..."}
 *   {"type":"done","exitCode":0,"durationMs":42}
 *   {"type":"error","content":"..."}
 */
export async function GET() {
  return NextResponse.json({
    commands: ALLOWED_COMMANDS.map((c) => ({
      name: c.name,
      label: c.label,
      description: c.description,
      category: c.category,
      risk: c.risk,
      command: c.command,
      args: c.args,
      timeoutMs: c.timeoutMs,
    })),
    note: "Only allowlisted commands can be executed. Write commands require approval.",
  });
}

export async function POST(req: NextRequest) {
  // API key validation (only enforces if require-key is enabled).
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return jsonError(auth.error ?? "Unauthorized", auth.status);
  }

  let body: { command?: string; approve?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const name = typeof body.command === "string" ? body.command.trim() : "";
  if (!name) {
    return jsonError("`command` is required.", 400);
  }

  const approve = body.approve === true;
  const resolved = resolveCommand(name, approve);
  if (!resolved.ok) {
    return jsonError(resolved.error, resolved.status);
  }

  const profile = resolved.profile;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: McpEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(evt) + "\n"));
      };

      send({ type: "start", command: profile.name, label: profile.label });

      try {
        for await (const chunk of streamAllowedCommand(profile)) {
          if (chunk.kind === "stdout") {
            send({ type: "stdout", content: chunk.content ?? "" });
          } else if (chunk.kind === "stderr") {
            send({ type: "stderr", content: chunk.content ?? "" });
          } else if (chunk.kind === "done") {
            send({
              type: "done",
              exitCode: chunk.exitCode ?? null,
              durationMs: chunk.durationMs ?? 0,
            });
          } else if (chunk.kind === "error") {
            send({ type: "error", content: chunk.error ?? "unknown error" });
          }
        }
      } catch (err) {
        send({
          type: "error",
          content: err instanceof Error ? err.message : "execution failed",
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
