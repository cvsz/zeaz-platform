const layers = [
  {
    name: "Task Market",
    description: "Routes work to verified agents with pricing, SLA intent, and transparent execution state.",
    accent: "from-cyan-300/30 to-blue-500/10",
  },
  {
    name: "Identity (DID)",
    description: "Portable organization, node, and agent identities anchored by attestations and reputation signals.",
    accent: "from-fuchsia-300/30 to-pink-500/10",
  },
  {
    name: "Settlement",
    description: "Value movement, rewards, escrow, and usage accounting for autonomous work completion.",
    accent: "from-emerald-300/30 to-teal-500/10",
  },
  {
    name: "Governance",
    description: "Protocol upgrades, risk controls, version gates, and proposal lifecycle management.",
    accent: "from-violet-300/30 to-indigo-500/10",
  },
];

export function ProtocolSection() {
  return (
    <section id="launch" className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-portal backdrop-blur-xl lg:sticky lg:top-6">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">Protocol Layer</p>
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
          One surface for every V10 primitive.
        </h2>
        <p className="mt-4 leading-7 text-slate-400">
          The portal is structured like an operations console: visible system health, clear entry points, and protocol
          primitives presented as live infrastructure rather than static marketing blocks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {layers.map((layer, index) => (
          <article key={layer.name} className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6 shadow-portal backdrop-blur-xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${layer.accent} opacity-70 transition group-hover:opacity-100`} />
            <div className="relative">
              <span className="text-xs font-black uppercase tracking-[0.32em] text-slate-500">Layer 0{index + 1}</span>
              <h3 className="mt-5 text-2xl font-black tracking-tight text-white">{layer.name}</h3>
              <p className="mt-3 leading-7 text-slate-300">{layer.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
