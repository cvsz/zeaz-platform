const metrics = [
  { label: "Active Nodes", value: "12,847", delta: "+18% 24h", tone: "text-cyan-200" },
  { label: "Tasks/sec", value: "4,291", delta: "streaming", tone: "text-pink-200" },
  { label: "Total Value", value: "$2.1M", delta: "+$143K", tone: "text-emerald-200" },
];

export function MetricsPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-portal backdrop-blur-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className={`text-2xl font-black tracking-tight ${metric.tone}`}>{metric.value}</p>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-300">
              {metric.delta}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
