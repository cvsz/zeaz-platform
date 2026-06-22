"use client";

import { useCallback, useRef, useState } from "react";
import {
  TerminalSquare,
  Play,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Check,
  X,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  ALLOWED_COMMANDS,
  COMMAND_CATEGORIES,
  type CommandProfile,
  type CommandCategory,
} from "@/lib/mcp-commands";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface OutputLine {
  kind: "stdout" | "stderr" | "info";
  text: string;
}

export function McpPanel() {
  const [selected, setSelected] = useState<CommandProfile | null>(null);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [pendingApprove, setPendingApprove] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runCommand = useCallback(
    async (cmd: CommandProfile, approve: boolean) => {
      setRunning(true);
      setError(null);
      setOutput([]);
      setExitCode(null);
      setDurationMs(null);
      setNeedsApproval(false);
      setPendingApprove(false);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/mcp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
          },
          body: JSON.stringify({ command: cmd.name, approve }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Request failed (${res.status}).`;
          try {
            const errJson = await res.json();
            if (errJson?.error) detail = errJson.error;
          } catch {
            /* ignore */
          }
          // If it's an approval-required error, surface the approval UX.
          if (detail.includes("approval") || detail.includes("approve")) {
            setNeedsApproval(true);
          }
          setError(detail);
          setRunning(false);
          return;
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
            let evt: {
              type?: string;
              command?: string;
              label?: string;
              content?: string;
              exitCode?: number | null;
              durationMs?: number;
            };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "start") {
              setOutput((prev) => [
                ...prev,
                { kind: "info", text: `$ ${evt.label ?? evt.command}` },
              ]);
            } else if (evt.type === "stdout" && evt.content) {
              setOutput((prev) => [...prev, { kind: "stdout", text: evt.content! }]);
            } else if (evt.type === "stderr" && evt.content) {
              setOutput((prev) => [...prev, { kind: "stderr", text: evt.content! }]);
            } else if (evt.type === "done") {
              setExitCode(evt.exitCode ?? null);
              setDurationMs(evt.durationMs ?? null);
            } else if (evt.type === "error") {
              setError(evt.content ?? "unknown error");
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          setError("cancelled");
        } else {
          setError((err as Error)?.message ?? "execution failed");
        }
      } finally {
        setRunning(false);
        abortRef.current = null;
      }
    },
    [],
  );

  const handleRun = (cmd: CommandProfile) => {
    setSelected(cmd);
    runCommand(cmd, cmd.risk === "write");
  };

  const handleApprove = () => {
    if (!selected) return;
    setPendingApprove(true);
    runCommand(selected, true);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="space-y-3">
      <SectionLabel>mcp cli connector · allowlisted</SectionLabel>
      <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
        The AI can only request operations by name. The server resolves each to a
        fixed command + args and runs it with <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">shell: false</code>.
        Write commands need approval.
      </p>

      {/* Command list grouped by category */}
      <div className="space-y-3">
        {COMMAND_CATEGORIES.map((cat) => {
          const cmds = ALLOWED_COMMANDS.filter((c) => c.category === cat.id);
          if (cmds.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
                {cat.label}
              </div>
              <div className="space-y-1">
                {cmds.map((cmd) => (
                  <button
                    key={cmd.name}
                    type="button"
                    onClick={() => handleRun(cmd)}
                    disabled={running}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                      selected?.name === cmd.name
                        ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                        : "border-zinc-800 bg-[#07090a]/40 hover:border-emerald-500/25 hover:bg-emerald-500/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                        cmd.risk === "read"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-400/25 bg-amber-400/10 text-amber-300",
                      )}
                      title={cmd.risk === "read" ? "read-only" : "write — needs approval"}
                    >
                      {cmd.risk === "read" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <ShieldAlert className="h-3 w-3" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11.5px] font-medium text-zinc-200">
                          {cmd.label}
                        </span>
                        <code className="font-mono text-[9px] text-zinc-600">{cmd.name}</code>
                        {running && selected?.name === cmd.name && (
                          <Loader2 className="ml-auto h-3 w-3 animate-spin text-emerald-400" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-snug text-zinc-500">
                        {cmd.description}
                      </span>
                      <code className="mt-0.5 block font-mono text-[9px] text-zinc-700">
                        {cmd.command} {cmd.args.join(" ")}
                      </code>
                    </span>
                    {!running && (
                      <Play className="mt-1 h-3 w-3 shrink-0 text-zinc-700 transition-colors group-hover:text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval gate */}
      {needsApproval && selected && !pendingApprove && (
        <div className="grad-border anim-fade-in-up rounded-xl bg-amber-400/[0.06] p-3">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-300" />
            <span className="font-mono text-[11px] font-medium text-amber-200">
              Approval required
            </span>
          </div>
          <p className="mb-2 text-[10.5px] leading-relaxed text-zinc-400">
            <strong className="text-amber-300">{selected.label}</strong> is a write
            operation. Confirm to execute:
          </p>
          <code className="mb-2 block rounded-md border border-amber-400/20 bg-[#07090a]/60 px-2 py-1 font-mono text-[10px] text-amber-200">
            {selected.command} {selected.args.join(" ")}
          </code>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10.5px] text-emerald-300 hover:bg-emerald-500/20"
            >
              <Check className="h-3 w-3" /> approve & run
            </button>
            <button
              type="button"
              onClick={() => {
                setNeedsApproval(false);
                setError(null);
              }}
              className="flex items-center gap-1 rounded-md border border-zinc-700 px-2.5 py-1 font-mono text-[10.5px] text-zinc-400 hover:bg-zinc-800/50"
            >
              <X className="h-3 w-3" /> cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !needsApproval && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Output */}
      {(output.length > 0 || running) && (
        <div className="grad-border overflow-hidden rounded-xl bg-[#050708]">
          <div className="flex items-center justify-between border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">
              <TerminalSquare className="h-3 w-3" /> output
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
              {exitCode !== null && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-1.5 py-0.5",
                    exitCode === 0
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300",
                  )}
                >
                  {exitCode === 0 ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                  exit {exitCode}
                </span>
              )}
              {durationMs !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {durationMs}ms
                </span>
              )}
              {running && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
                >
                  <X className="h-2.5 w-2.5" /> stop
                </button>
              )}
            </div>
          </div>
          <div className="terminal-scroll max-h-[320px] overflow-y-auto p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
              {output.map((line, i) => (
                <span
                  key={i}
                  className={cn(
                    line.kind === "stderr" && "text-rose-400/80",
                    line.kind === "stdout" && "text-zinc-300",
                    line.kind === "info" && "text-emerald-400/70",
                  )}
                >
                  {line.text}
                  {i < output.length - 1 ? "\n" : ""}
                </span>
              ))}
              {running && (
                <span className="inline-block h-3 w-1.5 anim-blink bg-emerald-400/80 align-middle" />
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
      {children}
    </div>
  );
}
