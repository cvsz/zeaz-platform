type OpsCardProps = Readonly<{ title: string; value: string; detail: string }>;

export function OpsCard({ title, value, detail }: OpsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
    </section>
  );
}
