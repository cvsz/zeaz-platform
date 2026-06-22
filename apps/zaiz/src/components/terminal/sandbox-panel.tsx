"use client";

import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Play, Loader2, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SandboxResult {
  ok: boolean;
  output: string[];
  returnValue: unknown;
  error?: string;
  durationMs: number;
}

interface Example { label: string; code: string }

export function SandboxPanel() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [running, setRunning] = useState(false);
  const [examples, setExamples] = useState<Example[]>([]);

  useEffect(() => {
    fetch("/api/sandbox")
      .then((r) => r.json())
      .then((d) => setExamples(d.examples ?? []))
      .catch(() => {});
  }, []);

  const handleRun = useCallback(async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({
        ok: false,
        output: [],
        returnValue: undefined,
        error: e instanceof Error ? e.message : "Execution failed",
        durationMs: 0,
      });
    } finally {
      setRunning(false);
    }
  }, [code, running]);

  const formatReturnValue = (v: unknown): string => {
    if (v === undefined) return "undefined";
    if (v === null) return "null";
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  return (
    <div className="space-y-3">
      <SectionLabel>sandbox · safe js execution</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Run JavaScript in an isolated scope with safe builtins only (no <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">require</code>, <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">process</code>, fs, or network). Use <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">return</code> for a return value.
      </p>

      {/* Examples */}
      {examples.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {examples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setCode(ex.code)}
              className="rounded-md border border-zinc-800 bg-[#0a0f0d]/40 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-emerald-500/25 hover:text-emerald-300"
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}

      {/* Code editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Write JavaScript and click Run&#10;const sum = [1,2,3].reduce((a,b) => a+b, 0);&#10;console.log('sum:', sum);&#10;return sum;"
        rows={8}
        className="terminal-scroll w-full resize-none rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleRun}
        disabled={!code.trim() || running}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-2 font-mono text-[11px] font-medium text-emerald-300 transition-all hover:from-emerald-500/25 hover:to-emerald-500/10 active:scale-[0.98] disabled:opacity-40"
      >
        {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
        run code
      </button>

      {/* Result */}
      {result && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl bg-[#050708]">
          <div className="flex items-center gap-2 border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5">
            {result.ok ? (
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-emerald-400">
                <Check className="h-3 w-3" /> success
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-rose-400">
                <X className="h-3 w-3" /> error
              </span>
            )}
            <span className="ml-auto font-mono text-[10px] text-zinc-600">{result.durationMs}ms</span>
          </div>
          <div className="terminal-scroll max-h-[260px] overflow-y-auto p-3">
            {result.output.length > 0 && (
              <pre className="mb-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-300">
                {result.output.join("\n")}
              </pre>
            )}
            {result.error && (
              <pre className="mb-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-rose-400">
                {result.error}
              </pre>
            )}
            {result.returnValue !== undefined && (
              <div>
                <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">return value</div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-emerald-300/80">
                  {formatReturnValue(result.returnValue)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
