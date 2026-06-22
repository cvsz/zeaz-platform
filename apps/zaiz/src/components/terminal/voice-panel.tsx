"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Square, Volume2, Loader2, AlertCircle, Play, Pause } from "lucide-react";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

export function VoicePanel() {
  // --- TTS state ---
  const [ttsText, setTtsText] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- ASR / push-to-talk state ---
  const [recording, setRecording] = useState(false);
  const [asrLoading, setAsrLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleTTS = useCallback(async () => {
    if (!ttsText.trim() || ttsLoading) return;
    setTtsLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
        },
        body: JSON.stringify({ action: "tts", text: ttsText.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "TTS failed");
    } finally {
      setTtsLoading(false);
    }
  }, [ttsText, ttsLoading]);

  const playAudio = () => {
    if (!audioUrl || !audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  // --- Push to talk ---
  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          setAsrLoading(true);
          try {
            const res = await fetch("/api/voice", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
              },
              body: JSON.stringify({ action: "asr", audioBase64: base64 }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error ?? "ASR failed");
            setTranscript(data.text ?? "");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Transcription failed");
          } finally {
            setAsrLoading(false);
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone access denied");
    }
  }, []);

  const stopRecording = () => {
    if (mediaRef.current && recording) {
      mediaRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="space-y-3">
      <SectionLabel>voice · tts + push to talk</SectionLabel>

      {/* TTS */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
          <Volume2 className="h-3 w-3" /> text → speech
        </div>
        <textarea
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          placeholder="Type text to speak…"
          rows={3}
          className="mb-2 w-full resize-none rounded-lg border border-emerald-500/15 bg-[#0a0f0d]/60 px-2.5 py-1.5 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleTTS}
          disabled={!ttsText.trim() || ttsLoading}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
        >
          {ttsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
          {ttsLoading ? "generating…" : "speak"}
        </button>
        {audioUrl && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={playAudio}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-2.5 py-1.5 font-mono text-[10.5px] text-emerald-300 hover:bg-emerald-500/15"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "pause" : "play"}
            </button>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
            <a href={audioUrl} download="tts.wav" className="font-mono text-[10px] text-zinc-500 hover:text-emerald-300">download</a>
          </div>
        )}
      </div>

      {/* Push to talk */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
          <Mic className="h-3 w-3" /> push to talk → speech → text
        </div>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={asrLoading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 font-mono text-[12px] font-medium transition-all active:scale-[0.98] disabled:opacity-50",
            recording
              ? "border-rose-500/40 bg-rose-500/15 text-rose-300 animate-pulse"
              : "border-sky-400/30 bg-sky-400/10 text-sky-300 hover:bg-sky-400/20",
          )}
        >
          {recording ? (
            <><Square className="h-4 w-4 fill-current" /> recording… tap to stop</>
          ) : asrLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> transcribing…</>
          ) : (
            <><Mic className="h-4 w-4" /> hold to talk</>
          )}
        </button>
        {transcript && (
          <div className="mt-2 rounded-lg border border-sky-400/20 bg-sky-400/[0.05] px-3 py-2">
            <div className="mb-0.5 font-mono text-[9px] uppercase tracking-wide text-sky-400/60">transcript</div>
            <p className="font-mono text-[12px] leading-relaxed text-zinc-200">{transcript}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
