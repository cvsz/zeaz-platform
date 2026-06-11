import type { OpsSummary, ProviderHealth, WorkflowDetail } from "../lib/api";

export function WorkflowStatusBadge({ status }: { status: string }) { return <span className="rounded-full border border-slate-600 px-2 py-1 text-xs uppercase">{status}</span>; }
export function WorkflowTable({ workflows }: { workflows: Array<{ id: string; state: string; createdAt?: string }> }) {
  return <table className="w-full text-left text-sm"><thead><tr><th>ID</th><th>Status</th><th>Created</th></tr></thead><tbody>{workflows.map((w) => <tr key={w.id} className="border-t border-slate-800"><td>{w.id}</td><td><WorkflowStatusBadge status={w.state} /></td><td>{w.createdAt ?? "-"}</td></tr>)}</tbody></table>;
}
export function QueueHealthCards({ summary }: { summary: OpsSummary }) { return <div className="grid gap-3 md:grid-cols-3">{Object.entries(summary.queue).map(([k, v]) => <div key={k} className="rounded border border-slate-700 p-3"><div>{k}</div><div className="text-xl">{v}</div></div>)}</div>; }
export function ProviderHealthCards({ providers }: { providers: ProviderHealth[] }) { return <div className="grid gap-3 md:grid-cols-2">{providers.map((p) => <div key={p.provider} className="rounded border border-slate-700 p-3"><div>{p.provider}</div><div>{p.status}</div><div>{p.latencyMs ?? "-"}ms</div></div>)}</div>; }
export function JobTimeline({ detail }: { detail: WorkflowDetail }) { return <ul className="space-y-2">{detail.jobs.map((j) => <li key={j.id} className="rounded border border-slate-700 p-3">{j.id} • {j.state}</li>)}</ul>; }
export function AssetPreviewList({ detail }: { detail: WorkflowDetail }) { return <ul className="space-y-2">{detail.assets.map((a) => <li key={a.id} className="rounded border border-slate-700 p-3">{a.kind} • {a.id}</li>)}</ul>; }
