"use client";

import { Check, CircleDot, Loader2, Circle, AlertCircle, Bot } from "lucide-react";
import type { AgentStepState, PlanStep } from "@/lib/agents";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";

interface AgentViewProps {
  agentName: string;
  goal: string;
  plan: PlanStep[] | null;
  steps: AgentStepState[];
  done: boolean;
  error: string | null;
}

/**
 * Renders an agent run: the goal, the planned steps as a checklist, and each
 * step's streaming output as it arrives.
 */
export function AgentView({
  agentName,
  goal,
  plan,
  steps,
  done,
  error,
}: AgentViewProps) {
  return (
    <div className="mb-5 anim-fade-in-up">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/25 bg-gradient-to-br from-amber-400/15 to-amber-400/[0.03]">
          <Bot className="h-3.5 w-3.5 text-amber-300" />
        </div>
        <span className="font-mono text-[12px] font-semibold tracking-wide text-amber-200/90">
          {agentName}
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-amber-400/40">
          agent
        </span>
        <div className="ml-auto">
          {done ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-medium text-emerald-300">
              <Check className="h-3 w-3" /> complete
            </span>
          ) : error ? (
            <span className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-mono text-[10px] font-medium text-rose-300">
              <AlertCircle className="h-3 w-3" /> failed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] font-medium text-amber-300">
              <Loader2 className="h-3 w-3 animate-spin" /> running
            </span>
          )}
        </div>
      </div>

      {/* Goal */}
      <div className="mb-3 grad-border rounded-xl bg-gradient-to-br from-amber-400/[0.05] to-transparent px-4 py-3">
        <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.15em] text-amber-400/50">
          goal
        </div>
        <div className="font-mono text-[13px] leading-relaxed text-zinc-100">
          {goal}
        </div>
      </div>

      {/* Plan */}
      {plan && (
        <div className="mb-3 grad-border overflow-hidden rounded-xl bg-[#0a0f0d]/50">
          <div className="flex items-center justify-between border-b border-emerald-500/[0.08] px-4 py-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-500">
              execution plan
            </span>
            <span className="font-mono text-[10px] text-emerald-400/60">
              {plan.length} steps
            </span>
          </div>
          <div className="space-y-0.5 px-2 py-2">
            {plan.map((p, i) => {
              const st = steps[i];
              const status = st?.status ?? "pending";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                    status === "running" && "bg-amber-400/[0.05]",
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {status === "done" ? (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check className="h-2.5 w-2.5 text-emerald-400" />
                      </div>
                    ) : status === "running" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    ) : status === "error" ? (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    ) : (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700">
                        <span className="font-mono text-[8px] text-zinc-600">{i + 1}</span>
                      </div>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "font-mono text-[12px] transition-colors",
                        status === "done"
                          ? "text-zinc-400"
                          : status === "running"
                            ? "font-medium text-amber-100"
                            : "text-zinc-500",
                      )}
                    >
                      {p.title}
                    </span>
                    {p.detail && (
                      <span className="block text-[11px] leading-snug text-zinc-600">
                        {p.detail}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step outputs */}
      {steps.map((step) =>
        step.content ? (
          <div
            key={`step-${step.index}`}
            className="mb-2.5 grad-border overflow-hidden rounded-xl bg-[#0a0f0d]/60 anim-fade-in-up"
          >
            <div className="flex items-center gap-2 border-b border-emerald-500/[0.08] bg-gradient-to-r from-emerald-500/[0.04] to-transparent px-4 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 font-mono text-[10px] font-bold text-emerald-300">
                {step.index + 1}
              </span>
              <span className="truncate font-mono text-[11px] text-zinc-400">
                {step.title}
              </span>
              {step.status === "running" && (
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-amber-400/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 anim-pulse-dot" />
                  streaming
                </span>
              )}
            </div>
            <div className="px-4 py-3">
              <Markdown content={step.content} />
            </div>
          </div>
        ) : null,
      )}

      {error && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span className="font-mono text-[12px] text-rose-300">{error}</span>
        </div>
      )}
    </div>
  );
}
