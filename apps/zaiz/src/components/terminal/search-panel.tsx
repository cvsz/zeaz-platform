"use client";

import { useCallback, useState } from "react";
import { Search, Loader2, ExternalLink, AlertCircle, Globe, FileText, BookOpen } from "lucide-react";
import type { SearchResult, PageContent } from "@/lib/web-tools-client";
import { cn } from "@/lib/utils";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [readingUrl, setReadingUrl] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setPageContent(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&num=8`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const handleReadPage = async (url: string) => {
    setReadingUrl(url);
    setPageContent(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setPageContent(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read page");
    } finally {
      setReadingUrl(null);
    }
  };

  return (
    <div className="space-y-3">
      <SectionLabel>web search tools · live results</SectionLabel>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search the web…"
          className="flex-1 rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
          search
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
            {results.length} results
          </div>
          {results.map((r, i) => (
            <div key={i} className="grad-border rounded-xl bg-[#07090a]/40 p-2.5">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 shrink-0 text-emerald-400/60" />
                <span className="font-mono text-[9px] text-zinc-600">{r.host_name}</span>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-zinc-600 hover:text-emerald-400"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block font-mono text-[11.5px] font-medium text-emerald-300 hover:underline"
              >
                {r.name}
              </a>
              <p className="mt-0.5 text-[10.5px] leading-snug text-zinc-500">{r.snippet}</p>
              <button
                type="button"
                onClick={() => handleReadPage(r.url)}
                disabled={readingUrl === r.url}
                className="mt-1.5 flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 font-mono text-[9.5px] text-zinc-500 hover:border-emerald-500/25 hover:text-emerald-300 disabled:opacity-40"
              >
                {readingUrl === r.url ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <FileText className="h-2.5 w-2.5" />}
                read page
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Page content */}
      {pageContent && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">
              <FileText className="h-3 w-3" /> {pageContent.title}
            </span>
          </div>
          <div className="terminal-scroll max-h-[300px] overflow-y-auto p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">
              {pageContent.ok ? pageContent.text : pageContent.error}
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
