import { getZAI } from "./glm";
import { validateRequest, extractApiKey } from "./api-keys";
import type { NextRequest } from "next/server";
import type { ImageSize, VideoSize, VideoQuality } from "./media-types";

/**
 * Media generation — server-only.
 *
 * Image generation is synchronous (returns base64 immediately).
 * Video generation is async: create a task, then poll until SUCCESS.
 *
 * Client-safe types + size registries live in media-types.ts.
 */

export type { ImageSize, VideoSize, VideoQuality };
export { IMAGE_SIZES, VIDEO_SIZES } from "./media-types";

export interface ImageGenResult {
  ok: boolean;
  base64?: string;
  mimeType?: string;
  error?: string;
}

/** Generate an image synchronously. */
export async function generateImage(opts: {
  prompt: string;
  size?: ImageSize;
}): Promise<ImageGenResult> {
  const zai = await getZAI();
  try {
    const response = await zai.images.generations.create({
      prompt: opts.prompt,
      size: opts.size ?? "1024x1024",
    });
    const base64 = response?.data?.[0]?.base64;
    if (!base64) {
      return { ok: false, error: "No image data returned by the API." };
    }
    return { ok: true, base64, mimeType: "image/png" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Image generation failed.",
    };
  }
}

/* ---------------- video ---------------- */

export interface VideoTaskResult {
  ok: boolean;
  taskId?: string;
  videoUrl?: string;
  error?: string;
}

/** Create a video generation task. */
export async function createVideoTask(opts: {
  prompt: string;
  quality?: VideoQuality;
  size?: VideoSize;
  fps?: number;
  duration?: number;
  withAudio?: boolean;
}): Promise<VideoTaskResult> {
  const zai = await getZAI();
  try {
    const task = await zai.video.generations.create({
      prompt: opts.prompt,
      quality: opts.quality ?? "speed",
      size: opts.size ?? "1280x720",
      fps: opts.fps ?? 30,
      duration: opts.duration ?? 5,
      with_audio: opts.withAudio ?? false,
    });
    if (!task?.id) {
      return { ok: false, error: "No task ID returned." };
    }
    return { ok: true, taskId: task.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Video task creation failed.",
    };
  }
}

/** Poll a video task until it completes (or times out). Yields status updates. */
export async function* pollVideoTask(
  taskId: string,
  maxPolls = 60,
  intervalMs = 5000,
): AsyncGenerator<{ status: string; videoUrl?: string; error?: string }, void, unknown> {
  const zai = await getZAI();
  for (let i = 0; i < maxPolls; i++) {
    try {
      const result = await zai.async.result.query(taskId);
      const status = result?.task_status ?? "UNKNOWN";
      if (status === "SUCCESS") {
        const videoUrl =
          result?.video_result?.[0]?.url ??
          result?.video_url ??
          result?.url ??
          undefined;
        yield { status: "SUCCESS", videoUrl };
        return;
      }
      if (status === "FAIL") {
        yield { status: "FAIL", error: "Video generation failed on the server." };
        return;
      }
      yield { status };
    } catch (err) {
      yield {
        status: "ERROR",
        error: err instanceof Error ? err.message : "Polling error.",
      };
      return;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  yield { status: "TIMEOUT", error: "Video generation timed out." };
}

/* ---------------- shared auth helper ---------------- */

/** Validate an incoming media request. Returns null if ok, or a Response if rejected. */
export async function checkMediaAuth(req: NextRequest): Promise<Response | null> {
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ error: auth.error ?? "Unauthorized" }),
      {
        status: auth.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return null;
}
