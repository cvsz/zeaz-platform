export function ErrorState({ title, message }: { title: string; message: string }) {
  return <div className="rounded-lg border border-red-500/40 bg-red-950/20 p-4 text-red-100"><h2 className="font-semibold">{title}</h2><p className="text-sm">{message}</p></div>;
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <div className="animate-pulse rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-slate-300">{label}</div>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-slate-300"><h2 className="font-medium text-white">{title}</h2><p className="text-sm">{message}</p></div>;
}
