const orgs = ["Helix Compute", "Astra Finance", "Northstar Labs"];
const agents = ["Router-17", "Verifier Nova", "Settlement Bee"];
const tasks = ["DID proof batch settled", "Governance sim completed", "GPU inference routed"];

function ListCard({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-portal backdrop-blur-xl">
      <p className={`text-xs font-black uppercase tracking-[0.28em] ${accent}`}>{title}</p>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
            <span className="font-semibold text-slate-100">{item}</span>
            <span className="text-xs font-black text-slate-500">#{index + 1}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function EcosystemList() {
  return (
    <section id="ecosystem" className="grid gap-4 lg:grid-cols-3">
      <ListCard title="Top Orgs" items={orgs} accent="text-cyan-200" />
      <ListCard title="Top Agents" items={agents} accent="text-pink-200" />
      <ListCard title="Recent Tasks" items={tasks} accent="text-emerald-200" />
    </section>
  );
}
