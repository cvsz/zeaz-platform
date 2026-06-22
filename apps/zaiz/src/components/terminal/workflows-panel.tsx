"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Workflow as WorkflowIcon, Play, Loader2, AlertCircle, Check, ArrowRight } from "lucide-react";
import type { Workflow } from "@/lib/workflows";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface NodeState {
  nodeId: string;
  label: string;
  status: "pending" | "running" | "done";
  content: string;
}

export function WorkflowsPanel() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((d) => {
        setWorkflows(d.workflows ?? []);
        if (d.workflows?.length > 0) setSelected(d.workflows[0].id);
      })
      .catch(() => {});
  }, []);

  const handleRun = useCallback(async () => {
    if (!selected || !input.trim() || running) return;
    setRunning(true);
    setError(null);
    setNodes([]);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getActiveKey() ? { "X-API-Key": getActiveKey()! } : {}),
        },
        body: JSON.stringify({ workflowId: selected, input: input.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Workflow failed");
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
          let evt: { type?: string; workflowName?: string; nodeCount?: number; nodeId?: string; nodeLabel?: string; index?: number; content?: string };
          try { evt = JSON.parse(line); } catch { continue; }
          if (evt.type === "node_start" && evt.nodeId) {
            setNodes((prev) => [...prev, { nodeId: evt.nodeId!, label: evt.nodeLabel ?? "", status: "running", content: "" }]);
          } else if (evt.type === "node_delta" && evt.nodeId) {
            setNodes((prev) => prev.map((n) => n.nodeId === evt.nodeId ? { ...n, content: n.content + (evt.content ?? "") } : n));
          } else if (evt.type === "node_end" && evt.nodeId) {
            setNodes((prev) => prev.map((n) => n.nodeId === evt.nodeId ? { ...n, status: "done" } : n));
          } else if (evt.type === "error") {
            throw new Error(evt.content ?? "Workflow error");
          }
        }
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Workflow failed");
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [selected, input, running]);

  const handleCancel = () => abortRef.current?.abort();

  const selectedWorkflow = workflows.find((w) => w.id === selected);

  return (
    <div className="space-y-3">
      <SectionLabel>agent workflows · multi-step dag</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Run multi-agent workflows that collaborate in sequence. Each node uses a different agent + mode, and passes its output to downstream nodes.
      </p>

      {/* Workflow selector */}
      <div className="space-y-1">
        {workflows.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setSelected(w.id)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left transition-colors",
              selected === w.id ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-zinc-800 bg-[#07090a]/40 hover:border-emerald-500/20",
            )}
          >
            <div className="flex items-center gap-2">
              <WorkflowIcon className={cn("h-3.5 w-3.5", selected === w.id ? "text-emerald-400" : "text-zinc-500")} />
              <span className="font-mono text-[12px] font-medium text-zinc-200">{w.name}</span>
              <span className="ml-auto font-mono text-[9px] text-zinc-600">{w.nodes.length} nodes</span>
            </div>
            <div className="mt-0.5 pl-5 text-[10.5px] text-zinc-500">{w.description}</div>
          </button>
        ))}
      </div>

      {/* Node flow visualization */}
      {selectedWorkflow && (
        <div className="flex flex-wrap items-center gap-1">
          {selectedWorkflow.nodes.map((n, i) => (
            <div key={n.id} className="flex items-center gap-1">
              <span className="rounded-md border border-zinc-800 bg-[#0a0f0d]/40 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-500">
                {n.label}
              </span>
              {i < selectedWorkflow.nodes.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-zinc-700" />}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe the task to run through the workflow…"
        rows={3}
        className="w-full resize-none rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      <button
        type="button"
        onClick={running ? handleCancel : handleRun}
        disabled={!input.trim() && !running}
        className={cn(
          "flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[11px] font-medium transition-all active:scale-[0.98] disabled:opacity-40",
          running ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] text-emerald-300 hover:from-emerald-500/25 hover:to-emerald-500/10",
        )}
      >
        {running ? <><Loader2 className="h-3 w-3 animate-spin" /> cancel</> : <><Play className="h-3 w-3" /> run workflow</>}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Node outputs */}
      {nodes.map((n) => (
        <div key={n.nodeId} className="grad-border anim-fade-in-up overflow-hidden rounded-xl bg-[#0a0f0d]/60">
          <div className="flex items-center gap-2 border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5">
            <span className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md font-mono text-[9px] font-bold",
              n.status === "done" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-400/15 text-amber-300",
            )}>
              {n.status === "done" ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
            </span>
            <span className="font-mono text-[11px] text-zinc-300">{n.label}</span>
            {n.status === "running" && <span className="ml-auto font-mono text-[9px] text-amber-400/70">streaming…</span>}
          </div>
          {n.content && (
            <div className="terminal-scroll max-h-[200px] overflow-y-auto p-3">
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">{n.content}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
