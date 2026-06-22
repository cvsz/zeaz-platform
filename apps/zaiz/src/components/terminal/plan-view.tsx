"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Circle,
  CircleDot,
  Loader2,
  AlertCircle,
  FilePlus,
  FilePen,
  FileX,
  ChevronRight,
  Play,
  GitBranch,
  TriangleAlert,
  ListChecks,
  Layers,
  ClipboardList,
} from "lucide-react";
import type {
  CodingPlan,
  PlanPhase,
  PlanFile,
  FileAction,
  Complexity,
} from "@/lib/plan";
import { cn } from "@/lib/utils";

interface PlanViewProps {
  task: string;
  plan: CodingPlan | null;
  planning: boolean;
  error: string | null;
  /** progress[phaseIndex][stepIndex] = done */
  progress: boolean[][];
  onToggleStep: (phaseIndex: number, stepIndex: number) => void;
  onExecutePhase: (phase: PlanPhase) => void;
  executingPhaseId: string | null;
}

const COMPLEXITY_STYLE: Record<Complexity, { label: string; cls: string }> = {
  low: { label: "low", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  medium: { label: "medium", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
  high: { label: "high", cls: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
};

const FILE_ICON: Record<FileAction, typeof FilePlus> = {
  create: FilePlus,
  modify: FilePen,
  delete: FileX,
};

const FILE_COLOR: Record<FileAction, string> = {
  create: "text-emerald-400",
  modify: "text-amber-300",
  delete: "text-rose-400",
};

export function PlanView({
  task,
  plan,
  planning,
  error,
  progress,
  onToggleStep,
  onExecutePhase,
  executingPhaseId,
}: PlanViewProps) {
  return (
    <div className="mb-5 anim-fade-in-up">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-400/25 bg-gradient-to-br from-violet-400/15 to-violet-400/[0.03]">
          <ClipboardList className="h-3.5 w-3.5 text-violet-300" />
        </div>
        <span className="font-mono text-[12px] font-semibold tracking-wide text-violet-200/90">
          GLM Coding Plan
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-violet-400/40">
          roadmap
        </span>
        <div className="ml-auto">
          {planning ? (
            <span className="flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 font-mono text-[10px] font-medium text-violet-300">
              <Loader2 className="h-3 w-3 animate-spin" /> drafting
            </span>
          ) : plan ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-medium text-emerald-300">
              <Check className="h-3 w-3" /> ready
            </span>
          ) : error ? (
            <span className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-mono text-[10px] font-medium text-rose-300">
              <AlertCircle className="h-3 w-3" /> failed
            </span>
          ) : null}
        </div>
      </div>

      {/* Task */}
      <div className="mb-3 grad-border rounded-xl bg-gradient-to-br from-violet-400/[0.05] to-transparent px-4 py-3">
        <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.15em] text-violet-400/50">
          task
        </div>
        <div className="font-mono text-[13px] leading-relaxed text-zinc-100">{task}</div>
      </div>

      {/* Planning shimmer */}
      {planning && !plan && (
        <div className="mb-3 grad-border rounded-xl bg-[#0a0f0d]/50 px-4 py-8">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[12px] text-violet-300/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            zLM 1.0 is structuring the implementation plan…
          </div>
          <div className="mx-auto mt-4 h-1 w-2/3 overflow-hidden rounded-full bg-violet-400/10">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-400/60 to-transparent shimmer" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && !plan && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span className="font-mono text-[12px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Plan body */}
      {plan && (
        <PlanBody
          plan={plan}
          progress={progress}
          onToggleStep={onToggleStep}
          onExecutePhase={onExecutePhase}
          executingPhaseId={executingPhaseId}
        />
      )}
    </div>
  );
}

function PlanBody({
  plan,
  progress,
  onToggleStep,
  onExecutePhase,
  executingPhaseId,
}: {
  plan: CodingPlan;
  progress: boolean[][];
  onToggleStep: (phaseIndex: number, stepIndex: number) => void;
  onExecutePhase: (phase: PlanPhase) => void;
  executingPhaseId: string | null;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]));

  const toggleExpand = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const totalSteps = useMemo(
    () => plan.phases.reduce((acc, p) => acc + p.steps.length, 0),
    [plan],
  );
  const doneSteps = useMemo(
    () =>
      progress.reduce(
        (acc, phaseSteps, pi) =>
          acc + phaseSteps.slice(0, plan.phases[pi]?.steps.length ?? 0).filter(Boolean).length,
        0,
      ),
    [progress, plan],
  );
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const cStyle = COMPLEXITY_STYLE[plan.complexity];

  return (
    <div className="space-y-3">
      {/* Title + meta */}
      <div className="grad-border overflow-hidden rounded-xl bg-gradient-to-br from-violet-400/[0.06] to-transparent">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-[15px] font-semibold tracking-tight text-violet-50">
              {plan.title}
            </h3>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide",
                cStyle.cls,
              )}
            >
              {cStyle.label} complexity
            </span>
          </div>
          {plan.summary && (
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">
              {plan.summary}
            </p>
          )}
          {plan.stack.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {plan.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-zinc-700/50 bg-zinc-800/30 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalSteps > 0 && (
          <div className="border-t border-violet-400/[0.08] bg-violet-400/[0.02] px-4 py-2.5">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px]">
              <span className="text-zinc-500">
                {doneSteps}/{totalSteps} steps complete
              </span>
              <span className="font-medium text-violet-300">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-2">
        {plan.phases.map((phase, pi) => {
          const isOpen = expanded.has(pi);
          const phaseSteps = progress[pi] ?? [];
          const phaseDone = phaseSteps.filter(Boolean).length;
          const phaseTotal = phase.steps.length;
          const phaseComplete =
            phaseTotal > 0 && phaseDone === phaseTotal;
          const deps = phase.dependencies
            .map((d) => plan.phases.findIndex((p) => p.id === d))
            .filter((i) => i >= 0);

          return (
            <div
              key={phase.id}
              className={cn(
                "rounded-lg border transition-colors",
                phaseComplete
                  ? "border-emerald-500/25 bg-emerald-500/[0.03]"
                  : "border-violet-400/15 bg-[#0a0f0d]/40",
              )}
            >
              {/* Phase header */}
              <button
                type="button"
                onClick={() => toggleExpand(pi)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left"
              >
                <span className="shrink-0">
                  {phaseComplete ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : isOpen ? (
                    <CircleDot className="h-4 w-4 text-violet-300" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-600" />
                  )}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10 font-mono text-[10px] font-bold text-violet-300">
                  {pi + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-mono text-[12.5px] font-medium",
                        phaseComplete ? "text-emerald-200" : "text-zinc-100",
                      )}
                    >
                      {phase.name}
                    </span>
                    {phaseTotal > 0 && (
                      <span className="font-mono text-[10px] text-zinc-600">
                        {phaseDone}/{phaseTotal}
                      </span>
                    )}
                  </span>
                  {phase.goal && (
                    <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                      {phase.goal}
                    </span>
                  )}
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-zinc-600 transition-transform",
                    isOpen && "rotate-90",
                  )}
                />
              </button>

              {/* Phase body */}
              {isOpen && (
                <div className="border-t border-violet-400/10 px-3 py-2.5">
                  {/* Dependencies */}
                  {deps.length > 0 && (
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[10.5px] text-zinc-500">
                      <GitBranch className="h-3 w-3" />
                      depends on:{" "}
                      {deps.map((di, i) => (
                        <span key={di}>
                          {i > 0 && ", "}
                          <span className="text-violet-300">
                            {plan.phases[di].name}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Files */}
                  {phase.files.length > 0 && (
                    <div className="mb-2.5">
                      <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                        <Layers className="h-3 w-3" />
                        files · {phase.files.length}
                      </div>
                      <div className="space-y-1">
                        {phase.files.map((f, fi) => (
                          <FileRow key={fi} file={f} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps checklist */}
                  {phase.steps.length > 0 && (
                    <div className="mb-2.5">
                      <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                        <ListChecks className="h-3 w-3" />
                        steps · {phase.steps.length}
                      </div>
                      <div className="space-y-1">
                        {phase.steps.map((step, si) => {
                          const done = phaseSteps[si] ?? false;
                          return (
                            <button
                              key={si}
                              type="button"
                              onClick={() => onToggleStep(pi, si)}
                              className="group flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-violet-400/[0.05]"
                            >
                              <span className="mt-0.5 shrink-0">
                                {done ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-zinc-600 group-hover:text-violet-300" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    "font-mono text-[12px]",
                                    done
                                      ? "text-zinc-500 line-through"
                                      : "text-zinc-200",
                                  )}
                                >
                                  {step.title}
                                </span>
                                {step.detail && (
                                  <span className="block text-[11px] leading-snug text-zinc-500">
                                    {step.detail}
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Execute */}
                  <button
                    type="button"
                    onClick={() => onExecutePhase(phase)}
                    disabled={executingPhaseId !== null}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors",
                      executingPhaseId === phase.id
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                        : "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    {executingPhaseId === phase.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> executing…
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> execute phase
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Risks + acceptance */}
      {(plan.risks.length > 0 || plan.acceptance.length > 0) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {plan.risks.length > 0 && (
            <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.03] px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-400/70">
                <TriangleAlert className="h-3 w-3" /> risks
              </div>
              <ul className="space-y-1">
                {plan.risks.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-1.5 text-[11.5px] leading-snug text-zinc-400"
                  >
                    <span className="text-amber-400/60">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.acceptance.length > 0 && (
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                <ListChecks className="h-3 w-3" /> acceptance
              </div>
              <ul className="space-y-1">
                {plan.acceptance.map((a, i) => (
                  <li
                    key={i}
                    className="flex gap-1.5 text-[11.5px] leading-snug text-zinc-400"
                  >
                    <span className="text-emerald-400/60">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FileRow({ file }: { file: PlanFile }) {
  const Icon = FILE_ICON[file.action];
  return (
    <div className="flex items-start gap-2 rounded-md border border-zinc-800/50 bg-[#07090a]/40 px-2 py-1.5">
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", FILE_COLOR[file.action])} />
      <span className="min-w-0 flex-1">
        <span className="block break-all font-mono text-[11.5px] text-zinc-200">
          {file.path}
        </span>
        {file.reason && (
          <span className="block text-[10.5px] leading-snug text-zinc-600">
            {file.reason}
          </span>
        )}
      </span>
      <span
        className={cn(
          "shrink-0 rounded border px-1 py-0.5 font-mono text-[9px] uppercase",
          FILE_COLOR[file.action],
          file.action === "create"
            ? "border-emerald-500/20 bg-emerald-500/[0.06]"
            : file.action === "modify"
              ? "border-amber-400/20 bg-amber-400/[0.06]"
              : "border-rose-500/20 bg-rose-500/[0.06]",
        )}
      >
        {file.action}
      </span>
    </div>
  );
}
