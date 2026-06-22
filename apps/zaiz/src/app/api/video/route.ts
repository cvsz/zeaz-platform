import { NextRequest } from "next/server";
import {
  createVideoTask,
  pollVideoTask,
  checkMediaAuth,
  type VideoSize,
  type VideoQuality,
} from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/video
 * body: {
 *   prompt: string,
 *   quality?: "speed" | "quality",
 *   size?: VideoSize,
 *   fps?: number,
 *   duration?: number,
 *   withAudio?: boolean
 * }
 *
 * Response: NDJSON stream:
 *   {"type":"task","taskId":"..."}
 *   {"type":"status","status":"PROCESSING","poll":N}
 *   {"type":"done","videoUrl":"https://..."}
 *   {"type":"error","content":"..."}
 */
export async function POST(req: NextRequest) {
  const rejected = await checkMediaAuth(req);
  if (rejected) return rejected;

  let body: {
    prompt?: string;
    quality?: VideoQuality;
    size?: VideoSize;
    fps?: number;
    duration?: number;
    withAudio?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return jsonError("`prompt` is required.", 400);
  }

  const validSizes = ["1920x1080", "1080x1920", "1280x720", "720x1280"];
  const size = (body.size && validSizes.includes(body.size as string) ? body.size : "1280x720") as VideoSize;
  const quality = (body.quality === "quality" ? "quality" : "speed") as VideoQuality;
  const fps = typeof body.fps === "number" && body.fps >= 1 && body.fps <= 60 ? Math.floor(body.fps) : 30;
  const duration = typeof body.duration === "number" && body.duration >= 1 && body.duration <= 10 ? Math.floor(body.duration) : 5;
  const withAudio = body.withAudio === true;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      // 1) Create task
      const task = await createVideoTask({
        prompt: prompt.slice(0, 2000),
        quality,
        size,
        fps,
        duration,
        withAudio,
      });
      if (!task.ok || !task.taskId) {
        send({ type: "error", content: task.error ?? "Failed to create video task." });
        controller.close();
        return;
      }
      send({ type: "task", taskId: task.taskId });

      // 2) Poll until complete
      for await (const update of pollVideoTask(task.taskId)) {
        if (update.status === "SUCCESS" && update.videoUrl) {
          send({ type: "done", videoUrl: update.videoUrl });
          break;
        }
        if (update.status === "FAIL" || update.status === "TIMEOUT" || update.status === "ERROR") {
          send({ type: "error", content: update.error ?? `Video ${update.status.toLowerCase()}.` });
          break;
        }
        send({ type: "status", status: update.status });
      }
      controller.close();
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
