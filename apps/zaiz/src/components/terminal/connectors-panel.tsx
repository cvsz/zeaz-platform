"use client";

import { useCallback, useState } from "react";
import { HardDrive, Mail, Loader2, AlertCircle, Search, ExternalLink, FileText, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectorTab = "drive" | "gmail" | "outlook";

export function ConnectorsPanel() {
  const [tab, setTab] = useState<ConnectorTab>("drive");
  return (
    <div className="space-y-3">
      <SectionLabel>connectors · external services</SectionLabel>
      <div className="flex gap-1 rounded-xl border border-emerald-500/10 bg-[#07090a]/40 p-1">
        <button onClick={() => setTab("drive")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all", tab === "drive" ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-500")}><HardDrive className="h-3.5 w-3.5" /> Drive</button>
        <button onClick={() => setTab("gmail")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all", tab === "gmail" ? "bg-rose-500/15 text-rose-300" : "text-zinc-500")}><Mail className="h-3.5 w-3.5" /> Gmail</button>
        <button onClick={() => setTab("outlook")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all", tab === "outlook" ? "bg-sky-500/15 text-sky-300" : "text-zinc-500")}><Inbox className="h-3.5 w-3.5" /> Outlook</button>
      </div>
      {tab === "drive" && <DriveConnector />}
      {tab === "gmail" && <GmailConnector />}
      {tab === "outlook" && <OutlookConnector />}
    </div>
  );
}

function DriveConnector() {
  const [data, setData] = useState<{ files: { id: string; name: string; mimeType: string; modifiedTime?: string; webViewLink?: string }[]; mock: boolean; status?: { message: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [content, setContent] = useState<{ name: string; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true); setError(null); setContent(null);
    try {
      const url = q ? `/api/gdrive?q=${encodeURIComponent(q)}` : "/api/gdrive";
      const res = await fetch(url);
      const d = await res.json();
      setData(d);
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  const readFile = async (id: string) => {
    try {
      const res = await fetch(`/api/gdrive?read=${id}`);
      const d = await res.json();
      if (d.ok) setContent({ name: d.name, content: d.content });
    } catch { setError("Failed to read file"); }
  };

  return (
    <div className="space-y-2.5">
      <MockBadge mock={data?.mock} message={data?.status?.message} />
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(query)} placeholder="Search files…" className="flex-1 rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none" />
        <button onClick={() => load(query || undefined)} disabled={loading} className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40">{loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />} {query ? "search" : "list"}</button>
      </div>
      {error && <ErrorBox text={error} />}
      {data?.files && data.files.length > 0 && (
        <div className="space-y-1">
          {data.files.map((f) => (
            <div key={f.id} className="grad-border rounded-xl bg-[#07090a]/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-400/60" />
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-zinc-200">{f.name}</span>
                {f.webViewLink && <a href={f.webViewLink} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-emerald-400"><ExternalLink className="h-3 w-3" /></a>}
              </div>
              <div className="mt-0.5 flex items-center gap-2 pl-5">
                <span className="font-mono text-[9px] text-zinc-600">{f.mimeType.split(".").pop()}</span>
                {f.modifiedTime && <span className="font-mono text-[9px] text-zinc-600">{new Date(f.modifiedTime).toLocaleDateString()}</span>}
                <button onClick={() => readFile(f.id)} className="ml-auto font-mono text-[9px] text-emerald-400/70 hover:text-emerald-300">read</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {content && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5"><span className="font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">{content.name}</span></div>
          <div className="terminal-scroll max-h-[250px] overflow-y-auto p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">{content.content}</pre></div>
        </div>
      )}
    </div>
  );
}

function GmailConnector() {
  const [data, setData] = useState<{ messages: { id: string; from: string; subject: string; snippet: string; date: string; unread: boolean }[]; mock: boolean; status?: { message: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [content, setContent] = useState<{ subject: string; from: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true); setError(null); setContent(null);
    try {
      const url = q ? `/api/gmail?q=${encodeURIComponent(q)}` : "/api/gmail";
      const res = await fetch(url); const d = await res.json(); setData(d);
    } catch { setError("Failed"); } finally { setLoading(false); }
  }, []);

  const readMsg = async (id: string) => {
    try { const res = await fetch(`/api/gmail?read=${id}`); const d = await res.json(); if (d.ok) setContent({ subject: d.subject, from: d.from, body: d.body }); }
    catch { setError("Failed to read"); }
  };

  return (
    <div className="space-y-2.5">
      <MockBadge mock={data?.mock} message={data?.status?.message} />
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(query)} placeholder="Search emails…" className="flex-1 rounded-xl border border-rose-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-rose-500/40 focus:outline-none" />
        <button onClick={() => load(query || undefined)} disabled={loading} className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-300 hover:bg-rose-500/20 disabled:opacity-40">{loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />} {query ? "search" : "inbox"}</button>
      </div>
      {error && <ErrorBox text={error} />}
      {data?.messages && data.messages.length > 0 && (
        <div className="space-y-1">
          {data.messages.map((m) => (
            <div key={m.id} className="grad-border rounded-xl bg-[#07090a]/40 px-3 py-2">
              <div className="flex items-center gap-2">
                {m.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="truncate font-mono text-[11.5px] text-zinc-200">{m.subject}</span></div>
                  <div className="font-mono text-[9px] text-zinc-600">{m.from} · {new Date(m.date).toLocaleDateString()}</div>
                </div>
                <button onClick={() => readMsg(m.id)} className="font-mono text-[9px] text-rose-400/70 hover:text-rose-300">read</button>
              </div>
              <p className="mt-0.5 pl-4 text-[10.5px] text-zinc-500">{m.snippet}</p>
            </div>
          ))}
        </div>
      )}
      {content && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="border-b border-rose-500/10 bg-rose-500/[0.03] px-3 py-1.5"><span className="font-mono text-[10px] text-rose-400/70">{content.subject}</span><span className="ml-2 font-mono text-[9px] text-zinc-600">{content.from}</span></div>
          <div className="terminal-scroll max-h-[250px] overflow-y-auto p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">{content.body}</pre></div>
        </div>
      )}
    </div>
  );
}

function OutlookConnector() {
  const [data, setData] = useState<{ messages: { id: string; from: string; subject: string; preview: string; received: string; isRead: boolean; importance: string }[]; mock: boolean; status?: { message: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [content, setContent] = useState<{ subject: string; from: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true); setError(null); setContent(null);
    try {
      const url = q ? `/api/outlook?q=${encodeURIComponent(q)}` : "/api/outlook";
      const res = await fetch(url); const d = await res.json(); setData(d);
    } catch { setError("Failed"); } finally { setLoading(false); }
  }, []);

  const readMsg = async (id: string) => {
    try { const res = await fetch(`/api/outlook?read=${id}`); const d = await res.json(); if (d.ok) setContent({ subject: d.subject, from: d.from, body: d.body }); }
    catch { setError("Failed"); }
  };

  return (
    <div className="space-y-2.5">
      <MockBadge mock={data?.mock} message={data?.status?.message} />
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(query)} placeholder="Search emails…" className="flex-1 rounded-xl border border-sky-400/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-sky-400/40 focus:outline-none" />
        <button onClick={() => load(query || undefined)} disabled={loading} className="flex items-center gap-1 rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 font-mono text-[11px] text-sky-300 hover:bg-sky-400/20 disabled:opacity-40">{loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />} {query ? "search" : "inbox"}</button>
      </div>
      {error && <ErrorBox text={error} />}
      {data?.messages && data.messages.length > 0 && (
        <div className="space-y-1">
          {data.messages.map((m) => (
            <div key={m.id} className="grad-border rounded-xl bg-[#07090a]/40 px-3 py-2">
              <div className="flex items-center gap-2">
                {!m.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />}
                {m.importance === "high" && <span className="rounded bg-rose-500/20 px-1 font-mono text-[7px] uppercase text-rose-400">high</span>}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[11.5px] text-zinc-200">{m.subject}</div>
                  <div className="font-mono text-[9px] text-zinc-600">{m.from} · {new Date(m.received).toLocaleDateString()}</div>
                </div>
                <button onClick={() => readMsg(m.id)} className="font-mono text-[9px] text-sky-400/70 hover:text-sky-300">read</button>
              </div>
              <p className="mt-0.5 pl-4 text-[10.5px] text-zinc-500">{m.preview}</p>
            </div>
          ))}
        </div>
      )}
      {content && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="border-b border-sky-400/10 bg-sky-400/[0.03] px-3 py-1.5"><span className="font-mono text-[10px] text-sky-400/70">{content.subject}</span><span className="ml-2 font-mono text-[9px] text-zinc-600">{content.from}</span></div>
          <div className="terminal-scroll max-h-[250px] overflow-y-auto p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">{content.body}</pre></div>
        </div>
      )}
    </div>
  );
}

function MockBadge({ mock, message }: { mock?: boolean; message?: string }) {
  if (mock === undefined) return null;
  return (
    <div className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[9.5px]", mock ? "border-amber-400/20 bg-amber-400/[0.05] text-amber-300" : "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-300")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", mock ? "bg-amber-400" : "bg-emerald-400")} />
      {message ?? (mock ? "Demo mode" : "Connected")}
    </div>
  );
}
function ErrorBox({ text }: { text: string }) {
  return <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /><span className="font-mono text-[11px] text-rose-300">{text}</span></div>;
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
