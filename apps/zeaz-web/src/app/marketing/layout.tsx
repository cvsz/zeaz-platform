"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TerminalSquare, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { name: "Home", href: "/marketing" },
  { name: "Pricing", href: "/marketing/pricing" },
  { name: "Contact", href: "/marketing/contact" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/marketing" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 font-bold">
                <TerminalSquare className="h-5 w-5" />
              </div>
              <span className="font-bold tracking-wider text-base">ZEAZ Platform</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-cyan-400",
                    pathname === link.href
                      ? "text-cyan-400"
                      : "text-slate-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 font-bold text-sm">
                  <TerminalSquare className="h-4 w-4" />
                </div>
                <span className="font-bold tracking-wider">ZEAZ Platform</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Software development and AI automation platform providing SaaS services,
                cloud-based development tools, AI agents, DevOps automation, and technical
                consulting for businesses and developers.
              </p>
              <p className="text-xs text-slate-500">
                Digital SaaS and software services only. No physical goods or prohibited
                regulated products are sold.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Pages</h3>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "/marketing" },
                  { name: "Pricing", href: "/marketing/pricing" },
                  { name: "Terms of Service", href: "/marketing/terms" },
                  { name: "Privacy Policy", href: "/marketing/privacy" },
                  { name: "Refund Policy", href: "/marketing/refund" },
                  { name: "Contact", href: "/marketing/contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <a
                    href="https://zeaz.dev"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    zeaz.dev
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.zeaz.dev"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    www.zeaz.dev
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@zeaz.dev"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    support@zeaz.dev
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} ZEAZ Platform. All rights reserved.</p>
            <p>Software-as-a-Service. Made for developers, teams, and businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
