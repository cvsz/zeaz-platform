import Link from "next/link";

export default function DashboardHomePage() {
  const pages = [
    { href: "/studio", title: "Studio", description: "Campaigns, script generation, and workflow launch." },
    { href: "/workflows", title: "Workflows", description: "Track scene graphs, jobs, and render output." },
    { href: "/queue", title: "Queue", description: "Monitor backlog, active workers, and failure depth." },
    { href: "/assets", title: "Assets", description: "Inspect generated media artifacts." },
    { href: "/providers", title: "Providers", description: "Review Veo and compatibility provider health." },
    { href: "/settings", title: "Settings", description: "Check service URL and local runtime configuration." },
  ] as const;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-6xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
            zVEO Dashboard
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">AI-native media orchestration for Veo and delivery workflows.</h1>
          <p className="text-sm leading-6 text-slate-300 md:text-base">
            Use the studio to compose campaigns, launch workflows, and watch the queue evolve in real time.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <Link
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              href={page.href}
              key={page.href}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{page.href}</div>
              <div className="mt-3 text-xl font-semibold text-white">{page.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{page.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
