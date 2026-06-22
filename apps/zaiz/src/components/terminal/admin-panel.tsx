"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  ShieldOff,
  Key,
  Trash2,
  Ban,
  Loader2,
  AlertCircle,
  Activity,
  Database,
  Cpu,
  Layers,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { ApiKeyPublic, KeyConfig } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface AdminStats {
  keys: {
    total: number;
    active: number;
    revoked: number;
    totalUsage: number;
    totalRateLimitPerHour: number;
    avgUsage: number;
  };
  registry: {
    models: number;
    skills: number;
    modules: number;
    agents: number;
    modes: number;
  };
  config: KeyConfig;
  recentKeys: ApiKeyPublic[];
  topKeysByUsage: ApiKeyPublic[];
}

export function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggleRequire = async () => {
    if (!stats) return;
    setToggling(true);
    const next = !stats.config.requireKey;
    setStats({ ...stats, config: { requireKey: next } });
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireKey: next }),
      });
    } catch {
      setStats({ ...stats, config: { requireKey: !next } });
      setError("Failed to toggle require-key");
    } finally {
      setToggling(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, revoke: true }),
      });
      await refresh();
    } catch {
      setError("Failed to revoke key");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, delete: true }),
      });
      await refresh();
    } catch {
      setError("Failed to delete key");
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 font-mono text-[11px] text-zinc-600">
        <Loader2 className="h-4 w-4 animate-spin" /> loading dashboard…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
        <span className="font-mono text-[11px] text-rose-300">{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SectionLabel>admin · control panel</SectionLabel>
        <button
          type="button"
          onClick={refresh}
          className="ml-auto flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-500 hover:border-emerald-500/25 hover:text-emerald-300"
        >
          <RefreshCw className="h-3 w-3" /> refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Key className="h-4 w-4" />}
          label="API Keys"
          value={stats.keys.total}
          sublabel={`${stats.keys.active} active · ${stats.keys.revoked} revoked`}
          color="emerald"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Usage"
          value={stats.keys.totalUsage}
          sublabel={`${stats.keys.avgUsage} avg/key`}
          color="amber"
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Rate Limit/hr"
          value={stats.keys.totalRateLimitPerHour === 0 ? "∞" : stats.keys.totalRateLimitPerHour}
          sublabel="across all keys"
          color="sky"
        />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Registry"
          value={`${stats.registry.models}+${stats.registry.skills}+${stats.registry.modules}`}
          sublabel="models · skills · modules"
          color="violet"
        />
      </div>

      {/* Require-key toggle */}
      <button
        type="button"
        onClick={handleToggleRequire}
        disabled={toggling}
        className={cn(
          "grad-border flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
          stats.config.requireKey ? "bg-emerald-500/[0.06]" : "bg-[#07090a]/40 hover:bg-emerald-500/[0.03]",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            stats.config.requireKey
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-zinc-700 text-zinc-500",
          )}
        >
          {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.config.requireKey ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block font-mono text-[12px] font-medium", stats.config.requireKey ? "text-emerald-200" : "text-zinc-300")}>
            Require API key
          </span>
          <span className="block text-[10.5px] text-zinc-500">
            {stats.config.requireKey ? "All AI requests need a valid key" : "Open access — no key required"}
          </span>
        </span>
        <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", stats.config.requireKey ? "bg-emerald-500/40" : "bg-zinc-700")}>
          <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", stats.config.requireKey ? "left-[18px]" : "left-0.5")} />
        </span>
      </button>

      {/* Registry breakdown */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">registry breakdown</div>
        <div className="grid grid-cols-5 gap-2">
          <RegistryStat icon={<Cpu className="h-3 w-3" />} label="models" value={stats.registry.models} />
          <RegistryStat icon={<Layers className="h-3 w-3" />} label="skills" value={stats.registry.skills} />
          <RegistryStat icon={<Layers className="h-3 w-3" />} label="modules" value={stats.registry.modules} />
          <RegistryStat icon={<Layers className="h-3 w-3" />} label="agents" value={stats.registry.agents} />
          <RegistryStat icon={<Layers className="h-3 w-3" />} label="modes" value={stats.registry.modes} />
        </div>
      </div>

      {/* Top keys by usage */}
      {stats.topKeysByUsage.length > 0 && (
        <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
          <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">top keys by usage</div>
          <div className="space-y-1.5">
            {stats.topKeysByUsage.map((k, i) => (
              <div key={k.id} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 font-mono text-[9px] font-bold text-emerald-400">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-300">{k.name}</span>
                <code className="font-mono text-[9px] text-zinc-600">…{k.lastFour}</code>
                <span className="font-mono text-[10px] font-medium text-emerald-400">{k.usageCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All keys management */}
      <div>
        <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">all keys ({stats.recentKeys.length})</div>
        <div className="space-y-1.5">
          {stats.recentKeys.map((k) => (
            <div
              key={k.id}
              className={cn(
                "grad-border rounded-xl px-3 py-2",
                k.active ? "bg-[#07090a]/40" : "bg-rose-500/[0.03]",
              )}
            >
              <div className="flex items-center gap-2">
                <Key className={cn("h-3.5 w-3.5 shrink-0", k.active ? "text-zinc-500" : "text-rose-400")} />
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-200">{k.name}</span>
                <code className="font-mono text-[9px] text-zinc-600">…{k.lastFour}</code>
                {!k.active && (
                  <span className="rounded-full bg-rose-500/20 px-1.5 py-px font-mono text-[8.5px] uppercase text-rose-400">revoked</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 font-mono text-[9.5px] text-zinc-600">
                <span className="flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5" />{k.usageCount} uses</span>
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{k.rateLimitPerHour === 0 ? "∞" : `${k.rateLimitPerHour}/hr`}</span>
                {k.lastUsedAt && <span>{timeAgo(k.lastUsedAt)}</span>}
              </div>
              {k.active && (
                <div className="mt-1.5 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRevoke(k.id)}
                    className="flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/[0.06] px-2 py-0.5 font-mono text-[9.5px] text-amber-300 hover:bg-amber-400/15"
                  >
                    <Ban className="h-2.5 w-2.5" /> revoke
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(k.id)}
                    className="flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/[0.06] px-2 py-0.5 font-mono text-[9.5px] text-rose-300 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-2.5 w-2.5" /> delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, color }: { icon: React.ReactNode; label: string; value: number | string; sublabel: string; color: "emerald" | "amber" | "sky" | "violet" }) {
  const colorMap = {
    emerald: "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300",
    amber: "border-amber-400/20 bg-amber-400/[0.04] text-amber-300",
    sky: "border-sky-400/20 bg-sky-400/[0.04] text-sky-300",
    violet: "border-violet-400/20 bg-violet-400/[0.04] text-violet-300",
  };
  return (
    <div className={cn("grad-border rounded-xl p-3", colorMap[color])}>
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] opacity-70">{label}</span>
      </div>
      <div className="font-mono text-[20px] font-bold leading-none">{value}</div>
      <div className="mt-1 font-mono text-[9px] text-zinc-500">{sublabel}</div>
    </div>
  );
}

function RegistryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-zinc-800/50 bg-[#0a0f0d]/40 py-2">
      <span className="text-zinc-600">{icon}</span>
      <span className="font-mono text-[14px] font-bold text-zinc-300">{value}</span>
      <span className="font-mono text-[8.5px] uppercase tracking-wide text-zinc-600">{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
      {children}
    </div>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
