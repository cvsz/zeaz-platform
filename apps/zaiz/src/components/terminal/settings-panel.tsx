"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings, Loader2, AlertCircle, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSettings {
  workspace: { defaultMode: string; defaultModel: string; autoSave: boolean; maxHistoryMessages: number };
  safety: { requireApiKey: boolean; sandboxEnabled: boolean; mcpApprovalRequired: boolean; maxCodeLength: number; blockDangerousCommands: boolean };
  editor: { fontSize: number; fontFamily: string; tabSize: number; wordWrap: boolean; lineNumbers: boolean; autoIndent: boolean };
  visual: { theme: string; accentColor: string; enableAnimations: boolean; enableGlow: boolean; enableGrid: boolean; compactMode: boolean; sidebarDefaultOpen: boolean };
  performance: { streamBatchSize: number; maxConcurrentRequests: number; cacheResponses: boolean; cacheTTLSeconds: number; enableTokenCounting: boolean; lazyLoadPanels: boolean };
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    try { const res = await fetch("/api/settings"); setSettings(await res.json()); }
    catch { setError("Failed to load settings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true); setError(null);
    try {
      await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      setSaved(true); setTimeout(() => setSaved(false), 1600);
    } catch { setError("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    setSaving(true);
    try { const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: true }) }); setSettings(await res.json()); }
    catch { setError("Reset failed"); }
    finally { setSaving(false); }
  };

  const update = (section: keyof AppSettings, key: string, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [section]: { ...settings[section], [key]: value } });
  };

  if (loading) return <div className="py-12 text-center font-mono text-[11px] text-zinc-600"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>;
  if (!settings) return <div className="text-center font-mono text-[11px] text-zinc-600">No settings</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SectionLabel>settings · advanced customization</SectionLabel>
        <button onClick={handleReset} disabled={saving} className="ml-auto flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-0.5 font-mono text-[9.5px] text-zinc-500 hover:text-rose-300"><RotateCcw className="h-2.5 w-2.5" /> reset</button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9.5px] text-emerald-300 hover:bg-emerald-500/20">{saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : saved ? <Check className="h-2.5 w-2.5" /> : <Settings className="h-2.5 w-2.5" />} {saving ? "saving" : saved ? "saved" : "save"}</button>
      </div>

      {error && <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /><span className="font-mono text-[11px] text-rose-300">{error}</span></div>}

      {/* Workspace */}
      <Section title="Workspace">
        <Field label="Default Mode"><Select value={settings.workspace.defaultMode} onChange={(v) => update("workspace", "defaultMode", v)} options={["chat","explain","debug","generate","review","optimize"]} /></Field>
        <Field label="Default Model"><Input value={settings.workspace.defaultModel} onChange={(v) => update("workspace", "defaultModel", v)} /></Field>
        <Field label="Auto Save"><Toggle on={settings.workspace.autoSave} onClick={() => update("workspace", "autoSave", !settings.workspace.autoSave)} /></Field>
        <Field label="Max History"><NumberInput value={settings.workspace.maxHistoryMessages} onChange={(v) => update("workspace", "maxHistoryMessages", v)} min={5} max={100} /></Field>
      </Section>

      {/* Safety */}
      <Section title="Safety Restrictions">
        <Field label="Require API Key"><Toggle on={settings.safety.requireApiKey} onClick={() => update("safety", "requireApiKey", !settings.safety.requireApiKey)} /></Field>
        <Field label="Sandbox Enabled"><Toggle on={settings.safety.sandboxEnabled} onClick={() => update("safety", "sandboxEnabled", !settings.safety.sandboxEnabled)} /></Field>
        <Field label="MCP Approval Required"><Toggle on={settings.safety.mcpApprovalRequired} onClick={() => update("safety", "mcpApprovalRequired", !settings.safety.mcpApprovalRequired)} /></Field>
        <Field label="Block Dangerous Commands"><Toggle on={settings.safety.blockDangerousCommands} onClick={() => update("safety", "blockDangerousCommands", !settings.safety.blockDangerousCommands)} /></Field>
        <Field label="Max Code Length"><NumberInput value={settings.safety.maxCodeLength} onChange={(v) => update("safety", "maxCodeLength", v)} min={1000} max={50000} step={1000} /></Field>
      </Section>

      {/* Editor */}
      <Section title="Editor Preferences">
        <Field label="Font Size"><NumberInput value={settings.editor.fontSize} onChange={(v) => update("editor", "fontSize", v)} min={10} max={24} /></Field>
        <Field label="Tab Size"><NumberInput value={settings.editor.tabSize} onChange={(v) => update("editor", "tabSize", v)} min={1} max={8} /></Field>
        <Field label="Word Wrap"><Toggle on={settings.editor.wordWrap} onClick={() => update("editor", "wordWrap", !settings.editor.wordWrap)} /></Field>
        <Field label="Line Numbers"><Toggle on={settings.editor.lineNumbers} onClick={() => update("editor", "lineNumbers", !settings.editor.lineNumbers)} /></Field>
        <Field label="Auto Indent"><Toggle on={settings.editor.autoIndent} onClick={() => update("editor", "autoIndent", !settings.editor.autoIndent)} /></Field>
      </Section>

      {/* Visual */}
      <Section title="Visual Style">
        <Field label="Theme"><Select value={settings.visual.theme} onChange={(v) => update("visual", "theme", v)} options={["dark","light","auto"]} /></Field>
        <Field label="Accent Color"><Select value={settings.visual.accentColor} onChange={(v) => update("visual", "accentColor", v)} options={["emerald","violet","amber","sky","rose","neon"]} /></Field>
        <Field label="Animations"><Toggle on={settings.visual.enableAnimations} onClick={() => update("visual", "enableAnimations", !settings.visual.enableAnimations)} /></Field>
        <Field label="Glow Effects"><Toggle on={settings.visual.enableGlow} onClick={() => update("visual", "enableGlow", !settings.visual.enableGlow)} /></Field>
        <Field label="Grid Background"><Toggle on={settings.visual.enableGrid} onClick={() => update("visual", "enableGrid", !settings.visual.enableGrid)} /></Field>
        <Field label="Compact Mode"><Toggle on={settings.visual.compactMode} onClick={() => update("visual", "compactMode", !settings.visual.compactMode)} /></Field>
        <Field label="Sidebar Default Open"><Toggle on={settings.visual.sidebarDefaultOpen} onClick={() => update("visual", "sidebarDefaultOpen", !settings.visual.sidebarDefaultOpen)} /></Field>
      </Section>

      {/* Performance */}
      <Section title="Performance">
        <Field label="Stream Batch Size"><NumberInput value={settings.performance.streamBatchSize} onChange={(v) => update("performance", "streamBatchSize", v)} min={1} max={10} /></Field>
        <Field label="Max Concurrent Requests"><NumberInput value={settings.performance.maxConcurrentRequests} onChange={(v) => update("performance", "maxConcurrentRequests", v)} min={1} max={10} /></Field>
        <Field label="Cache Responses"><Toggle on={settings.performance.cacheResponses} onClick={() => update("performance", "cacheResponses", !settings.performance.cacheResponses)} /></Field>
        <Field label="Cache TTL (seconds)"><NumberInput value={settings.performance.cacheTTLSeconds} onChange={(v) => update("performance", "cacheTTLSeconds", v)} min={0} max={3600} /></Field>
        <Field label="Token Counting"><Toggle on={settings.performance.enableTokenCounting} onClick={() => update("performance", "enableTokenCounting", !settings.performance.enableTokenCounting)} /></Field>
        <Field label="Lazy Load Panels"><Toggle on={settings.performance.lazyLoadPanels} onClick={() => update("performance", "lazyLoadPanels", !settings.performance.lazyLoadPanels)} /></Field>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="grad-border rounded-xl bg-[#07090a]/40 p-3"><div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">{title}</div><div className="space-y-1.5">{children}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><span className="font-mono text-[11px] text-zinc-400 flex-1">{label}</span>{children}</div>;
}
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("relative h-4 w-7 shrink-0 rounded-full transition-colors", on ? "bg-emerald-500/40" : "bg-zinc-700")}><span className={cn("absolute top-0.5 block h-3 w-3 rounded-full bg-white transition-all", on ? "left-3.5" : "left-0.5")} /></button>;
}
function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} className="w-32 rounded-md border border-zinc-800 bg-[#0a0f0d]/60 px-2 py-0.5 font-mono text-[10.5px] text-zinc-200 focus:border-emerald-500/40 focus:outline-none" />;
}
function NumberInput({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} min={min} max={max} step={step} className="w-20 rounded-md border border-zinc-800 bg-[#0a0f0d]/60 px-2 py-0.5 font-mono text-[10.5px] text-zinc-200 focus:border-emerald-500/40 focus:outline-none" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-zinc-800 bg-[#0a0f0d]/60 px-2 py-0.5 font-mono text-[10.5px] text-zinc-200 focus:outline-none">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
