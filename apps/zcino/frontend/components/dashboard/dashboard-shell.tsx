"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useTheme } from "@/app/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Explorer" },
  { href: "/governance", label: "Governance" },
  { href: "/tasks", label: "Tasks" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-app text-foreground">
      <div className="mx-auto flex max-w-[96rem] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 rounded-3xl border border-border bg-shell/90 px-4 py-3 shadow-card backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 text-lg font-black text-slate-950">Z</span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Zcino Meta</p>
                <p className="text-xs text-muted">Production control plane</p>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-bold text-muted transition hover:bg-muted/60 hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? "Light" : "Dark"} mode
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
