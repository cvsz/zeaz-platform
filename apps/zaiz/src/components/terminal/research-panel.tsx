"use client";

import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Play, Loader2, AlertCircle, Check, BookOpen, ExternalLink, FileText } from "lucide-react";
import type { SearchResult, PageContent } from "@/lib/web-tools-client";
import { cn } from "@/lib/utils";

export function ResearchPanel() {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState<PageContent | null>(null);
  const [reading, setReading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRead = useCallback(async () => {
    if (!url.trim() || reading) return;
    setReading(true);
    setError(null);
    setPage(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", url: url.trim() }),
      });
      const data = await res.json();
      setPage(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read");
    } finally {
      setReading(false);
    }
  }, [url, reading]);

  const handleSummarize = useCallback(async () => {
    if (summarizing) return;
    setSummarizing(true);
    setError(null);
    setSummary("");

    const text = page?.ok ? page.text : "";
    const body: { action: string; query?: string; url?: string; text?: string } = {
      action: "summarize",
      query: query.trim() || undefined,
    };
    if (text) body.text = text;
    else if (url.trim()) body.url = url.trim();
    else {
      setError("Read a page or provide a URL first.");
      setSummarizing(false);
      return;
    }

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Summarize failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === "delta") { acc += evt.content; setSummary(acc); }
            else if (evt.type === "error") throw new Error(evt.content);
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summarize failed");
    } finally {
      setSummarizing(false);
    }
  }, [summarizing, page, url, query]);

  return (
    <div className="space-y-3">
      <SectionLabel>research tools · read + summarize</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Read any web page and get a GLM-powered summary. Enter a URL, read it, then summarize.
      </p>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/article"
        className="w-full rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Focus the summary on… (optional)"
        className="w-full rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRead}
          disabled={!url.trim() || reading}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 font-mono text-[11px] text-sky-300 hover:bg-sky-400/20 disabled:opacity-40"
        >
          {reading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
          read page
        </button>
        <button
          type="button"
          onClick={handleSummarize}
          disabled={summarizing || (!page?.ok && !url.trim())}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-2 font-mono text-[11px] font-medium text-emerald-300 hover:from-emerald-500/25 hover:to-emerald-500/10 disabled:opacity-40"
        >
          {summarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookOpen className="h-3 w-3" />}
          summarize
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {page && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center gap-1.5 border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5">
            <FileText className="h-3 w-3 text-emerald-400/70" />
            <span className="truncate font-mono text-[10px] text-emerald-400/70">{page.title}</span>
          </div>
          <div className="terminal-scroll max-h-[200px] overflow-y-auto p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">
              {page.ok ? page.text.slice(0, 2000) : page.error}
            </pre>
          </div>
        </div>
      )}

      {summary && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center gap-1.5 border-b border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-1.5">
            <Check className="h-3 w-3 text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">summary</span>
          </div>
          <div className="p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed text-zinc-300">
              {summary}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
