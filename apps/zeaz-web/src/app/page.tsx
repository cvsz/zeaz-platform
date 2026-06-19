"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Lock,
  Network,
  Cpu,
  ShieldCheck,
  Terminal,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const projects = [
    {
      title: "zTrader",
      subtitle: "Algorithmic Trading Stack",
      icon: <TrendingUp className="h-6 w-6 text-emerald-400" />,
      description: "Safety-first algorithmic trading platform featuring deterministic paper engine, CCXT mock fallbacks, and fail-closed risk gates (symbol allowlists, max notional limits, and global kill switch).",
      tags: ["Python", "FastAPI", "Redis", "Celery"],
    },
    {
      title: "zcloud",
      subtitle: "CloudPanel Operations Cockpit",
      icon: <Cpu className="h-6 w-6 text-cyan-400" />,
      description: "Offline-safe server manager and knowledge map built on CloudPanel v2 documentation, incorporating complete CLI atlas, permission resetters, and multi-cloud launch checks.",
      tags: ["Static Web", "CLI Tooling", "CloudPanel v2"],
    },
    {
      title: "zcfdash / zdash",
      subtitle: "Cloudflare Control Plane",
      icon: <Layers className="h-6 w-6 text-amber-400" />,
      description: "Master control dashboard managing DNS routing overlays, active tunnel ingress lists, Cloudflare IP updaters, and OpenTofu/Terraform deployment state.",
      tags: ["Next.js", "Terraform", "Cloudflare API"],
    },
    {
      title: "zLMS",
      subtitle: "Learning Management System",
      icon: <Code2 className="h-6 w-6 text-purple-400" />,
      description: "Legacy LMS production stack refactored for modern security compliance, strict TypeScript enforcement, Zero-Trust network policies, and isolated runtime classes.",
      tags: ["Next.js", "TypeScript", "Docker", "K8s"],
    },
  ];

  const skills = [
    {
      category: "Edge & Infrastructure",
      icon: <Cloud className="h-5 w-5 text-cyan-400" />,
      items: ["Cloudflare Workers / Pages", "Durable Objects / KV", "Cloudflare Tunnels", "Terraform / OpenTofu"],
    },
    {
      category: "Backend & Systems",
      icon: <Network className="h-5 w-5 text-emerald-400" />,
      items: ["Python / FastAPI / Pytest", "Node.js / TypeScript / Next.js", "Celery / Redis / PostgreSQL", "Docker & Kubernetes"],
    },
    {
      category: "Security & Operations",
      icon: <ShieldCheck className="h-5 w-5 text-amber-400" />,
      items: ["GPG Signed Git Workflows", "Least-Privilege Site Users", "Basic Auth & 2FA Enforcements", "Varnish Cache & Nginx Tune"],
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070d] text-white font-sans selection:bg-cyan-500/30">
      {/* Glow overlays */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,1))]" />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-24 space-y-20">
        {/* Navigation/Header */}
        <header className="flex justify-between items-center border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 font-bold text-xl">
              z
            </div>
            <span className="font-extrabold tracking-wider text-lg">zeaz.dev</span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition"
          >
            System Control Panel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        {/* Hero Section */}
        <section className="space-y-6 md:w-3/4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
            <Flame className="h-4 w-4 animate-pulse" />
            Platform Developer &amp; Cloud Architect
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
            I build safety-first, edge-powered distributed systems.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
            Hi, I am <strong className="font-semibold text-white">Zeaz</strong>. I design secure control planes, 
            algorithmic trading platforms, and high-availability server deployments. I focus on least-privilege 
            architectures, automated validation, and deterministic infrastructure.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-600 px-6 py-3 font-semibold text-black transition shadow-lg shadow-cyan-500/20"
            >
              Control Panel Dashboard
            </Link>
            <a
              href="https://github.com/cvsz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold transition"
            >
              GitHub Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Ecosystem/Projects */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Ecosystem</h2>
            <p className="text-slate-400 max-w-2xl font-light">
              A collection of customized platforms, engines, and cockpits created and maintained under the Zeaz network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.title}
                className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 hover:bg-white/[0.06] transition duration-300"
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
                      {project.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{project.title}</h3>
                      <p className="text-xs text-slate-400 font-mono">{project.subtitle}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-light mb-6">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs font-mono text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & DNA */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Core Technical DNA</h2>
            <p className="text-slate-400 max-w-2xl font-light">
              Technologies and engineering practices utilized to maintain absolute uptime, safety, and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.category}
                className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-6"
              >
                <div className="flex items-center gap-3 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                    {skill.icon}
                  </div>
                  <h3 className="font-semibold text-base">{skill.category}</h3>
                </div>
                <ul className="space-y-3 font-light text-sm text-slate-300">
                  {skill.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-light">
          <p>© {new Date().getFullYear()} zeaz.dev. Developed with Antigravity AI.</p>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-white transition">Control Panel</Link>
            <a href="https://github.com/cvsz/zeaz-platform" target="_blank" rel="noreferrer" className="hover:text-white transition inline-flex items-center gap-1">
              Repository
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
