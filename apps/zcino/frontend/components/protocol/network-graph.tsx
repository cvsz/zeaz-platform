const nodes = [
  { cx: 50, cy: 48, r: 13, fill: "#22d3ee", label: "core" },
  { cx: 22, cy: 28, r: 7, fill: "#f0abfc", label: "org" },
  { cx: 78, cy: 27, r: 8, fill: "#38bdf8", label: "sdk" },
  { cx: 18, cy: 68, r: 6, fill: "#34d399", label: "node" },
  { cx: 82, cy: 70, r: 7, fill: "#fb7185", label: "dao" },
  { cx: 49, cy: 84, r: 5, fill: "#a78bfa", label: "agent" },
  { cx: 35, cy: 15, r: 4, fill: "#67e8f9", label: "did" },
  { cx: 65, cy: 88, r: 4, fill: "#f9a8d4", label: "settle" },
];

const edges = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 6],
  [2, 6],
  [4, 7],
  [5, 7],
  [1, 3],
  [2, 4],
] as const;

export function NetworkGraph() {
  return (
    <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-slate-950/55 shadow-portal backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.24),transparent_24rem),radial-gradient(circle_at_72%_20%,rgba(244,114,182,0.16),transparent_18rem)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.13)_1px,transparent_1px)] [background-size:42px_42px]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" role="img" aria-label="Live V10 autonomous network graph">
        <defs>
          <linearGradient id="edge" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#e879f9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {edges.map(([from, to], index) => {
          const start = nodes[from];
          const end = nodes[to];
          return (
            <line
              key={`${start.label}-${end.label}`}
              x1={start.cx}
              y1={start.cy}
              x2={end.cx}
              y2={end.cy}
              stroke="url(#edge)"
              strokeDasharray="4 5"
              strokeLinecap="round"
              strokeWidth="0.45"
              className="origin-center animate-pulse"
              style={{ animationDelay: `${index * 120}ms` }}
            />
          );
        })}
        {nodes.map((node, index) => (
          <g key={node.label} filter="url(#glow)" className="origin-center animate-float" style={{ animationDelay: `${index * 160}ms` }}>
            <circle cx={node.cx} cy={node.cy} r={node.r + 2.5} fill={node.fill} opacity="0.11" />
            <circle cx={node.cx} cy={node.cy} r={node.r} fill={node.fill} opacity="0.88" />
            <circle cx={node.cx - node.r / 3} cy={node.cy - node.r / 3} r={node.r / 3} fill="white" opacity="0.65" />
          </g>
        ))}
      </svg>

      <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">V10 Mesh</p>
        <p className="mt-1 text-sm text-slate-400">Task flow latency: 42ms</p>
      </div>
      <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-pink-200">Cluster Sync</p>
        <p className="mt-1 text-sm text-slate-400">8 org shards online</p>
      </div>
    </div>
  );
}
