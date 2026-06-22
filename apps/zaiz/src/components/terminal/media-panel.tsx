"use client";

import { useCallback, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  Loader2,
  Download,
  AlertCircle,
  Sparkles,
  Film,
  Play,
  Check,
} from "lucide-react";
import { IMAGE_SIZES, VIDEO_SIZES, type ImageSize, type VideoSize, type VideoQuality } from "@/lib/media-types";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

type Tab = "image" | "video";

export function MediaPanel() {
  const [tab, setTab] = useState<Tab>("image");

  return (
    <div className="space-y-3">
      <SectionLabel>media studio · generate</SectionLabel>

      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-xl border border-emerald-500/10 bg-[#07090a]/40 p-1">
        <SubTab active={tab === "image"} onClick={() => setTab("image")} icon={<ImageIcon className="h-3.5 w-3.5" />} label="Image" />
        <SubTab active={tab === "video"} onClick={() => setTab("video")} icon={<Video className="h-3.5 w-3.5" />} label="Video" />
      </div>

      {tab === "image" ? <ImageGenerator /> : <VideoGenerator />}
    </div>
  );
}

/* ============== IMAGE ============== */

function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
        },
        body: JSON.stringify({ prompt: prompt.trim(), size }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      setResult(`data:${data.mimeType};base64,${data.base64}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [prompt, size, loading]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `zlm-image-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-2.5">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image to generate…"
        rows={3}
        className="terminal-scroll w-full resize-none rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      {/* Size selector */}
      <div>
        <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">size</div>
        <div className="grid grid-cols-2 gap-1">
          {IMAGE_SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSize(s.id)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-left transition-colors",
                size === s.id
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-[#07090a]/40 hover:border-emerald-500/20",
              )}
            >
              <div className={cn("font-mono text-[10.5px]", size === s.id ? "text-emerald-300" : "text-zinc-400")}>
                {s.label}
              </div>
              <div className="font-mono text-[9px] text-zinc-600">{s.id} · {s.ratio}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-2 font-mono text-[11px] font-medium text-emerald-300 transition-all hover:from-emerald-500/25 hover:to-emerald-500/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> generating…
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" /> generate image
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {result && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">
              <Check className="h-3 w-3" /> result
            </span>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <Download className="h-3 w-3" /> download
            </button>
          </div>
          <img src={result} alt="Generated" className="w-full" />
        </div>
      )}
    </div>
  );
}

/* ============== VIDEO ============== */

function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<VideoSize>("1280x720");
  const [quality, setQuality] = useState<VideoQuality>("speed");
  const [duration, setDuration] = useState(5);
  const [withAudio, setWithAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus("Creating task…");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
        },
        body: JSON.stringify({ prompt: prompt.trim(), size, quality, duration, withAudio }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let evt: { type?: string; taskId?: string; status?: string; videoUrl?: string; content?: string };
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.type === "task") {
            setStatus(`Task created: ${evt.taskId?.slice(0, 12)}…`);
          } else if (evt.type === "status") {
            setStatus(`${evt.status}… polling`);
          } else if (evt.type === "done") {
            setVideoUrl(evt.videoUrl ?? null);
            setStatus(null);
            setLoading(false);
            return;
          } else if (evt.type === "error") {
            throw new Error(evt.content ?? "Video generation failed");
          }
        }
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") {
        setStatus("cancelled");
      } else {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [prompt, size, quality, duration, withAudio, loading]);

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="space-y-2.5">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the video to generate…"
        rows={3}
        className="terminal-scroll w-full resize-none rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      {/* Size */}
      <div>
        <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">size</div>
        <div className="grid grid-cols-2 gap-1">
          {VIDEO_SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSize(s.id)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-left transition-colors",
                size === s.id
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-[#07090a]/40 hover:border-emerald-500/20",
              )}
            >
              <div className={cn("font-mono text-[10.5px]", size === s.id ? "text-emerald-300" : "text-zinc-400")}>
                {s.label}
              </div>
              <div className="font-mono text-[9px] text-zinc-600">{s.id}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality + duration */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">quality</div>
          <div className="flex gap-1">
            {(["speed", "quality"] as VideoQuality[]).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 font-mono text-[10.5px] transition-colors",
                  quality === q
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 text-zinc-500 hover:border-emerald-500/20",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">duration: {duration}s</div>
          <input
            type="range"
            min={1}
            max={10}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Audio toggle */}
      <button
        type="button"
        onClick={() => setWithAudio((a) => !a)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
          withAudio ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-zinc-800 bg-[#07090a]/40",
        )}
      >
        <span className={cn("flex h-4 w-4 items-center justify-center rounded border", withAudio ? "border-emerald-500/40 bg-emerald-500/20" : "border-zinc-700")}>
          {withAudio && <Check className="h-2.5 w-2.5 text-emerald-400" />}
        </span>
        <span className="font-mono text-[11px] text-zinc-400">with audio</span>
      </button>

      <button
        type="button"
        onClick={loading ? handleCancel : handleGenerate}
        disabled={!prompt.trim() && !loading}
        className={cn(
          "flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[11px] font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
          loading
            ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
            : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] text-emerald-300 hover:from-emerald-500/25 hover:to-emerald-500/10",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> cancel
          </>
        ) : (
          <>
            <Film className="h-3 w-3" /> generate video
          </>
        )}
      </button>

      {status && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2 font-mono text-[11px] text-emerald-300/80">
          <Loader2 className="h-3 w-3 animate-spin" />
          {status}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {videoUrl && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">
              <Check className="h-3 w-3" /> video ready
            </span>
            <a
              href={videoUrl}
              download={`zlm-video-${Date.now()}.mp4`}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <Download className="h-3 w-3" /> download
            </a>
          </div>
          <video src={videoUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
}

/* ============== shared ============== */

function SubTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all",
        active ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
      {children}
    </div>
  );
}
