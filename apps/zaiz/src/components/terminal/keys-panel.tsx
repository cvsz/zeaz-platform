"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Ban,
  Eye,
  EyeOff,
  Shield,
  ShieldOff,
  Loader2,
  AlertCircle,
  Gauge,
} from "lucide-react";
import {
  type ApiKeyPublic,
  type ApiKeyCreated,
  type KeyConfig,
  getActiveKey,
  setActiveKey,
} from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface KeysPanelProps {
  onClose?: () => void;
}

export function KeysPanel({ onClose }: KeysPanelProps) {
  const [keys, setKeys] = useState<ApiKeyPublic[]>([]);
  const [config, setConfig] = useState<KeyConfig>({ requireKey: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Create form
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState(60);

  // Newly created key (shown once for copy)
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [showCreated, setShowCreated] = useState(false);

  // Active key (from localStorage)
  const [activeKey, setActiveKeyState] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setKeys(data.keys ?? []);
      setConfig(data.config ?? { requireKey: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    setActiveKeyState(getActiveKey());
  }, [refresh]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), rateLimitPerHour: newLimit }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Failed (${res.status})`);
      }
      const created: ApiKeyCreated = await res.json();
      setCreatedKey(created);
      setShowCreated(true);
      setNewName("");
      setNewLimit(60);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRequire = async () => {
    const next = !config.requireKey;
    setConfig({ requireKey: next });
    try {
      await fetch("/api/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireKey: next }),
      });
    } catch {
      setConfig({ requireKey: !next });
      setError("Failed to toggle require-key");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await fetch("/api/keys", {
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
      await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      await refresh();
    } catch {
      setError("Failed to delete key");
    }
  };

  const handleUseKey = (key: string, name: string) => {
    const next = activeKey === key ? null : key;
    setActiveKey(next, next ? name : null);
    setActiveKeyState(next);
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleRateLimitChange = async (id: string, value: number) => {
    try {
      await fetch("/api/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rateLimitPerHour: value }),
      });
      await refresh();
    } catch {
      setError("Failed to update rate limit");
    }
  };

  return (
    <div className="space-y-3">
      <SectionLabel>api keys · access control</SectionLabel>
      <p className="mb-3 text-[11.5px] leading-relaxed text-zinc-500">
        Generate API keys to gate access and rate-limit usage. When{" "}
        <strong className="text-zinc-400">Require key</strong> is on, every CLI
        request must carry a valid <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">X-API-Key</code> header.
      </p>

      {/* Require-key toggle */}
      <button
        type="button"
        onClick={handleToggleRequire}
        className={cn(
          "grad-border flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
          config.requireKey
            ? "bg-emerald-500/[0.06]"
            : "bg-[#07090a]/40 hover:bg-emerald-500/[0.03]",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            config.requireKey
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border-zinc-700 text-zinc-500",
          )}
        >
          {config.requireKey ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-mono text-[12px] font-medium",
              config.requireKey ? "text-emerald-200" : "text-zinc-300",
            )}
          >
            Require API key
          </span>
          <span className="block text-[10.5px] text-zinc-500">
            {config.requireKey
              ? "All /api/cli, /api/agent, /api/plan requests need a valid key"
              : "Open access — no key required (default)"}
          </span>
        </span>
        <span
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
            config.requireKey ? "bg-emerald-500/40" : "bg-zinc-700",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-200",
              config.requireKey ? "left-[18px]" : "left-0.5",
            )}
          />
        </span>
      </button>

      {/* Create form */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
          <Plus className="h-3 w-3" /> create new key
        </div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Key name (e.g. production, dev)"
          className="mb-2 w-full rounded-lg border border-emerald-500/15 bg-[#0a0f0d]/60 px-2.5 py-1.5 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <div className="mb-2 flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span className="font-mono text-[10.5px] text-zinc-500">Rate limit</span>
          <input
            type="number"
            min={0}
            value={newLimit}
            onChange={(e) => setNewLimit(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 rounded-lg border border-emerald-500/15 bg-[#0a0f0d]/60 px-2 py-1 font-mono text-[12px] text-zinc-200 focus:border-emerald-500/40 focus:outline-none"
          />
          <span className="font-mono text-[10.5px] text-zinc-600">req/hour (0 = unlimited)</span>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-1.5 font-mono text-[11px] font-medium text-emerald-300 transition-all duration-200 hover:from-emerald-500/25 hover:to-emerald-500/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {creating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> generating…
            </>
          ) : (
            <>
              <Key className="h-3 w-3" /> generate key
            </>
          )}
        </button>
      </div>

      {/* Newly created key (show once) */}
      {createdKey && showCreated && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-3 w-3 text-emerald-400" />
            </span>
            <span className="font-mono text-[11px] font-medium text-emerald-200">
              Key created — copy now (shown only once)
            </span>
            <button
              type="button"
              onClick={() => setShowCreated(false)}
              className="ml-auto font-mono text-[10px] text-zinc-500 hover:text-zinc-300"
            >
              dismiss
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="terminal-scroll flex-1 overflow-x-auto rounded-lg border border-emerald-500/20 bg-[#07090a]/80 px-2.5 py-1.5 font-mono text-[11px] text-emerald-300">
              {createdKey.key}
            </code>
            <button
              type="button"
              onClick={() => handleCopy(createdKey.key, "created")}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 font-mono text-[10.5px] text-emerald-300 hover:bg-emerald-500/20"
            >
              {copiedId === "created" ? (
                <>
                  <Check className="h-3 w-3" /> copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> copy
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              handleUseKey(createdKey.key, createdKey.name);
              setShowCreated(false);
            }}
            className="mt-2 w-full rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-1.5 font-mono text-[10.5px] text-emerald-300 hover:bg-emerald-500/15"
          >
            Use this key for my session →
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Key list */}
      <div className="space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 font-mono text-[11px] text-zinc-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading keys…
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-6 text-center font-mono text-[11px] text-zinc-600">
            No API keys yet. Create one above.
          </div>
        ) : (
          keys.map((k) => {
            const isActive = activeKey !== null && k.lastFour === activeKey?.slice(-4);
            return (
              <div
                key={k.id}
                className={cn(
                  "grad-border rounded-xl px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-emerald-500/[0.06]"
                    : k.active
                      ? "bg-[#07090a]/40"
                      : "bg-rose-500/[0.03]",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                      isActive
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : k.active
                          ? "border-zinc-700 text-zinc-400"
                          : "border-rose-500/30 text-rose-400",
                    )}
                  >
                    <Key className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono text-[12px] font-medium",
                          isActive ? "text-emerald-200" : "text-zinc-200",
                        )}
                      >
                        {k.name}
                      </span>
                      <code className="font-mono text-[10px] text-zinc-600">…{k.lastFour}</code>
                      {isActive && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-px font-mono text-[8.5px] uppercase text-emerald-400">
                          active
                        </span>
                      )}
                      {!k.active && (
                        <span className="rounded-full bg-rose-500/20 px-1.5 py-px font-mono text-[8.5px] uppercase text-rose-400">
                          revoked
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-zinc-600">
                      {k.usageCount} uses · {k.rateLimitPerHour === 0 ? "∞" : `${k.rateLimitPerHour}/hr`}
                      {k.lastUsedAt && ` · ${timeAgo(k.lastUsedAt)}`}
                    </span>
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-2 flex items-center gap-1.5">
                  {k.active && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUseKey(`zlm-${""}`, k.name)}
                        disabled
                        className="cursor-not-allowed rounded-md border border-zinc-800 px-2 py-1 font-mono text-[10px] text-zinc-700"
                        title="Use the full key from the creation step"
                      >
                        use
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevoke(k.id)}
                        className="flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/[0.06] px-2 py-1 font-mono text-[10px] text-amber-300 hover:bg-amber-400/15"
                      >
                        <Ban className="h-2.5 w-2.5" /> revoke
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(k.id)}
                    className="flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/[0.06] px-2 py-1 font-mono text-[10px] text-rose-300 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-2.5 w-2.5" /> delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
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
