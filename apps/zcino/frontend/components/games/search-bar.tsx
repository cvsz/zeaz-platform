"use client";

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">Search games</span>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search games or providers"
        className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 outline-none ring-gold-400/40 transition focus:border-gold-400/60 focus:ring-4"
        type="search"
      />
    </label>
  );
}
