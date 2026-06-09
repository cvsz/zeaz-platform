"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Cloud, Globe, Network, RefreshCcw, Route, Server, ShieldCheck, Terminal } from "lucide-react";

type ControlSummary = {
  title?: string;
  ui_hostname?: string;
  api_hostname?: string;
  mode?: string;
  routes?: Array<Record<string, unknown>>;
  health?: Record<string, unknown>;
  next_local_commands?: string[];
};

type ReportPayload = {
  port_report?: { exists?: boolean; path?: string; tail?: string };
  go_live_report?: { exists?: boolean; path?: string; tail?: string };
  audit_report?: { exists?: boolean; path?: string; tail?: string };
};

const CONTROL_API_HOST = "api-zcfdash.zeaz.dev";
const CONTROL_UI_HOST = "zcfdash.zeaz.dev";

function controlApiBase() {
  if (typeof window === "undefined") return "/api/runtime/cloudflare";
  if (window.location.hostname === CONTROL_UI_HOST) {
    return `https://${CONTROL_API_HOST}/api/runtime/cloudflare`;
  }
  return "/api/runtime/cloudflare";
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${controlApiBase()}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function Dashboard() {
  const [summary, setSummary] = useState<ControlSummary | null>(null);
  const [reports, setReports] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const routes = useMemo(() => summary?.routes ?? [], [summary]);
  const health = summary?.health ?? {};

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [summaryPayload, reportPayload] = await Promise.all([
        getJson<ControlSummary>("/summary"),
        getJson<ReportPayload>("/reports"),
      ]);
      setSummary(summaryPayload);
      setReports(reportPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 space-y-8 pb-20 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="w-8 h-8 text-primary" />
            ZeaZ Cloudflare Control Panel
          </h1>
          <p className="text-muted-foreground font-mono mt-1">
            UI: {CONTROL_UI_HOST} | API: {CONTROL_API_HOST} | Mode: read-only evidence/control
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-mono text-primary hover:bg-primary/20"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle>Control API unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-destructive">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start apps/api on the api-zcfdash origin and regenerate route assets before public cutover.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Control API" value={loading ? "loading" : String(health.status ?? "unknown")} icon={<Activity className="h-4 w-4" />} />
        <MetricCard title="Routes" value={String(routes.length)} icon={<Route className="h-4 w-4" />} />
        <MetricCard title="Mode" value={summary?.mode ?? "read-only"} icon={<ShieldCheck className="h-4 w-4" />} />
        <MetricCard title="Origin policy" value="127.0.0.1" icon={<Network className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              zcfdash Cloudflare Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">App</th>
                    <th className="py-2 pr-4">Hostname</th>
                    <th className="py-2 pr-4">Origin</th>
                    <th className="py-2 pr-4">Path</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={`${String(route.hostname)}-${index}`} className="border-t border-border/50">
                      <td className="py-3 pr-4 font-mono">{String(route.app_id ?? "-")}</td>
                      <td className="py-3 pr-4 font-mono">{String(route.hostname ?? "-")}</td>
                      <td className="py-3 pr-4 font-mono">{String(route.origin ?? "-")}</td>
                      <td className="py-3 pr-4 font-mono">{String(route.path ?? "-")}</td>
                      <td className="py-3 pr-4 font-mono">{String(route.status ?? "-")}</td>
                    </tr>
                  ))}
                  {!routes.length ? (
                    <tr>
                      <td className="py-6 text-muted-foreground" colSpan={5}>No zcfdash routes loaded yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Local commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-black/60 p-4 text-xs text-muted-foreground">
{(summary?.next_local_commands ?? [
  "python3 scripts/platform/generate-port-refactor-assets.py",
  "make -f Makefile -f Makefile.app-servers apps-server-status",
  "bash scripts/platform/final-go-live-complete.sh",
]).join("\n")}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ReportCard title="Port / tunnel assets" report={reports?.port_report} />
        <ReportCard title="Final go-live" report={reports?.go_live_report} />
        <ReportCard title="Full repo audit" report={reports?.audit_report} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold break-words">{value}</div>
      </CardContent>
    </Card>
  );
}

function ReportCard({ title, report }: { title: string; report?: { exists?: boolean; path?: string; tail?: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs font-mono text-muted-foreground">{report?.path ?? "not loaded"}</div>
        <div className="text-sm">Status: {report?.exists ? "present" : "missing"}</div>
        <pre className="max-h-72 overflow-auto rounded-lg bg-black/60 p-3 text-xs text-muted-foreground">
{report?.tail || "No report content available."}
        </pre>
      </CardContent>
    </Card>
  );
}
