"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, ShieldCheck, Plus, Trash2, Loader2, AlertCircle, Check, Lock, Users } from "lucide-react";
import type { PermissionKey } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface RolePublic {
  id: string;
  name: string;
  permissions: PermissionKey[];
  active: boolean;
  createdAt: string;
}

interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
  resource: string;
}

interface Preset {
  name: string;
  description: string;
  permissions: PermissionKey[];
  color: string;
}

export function PermissionsPanel() {
  const [roles, setRoles] = useState<RolePublic[]>([]);
  const [permissions, setPermissions] = useState<PermissionMeta[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/permissions");
      const data = await res.json();
      setRoles(data.roles ?? []);
      setPermissions(data.permissions ?? []);
      setPresets(data.presets ?? []);
    } catch {
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const togglePerm = (key: PermissionKey) => {
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const applyPreset = (preset: Preset) => {
    setNewRoleName(preset.name);
    setSelectedPerms(preset.permissions);
  };

  const handleSave = async () => {
    if (!newRoleName.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName.trim(), permissions: selectedPerms }),
      });
      if (!res.ok) throw new Error("Failed to save role");
      setNewRoleName("");
      setSelectedPerms([]);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await fetch(`/api/permissions?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      await refresh();
    } catch {
      setError("Failed to delete role");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-12 font-mono text-[11px] text-zinc-600"><Loader2 className="h-4 w-4 animate-spin" /> loading…</div>;
  }

  return (
    <div className="space-y-3">
      <SectionLabel>permissions · role-based access</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Define roles with permission sets. API keys can be assigned roles to control what each key can do.
      </p>

      {/* Presets */}
      <div>
        <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">presets</div>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-zinc-800 bg-[#07090a]/40 px-2.5 py-2 text-left transition-colors hover:border-emerald-500/25"
            >
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-zinc-500" />
                <span className="font-mono text-[11px] font-medium text-zinc-300">{p.name}</span>
                <span className="ml-auto font-mono text-[9px] text-zinc-600">{p.permissions.length}</span>
              </div>
              <div className="mt-0.5 text-[9.5px] leading-snug text-zinc-600">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* New role form */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">create / update role</div>
        <input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="role name (e.g. editor)"
          className="mb-2 w-full rounded-lg border border-emerald-500/15 bg-[#0a0f0d]/60 px-2.5 py-1.5 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <div className="mb-2 flex flex-wrap gap-1">
          {permissions.map((p) => {
            const active = selectedPerms.includes(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => togglePerm(p.key)}
                title={p.description}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] transition-colors",
                  active
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-zinc-800 text-zinc-500 hover:border-emerald-500/20",
                )}
              >
                {active && <Check className="mr-0.5 inline h-2 w-2" />}
                {p.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!newRoleName.trim() || saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          save role
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Existing roles */}
      <div>
        <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">
          roles ({roles.length})
        </div>
        <div className="space-y-1.5">
          {roles.map((role) => (
            <div key={role.id} className="grad-border rounded-xl bg-[#07090a]/40 p-2.5">
              <div className="flex items-center gap-2">
                <Shield className={cn("h-3.5 w-3.5", role.name === "admin" ? "text-rose-400" : "text-emerald-400")} />
                <span className="font-mono text-[12px] font-medium text-zinc-200">{role.name}</span>
                <span className="font-mono text-[9px] text-zinc-600">{role.permissions.length} perms</span>
                <button
                  type="button"
                  onClick={() => handleDelete(role.name)}
                  className="ml-auto flex items-center gap-1 rounded-md border border-rose-500/20 px-1.5 py-0.5 font-mono text-[9.5px] text-rose-300 hover:bg-rose-500/15"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-0.5">
                {role.permissions.map((p) => (
                  <span key={p} className="rounded border border-zinc-800 px-1 py-px font-mono text-[8.5px] text-zinc-500">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
