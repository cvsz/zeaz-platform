"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckSquare, Plus, Trash2, Loader2, AlertCircle, Check, Circle, Clock, Square } from "lucide-react";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface Task {
  id: string; title: string; description: string; status: string; priority: string; tags: string[]; dueAt: string | null; createdAt: string;
}

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = getActiveKey();
  const refresh = useCallback(async () => {
    if (!key) { setLoading(false); return; }
    try { const res = await fetch("/api/tasks", { headers: { "X-API-Key": key } }); const d = await res.json(); setTasks(d.tasks ?? []); setStats(d.stats ?? { total: 0, todo: 0, inProgress: 0, done: 0, blocked: 0 }); }
    catch { setError("Failed to load tasks"); }
    finally { setLoading(false); }
  }, [key]);

  useEffect(() => {
    const id = requestAnimationFrame(() => refresh());
    return () => cancelAnimationFrame(id);
  }, [refresh]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !key) return;
    setSaving(true);
    try { await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": key }, body: JSON.stringify({ title: newTitle.trim(), priority: newPriority }) }); setNewTitle(""); await refresh(); }
    catch { setError("Failed to add task"); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    if (!key) return;
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json", "X-API-Key": key }, body: JSON.stringify({ id, status }) });
    await refresh();
  };

  const handleDelete = async (id: string) => {
    if (!key) return;
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE", headers: { "X-API-Key": key } });
    await refresh();
  };

  if (!key) return <div className="p-4 text-center font-mono text-[11px] text-zinc-600">Login via Dashboard first.</div>;
  if (loading) return <div className="py-12 text-center font-mono text-[11px] text-zinc-600"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>;

  const statusIcon = (status: string) => {
    if (status === "done") return <Check className="h-3.5 w-3.5 text-emerald-400" />;
    if (status === "in-progress") return <Clock className="h-3.5 w-3.5 text-amber-300" />;
    if (status === "blocked") return <Square className="h-3.5 w-3.5 text-rose-400" />;
    return <Circle className="h-3.5 w-3.5 text-zinc-600" />;
  };

  return (
    <div className="space-y-3">
      <SectionLabel>tasks · project manager</SectionLabel>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1.5">
        {(["todo","inProgress","done","blocked"] as const).map((s) => (
          <div key={s} className="rounded-lg border border-zinc-800/50 bg-[#0a0f0d]/40 p-2 text-center">
            <div className="font-mono text-[14px] font-bold text-zinc-200">{stats[s] ?? 0}</div>
            <div className="font-mono text-[7.5px] uppercase tracking-wide text-zinc-600">{s === "inProgress" ? "active" : s}</div>
          </div>
        ))}
      </div>

      {/* Add */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-2.5">
        <div className="flex gap-1.5">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="New task…" className="flex-1 rounded-lg border border-emerald-500/15 bg-[#0a0f0d]/60 px-2.5 py-1 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none" />
          <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="rounded-lg border border-zinc-800 bg-[#0a0f0d]/60 px-2 py-1 font-mono text-[10.5px] text-zinc-300 focus:outline-none"><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="urgent">urgent</option></select>
          <button onClick={handleAdd} disabled={!newTitle.trim() || saving} className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10.5px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40">{saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}</button>
        </div>
      </div>

      {error && <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /><span className="font-mono text-[11px] text-rose-300">{error}</span></div>}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-6 text-center font-mono text-[11px] text-zinc-600">No tasks yet. Add one above.</div>
      ) : (
        <div className="space-y-1">
          {tasks.map((t) => (
            <div key={t.id} className="grad-border rounded-xl bg-[#07090a]/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <button onClick={() => handleStatus(t.id, t.status === "done" ? "todo" : "done")} className="shrink-0">{statusIcon(t.status)}</button>
                <span className={cn("min-w-0 flex-1 truncate font-mono text-[12px]", t.status === "done" ? "text-zinc-600 line-through" : "text-zinc-200")}>{t.title}</span>
                <span className={cn("rounded-full border px-1.5 py-px font-mono text-[8.5px] uppercase", t.priority === "urgent" ? "border-rose-500/30 text-rose-400" : t.priority === "high" ? "border-amber-400/30 text-amber-300" : "border-zinc-700 text-zinc-500")}>{t.priority}</span>
                <button onClick={() => handleDelete(t.id)} className="shrink-0 text-zinc-600 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
              </div>
              {t.description && <p className="mt-0.5 pl-5 text-[10.5px] text-zinc-500">{t.description}</p>}
              <div className="mt-0.5 flex items-center gap-1.5 pl-5">
                {t.tags.map((tag) => <span key={tag} className="rounded border border-zinc-800 px-1 py-px font-mono text-[8.5px] text-zinc-600">{tag}</span>)}
                {t.status !== "done" && t.status !== "in-progress" && <button onClick={() => handleStatus(t.id, "in-progress")} className="font-mono text-[8.5px] text-amber-300/70 hover:text-amber-300">start</button>}
                {t.status === "in-progress" && <button onClick={() => handleStatus(t.id, "blocked")} className="font-mono text-[8.5px] text-rose-300/70 hover:text-rose-300">block</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
