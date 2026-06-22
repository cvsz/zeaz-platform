import { NextRequest, NextResponse } from "next/server";
import { generateImage, checkMediaAuth, type ImageSize } from "@/lib/media";
import { generateLocalImage, isLocalMediaModel } from "@/lib/local-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/image
 * body: { prompt: string, size?: ImageSize, model?: string }
 *
 * When model === "zlm-1.0-local", generates an SVG offline (no API call).
 * Otherwise uses the z.ai image generation API.
 */
export async function POST(req: NextRequest) {
  const rejected = await checkMediaAuth(req);
  if (rejected) return rejected;

  let body: { prompt?: string; size?: ImageSize; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "`prompt` is required." }, { status: 400 });
  }

  // Local model: generate SVG offline
  if (isLocalMediaModel(body.model)) {
    const result = generateLocalImage(prompt);
    if (!result.ok || !result.svg) {
      return NextResponse.json({ ok: false, error: result.error ?? "Local image failed" }, { status: 500 });
    }
    const base64 = Buffer.from(result.svg).toString("base64");
    return NextResponse.json({ ok: true, base64, mimeType: result.mimeType });
  }

  const validSizes = [
    "1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1440x720", "720x1440",
  ];
  const size = (body.size && validSizes.includes(body.size as string) ? body.size : "1024x1024") as ImageSize;

  const result = await generateImage({ prompt: prompt.slice(0, 2000), size });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json(result);
}
