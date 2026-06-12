import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  Cloud,
  Code2,
  Network,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ZEAZ Platform — AI Automation and Software Development SaaS",
  description:
    "ZEAZ Platform provides AI-powered SaaS software development tools, cloud services, DevOps automation, API integrations, and AI agents for businesses, developers, and technical teams.",
};

export default function HomePage() {
  const products = [
    {
      title: "AI Automation Tools",
      icon: Bot,
      description:
        "Deploy AI agents for task automation, content generation, analytics, and workflow orchestration without managing infrastructure.",
    },
    {
      title: "Cloud Development Tools",
      icon: Cloud,
      description:
        "Cloud-hosted development environments, CI/CD pipelines, server management, and deployment automation for modern teams.",
    },
    {
      title: "DevOps Automation",
      icon: Rocket,
      description:
        "Infrastructure as code, automated validation, zero-downtime deployments, and observability for production systems.",
    },
    {
      title: "API Integrations",
      icon: Network,
      description:
        "RESTful and edge-native API integrations with Cloudflare Workers, AI Gateways, and extensible webhook connectors.",
    },
    {
      title: "Educational Resources",
      icon: Code2,
      description:
        "Technical documentation, architecture guides, and best practices for cloud-native development and AI automation.",
    },
    {
      title: "Consulting & Support",
      icon: Users,
      description:
        "Expert technical consulting for system architecture, security hardening, migration planning, and production operations.",
    },
  ];

  return (
    <div className="bg-[#05070d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,1))]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">

        {/* Hero */}
        <section className="pt-20 md:pt-32 pb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <TrendingUp className="h-3.5 w-3.5" />
            Software-as-a-Service Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            AI Automation and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Software Development
            </span>{" "}
            Platform
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            ZEAZ Platform provides SaaS services, cloud-based development tools, AI agents,
            DevOps automation, API integrations, educational content, and consulting for
            businesses, developers, and technical teams.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-600 px-6 py-3 font-semibold text-black transition shadow-lg shadow-cyan-500/20"
            >
              View Pricing
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold transition"
            >
              Contact Support
            </Link>
          </div>
        </section>

        {/* Products */}
        <section className="py-16 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              What We Offer
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Digital subscription services delivered through cloud platforms, APIs, and
              support channels. All services are software-based and delivered online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition space-y-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{product.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100%", label: "Digital Delivery" },
              { value: "Cloud", label: "SaaS Infrastructure" },
              { value: "24/7", label: "Platform Availability" },
              { value: "SaaS", label: "Subscription Model" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-cyan-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Target audience */}
        <section className="py-16 border-t border-white/10 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Built For
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Businesses", "Developers", "Teams", "Creators", "Technical Operators"].map(
              (audience) => (
                <span
                  key={audience}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300"
                >
                  {audience}
                </span>
              )
            )}
          </div>
        </section>

        {/* Compliance */}
        <section className="py-12 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                Compliance Notice
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              ZEAZ Platform provides digital software services only. We do not sell physical
              goods, regulated products, gambling services, financial services, adult content,
              or prohibited items. All transactions are digital service subscriptions and
              software-related services delivered online.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Subscribe to a plan that fits your needs and get instant access to cloud-hosted
            software tools, AI automation, and developer infrastructure.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-600 px-6 py-3 font-semibold text-black transition shadow-lg shadow-cyan-500/20"
            >
              View Plans & Pricing
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
