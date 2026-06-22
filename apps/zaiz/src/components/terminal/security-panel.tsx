"use client";

import { useCallback, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, Loader2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Finding {
  id: string;
  rule: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  file: string;
  line: number;
  snippet: string;
  recommendation: string;
}

interface ScanResult {
  ok: boolean;
  filesScanned: number;
  findings: Finding[];
  summary: Record<string, number>;
  durationMs: number;
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: typeof Shield }> = {
  critical: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: ShieldAlert },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: ShieldAlert },
  medium: { color: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/30", icon: Shield },
  low: { color: "text-sky-300", bg: "bg-sky-400/10", border: "border-sky-400/30", icon: Shield },
  info: { color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/30", icon: Shield },
};

export function SecurityPanel() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const handleScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/security", { method: "POST" });
      if (!res.ok) throw new Error(`Scan failed (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }, []);

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <SectionLabel>security scanner · owasp top 10</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Scans all source files for vulnerabilities: hardcoded secrets, SQL injection, XSS, SSRF, weak crypto, and more. 20+ rules based on OWASP Top 10.
      </p>

      <button
        type="button"
        onClick={handleScan}
        disabled={scanning}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 to-rose-500/[0.05] px-3 py-2 font-mono text-[11px] font-medium text-rose-300 transition-all hover:from-rose-500/25 hover:to-rose-500/10 active:scale-[0.98] disabled:opacity-40"
      >
        {scanning ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> scanning…</>
        ) : (
          <><Shield className="h-3 w-3" /> run security scan</>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-2 anim-fade-in-up">
          {/* Summary */}
          <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              {result.findings.length === 0 ? (
                <><ShieldCheck className="h-4 w-4 text-emerald-400" /><span className="font-mono text-[12px] font-medium text-emerald-300">No issues found</span></>
              ) : (
                <><ShieldAlert className="h-4 w-4 text-rose-400" /><span className="font-mono text-[12px] font-medium text-rose-300">{result.findings.length} findings</span></>
              )}
              <span className="ml-auto font-mono text-[9.5px] text-zinc-600">{result.filesScanned} files · {result.durationMs}ms</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(["critical", "high", "medium", "low", "info"] as const).map((sev) => {
                const cfg = SEVERITY_CONFIG[sev];
                const count = result.summary[sev] ?? 0;
                return (
                  <div key={sev} className={cn("rounded-lg border p-2 text-center", cfg.border, cfg.bg)}>
                    <div className={cn("font-mono text-[16px] font-bold", cfg.color)}>{count}</div>
                    <div className="font-mono text-[7.5px] uppercase tracking-wide text-zinc-600">{sev}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Findings */}
          {result.findings.length > 0 && (
            <div className="space-y-1">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">findings</div>
              {result.findings.slice(0, 50).map((f, i) => {
                const cfg = SEVERITY_CONFIG[f.severity];
                const isOpen = expanded.has(i);
                return (
                  <div key={i} className={cn("grad-border overflow-hidden rounded-xl", cfg.border)}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(i)}
                      className={cn("flex w-full items-center gap-2 px-3 py-2 text-left", cfg.bg)}
                    >
                      {isOpen ? <ChevronDown className="h-3 w-3 shrink-0 text-zinc-500" /> : <ChevronRight className="h-3 w-3 shrink-0 text-zinc-500" />}
                      <span className={cn("font-mono text-[9px] uppercase font-bold", cfg.color)}>{f.severity}</span>
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-200">{f.rule}</span>
                      <code className="font-mono text-[9px] text-zinc-600">{f.file}:{f.line}</code>
                    </button>
                    {isOpen && (
                      <div className="border-t border-zinc-800/50 px-3 py-2">
                        <p className="mb-1 text-[10.5px] text-zinc-400">{f.description}</p>
                        <pre className="mb-1 overflow-x-auto rounded-md border border-zinc-800/50 bg-[#0a0f0d]/60 px-2 py-1 font-mono text-[10px] text-zinc-500">{f.snippet}</pre>
                        <p className="text-[10.5px] text-emerald-300/70">→ {f.recommendation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
