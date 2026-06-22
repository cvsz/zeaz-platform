"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, Download, Trash2, Loader2, AlertCircle, Check, Database, Lock, Eye } from "lucide-react";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface Inventory {
  apiKey: { exists: boolean; name?: string; lastFour?: string; usageCount?: number };
  profile: { exists: boolean; email?: string; name?: string; plan?: string; credits?: number; tokensUsed?: number };
  usageRecords: { count: number; oldestDate?: string };
  memories: { count: number };
  invoices: { count: number };
  roles: { count: number; names: string[] };
  conversations: { count: number };
  tasks: { count: number };
  settings: { exists: boolean };
}

export function PrivacyPanel() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string | null>(null);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const key = getActiveKey();

  const refresh = useCallback(async () => {
    if (!key) { setLoading(false); return; }
    try {
      const res = await fetch("/api/privacy", { headers: { "X-API-Key": key } });
      if (!res.ok) throw new Error("Failed");
      setInventory(await res.json());
    } catch { setError("Failed to load data inventory"); }
    finally { setLoading(false); }
  }, [key]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleExport = async () => {
    if (!key) return;
    setExporting(true); setError(null); setExportData(null);
    try {
      const res = await fetch("/api/privacy", { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": key }, body: JSON.stringify({ action: "export" }) });
      const data = await res.json();
      if (data.ok) setExportData(JSON.stringify(data.data, null, 2));
      else throw new Error(data.error ?? "Export failed");
    } catch (e) { setError(e instanceof Error ? e.message : "Export failed"); }
    finally { setExporting(false); }
  };

  const handleDelete = async () => {
    if (!key) return;
    if (!confirm("This will permanently delete ALL your data (API key, profile, usage, memories, invoices, conversations, tasks). This cannot be undone. Continue?")) return;
    setDeleting(true); setError(null); setDeleteResult(null);
    try {
      const res = await fetch("/api/privacy", { method: "DELETE", headers: { "X-API-Key": key } });
      const data = await res.json();
      if (data.ok) {
        setDeleteResult(`Deleted: ${data.deleted.usageRecords} usage records, ${data.deleted.memories} memories, ${data.deleted.invoices} invoices, ${data.deleted.conversations} conversations, ${data.deleted.tasks} tasks.`);
      } else throw new Error(data.error ?? "Delete failed");
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
    finally { setDeleting(false); }
  };

  if (!key) return <div className="p-4 text-center font-mono text-[11px] text-zinc-600">Login via Dashboard first.</div>;
  if (loading) return <div className="py-12 text-center font-mono text-[11px] text-zinc-600"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <SectionLabel>data & privacy · gdpr</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        View what data is stored, export it (right to portability), or delete it all (right to erasure).
      </p>

      {/* Data inventory */}
      {inventory && (
        <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600"><Database className="h-3 w-3" /> data inventory</div>
          <div className="space-y-1">
            <DataRow icon={<Lock className="h-3 w-3" />} label="API Key" value={inventory.apiKey.exists ? `${inventory.apiKey.name} (…${inventory.apiKey.lastFour})` : "not found"} />
            <DataRow icon={<Eye className="h-3 w-3" />} label="Profile" value={inventory.profile.exists ? `${inventory.profile.name ?? "Anonymous"} · ${inventory.profile.plan}` : "not found"} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Usage Records" value={`${inventory.usageRecords.count} records`} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Memories" value={`${inventory.memories.count} entries`} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Invoices" value={`${inventory.invoices.count} records`} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Roles" value={`${inventory.roles.count} (${inventory.roles.names.join(", ") || "none"})`} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Conversations" value={`${inventory.conversations.count} saved`} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Tasks" value={`${inventory.tasks.count} tasks`} />
            <DataRow icon={<Database className="h-3 w-3" />} label="Settings" value={inventory.settings.exists ? "configured" : "default"} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleExport} disabled={exporting} className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40">
          {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} export data
        </button>
        <button onClick={handleDelete} disabled={deleting} className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-300 hover:bg-rose-500/20 disabled:opacity-40">
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} delete all
        </button>
      </div>

      {error && <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /><span className="font-mono text-[11px] text-rose-300">{error}</span></div>}

      {deleteResult && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /><span className="font-mono text-[11px] text-emerald-300">{deleteResult}</span></div>
      )}

      {exportData && (
        <div className="grad-border anim-fade-in-up overflow-hidden rounded-xl">
          <div className="flex items-center gap-2 border-b border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1.5">
            <Check className="h-3 w-3 text-emerald-400" /><span className="font-mono text-[10px] uppercase text-emerald-400/70">exported data</span>
            <button onClick={() => { const blob = new Blob([exportData], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "zlm-cli-data-export.json"; a.click(); }} className="ml-auto font-mono text-[10px] text-zinc-500 hover:text-emerald-300">download json</button>
          </div>
          <div className="terminal-scroll max-h-[200px] overflow-y-auto p-3"><pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-zinc-500">{exportData.slice(0, 2000)}{exportData.length > 2000 ? "\n…(truncated)" : ""}</pre></div>
        </div>
      )}
    </div>
  );
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-2 font-mono text-[11px]"><span className="text-zinc-600">{icon}</span><span className="text-zinc-400">{label}</span><span className="ml-auto text-zinc-300">{value}</span></div>;
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
