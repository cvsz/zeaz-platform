"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, Plus, Trash2, Loader2, AlertCircle, Star, StarOff } from "lucide-react";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface MemoryEntry {
  id: string;
  category: string;
  content: string;
  importance: number;
  createdAt: string;
}

export function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("note");
  const [newImportance, setNewImportance] = useState(3);
  const [saving, setSaving] = useState(false);

  const key = getActiveKey();

  const refresh = useCallback(async () => {
    if (!key) { setLoading(false); return; }
    try {
      const res = await fetch("/api/memory", { headers: { "X-API-Key": key } });
      const d = await res.json();
      setMemories(d.memories ?? []);
    } catch {
      setError("Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAdd = async () => {
    if (!newContent.trim() || !key) return;
    setSaving(true);
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": key },
        body: JSON.stringify({ content: newContent.trim(), category: newCategory, importance: newImportance }),
      });
      setNewContent("");
      await refresh();
    } catch {
      setError("Failed to add memory");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!key) return;
    await fetch(`/api/memory?id=${id}`, { method: "DELETE", headers: { "X-API-Key": key } });
    await refresh();
  };

  const handleClear = async () => {
    if (!key) return;
    await fetch("/api/memory?clear=1", { method: "DELETE", headers: { "X-API-Key": key } });
    await refresh();
  };

  if (!key) {
    return <div className="p-4 text-center font-mono text-[11px] text-zinc-600">Login via the Dashboard tab first.</div>;
  }

  return (
    <div className="space-y-3">
      <SectionLabel>memory system · persistent context</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Store facts, preferences, and notes. Memories persist per API key and can be injected into prompts as context.
      </p>

      {/* Add form */}
      <div className="grad-border rounded-xl bg-[#07090a]/40 p-3">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Remember that I prefer TypeScript with strict mode…"
          rows={2}
          className="mb-2 w-full resize-none rounded-lg border border-emerald-500/15 bg-[#0a0f0d]/60 px-2.5 py-1.5 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
        />
        <div className="mb-2 flex items-center gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-[#0a0f0d]/60 px-2 py-1 font-mono text-[10.5px] text-zinc-300 focus:outline-none"
          >
            <option value="note">note</option>
            <option value="fact">fact</option>
            <option value="preference">preference</option>
            <option value="context">context</option>
          </select>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNewImportance(n)}
                className="p-0.5"
              >
                {n <= newImportance ? (
                  <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                ) : (
                  <StarOff className="h-3 w-3 text-zinc-700" />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newContent.trim() || saving}
            className="ml-auto flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10.5px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            add
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {/* Memory list */}
      {loading ? (
        <div className="py-6 text-center font-mono text-[11px] text-zinc-600"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>
      ) : memories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-6 text-center font-mono text-[11px] text-zinc-600">
          No memories yet. Add one above.
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">{memories.length} memories</span>
            <button onClick={handleClear} className="font-mono text-[9.5px] text-rose-400/70 hover:text-rose-300">clear all</button>
          </div>
          {memories.map((m) => (
            <div key={m.id} className="grad-border rounded-xl bg-[#07090a]/40 p-2.5">
              <div className="flex items-start gap-2">
                <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                <span className="min-w-0 flex-1 font-mono text-[11.5px] leading-relaxed text-zinc-300">{m.content}</span>
                <button onClick={() => handleDelete(m.id)} className="shrink-0 text-zinc-600 hover:text-rose-400">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2 pl-5">
                <span className="rounded border border-zinc-800 px-1 py-px font-mono text-[8.5px] uppercase text-zinc-600">{m.category}</span>
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={cn("h-2 w-2", i < m.importance ? "fill-emerald-400 text-emerald-400" : "text-zinc-800")} />
                  ))}
                </span>
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
