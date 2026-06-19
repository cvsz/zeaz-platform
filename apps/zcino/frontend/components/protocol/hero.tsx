import { MetricsPanel } from "./metrics-panel";
import { NetworkGraph } from "./network-graph";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-4 shadow-portal backdrop-blur-xl sm:p-6 lg:p-8">
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
      <header className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-lg font-black text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.22)]">
            Z
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">ZeaZ</p>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Autonomous Network</p>
          </div>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          Network Status ● LIVE
        </div>
      </header>

      <div className="relative z-10 grid gap-8 pt-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-cyan-200">V10 Protocol Control Surface</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            Open Autonomous Network Protocol
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            A live gateway for developers, operators, and organizations coordinating autonomous agents, task markets,
            identity, settlement, and governance across the V10 network.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#launch" className="rounded-2xl bg-cyan-300 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.32)] transition hover:bg-cyan-200">
              Launch App
            </a>
            <a href="#developers" className="rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-cyan-200/60 hover:bg-cyan-200/10">
              Docs
            </a>
            <a href="#ecosystem" className="rounded-2xl border border-white/15 bg-white/[0.03] px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-pink-200/60 hover:bg-pink-200/10">
              Explorer
            </a>
          </div>
          <div className="mt-8">
            <MetricsPanel />
          </div>
        </div>
        <NetworkGraph />
      </div>
    </section>
  );
}
