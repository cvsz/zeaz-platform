import type { Metadata } from "next";
import { Mail, Globe, HelpCircle } from "lucide-react";

const topics = [
  {
    title: "Billing",
    description: "Questions about invoices, subscriptions, or payment methods.",
  },
  {
    title: "Subscription",
    description: "Plan changes, upgrades, downgrades, or cancellation requests.",
  },
  {
    title: "Technical Support",
    description: "Issues with platform access, API integration, or service functionality.",
  },
  {
    title: "Account Access",
    description: "Login issues, account recovery, or permission changes.",
  },
  {
    title: "Consulting Inquiries",
    description: "Custom development, architecture review, or technical consulting.",
  },
];

export const metadata: Metadata = {
  title: "Contact — ZEAZ Platform",
  description:
    "Get in touch with ZEAZ Platform for billing, technical support, account questions, and consulting inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#05070d] min-h-screen">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24 space-y-10">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Contact</h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Get in touch with the ZEAZ Platform team. We are here to help with billing,
            technical support, account questions, and consulting inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40">
              <Mail className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="font-bold text-lg text-white">Email</h2>
            <p className="text-sm text-slate-400">
              Send us an email and we will respond as soon as possible.
            </p>
            <a
              href="mailto:support@zeaz.dev"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition text-sm font-semibold"
            >
              support@zeaz.dev
            </a>
          </div>

          {/* Website */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40">
              <Globe className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="font-bold text-lg text-white">Website</h2>
            <p className="text-sm text-slate-400">Visit our website for more information.</p>
            <div className="space-y-1">
              <a
                href="https://zeaz.dev"
                className="block text-cyan-400 hover:text-cyan-300 transition text-sm font-semibold"
              >
                zeaz.dev
              </a>
              <a
                href="https://www.zeaz.dev"
                className="block text-cyan-400 hover:text-cyan-300 transition text-sm font-semibold"
              >
                www.zeaz.dev
              </a>
            </div>
          </div>
        </div>

        {/* Support topics */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Common Inquiries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <HelpCircle className="h-5 w-5 mt-0.5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{topic.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{topic.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business info */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="font-bold text-lg text-white">Business Information</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            ZEAZ Platform is a Software-as-a-Service, AI automation, software development tools,
            DevOps automation, and technical consulting provider. All services are digital and
            delivered online.
          </p>
          <p className="text-sm text-slate-400">
            Business category: Software-as-a-Service (SaaS) | AI automation | Software
            development tools | DevOps automation | Technical consulting
          </p>
        </div>
      </div>
    </div>
  );
}
