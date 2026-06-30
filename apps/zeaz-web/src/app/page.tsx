"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Gauge,
  Globe2,
  LockKeyhole,
  Network,
  ShieldCheck,
  TerminalSquare,
  Search,
  Sparkles,
  Cpu,
  Layers,
  Terminal as TerminalIcon,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

// Platform Pillars section
const platformPillars = [
  {
    title: "AI Automation",
    description:
      "Enterprise agent workflows, autonomous video orchestration, eval harnesses, and secure operator loops.",
    icon: Bot,
    color: "from-purple-500/20 to-indigo-500/20",
    textColor: "text-purple-300",
    borderColor: "hover:border-purple-500/30",
  },
  {
    title: "Cloudflare Edge",
    description:
      "Zero Trust access, Cloudflare Tunnels, sub-millisecond edge Workers, WAF policies, and DNS governance.",
    icon: Cloud,
    color: "from-cyan-500/20 to-blue-500/20",
    textColor: "text-cyan-300",
    borderColor: "hover:border-cyan-500/30",
  },
  {
    title: "Enterprise Software",
    description:
      "Robust Next.js, FastAPI, Go, and Python frameworks structured with typed interfaces and monorepo cohesion.",
    icon: Code2,
    color: "from-emerald-500/20 to-teal-500/20",
    textColor: "text-emerald-300",
    borderColor: "hover:border-emerald-500/30",
  },
  {
    title: "DevSecOps & SRE",
    description:
      "Zero-secret policies, manual infrastructure approvals, auditable runbooks, and Prometheus observability.",
    icon: ShieldCheck,
    color: "from-amber-500/20 to-orange-500/20",
    textColor: "text-amber-300",
    borderColor: "hover:border-amber-500/30",
  },
];

const guardrails = [
  { text: "Operator-approved infrastructure changes", desc: "No auto-apply without manual verification step" },
  { text: "Zero committed secrets & tokens", desc: "Strict environment-gated config and SOPS/age integration" },
  { text: "Offline-first pre-deployment validation", desc: "Local health & configuration tests before external API checks" },
  { text: "Hardened HTTP response headers", desc: "Default Content Security Policy and secure cookie attributes" },
  { text: "Plan-gated Cloudflare modules", desc: "Safe fallbacks for Free, Pro, and Business zone profiles" },
  { text: "Symmetric disaster recovery playbooks", desc: "Documented detection signals, containment steps, and templates" },
];

const appShowcase = [
  {
    name: "zeaz-web",
    path: "apps/zeaz-web",
    category: "Core Platform",
    status: "active",
    hostname: "zeaz.dev",
    summary: "Public corporate portal, marketing cockpit, and global service catalog.",
  },
  {
    name: "zeaz-api",
    path: "apps/zeaz-api",
    category: "Core Platform",
    status: "active",
    hostname: "zeaz-api.zeaz.dev",
    summary: "High-throughput API gateway serving unified platform domains.",
  },
  {
    name: "zdash",
    path: "apps/zdash",
    category: "Core Platform",
    status: "active",
    hostname: "dash.zeaz.dev",
    summary: "Main operations dashboard for platform governance and monitoring.",
  },
  {
    name: "zcfdash",
    path: "apps/zcfdash",
    category: "Core Platform",
    status: "active",
    hostname: "cfdash.zeaz.dev",
    summary: "Edge control interface showing routing tables and WAF stats.",
  },
  {
    name: "zcloud",
    path: "apps/zcloud",
    category: "Core Platform",
    status: "active",
    hostname: "cloud.zeaz.dev",
    summary: "Infrastructure orchestrator and multi-cloud container management console.",
  },
  {
    name: "zorg",
    path: "apps/zorg",
    category: "Core Platform",
    status: "active",
    hostname: "zorg.zeaz.dev",
    summary: "Corporate directory and multi-tenant organization manager.",
  },
  {
    name: "zveo",
    path: "apps/zveo",
    category: "AI Ecosystem",
    status: "active",
    hostname: "zveo.zeaz.dev",
    summary: "AI video generation, publishing pipeline, and provider manager.",
  },
  {
    name: "ShipGenAI",
    path: "apps/ShipGenAI",
    category: "AI Ecosystem",
    status: "active",
    hostname: "shipgenai.zeaz.dev",
    summary: "AI content factory for commerce, custom avatars, and assets.",
  },
  {
    name: "zai",
    path: "apps/zai",
    category: "AI Ecosystem",
    status: "active",
    hostname: "zai.zeaz.dev",
    summary: "Local AI agent workspace and decentralized execution nodes.",
  },
  {
    name: "zai-coder",
    path: "apps/zai-coder",
    category: "AI Ecosystem",
    status: "active",
    hostname: "zai-coder.zeaz.dev",
    summary: "Autonomous code assistant with skill templates and local test runner.",
  },
  {
    name: "zai-factory",
    path: "apps/zai-factory",
    category: "AI Ecosystem",
    status: "active",
    hostname: "factory.zeaz.dev",
    summary: "Agent generation hub and packages compiler.",
  },
  {
    name: "zaiz",
    path: "apps/zaiz",
    category: "AI Ecosystem",
    status: "active",
    hostname: "zaiz.zeaz.dev",
    summary: "Composite AI tools utilizing Prisma storage and microservices.",
  },
  {
    name: "zsp-aitool",
    path: "apps/zsp-aitool",
    category: "AI Ecosystem",
    status: "active",
    hostname: "zsp-aitool.zeaz.dev",
    summary: "SaaS automation tool with Chrome extension adapters.",
  },
  {
    name: "zwallet",
    path: "apps/zwallet",
    category: "Fintech & Trading",
    status: "active",
    hostname: "admin-wallet.zeaz.dev",
    summary: "Secure wallet vault implementing multi-signature policies and Web3 guards.",
  },
  {
    name: "ztrader",
    path: "apps/ztrader",
    category: "Fintech & Trading",
    status: "active",
    hostname: "trader.zeaz.dev",
    summary: "Algo trading engine with paper trading gates and risk monitoring.",
  },
  {
    name: "zcino",
    path: "apps/zcino",
    category: "Fintech & Trading",
    status: "active",
    hostname: "cino.zeaz.dev",
    summary: "Go-based transaction and game engine testing high concurrency.",
  },
  {
    name: "zacademy",
    path: "apps/zacademy",
    category: "Workspace & Education",
    status: "active",
    hostname: "academy.zeaz.dev",
    summary: "LMS portal delivering platform certificates and course files.",
  },
  {
    name: "zlms",
    path: "apps/zlms",
    category: "Workspace & Education",
    status: "active",
    hostname: "lms.zeaz.dev",
    summary: "Learning platform workspace with integrated sandbox workspaces.",
  },
  {
    name: "zoffice",
    path: "apps/zoffice",
    category: "Workspace & Education",
    status: "active",
    hostname: "office.zeaz.dev",
    summary: "Corporate task tracker, documents directory, and calendars.",
  },
  {
    name: "zow",
    path: "apps/zow",
    category: "Workspace & Education",
    status: "active",
    hostname: "openwork.zeaz.dev",
    summary: "Open-work workspace and remote worker synchronization APIs.",
  },
  {
    name: "zquest",
    path: "apps/zquest",
    category: "Workspace & Education",
    status: "active",
    hostname: "zquest.zeaz.dev",
    summary: "Interactive quest platform and developer onboarding simulator.",
  },
  {
    name: "api",
    path: "apps/api",
    category: "Dev Tools & Bots",
    status: "active",
    hostname: "api.zeaz.dev",
    summary: "Shared monorepo gateway and global type bindings.",
  },
  {
    name: "zdev",
    path: "apps/zdev",
    category: "Dev Tools & Bots",
    status: "active",
    hostname: "zdev.zeaz.dev",
    summary: "Local builder, script triggers, and automation templates.",
  },
  {
    name: "zchat",
    path: "apps/zchat",
    category: "Dev Tools & Bots",
    status: "active",
    hostname: "zchat.zeaz.dev",
    summary: "Realtime messaging application built with WebSockets and Vite.",
  },
  {
    name: "zfbauto",
    path: "apps/zfbauto",
    category: "Dev Tools & Bots",
    status: "active",
    hostname: "zfbauto.zeaz.dev",
    summary: "Meta API integration suite and advertising analytics pipelines.",
  },
  {
    name: "zlinebot",
    path: "apps/zlinebot",
    category: "Dev Tools & Bots",
    status: "active",
    hostname: "linebot.zeaz.dev",
    summary: "LINE bot webhook handler integrated with edge AI models.",
  },
  {
    name: "zsticker",
    path: "apps/zsticker",
    category: "Dev Tools & Bots",
    status: "active",
    hostname: "zsticker.zeaz.dev",
    summary: "Dynamic media and image processing services at the edge.",
  },
];

const categories = [
  "All",
  "Core Platform",
  "AI Ecosystem",
  "Fintech & Trading",
  "Workspace & Education",
  "Dev Tools & Bots",
];

// Simulated Live Edge Logs for the console animation
const simulatedLogs = [
  { type: "route", method: "GET", path: "auth.zeaz.dev/login", target: "Authentik", status: "200", latency: "14ms" },
  { type: "auth", method: "POST", path: "pay.zeaz.dev/v1/vault", target: "zwallet-signature", status: "201", latency: "42ms" },
  { type: "ai", method: "POST", path: "zveo.zeaz.dev/api/v1/video", target: "Workers AI Generator", status: "202", latency: "125ms" },
  { type: "waf", method: "GET", path: "trader.zeaz.dev/admin", target: "WAF block (Non-RFC IP)", status: "403", latency: "1ms" },
  { type: "route", method: "GET", path: "academy.zeaz.dev/courses", target: "zacademy-lms", status: "200", latency: "8ms" },
  { type: "tunnel", method: "UPGRADE", path: "dash.zeaz.dev/ws", target: "Cloudflare Tunnel Ingress", status: "101", latency: "5ms" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [logIndex, setLogIndex] = useState(0);

  // Rotate simulated logs automatically
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % simulatedLogs.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filteredApps = useMemo(() => {
    return appShowcase.filter((app) => {
      const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZEAZDEV Company Limited",
    url: "https://zeaz.dev",
    email: "support@zeaz.dev",
    brand: {
      "@type": "Brand",
      name: "ZEAZDEV",
    },
    description:
      "Enterprise-grade AI automation, Cloudflare-first edge operations, fintech platforms, and developer systems.",
    sameAs: ["https://github.com/cvsz/zeaz-platform"],
    areaServed: "Worldwide",
    serviceType: [
      "AI automation",
      "Cloudflare platform engineering",
      "Fintech structures",
      "Developer platforms",
      "GitOps orchestration",
    ],
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#02040a] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Futuristic Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(16,185,129,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,4,10,0)_60%,#02040a_100%)]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <header className="sticky top-4 z-50 mb-12 rounded-2xl border border-white/5 bg-[#070b19]/65 backdrop-blur-xl px-4 py-3 shadow-lg shadow-cyan-950/20 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-950/40 text-cyan-400 shadow-md shadow-cyan-400/10 group-hover:border-cyan-400/60 transition-all duration-300">
                <TerminalSquare className="h-5 w-5" />
                <span className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <span className="block text-sm font-black tracking-[0.25em] text-white">
                  ZEAZDEV
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">
                  Company Limited
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
              <a href="#platform" className="hover:text-cyan-400 transition-colors">Platform</a>
              <a href="#guardrails" className="hover:text-cyan-400 transition-colors">Guardrails</a>
              <a href="#apps" className="hover:text-cyan-400 transition-colors">Showcase</a>
              <a href="#console" className="hover:text-cyan-400 transition-colors">Console</a>
              <Link href="/marketing/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-cyan-400/30 bg-cyan-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-all duration-300 hover:bg-cyan-400 hover:text-slate-950 hover:shadow-lg hover:shadow-cyan-400/25"
              >
                <span>Control Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid items-center gap-12 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
              Enterprise platform framework
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 sm:text-6xl xl:text-7xl leading-[1.05]">
              Production AI, Cloud, and Software Systems.
            </h1>
            
            <p className="max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              ZEAZDEV builds production-grade environments with strict identity separation,
              zero-secret governance, sub-millisecond edge routes, and auditable SRE runbooks
              under the <code className="text-cyan-400 font-mono">zeaz.dev</code> domain.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#apps"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
              >
                <span>Explore Showcase</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/marketing/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
              >
                Contact Engineers
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
              {[
                { label: "Domains Served", value: "8 Active" },
                { label: "Active Apps", value: `${appShowcase.length} Packages` },
                { label: "DNS Strategy", value: "Cloudflare-first" },
                { label: "Policy posture", value: "Guarded" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
                  <dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">{metric.label}</dt>
                  <dd className="mt-1.5 text-sm font-bold text-slate-200">{metric.value}</dd>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Simulated Ops Console */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-cyan-500/10 blur-2xl opacity-60" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#060814]/80 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
              
              {/* Console Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Cpu className="h-4 w-4" />
                    <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">edge-node-status</h3>
                    <p className="text-[9px] text-slate-500 font-mono">deployment telemetry online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                    converged
                  </span>
                </div>
              </div>

              {/* Console Stats */}
              <div className="grid grid-cols-2 gap-3 py-4">
                {[
                  { label: "ZT AUTH TYPE", value: "MFA + RBAC", icon: LockKeyhole, color: "text-purple-400" },
                  { label: "EDGE RUNTIME", value: "Cloudflare Workers", icon: Globe2, color: "text-cyan-400" },
                  { label: "VAULT STATUS", value: "Encrypted (SOPS)", icon: Database, color: "text-amber-400" },
                  { label: "IP POSTURE", value: "127.0.0.1 Origins", icon: Network, color: "text-emerald-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex flex-col justify-between">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                      <div className="mt-2">
                        <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase">{item.label}</p>
                        <p className="text-xs font-bold text-slate-200 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulated Live Route Stream */}
              <div className="rounded-xl border border-cyan-500/10 bg-cyan-950/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 font-mono">
                    <TerminalIcon className="h-3.5 w-3.5" />
                    <span>Real-time Ingress Stream</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400">Live</span>
                </div>

                <div className="h-18 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={logIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400 truncate max-w-[200px]">
                          {simulatedLogs[logIndex].path}
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {simulatedLogs[logIndex].latency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-1.5">
                        <span className="text-slate-500">
                          Method: <strong className="text-cyan-400 font-bold">{simulatedLogs[logIndex].method}</strong>
                        </span>
                        <span className="text-slate-500">
                          Target: <span className="text-slate-300">{simulatedLogs[logIndex].target}</span>
                        </span>
                        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 rounded font-black">
                          {simulatedLogs[logIndex].status}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div className="mt-4 border-t border-white/5 pt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Preflight Validation</span>
                  <span className="text-emerald-400">100% Passed</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div key={idx} className="h-1.5 flex-1 rounded-full bg-emerald-500/80 shadow shadow-emerald-500/50" />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Platform Pillars Section */}
        <section id="platform" className="border-t border-white/5 py-16">
          <div className="max-w-3xl space-y-3 mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Engineered for Production Postures
            </h2>
            <p className="text-slate-400">
              The platform is built on real-world stability and governance rules rather than demo-driven architectures.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b ${pillar.color} p-6 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${pillar.borderColor} group`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 text-cyan-400 group-hover:text-white transition-colors duration-300">
                    <Icon className={`h-5 w-5 ${pillar.textColor}`} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white tracking-tight">{pillar.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* SRE Guardrails Section */}
        <section id="guardrails" className="grid gap-12 border-t border-white/5 py-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              SRE & Security Guardrails
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Compliance-First Infrastructure
            </h2>
            <p className="text-slate-400 leading-relaxed">
              We operate under absolute security restrictions. Infrastructure configurations
              undergo multi-stage, human-approved GitOps checks. The target system ensures
              plan compatibility fallback policies so that features degrade gracefully across
              different Cloudflare account tiers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {guardrails.map((g) => (
              <div
                key={g.text}
                className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.01] p-4 hover:bg-white/[0.03] transition-colors duration-300"
              >
                <div className="mt-0.5 rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{g.text}</h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive App Showcase & Monorepo Catalog */}
        <section id="apps" className="border-t border-white/5 py-16">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Monorepo Workspace Catalog
              </h2>
              <p className="text-slate-400">
                A live, queryable registry of active applications deployed within the monorepo.
                Filter by workspace category or search directly.
              </p>
            </div>

            {/* Live Stats */}
            <div className="flex gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-center">
                <span className="block text-2xl font-black text-white">{appShowcase.length}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Packages</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-center">
                <span className="block text-2xl font-black text-emerald-400">
                  {appShowcase.filter((a) => a.status === "active").length}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-center">
                <span className="block text-2xl font-black text-cyan-400">100%</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Monitored</span>
              </div>
            </div>
          </div>

          {/* Interactive Filters and Search */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20"
                      : "border border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#060814]/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 outline-none transition-colors duration-300 focus:border-cyan-400/40 focus:bg-[#070b1c]/80"
              />
            </div>
          </div>

          {/* Apps Showcase Grid */}
          <motion.div
            layout
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={app.name}
                  className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-[#05070f]/75 p-6 shadow-md hover:border-white/10 hover:bg-[#070a1a]/85 transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                          {app.path}
                        </span>
                        <h3 className="mt-2 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                          {app.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                        {app.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {app.category}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                      {app.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[170px]" title={app.hostname}>
                      {app.hostname}
                    </span>
                    <a
                      href={`https://${app.hostname}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-200 transition-colors"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredApps.length === 0 && (
            <div className="py-16 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-slate-600" />
              <h3 className="mt-4 text-sm font-bold text-slate-300">No workspaces found</h3>
              <p className="mt-2 text-xs text-slate-500">
                Try modifying your query or select a different category.
              </p>
            </div>
          )}
        </section>

        {/* Enterprise Call To Action */}
        <section id="console" className="border-t border-white/5 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-cyan-950/5 p-8 text-center shadow-lg shadow-cyan-950/10 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_60%)] pointer-events-none" />
            
            <h2 className="relative z-10 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Ready for production environments.
            </h2>
            
            <p className="relative z-10 mx-auto mt-4 max-w-xl text-slate-400 text-sm md:text-base leading-relaxed">
              Integrate zero-trust edge controllers, automate agentic pipelines, or design compliant financial structures with professional engineering practices.
            </p>

            <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/marketing/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 transition-all duration-300"
              >
                <span>Initiate Integration</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:support@zeaz.dev"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
              >
                support@zeaz.dev
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-4 border-t border-white/5 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between font-mono">
          <p>© {new Date().getFullYear()} ZEAZDEV Company Limited. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link href="/marketing/terms" className="hover:text-cyan-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/marketing/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/marketing/refund" className="hover:text-cyan-400 transition-colors">
              Refund Policy
            </Link>
          </div>
        </footer>

      </div>
    </main>
  );
}
