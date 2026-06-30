"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Cpu, Zap, Eye, Infinity as Inf, Brain, Search } from "lucide-react";
import {
  MODELS,
  MODEL_CATEGORIES,
  DEFAULT_MODEL_ID,
  type ModelMeta,
  type ModelCategory,
} from "@/lib/models";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

const CATEGORY_ICON: Record<ModelCategory, typeof Cpu> = {
  flagship: Brain,
  fast: Zap,
  air: Cpu,
  long: Inf,
  vision: Eye,
  legacy: Search,
  local: Cpu,
};

function SpeedMeter({ speed }: { speed: number }) {
  return (
    <span className="flex items-center gap-0.5" title={`Speed: ${speed}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-1 rounded-full",
            i < speed ? "bg-emerald-400/80" : "bg-zinc-700",
          )}
        />
      ))}
    </span>
  );
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const current = MODELS.find((m) => m.id === value) ?? MODELS.find((m) => m.id === DEFAULT_MODEL_ID)!;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const filterLower = filter.trim().toLowerCase();
  const matches = (m: ModelMeta) =>
    !filterLower ||
    m.id.includes(filterLower) ||
    m.label.toLowerCase().includes(filterLower) ||
    m.tagline.toLowerCase().includes(filterLower);

  const grouped = MODEL_CATEGORIES.map((cat) => ({
    cat,
    models: MODELS.filter((m) => m.category === cat.id && matches(m)),
  })).filter((g) => g.models.length > 0);

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
    setFilter("");
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px] transition-all duration-200",
          open
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 glow-emerald"
            : "border-transparent text-zinc-400 hover:border-emerald-500/25 hover:bg-emerald-500/[0.06] hover:text-emerald-300",
        )}
        title={`Model: ${current.label} — ${current.tagline}`}
        aria-label="Select model"
        aria-expanded={open}
      >
        <Cpu className="h-3 w-3" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong grad-border anim-fade-in-up absolute right-0 top-[calc(100%+6px)] z-50 w-[320px] max-w-[calc(100vw-1.5rem)] origin-top-right rounded-2xl p-1.5 shadow-2xl shadow-black/50"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-emerald-500/10 px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search models…"
              className="flex-1 bg-transparent font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            <span className="shrink-0 font-mono text-[10px] text-zinc-600">
              {MODELS.filter(matches).length}/{MODELS.length}
            </span>
          </div>

          {/* Scrollable list */}
          <div className="terminal-scroll max-h-[360px] overflow-y-auto py-1">
            {grouped.length === 0 && (
              <div className="px-3 py-6 text-center font-mono text-[11px] text-zinc-600">
                No models match "{filter}"
              </div>
            )}
            {grouped.map(({ cat, models }) => {
              const CatIcon = CATEGORY_ICON[cat.id];
              return (
                <div key={cat.id} className="mb-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
                    <CatIcon className="h-3 w-3" />
                    {cat.label}
                  </div>
                  {models.map((m) => {
                    const active = m.id === value;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => select(m.id)}
                        className={cn(
                          "group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150",
                          active
                            ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                            : "hover:bg-emerald-500/[0.05]",
                        )}
                      >
                        <span className="mt-0.5 shrink-0">
                          {active ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
                              <Check className="h-2.5 w-2.5 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-zinc-700" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-mono text-[12px] font-medium",
                                active ? "text-emerald-200" : "text-zinc-200",
                              )}
                            >
                              {m.label}
                            </span>
                            {m.recommended && (
                              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-px font-mono text-[8.5px] uppercase tracking-wide text-emerald-400/80">
                                rec
                              </span>
                            )}
                            <span className="ml-auto">
                              <SpeedMeter speed={m.speed} />
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[10.5px] leading-snug text-zinc-500">
                            {m.tagline}
                          </span>
                          {m.context && (
                            <span className="mt-0.5 block font-mono text-[9px] text-zinc-700">
                              {m.context >= 1000000
                                ? `${m.context / 1000000}M ctx`
                                : `${m.context / 1000}K ctx`}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-emerald-500/10 px-2.5 py-1.5">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-zinc-600">
              <span className="flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-emerald-500/60" />
                speed meter
              </span>
              <span>{MODELS.length} models</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
