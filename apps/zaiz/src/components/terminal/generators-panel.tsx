"use client";

import { useCallback, useRef, useState } from "react";
import { Wand2, Bot, Loader2, AlertCircle, Check, Copy, Sparkles, Cpu } from "lucide-react";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

type GenTab = "prompt" | "agent";

export function GeneratorsPanel() {
  const [tab, setTab] = useState<GenTab>("prompt");
  return (
    <div className="space-y-3">
      <SectionLabel>generators · ai-powered creation</SectionLabel>
      <div className="flex gap-1 rounded-xl border border-emerald-500/10 bg-[#07090a]/40 p-1">
        <button onClick={() => setTab("prompt")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all", tab === "prompt" ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-500")}><Wand2 className="h-3.5 w-3.5" /> Prompts</button>
        <button onClick={() => setTab("agent")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all", tab === "agent" ? "bg-amber-400/15 text-amber-300" : "text-zinc-500")}><Bot className="h-3.5 w-3.5" /> Agents</button>
      </div>
      {tab === "prompt" ? <PromptGenerator /> : <AgentGenerator />}
    </div>
  );
}

function PromptGenerator() {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ title: string; systemPrompt: string; userTemplate: string; tips: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!desc.trim() || loading) return;
    setLoading(true); setError(null); setResult(null); setParsed(null);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const res = await fetch("/api/prompt-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}) },
        body: JSON.stringify({ description: desc.trim() }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim(); buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === "delta") { acc += evt.content; setResult(acc); }
            else if (evt.type === "done") { setParsed(evt.prompt); }
            else if (evt.type === "error") { throw new Error(evt.content); }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); abortRef.current = null; }
  }, [desc, loading]);

  const handleCopy = async () => {
    if (!parsed) return;
    try { await navigator.clipboard.writeText(parsed.systemPrompt); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <div className="space-y-2.5">
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the prompt you need… (e.g. 'a code reviewer that finds security bugs')" rows={3}
        className="w-full resize-none rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none" />
      <button onClick={loading ? () => abortRef.current?.abort() : handleGenerate} disabled={!desc.trim() && !loading}
        className={cn("flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[11px] font-medium transition-all active:scale-[0.98] disabled:opacity-40",
          loading ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] text-emerald-300")}>
        {loading ? <><Loader2 className="h-3 w-3 animate-spin" /> cancel</> : <><Sparkles className="h-3 w-3" /> generate prompt</>}
      </button>
      {error && <ErrorBox text={error} />}
      {parsed && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center gap-2 border-b border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-1.5">
            <Check className="h-3 w-3 text-emerald-400" />
            <span className="font-mono text-[11px] font-medium text-emerald-300">{parsed.title}</span>
            <button onClick={handleCopy} className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300">
              {copied ? <><Check className="h-3 w-3" /> copied</> : <><Copy className="h-3 w-3" /> copy</>}
            </button>
          </div>
          <div className="terminal-scroll max-h-[300px] overflow-y-auto p-3 space-y-2">
            <div><div className="mb-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-600">system prompt</div><pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-300">{parsed.systemPrompt}</pre></div>
            {parsed.userTemplate && <div><div className="mb-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-600">user template</div><pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-emerald-300/80">{parsed.userTemplate}</pre></div>}
            {parsed.tips.length > 0 && <div><div className="mb-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-600">tips</div><ul className="space-y-0.5">{parsed.tips.map((t, i) => <li key={i} className="text-[11px] text-zinc-500">• {t}</li>)}</ul></div>}
          </div>
        </div>
      )}
      {result && !parsed && <div className="grad-border rounded-xl bg-[#07090a]/40 p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-zinc-500">{result}</pre></div>}
    </div>
  );
}

function AgentGenerator() {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ name: string; id: string; tagline: string; description: string; plannerPrompt: string; executorPrompt: string; maxSteps: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!desc.trim() || loading) return;
    setLoading(true); setError(null); setResult(null); setParsed(null);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const res = await fetch("/api/agent-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}) },
        body: JSON.stringify({ description: desc.trim() }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim(); buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === "delta") { acc += evt.content; setResult(acc); }
            else if (evt.type === "done") { setParsed(evt.agent); }
            else if (evt.type === "error") { throw new Error(evt.content); }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); abortRef.current = null; }
  }, [desc, loading]);

  const handleCopy = async () => {
    if (!parsed) return;
    const text = `const AGENT = {
  id: "${parsed.id}",
  name: "${parsed.name}",
  tagline: "${parsed.tagline}",
  description: "${parsed.description}",
  plannerPrompt: \`${parsed.plannerPrompt}\`,
  executorPrompt: \`${parsed.executorPrompt}\`,
  maxSteps: ${parsed.maxSteps},
};`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <div className="space-y-2.5">
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the agent you need… (e.g. 'an agent that builds data pipelines')" rows={3}
        className="w-full resize-none rounded-xl border border-amber-400/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/40 focus:outline-none" />
      <button onClick={loading ? () => abortRef.current?.abort() : handleGenerate} disabled={!desc.trim() && !loading}
        className={cn("flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[11px] font-medium transition-all active:scale-[0.98] disabled:opacity-40",
          loading ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-amber-400/30 bg-gradient-to-br from-amber-400/15 to-amber-400/[0.05] text-amber-300")}>
        {loading ? <><Loader2 className="h-3 w-3 animate-spin" /> cancel</> : <><Cpu className="h-3 w-3" /> generate agent</>}
      </button>
      {error && <ErrorBox text={error} />}
      {parsed && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center gap-2 border-b border-amber-400/10 bg-amber-400/[0.04] px-3 py-1.5">
            <Bot className="h-3 w-3 text-amber-400" />
            <span className="font-mono text-[11px] font-medium text-amber-300">{parsed.name}</span>
            <span className="font-mono text-[9px] text-zinc-600">{parsed.id} · {parsed.maxSteps} steps</span>
            <button onClick={handleCopy} className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 hover:bg-amber-400/10 hover:text-amber-300">
              {copied ? <><Check className="h-3 w-3" /> copied</> : <><Copy className="h-3 w-3" /> copy</>}
            </button>
          </div>
          <div className="terminal-scroll max-h-[300px] overflow-y-auto p-3 space-y-2">
            <p className="text-[11.5px] text-zinc-400">{parsed.description}</p>
            <p className="font-mono text-[10px] text-amber-300/70">{parsed.tagline}</p>
            <div><div className="mb-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-600">planner prompt</div><pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-300">{parsed.plannerPrompt}</pre></div>
            <div><div className="mb-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-600">executor prompt</div><pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-300">{parsed.executorPrompt}</pre></div>
          </div>
        </div>
      )}
      {result && !parsed && <div className="grad-border rounded-xl bg-[#07090a]/40 p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-zinc-500">{result}</pre></div>}
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /><span className="font-mono text-[11px] text-rose-300">{text}</span></div>;
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
