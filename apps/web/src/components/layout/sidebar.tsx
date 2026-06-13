"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TerminalSquare, 
  LayoutDashboard, 
  Server, 
  Bot, 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Rocket, 
  Key,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Services", href: "/dashboard/services", icon: Server },
  { name: "Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Healing", href: "/dashboard/healing", icon: Stethoscope },
  { name: "Observability", href: "/dashboard/observability", icon: Activity },
  { name: "Auth", href: "/dashboard/auth", icon: ShieldCheck },
  { name: "Edge", href: "/dashboard/edge", icon: Globe },
  { name: "Deployments", href: "/dashboard/deployments", icon: Rocket },
  { name: "Vault", href: "/dashboard/vault", icon: Key },
  { name: "Terminal", href: "/dashboard/terminal", icon: TerminalSquare },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border glass flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 text-primary font-mono font-bold tracking-widest text-lg">
          <TerminalSquare className="w-5 h-5" />
          <span>ZEAZ OS</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground hover:text-white transition-colors">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <aside className={cn(
        "w-64 border-r border-border glass flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-mono font-bold tracking-widest text-lg">
            <TerminalSquare className="w-5 h-5" />
            <span>ZEAZ OS</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-white/5",
                    isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-border/50 text-xs text-muted-foreground font-mono text-center">
          v1.0.0-rc / SYS_ONLINE
        </div>
      </aside>
    </>
  );
}
