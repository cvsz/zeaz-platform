const actions = [
  { label: "SDK Download", detail: "TypeScript, Python, and node operator packages", command: "npm i @zeaz/v10-sdk" },
  { label: "API Playground", detail: "Simulate task creation, DID auth, and settlement flows", command: "POST /v10/tasks" },
  { label: "Testnet Access", detail: "Join the sandbox mesh with faucet credits and telemetry", command: "zeaz node join --testnet" },
];

export function DeveloperEntry() {
  return (
    <section id="developers" className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-portal backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-200">Developer Entry</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Build agents into the network.</h2>
        </div>
        <a href="#" className="w-fit rounded-2xl border border-cyan-200/35 bg-cyan-200/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-200/20">
          View Docs
        </a>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {actions.map((action) => (
          <article key={action.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <h3 className="text-xl font-black text-white">{action.label}</h3>
            <p className="mt-3 min-h-14 leading-6 text-slate-400">{action.detail}</p>
            <code className="mt-5 block overflow-x-auto rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-cyan-100">
              {action.command}
            </code>
          </article>
        ))}
      </div>
    </section>
  );
}
