"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, Loader2, AlertCircle, TrendingUp, Coins, Cpu, Database,
  Wifi, WifiOff, Brain, Activity, CreditCard, Clock, Zap,
} from "lucide-react";
import { getActiveKey, setActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface DashboardData {
  profile: {
    hasProfile: boolean;
    email?: string | null;
    name?: string | null;
    plan?: string;
    credits?: number;
    tokensUsed?: number;
    requestCount?: number;
    internetEnabled?: boolean;
    memoryEnabled?: boolean;
    limits?: Record<string, unknown>;
  };
  usage: {
    totalRequests: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    byEndpoint: Record<string, { count: number; tokens: number }>;
    last24h: { requests: number; tokens: number };
    last7d: { requests: number; tokens: number };
  };
  memoryCount: number;
  invoices: unknown[];
  billingStats: {
    totalUsers: number;
    totalRevenue: number;
    totalCredits: number;
    totalTokens: number;
    byPlan: Record<string, number>;
  };
}

export function DashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginKey, setLoginKey] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const refresh = useCallback(async () => {
    const key = getActiveKey();
    if (!key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard", { headers: { "X-API-Key": key } });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Failed (${res.status})`);
      }
      const d = await res.json();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleLogin = async () => {
    if (!loginKey.trim() || loggingIn) return;
    setLoggingIn(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", apiKey: loginKey.trim() }),
      });
      if (!res.ok) throw new Error("Login failed");
      setActiveKey(loginKey.trim());
      setLoginKey("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setActiveKey(null);
    setData(null);
  };

  // Not logged in — show login
  if (!getActiveKey()) {
    return (
      <div className="space-y-3">
        <SectionLabel>dashboard · login via api key</SectionLabel>
        <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
          Login with your API key to view your dashboard — usage, billing, memory, and profile.
        </p>
        <input
          value={loginKey}
          onChange={(e) => setLoginKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="zlm-xxxxxxxxxxxx"
          className="w-full rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleLogin}
          disabled={!loginKey.trim() || loggingIn}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-2 font-mono text-[11px] font-medium text-emerald-300 hover:from-emerald-500/25 hover:to-emerald-500/10 disabled:opacity-40"
        >
          {loggingIn ? <Loader2 className="h-3 w-3 animate-spin" /> : <LayoutDashboard className="h-3 w-3" />}
          login
        </button>
        {error && <ErrorBox text={error} />}
        <p className="text-[10px] text-zinc-600">
          No API key? Generate one in the Keys tab, then paste it here.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-12 font-mono text-[11px] text-zinc-600"><Loader2 className="h-4 w-4 animate-spin" /> loading dashboard…</div>;
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <ErrorBox text={error ?? "No data" } />
        <button onClick={handleLogout} className="font-mono text-[10px] text-zinc-600 hover:text-rose-400">logout</button>
      </div>
    );
  }

  const p = data.profile;
  const u = data.usage;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SectionLabel>dashboard · overview</SectionLabel>
        <button onClick={refresh} className="ml-auto font-mono text-[10px] text-zinc-600 hover:text-emerald-400">refresh</button>
        <button onClick={handleLogout} className="font-mono text-[10px] text-zinc-600 hover:text-rose-400">logout</button>
      </div>

      {/* Profile card */}
      {p.hasProfile && (
        <div className="grad-border rounded-xl bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 font-mono text-[12px] font-bold text-emerald-300">
              {(p.name ?? p.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[12px] font-medium text-zinc-200">{p.name ?? "Anonymous"}</div>
              <div className="font-mono text-[10px] text-zinc-600">{p.email ?? "no email"}</div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9.5px] uppercase text-emerald-300">{p.plan}</span>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<Coins className="h-4 w-4" />} label="Credits" value={p.credits ?? 0} color="amber" />
        <StatCard icon={<Activity className="h-4 w-4" />} label="Requests" value={p.requestCount ?? 0} color="emerald" />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Tokens Used" value={(p.tokensUsed ?? 0).toLocaleString()} color="sky" />
        <StatCard icon={<Brain className="h-4 w-4" />} label="Memories" value={data.memoryCount} color="violet" />
      </div>

      {/* Usage (24h / 7d) */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">usage</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-zinc-800/50 bg-[#0a0f0d]/40 p-2">
            <div className="font-mono text-[8.5px] uppercase tracking-wide text-zinc-600">last 24h</div>
            <div className="font-mono text-[14px] font-bold text-zinc-200">{u.last24h.requests} reqs</div>
            <div className="font-mono text-[9px] text-zinc-600">{u.last24h.tokens.toLocaleString()} tokens</div>
          </div>
          <div className="rounded-lg border border-zinc-800/50 bg-[#0a0f0d]/40 p-2">
            <div className="font-mono text-[8.5px] uppercase tracking-wide text-zinc-600">last 7d</div>
            <div className="font-mono text-[14px] font-bold text-zinc-200">{u.last7d.requests} reqs</div>
            <div className="font-mono text-[9px] text-zinc-600">{u.last7d.tokens.toLocaleString()} tokens</div>
          </div>
        </div>
        {/* By endpoint */}
        {Object.keys(u.byEndpoint).length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="font-mono text-[8.5px] uppercase tracking-wide text-zinc-600">by endpoint</div>
            {Object.entries(u.byEndpoint).sort((a, b) => b[1].count - a[1].count).map(([ep, s]) => (
              <div key={ep} className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-zinc-400">{ep}</span>
                <span className="ml-auto text-zinc-600">{s.count} · {s.tokens.toLocaleString()} tok</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggles: internet + memory */}
      {p.hasProfile && (
        <div className="grid grid-cols-2 gap-2">
          <ToggleCard
            icon={p.internetEnabled ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            label="Internet"
            enabled={!!p.internetEnabled}
            onToggle={async () => {
              const key = getActiveKey()!;
              await fetch("/api/usage", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "X-API-Key": key },
                body: JSON.stringify({ internet: !p.internetEnabled }),
              });
              refresh();
            }}
          />
          <ToggleCard
            icon={<Brain className="h-3.5 w-3.5" />}
            label="Memory"
            enabled={!!p.memoryEnabled}
            onToggle={async () => {
              const key = getActiveKey()!;
              await fetch("/api/usage", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "X-API-Key": key },
                body: JSON.stringify({ memory: !p.memoryEnabled }),
              });
              refresh();
            }}
          />
        </div>
      )}

      {/* Billing stats (admin view) */}
      {data.billingStats && (
        <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
          <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">platform stats</div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Users" value={data.billingStats.totalUsers} />
            <MiniStat label="Revenue" value={`$${(data.billingStats.totalRevenue / 100).toFixed(0)}`} />
            <MiniStat label="Tokens" value={(data.billingStats.totalTokens / 1000).toFixed(0) + "K"} />
          </div>
          {Object.keys(data.billingStats.byPlan).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(data.billingStats.byPlan).map(([plan, count]) => (
                <span key={plan} className="rounded-md border border-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
                  {plan}: {count}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/[0.04] text-amber-300",
    sky: "border-sky-400/20 bg-sky-400/[0.04] text-sky-300",
    violet: "border-violet-400/20 bg-violet-400/[0.04] text-violet-300",
  };
  return (
    <div className={cn("grad-border rounded-xl p-3", colors[color])}>
      <div className="mb-1 flex items-center gap-1.5">{icon}<span className="font-mono text-[9px] uppercase tracking-[0.15em] opacity-70">{label}</span></div>
      <div className="font-mono text-[18px] font-bold leading-none">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800/50 bg-[#0a0f0d]/40 p-2 text-center">
      <div className="font-mono text-[13px] font-bold text-zinc-200">{value}</div>
      <div className="font-mono text-[8px] uppercase tracking-wide text-zinc-600">{label}</div>
    </div>
  );
}

function ToggleCard({ icon, label, enabled, onToggle }: { icon: React.ReactNode; label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all",
        enabled ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-zinc-800 bg-[#07090a]/40",
      )}
    >
      <span className={cn(enabled ? "text-emerald-400" : "text-zinc-600")}>{icon}</span>
      <span className="font-mono text-[11px] text-zinc-300">{label}</span>
      <span className={cn("ml-auto h-4 w-7 rounded-full transition-colors", enabled ? "bg-emerald-500/40" : "bg-zinc-700")}>
        <span className={cn("block h-3 w-3 rounded-full bg-white transition-all", enabled ? "ml-3.5 mt-0.5" : "ml-0.5 mt-0.5")} />
      </span>
    </button>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
      <span className="font-mono text-[11px] text-rose-300">{text}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
