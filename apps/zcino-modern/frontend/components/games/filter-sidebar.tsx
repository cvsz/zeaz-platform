"use client";

import type { GameCategory, GameFilters } from "@/types/game";

type FilterSidebarProps = {
  filters: GameFilters;
  providers: string[];
  categories: GameCategory[];
  onChange: (filters: GameFilters) => void;
};

const labelByCategory: Record<GameCategory, string> = {
  slots: "Slots",
  table: "Table",
  live: "Live",
  arcade: "Arcade",
  jackpot: "Jackpot",
};

export function FilterSidebar({ filters, providers, categories, onChange }: FilterSidebarProps) {
  return (
    <aside className="sticky top-6 h-fit rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-card backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Filters</p>
          <h2 className="mt-1 text-xl font-bold">Refine lobby</h2>
        </div>
        <button
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-gold-400/60 hover:text-white"
          onClick={() => onChange({})}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Provider</span>
          <select
            value={filters.provider ?? ""}
            onChange={(event) => onChange({ ...filters, provider: event.target.value || undefined })}
            className="w-full rounded-2xl border border-white/10 bg-felt-900 px-4 py-3 text-sm text-white outline-none focus:border-gold-400/60"
          >
            <option value="">All providers</option>
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-300">Category</legend>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-2xl border px-3 py-2 text-sm transition ${
                !filters.category
                  ? "border-gold-400/70 bg-gold-400/15 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
              }`}
              onClick={() => onChange({ ...filters, category: undefined })}
              type="button"
            >
              All
            </button>
            {categories.map((category) => (
              <button
                className={`rounded-2xl border px-3 py-2 text-sm transition ${
                  filters.category === category
                    ? "border-gold-400/70 bg-gold-400/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                }`}
                key={category}
                onClick={() => onChange({ ...filters, category })}
                type="button"
              >
                {labelByCategory[category]}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">RTP range</span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">
              {filters.rtpMin ?? 91}% - {filters.rtpMax ?? 99}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="sr-only">Minimum RTP</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-felt-900 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60"
                max={filters.rtpMax ?? 99}
                min={91}
                onChange={(event) =>
                  onChange({ ...filters, rtpMin: event.target.value ? Number(event.target.value) : undefined })
                }
                placeholder="Min"
                step="0.5"
                type="number"
                value={filters.rtpMin ?? ""}
              />
            </label>
            <label>
              <span className="sr-only">Maximum RTP</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-felt-900 px-3 py-2 text-sm text-white outline-none focus:border-gold-400/60"
                max={99}
                min={filters.rtpMin ?? 91}
                onChange={(event) =>
                  onChange({ ...filters, rtpMax: event.target.value ? Number(event.target.value) : undefined })
                }
                placeholder="Max"
                step="0.5"
                type="number"
                value={filters.rtpMax ?? ""}
              />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
