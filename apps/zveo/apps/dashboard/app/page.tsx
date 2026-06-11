import Link from "next/link";

export default function DashboardHomePage() {
  const pages = ["workflows", "queue", "assets", "providers", "settings"];
  return <main className="min-h-screen p-8"><h1 className="text-3xl font-bold">zVEO Dashboard</h1><div className="mt-6 grid gap-3 md:grid-cols-3">{pages.map((p) => <Link className="rounded border border-slate-700 p-4" href={`/${p}` as any} key={p}>/{p}</Link>)}</div></main>;
}
