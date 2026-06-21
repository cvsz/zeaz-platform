import Link from "next/link";
import { getDashboardRuntimeOptions } from "../../lib/service-auth";

export default function SettingsPage() {
  const runtime = getDashboardRuntimeOptions();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Settings</h1>
          <p className="mt-2 text-sm text-slate-400">
            Runtime settings for the dashboard and the service token used to reach the API gateway.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">API URL</div>
            <div className="mt-2 break-all text-sm text-white">{runtime.apiBaseUrl}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Tenant</div>
            <div className="mt-2 break-all text-sm text-white">{runtime.tenantId}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Project</div>
            <div className="mt-2 break-all text-sm text-white">{runtime.projectId}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Service Roles</div>
            <div className="mt-2 text-sm text-white">{runtime.roles.join(", ")}</div>
          </div>
        </div>
        <Link
          href="/studio"
          className="inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Open Video Studio
        </Link>
      </div>
    </main>
  );
}
