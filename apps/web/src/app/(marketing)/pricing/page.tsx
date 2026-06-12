import type { Metadata } from "next";
import Link from "next/link";
import { Check, HelpCircle } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description:
      "For individual developers and small projects getting started with cloud tools and AI automation.",
    features: [
      "Access to cloud-based development tools",
      "AI automation agents (limited)",
      "API integrations",
      "Community support",
      "Educational resources",
      "1 project workspace",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description:
      "For teams and growing businesses needing advanced automation and collaboration features.",
    popular: true,
    features: [
      "All Starter features",
      "Unlimited AI automation agents",
      "Advanced API integrations",
      "DevOps automation tools",
      "Priority email support",
      "10 project workspaces",
      "Team collaboration",
    ],
  },
  {
    name: "Business",
    price: "$299",
    period: "/month",
    description:
      "For organizations requiring advanced automation, dedicated support, and custom integrations.",
    features: [
      "All Pro features",
      "Custom AI agent development",
      "Dedicated technical support",
      "SLA-backed availability",
      "Custom API integrations",
      "Unlimited workspaces",
      "Onboarding consultation",
      "Early access to new features",
    ],
  },
];

export const metadata: Metadata = {
  title: "Pricing — ZEAZ Platform",
  description:
    "Simple, transparent SaaS pricing for ZEAZ Platform. Choose from Starter ($29/mo), Pro ($99/mo), or Business ($299/mo) plans. All digital, cancel anytime.",
};

export default function PricingPage() {
  return (
    <div className="bg-[#05070d] min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_40%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Subscribe monthly or annually. All plans include digital access to cloud-hosted
            software features, AI automation tools, and technical support. No physical goods
            are delivered — everything is provided online.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 md:p-8 space-y-6 ${
                plan.popular
                  ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-bold text-black uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-slate-400">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <span className="block w-full text-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 cursor-default">
                  Subscribe
                </span>
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Billed monthly or annually. Cancel anytime.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="max-w-3xl mx-auto space-y-6 text-sm text-slate-400">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <HelpCircle className="h-5 w-5 mt-0.5 text-cyan-400 shrink-0" />
            <div className="space-y-2">
              <p>
                <strong className="text-white">Digital Service Delivery:</strong> After
                successful payment, customers receive immediate access to subscribed software
                features, cloud-hosted services, and AI automation tools through the ZEAZ
                Platform dashboard and API.
              </p>
              <p>
                <strong className="text-white">Cancellation:</strong> You may cancel your
                subscription at any time. Access continues through the end of the current
                billing period. See our{" "}
                <Link href="/refund" className="text-cyan-400 hover:underline">
                  Refund Policy
                </Link>{" "}
                for details.
              </p>
              <p>
                <strong className="text-white">No Physical Goods:</strong> All services are
                digital and delivered online. No physical items, regulated products, financial
                services, or prohibited goods are sold.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
