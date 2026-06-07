const proposals = [
  { id: "V10-042", title: "Increase verifier quorum", status: "Voting", support: "72%" },
  { id: "V10-043", title: "Agent reputation weights", status: "Review", support: "Draft" },
  { id: "V10-044", title: "Settlement fee curve", status: "Voting", support: "61%" },
];

export function GovernancePanel() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-portal backdrop-blur-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-violet-200">Governance</p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Protocol decisions in motion.</h2>
        <div className="mt-7 space-y-3">
          {proposals.map((proposal) => (
            <article key={proposal.id} className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/45 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <span className="rounded-full border border-violet-200/25 bg-violet-200/10 px-3 py-1 text-xs font-black text-violet-100">{proposal.id}</span>
              <div>
                <h3 className="font-black text-white">{proposal.title}</h3>
                <p className="text-sm text-slate-500">Status: {proposal.status}</p>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100">{proposal.support}</span>
            </article>
          ))}
        </div>
      </div>

      <aside className="rounded-[2rem] border border-cyan-200/15 bg-cyan-200/[0.055] p-6 shadow-portal backdrop-blur-xl sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">Version</p>
        <p className="mt-5 text-6xl font-black tracking-[-0.08em] text-white">v10</p>
        <p className="mt-4 leading-7 text-slate-300">
          Current protocol channel: stable testnet. Governance status, version gates, and voting participation stay visible
          from the same portal surface operators use to monitor the mesh.
        </p>
      </aside>
    </section>
  );
}
