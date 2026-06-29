"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Creation {
  id: string;
  prompt: string;
  aspectRatio: string;
  resolution: string;
  model: string;
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  createdAt: string;
}

export default function VeoStudioPage() {
  // Mode Selection
  const [mode, setMode] = useState<"text-to-video" | "image-to-video" | "reference-to-video">("text-to-video");

  // Form State
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [model, setModel] = useState("lite");
  const [imageUrl, setImageUrl] = useState("");
  const [lastImage, setLastImage] = useState("");
  const [imagesListText, setImagesListText] = useState("");

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Historical generations in session state for prototype
  const [creations, setCreations] = useState<Creation[]>([]);

  // Periodically poll active "processing" creations
  useEffect(() => {
    const processing = creations.filter((c) => c.status === "processing");
    if (processing.length === 0) return;

    const interval = setInterval(async () => {
      const updated = await Promise.all(
        creations.map(async (c) => {
          if (c.status !== "processing") return c;
          try {
            const res = await fetch(`/api/zveo/v1/veo/status?request_id=${c.id}`);
            if (!res.ok) return c;
            const data = await res.json();
            if (data.status === "completed") {
              return { ...c, status: "completed" as const, videoUrl: data.videoUrl };
            } else if (data.status === "failed") {
              return { ...c, status: "failed" as const, error: data.error || "Generation failed" };
            }
          } catch (err) {
            console.error("Error polling creation status", err);
          }
          return c;
        })
      );
      setCreations(updated);
    }, 5000);

    return () => clearInterval(interval);
  }, [creations]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && mode === "text-to-video") {
      setError("Prompt is required for Text-to-Video");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage("Submitting generation request to MuAPI...");

    try {
      const imagesList = imagesListText
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const res = await fetch("/api/zveo/v1/veo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt,
          aspect_ratio: aspectRatio,
          resolution,
          duration: 8,
          model,
          image_url: imageUrl || undefined,
          last_image: lastImage || undefined,
          images_list: imagesList.length > 0 ? imagesList : undefined,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to submit request");
      }

      const data = await res.json();
      const requestId = data.request_id;

      if (!requestId) {
        throw new Error("No request ID received from API");
      }

      const newCreation: Creation = {
        id: requestId,
        prompt,
        aspectRatio,
        resolution,
        model,
        status: "processing",
        createdAt: new Date().toLocaleTimeString(),
      };

      setCreations([newCreation, ...creations]);
      setPrompt("");
      setImageUrl("");
      setLastImage("");
      setImagesListText("");
      setStatusMessage("Submission successful! Processing...");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-8 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs uppercase tracking-widest text-slate-400 hover:text-cyan-400">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Google Veo 3.1 & 4.0 Studio
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Generate cinematic high-fidelity AI videos via MuAPI edge endpoints.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start rounded-full border border-cyan-500/20 bg-cyan-950/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
            </span>
            Active Studio Connection
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Controls Panel */}
          <div className="lg:col-span-5">
            <form onSubmit={handleGenerate} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-900/60 p-1">
                {(["text-to-video", "image-to-video", "reference-to-video"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMode(t)}
                    className={`rounded-md py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
                      mode === t
                        ? "bg-cyan-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t.split("-")[0]}
                  </button>
                ))}
              </div>

              {/* Dynamic Inputs */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Prompt Description
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter visual directions, lighting, styling, camera motion..."
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                  />
                </div>

                {mode === "image-to-video" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        First Frame Image URL
                      </label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/start-frame.jpg"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 p-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Last Frame Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={lastImage}
                        onChange={(e) => setLastImage(e.target.value)}
                        placeholder="https://example.com/end-frame.jpg"
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 p-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {mode === "reference-to-video" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Reference Image URLs (One URL per line, max 3)
                    </label>
                    <textarea
                      rows={3}
                      value={imagesListText}
                      onChange={(e) => setImagesListText(e.target.value)}
                      placeholder="https://example.com/ref-1.jpg&#10;https://example.com/ref-2.jpg"
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                )}

                {/* Grid Settings */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Ratio
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none"
                    >
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Resolution
                    </label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none"
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="4k">4K (UHD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Model Tier
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 p-2 text-xs text-white outline-none"
                    >
                      <option value="lite">Lite</option>
                      <option value="fast">Fast</option>
                      <option value="quality">Quality</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status indicator / alerts */}
              {error && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              {statusMessage && !error && (
                <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-400">
                  {statusMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-sm font-semibold text-slate-950 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Generate Video Flow"}
              </button>
            </form>
          </div>

          {/* Outputs / Gallery Panel */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">Live Creations Output</h2>
              <p className="text-xs text-slate-400 mt-1">
                Creations in this session will update automatically upon MuAPI webhook callback completion.
              </p>

              {creations.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                  <div className="rounded-full bg-slate-900 p-4 text-slate-600">🎬</div>
                  <h3 className="mt-4 font-semibold text-white">No creations yet</h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs">
                    Choose a mode on the left, type a prompt description, and launch your video generation.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {creations.map((creation) => (
                    <div key={creation.id} className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] font-mono text-slate-500">ID: {creation.id}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{creation.createdAt}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              creation.status === "completed"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : creation.status === "failed"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse"
                            }`}
                          >
                            {creation.status}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-200 line-clamp-2">{creation.prompt}</p>

                      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5">{creation.aspectRatio}</span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5">{creation.resolution}</span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5">{creation.model}</span>
                      </div>

                      {creation.status === "completed" && creation.videoUrl && (
                        <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
                          <video src={creation.videoUrl} controls className="w-full max-h-[300px]" />
                        </div>
                      )}

                      {creation.status === "failed" && (
                        <div className="mt-3 text-xs text-red-400 bg-red-950/20 p-2.5 rounded border border-red-500/15">
                          {creation.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
