import Link from "next/link";
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
  Key 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Services", href: "/services", icon: Server },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Healing", href: "/healing", icon: Stethoscope },
  { name: "Observability", href: "/observability", icon: Activity },
  { name: "Auth", href: "/auth", icon: ShieldCheck },
  { name: "Edge", href: "/edge", icon: Globe },
  { name: "Deployments", href: "/deployments", icon: Rocket },
  { name: "Vault", href: "/vault", icon: Key },
  { name: "Terminal", href: "/terminal", icon: TerminalSquare },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border glass flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-mono font-bold tracking-widest text-lg">
          <TerminalSquare className="w-5 h-5" />
          <span>ZEAZ OS</span>
        </div>
      </div>
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <nav className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-white/5 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-border/50 text-xs text-muted-foreground font-mono text-center">
        v1.0.0-rc / SYS_ONLINE
      </div>
    </aside>
  );
}
