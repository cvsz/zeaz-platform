import { getZAI } from "./glm";

/**
 * Voice — server-only.
 *
 * TTS: text → audio (WAV) via zai.audio.tts.create()
 * ASR: audio (base64) → text via zai.audio.asr.create()
 */

export type TTSVoice = "tongtong" | "chuichui" | "xiaochen" | "jam" | "kazi" | "douji" | "luodo";

export const TTS_VOICES: { id: TTSVoice; label: string; description: string }[] = [
  { id: "tongtong", label: "Tongtong", description: "Warm & friendly" },
  { id: "chuichui", label: "Chuichui", description: "Lively & cute" },
  { id: "xiaochen", label: "Xiaochen", description: "Calm & professional" },
  { id: "jam", label: "Jam", description: "British gentleman" },
  { id: "kazi", label: "Kazi", description: "Clear & standard" },
  { id: "douji", label: "Douji", description: "Natural & fluent" },
  { id: "luodo", label: "Luodo", description: "Expressive" },
];

/** Convert text to speech, returning a WAV audio Buffer. */
export async function textToSpeech(opts: {
  text: string;
  voice?: TTSVoice;
  speed?: number;
}): Promise<{ ok: boolean; buffer?: Buffer; error?: string }> {
  const text = opts.text.trim();
  if (!text) return { ok: false, error: "Text is required." };
  if (text.length > 1024) return { ok: false, error: "Text exceeds 1024 character limit." };

  const speed = Math.max(0.5, Math.min(2.0, opts.speed ?? 1.0));
  const voice = opts.voice ?? "tongtong";

  try {
    const zai = await getZAI();
    const response = await zai.audio.tts.create({
      input: text,
      voice,
      speed,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await (response as Response).arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    return { ok: true, buffer };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "TTS failed.",
    };
  }
}

/** Transcribe audio (base64) to text. */
export async function speechToText(opts: {
  audioBase64: string;
}): Promise<{ ok: boolean; text?: string; error?: string }> {
  const audioBase64 = opts.audioBase64?.trim();
  if (!audioBase64) return { ok: false, error: "Audio data is required." };

  try {
    const zai = await getZAI();
    const response = await zai.audio.asr.create({
      file_base64: audioBase64,
    });

    const text = (response as { text?: string }).text ?? "";
    if (!text) return { ok: false, error: "Empty transcription result." };
    return { ok: true, text };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "ASR failed.",
    };
  }
}
