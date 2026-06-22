"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Trash2, Loader2, AlertCircle, Plus, Clock } from "lucide-react";
import { getActiveKey } from "@/lib/api-keys-client";
import { cn } from "@/lib/utils";

interface ConvListItem {
  id: string; title: string; createdAt: string; updatedAt: string; messageCount: number;
}

export function ConversationsPanel() {
  const [list, setList] = useState<ConvListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = getActiveKey();

  const refresh = useCallback(async () => {
    if (!key) { setLoading(false); return; }
    try {
      const res = await fetch("/api/conversations", { headers: { "X-API-Key": key } });
      const d = await res.json();
      setList(d.conversations ?? []);
    } catch { setError("Failed to load conversations"); }
    finally { setLoading(false); }
  }, [key]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id: string) => {
    if (!key) return;
    await fetch(`/api/conversations?id=${id}`, { method: "DELETE", headers: { "X-API-Key": key } });
    await refresh();
  };

  if (!key) return <div className="p-4 text-center font-mono text-[11px] text-zinc-600">Login via Dashboard first.</div>;
  if (loading) return <div className="py-12 text-center font-mono text-[11px] text-zinc-600"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <SectionLabel>conversations · save & load</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Conversations are saved per API key. Use <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">/save</code> in the terminal to save the current chat, then load it here or with <code className="rounded bg-emerald-500/10 px-1 text-emerald-300">/load &lt;id&gt;</code>.
      </p>

      {error && <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /><span className="font-mono text-[11px] text-rose-300">{error}</span></div>}

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-6 text-center">
          <MessageSquare className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
          <div className="font-mono text-[11px] text-zinc-600">No saved conversations yet.</div>
          <div className="mt-1 font-mono text-[10px] text-zinc-700">Type <code className="text-emerald-400">/save</code> in the terminal to save.</div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">{list.length} conversations</div>
          {list.map((c) => (
            <div key={c.id} className="grad-border rounded-xl bg-[#07090a]/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-emerald-400/60" />
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-zinc-200">{c.title}</span>
                <span className="font-mono text-[9px] text-zinc-600">{c.messageCount} msgs</span>
                <button onClick={() => handleDelete(c.id)} className="shrink-0 text-zinc-600 hover:text-rose-400"><Trash2 className="h-3 w-3" /></button>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 pl-5">
                <Clock className="h-2.5 w-2.5 text-zinc-700" />
                <span className="font-mono text-[9px] text-zinc-600">{new Date(c.updatedAt).toLocaleDateString()} {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <code className="ml-auto font-mono text-[8px] text-zinc-700">{c.id.slice(0, 16)}</code>
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
