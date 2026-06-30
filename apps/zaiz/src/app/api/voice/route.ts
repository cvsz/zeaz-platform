import { NextRequest, NextResponse } from "next/server";
import { textToSpeech, speechToText, TTS_VOICES, type TTSVoice } from "@/lib/voice";
import { generateLocalAudio, isLocalMediaModel } from "@/lib/local-media";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Voice — TTS + ASR.
 *
 * POST /api/voice { action: "tts", text, voice?, speed? }
 *   → audio/wav binary response
 * POST /api/voice { action: "asr", audioBase64 }
 *   → { ok, text }
 * GET  /api/voice — list available TTS voices
 */
export async function GET() {
  return NextResponse.json({ voices: TTS_VOICES });
}

export async function POST(req: NextRequest) {
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }

  let body: { action?: string; text?: string; voice?: string; speed?: number; audioBase64?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = body.action;

  if (action === "tts") {
    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim()) return NextResponse.json({ error: "`text` is required." }, { status: 400 });
    const voice = (body.voice as TTSVoice) ?? "tongtong";
    const speed = typeof body.speed === "number" ? body.speed : 1.0;

    // Local model: generate beep melody offline
    if (isLocalMediaModel(body.model)) {
      const result = generateLocalAudio(text);
      if (!result.ok || !result.buffer) {
        return NextResponse.json({ error: result.error ?? "Local TTS failed." }, { status: 500 });
      }
      return new NextResponse(result.buffer as any, {
        status: 200,
        headers: { "Content-Type": "audio/wav", "Content-Length": result.buffer.length.toString(), "Cache-Control": "no-cache" },
      });
    }

    const result = await textToSpeech({ text, voice, speed });
    if (!result.ok || !result.buffer) {
      return NextResponse.json({ error: result.error ?? "TTS failed." }, { status: 500 });
    }
    return new NextResponse(result.buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": result.buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  }

  if (action === "asr") {
    const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
    if (!audioBase64) return NextResponse.json({ error: "`audioBase64` is required." }, { status: 400 });

    const result = await speechToText({ audioBase64 });
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "ASR failed." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, text: result.text });
  }

  return NextResponse.json({ error: "Unknown action. Use 'tts' or 'asr'." }, { status: 400 });
}
