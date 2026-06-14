"use client";
import { ApiTerminal } from "@/components/api-terminal";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadinessScorecard, DeploymentStatusWidget } from "@/components/dashboard-widgets";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  Copy,
  Database,
  FileText,
  Gauge,
  Globe,
  Layers3,
  Lock,
  Network,
  RadioTower,
  RefreshCcw,
  Route,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  TimerReset,
  XCircle,
  Zap,
} from "lucide-react";

type RouteRecord = {
  app_id?: string;
  role?: string;
  path?: string;
  hostname?: string;
  port?: number;
  origin?: string;
  status?: string;
  alias_for?: string;
  api_gateway_prefix?: string;
  description?: string;
};

type ControlSummary = {
  title?: string;
  ui_hostname?: string;
  api_hostname?: string;
  mode?: string;
  routes?: RouteRecord[];
  health?: Record<string, unknown>;
  next_local_commands?: string[];
};

type ReportRecord = { exists?: boolean; path?: string; tail?: string };

type ReportPayload = {
  port_report?: ReportRecord;
  go_live_report?: ReportRecord;
  audit_report?: ReportRecord;
};

type ConsoleResult = {
  endpoint: string;
  status: "idle" | "loading" | "ok" | "error";
  body: string;
};

const CONTROL_API_HOST = "api.zeaz.dev";
const CONTROL_UI_HOST = "zeaz.dev";
const API_PREFIX = "/api/runtime/cloudflare";
const OBSERVABILITY_PREFIX = "/api/runtime/observability";

const REPORT_LABELS: Record<keyof ReportPayload, string> = {
  port_report: "Port / tunnel assets",
  go_live_report: "Final go-live",
  audit_report: "Full repo audit",
};

const API_ENDPOINTS = [
  { label: "Health", path: "/health" },
  { label: "Summary", path: "/summary" },
  { label: "Routes", path: "/routes" },
  { label: "Terraform", path: "/terraform" },
  { label: "Ingress", path: "/ingress" },
  { label: "Reports", path: "/reports" },
];

const LOCAL_COMMANDS = [
  "cd /home/zeazdev/zeaz-platform",
  "git pull --ff-only origin main",
  "chmod +x scripts/platform/apps-server-control.sh",
  "python3 scripts/platform/generate-port-refactor-assets.py",
  "make -f Makefile -f Makefile.app-servers apps-server-start",
  "make -f Makefile -f Makefile.app-servers apps-server-status",
  "bash scripts/platform/final-go-live-complete.sh",
];

function controlApiBase() {
  if (typeof window === "undefined") return API_PREFIX;
  if (window.location.hostname === CONTROL_UI_HOST) {
    return `https://${CONTROL_API_HOST}${API_PREFIX}`;
  }
  return API_PREFIX;
}

function observabilityApiBase() {
  if (typeof window === "undefined") return OBSERVABILITY_PREFIX;
  if (window.location.hostname === CONTROL_UI_HOST) {
    return `https://${CONTROL_API_HOST}${OBSERVABILITY_PREFIX}`;
  }
  return OBSERVABILITY_PREFIX;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${controlApiBase()}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function getObservabilityJson<T>(path: string): Promise<T> {
  const res = await fetch(`${observabilityApiBase()}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function textIncludes(text: string | undefined, query: string) {
  if (!query.trim()) return true;
  return String(text ?? "").toLowerCase().includes(query.trim().toLowerCase());
}

function statusTone(status: string | undefined) {
  const value = String(status ?? "unknown").toLowerCase();
  if (["ok", "active", "present", "passed", "running", "ready"].some((s) => value.includes(s))) return "success";
  if (["warn", "blocked", "missing", "fail", "error", "stopped"].some((s) => value.includes(s))) return "danger";
  return "neutral";
}

function reportDecision(report?: ReportRecord) {
  const tail = report?.tail ?? "";
  if (!report?.exists) return "missing";
  if (/GO-LIVE GATES PASSED|AUDIT COMPLETED/i.test(tail)) return "passed";
  if (/GO-LIVE BLOCKED|AUDIT BLOCKED|FAIL|critical/i.test(tail)) return "blocked";
  if (/WARN|warning/i.test(tail)) return "warning";
  return "present";
}

function routeSearchText(route: RouteRecord) {
  return [route.app_id, route.hostname, route.origin, route.path, route.role, route.status, route.alias_for].filter(Boolean).join(" ");
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function Dashboard() {
  const [summary, setSummary] = useState<ControlSummary | null>(null);
  const [reports, setReports] = useState<ReportPayload | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [securityScan, setSecurityScan] = useState<any>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [routeQuery, setRouteQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<keyof ReportPayload>("go_live_report");
  const [consoleResult, setConsoleResult] = useState<ConsoleResult>({ endpoint: "/summary", status: "idle", body: "" });

  const routes = useMemo(() => summary?.routes ?? [], [summary]);
  const filteredRoutes = useMemo(
    () => routes.filter((route) => textIncludes(routeSearchText(route), routeQuery)),
    [routes, routeQuery]
  );
  const health = summary?.health ?? {};
  const healthStatus = String(health.status ?? (error ? "error" : loading ? "loading" : "unknown"));
  const reportStates = useMemo(
    () => ({
      port_report: reportDecision(reports?.port_report),
      go_live_report: reportDecision(reports?.go_live_report),
      audit_report: reportDecision(reports?.audit_report),
    }),
    [reports]
  );
  const releaseBlocked = Object.values(reportStates).some((state) => ["blocked", "missing"].includes(state));
  const readinessScore = useMemo(() => {
    const routeScore = routes.length >= 2 ? 30 : routes.length ? 18 : 0;
    const apiScore = healthStatus === "ok" ? 25 : error ? 0 : 10;
    const reportScore = Object.values(reportStates).reduce((score, state) => {
      if (state === "passed" || state === "present") return score + 15;
      if (state === "warning") return score + 8;
      return score;
    }, 0);
    return Math.min(100, routeScore + apiScore + reportScore);
  }, [routes.length, healthStatus, reportStates, error]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [summaryPayload, reportPayload, metricsPayload, securityScanPayload, deploymentPayload] = await Promise.all([
        getJson<ControlSummary>("/summary"),
        getJson<ReportPayload>("/reports"),
        getObservabilityJson<any>("/metrics"),
        getObservabilityJson<any>("/security_scan"),
        getJson<any>("/deployment_status"),
      ]);
      setSummary(summaryPayload);
      setReports(reportPayload);
      setMetrics(metricsPayload);
      setSecurityScan(securityScanPayload);
      setDeploymentStatus(deploymentPayload);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function runConsole(endpoint: string) {
    setConsoleResult({ endpoint, status: "loading", body: "Loading..." });
    try {
      const payload = await getJson(endpoint);
      setConsoleResult({ endpoint, status: "ok", body: safeJson(payload) });
    } catch (err) {
      setConsoleResult({ endpoint, status: "error", body: err instanceof Error ? err.message : String(err) });
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard can be unavailable in non-secure local contexts. The command remains visible for manual copy.
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.8),rgba(2,6,23,1))]" />
      <div className="relative mx-auto max-w-[1800px] space-y-8 p-4 pb-20 md:p-8">
        <Hero
          healthStatus={healthStatus}
          readinessScore={readinessScore}
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={load}
        />

        {error ? <ErrorBanner message={error} /> : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-cyan-300" /> Platform Health</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-slate-400">CPU Usage</p>
                <p className="text-2xl font-bold">{metrics?.cpu_usage ?? "N/A"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-slate-400">Memory Usage</p>
                <p className="text-2xl font-bold">{metrics?.memory_usage ?? "N/A"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-300" /> Security Scan Summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-slate-400">Last Scan</p>
                <p className="font-mono text-sm">{securityScan?.last_scan ? new Date(securityScan.last_scan).toLocaleString() : "N/A"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-slate-400">Vulnerabilities</p>
                <p className="text-2xl font-bold text-red-300">{securityScan?.vulnerabilities ?? "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Platform API" value={healthStatus} subtitle={CONTROL_API_HOST} icon={<Activity className="h-5 w-5" />} tone={statusTone(healthStatus)} />
          <MetricCard title="Routes online" value={`${routes.length}`} subtitle="platform port plan" icon={<Route className="h-5 w-5" />} tone={routes.length >= 5 ? "success" : "danger"} />
          <MetricCard title="Deployment posture" value={releaseBlocked ? "blocked" : "ready"} subtitle="based on local reports" icon={<ShieldCheck className="h-5 w-5" />} tone={releaseBlocked ? "danger" : "success"} />
          <MetricCard title="Origin policy" value="localhost only" subtitle="127.0.0.1 tunnel origins" icon={<Lock className="h-5 w-5" />} tone="success" />
        </section>

        <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.3fr_0.7fr]">
          <CommandDeck summary={summary} readinessScore={readinessScore} reportStates={reportStates} />
          <OperationsPanel commands={summary?.next_local_commands?.length ? summary.next_local_commands : LOCAL_COMMANDS} onCopy={copyText} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <RoutesPanel routes={filteredRoutes} total={routes.length} query={routeQuery} onQuery={setRouteQuery} />
          <TopologyPanel routes={routes} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ReadinessScorecard score={readinessScore} />
          <DeploymentStatusWidget statusData={deploymentStatus} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ReportsPanel
            reports={reports}
            reportStates={reportStates}
            selected={selectedReport}
            onSelect={setSelectedReport}
          />
          <ApiConsole consoleResult={consoleResult} onRun={runConsole} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <FeatureMatrix />
          <ReleaseChecklist releaseBlocked={releaseBlocked} />
          <SourceMap />
          <ApiTerminal />
        </section>
      </div>
    </main>
  );
}

function Hero({
  healthStatus,
  readinessScore,
  loading,
  lastUpdated,
  onRefresh,
}: {
  healthStatus: string;
  readinessScore: number;
  loading: boolean;
  lastUpdated: string;
  onRefresh: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-8">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.22),transparent_55%)] lg:block" />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
            <Sparkles className="h-4 w-4" />
            Final Release Control Plane
          </div>
          <div className="space-y-3">
            <h1 className="max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
              ZeaZ Platform Master Control Panel
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Professional platform-wide operations cockpit for ZeaZ. It unifies all application routes,
              tunnel origins, Terraform state evidence, and deployment reports across the entire monorepo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-mono text-slate-300">
            <Badge icon={<Globe className="h-4 w-4" />} text="zeaz.dev" tone="blue" />
            <Badge icon={<RadioTower className="h-4 w-4" />} text="api.zeaz.dev" tone="emerald" />
            <Badge icon={<Lock className="h-4 w-4" />} text="safe read-only mode" tone="neutral" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Release readiness</p>
              <p className="text-5xl font-black">{readinessScore}%</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" style={{ width: `${readinessScore}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <StatusPill label="API" value={healthStatus} />
            <StatusPill label="Updated" value={lastUpdated || "not yet"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <Card className="border-red-500/40 bg-red-500/10 backdrop-blur">
      <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 text-red-300" />
          <div>
            <p className="font-semibold text-red-100">Control API unavailable</p>
            <p className="font-mono text-sm text-red-200/80">{message}</p>
            <p className="mt-1 text-sm text-slate-300">
              Start apps/api and ensure the API gateway is correctly configured in the port plan.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommandDeck({
  summary,
  readinessScore,
  reportStates,
}: {
  summary: ControlSummary | null;
  readinessScore: number;
  reportStates: Record<keyof ReportPayload, string>;
}) {
  const cards = [
    { label: "UI Host", value: summary?.ui_hostname ?? CONTROL_UI_HOST, icon: <Globe className="h-5 w-5" /> },
    { label: "API Host", value: summary?.api_hostname ?? CONTROL_API_HOST, icon: <Server className="h-5 w-5" /> },
    { label: "Mode", value: summary?.mode ?? "read-only control", icon: <ShieldCheck className="h-5 w-5" /> },
    { label: "Score", value: `${readinessScore}%`, icon: <Gauge className="h-5 w-5" /> },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Layers3 className="h-6 w-6 text-cyan-300" />
          Master Command Deck
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase tracking-[0.2em]">{card.label}</span>
                {card.icon}
              </div>
              <div className="break-words font-mono text-sm text-white">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(Object.keys(reportStates) as Array<keyof ReportPayload>).map((key) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{REPORT_LABELS[key]}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">{key}</p>
                </div>
                <ToneIcon tone={statusTone(reportStates[key])} />
              </div>
              <div className="mt-4">
                <ToneBadge value={reportStates[key]} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OperationsPanel({ commands, onCopy }: { commands: string[]; onCopy: (value: string) => void }) {
  const commandText = commands.join("\n");
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-xl">
          <span className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-emerald-300" />
            Operator Runbook
          </span>
          <button
            type="button"
            onClick={() => onCopy(commandText)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[360px] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-xs leading-6 text-emerald-100">
{commandText}
        </pre>
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          All controls are evidence/read-only by default. Terraform apply, token rotation, DNS mutation, and destructive cleanup remain guarded outside this dashboard.
        </div>
      </CardContent>
    </Card>
  );
}

function RoutesPanel({
  routes,
  total,
  query,
  onQuery,
}: {
  routes: RouteRecord[];
  total: number;
  query: string;
  onQuery: (value: string) => void;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span className="flex items-center gap-2 text-xl">
            <Route className="h-6 w-6 text-blue-300" />
            Cloudflare Route Matrix
          </span>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Filter app, host, origin..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-2 pl-10 pr-3 text-sm outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/40"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-400">
          <Badge icon={<Network className="h-4 w-4" />} text={`${routes.length}/${total} visible`} tone="neutral" />
          <Badge icon={<Lock className="h-4 w-4" />} text="127.0.0.1 origins" tone="emerald" />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-4 py-3">App</th>
                <th className="px-4 py-3">Hostname</th>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={`${String(route.hostname)}-${index}`} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-4 font-mono text-cyan-100">{route.app_id ?? "-"}</td>
                  <td className="px-4 py-4 font-mono">{route.hostname ?? "-"}</td>
                  <td className="px-4 py-4 font-mono text-slate-300">{route.origin ?? "-"}</td>
                  <td className="px-4 py-4 font-mono text-slate-300">{route.path ?? "-"}</td>
                  <td className="px-4 py-4"><ToneBadge value={route.role ?? "route"} /></td>
                  <td className="px-4 py-4"><ToneBadge value={route.status ?? "unknown"} /></td>
                </tr>
              ))}
              {!routes.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>No routes match the current filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TopologyPanel({ routes }: { routes: RouteRecord[] }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <RadioTower className="h-6 w-6 text-purple-300" />
          Live Topology
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[430px] overflow-hidden rounded-3xl border border-white/10 bg-black/50 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.20),transparent_45%)]" />
          <div className="relative flex h-full min-h-[380px] flex-col justify-between">
            <Node title="Cloudflare Edge" subtitle="public hostnames" icon={<Cloud className="h-5 w-5" />} />
            <div className="mx-auto h-12 w-px bg-gradient-to-b from-cyan-400/70 to-transparent" />
            <Node title="Tunnel Ingress" subtitle="route overlay + generated ingress" icon={<Network className="h-5 w-5" />} />
            <div className="mx-auto h-12 w-px bg-gradient-to-b from-emerald-400/70 to-transparent" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {routes.slice(0, 4).map((route) => (
                <div key={String(route.hostname)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-mono text-sm text-cyan-100">{route.hostname}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">{route.origin}</p>
                </div>
              ))}
              {!routes.length ? <p className="text-sm text-slate-400">No topology routes loaded.</p> : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsPanel({
  reports,
  reportStates,
  selected,
  onSelect,
}: {
  reports: ReportPayload | null;
  reportStates: Record<keyof ReportPayload, string>;
  selected: keyof ReportPayload;
  onSelect: (value: keyof ReportPayload) => void;
}) {
  const current = reports?.[selected];
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-amber-300" />
          Report Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(Object.keys(REPORT_LABELS) as Array<keyof ReportPayload>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`rounded-2xl border p-4 text-left transition ${selected === key ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-black/30 hover:bg-white/[0.06]"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{REPORT_LABELS[key]}</span>
                <ToneIcon tone={statusTone(reportStates[key])} />
              </div>
              <div className="mt-2"><ToneBadge value={reportStates[key]} /></div>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-mono text-slate-300">{current?.path ?? "not loaded"}</span>
            <ToneBadge value={current?.exists ? "present" : "missing"} />
          </div>
          <pre className="max-h-[440px] overflow-auto whitespace-pre-wrap rounded-xl bg-black/50 p-4 text-xs leading-5 text-slate-300">
{current?.tail || "No report content available."}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiConsole({ consoleResult, onRun }: { consoleResult: ConsoleResult; onRun: (endpoint: string) => void }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Code2 className="h-6 w-6 text-emerald-300" />
          Read-only API Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {API_ENDPOINTS.map((endpoint) => (
            <button
              key={endpoint.path}
              type="button"
              onClick={() => onRun(endpoint.path)}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:border-emerald-300/50 hover:bg-emerald-300/10"
            >
              <p className="font-semibold">{endpoint.label}</p>
              <p className="mt-1 font-mono text-xs text-slate-400">{endpoint.path}</p>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="font-mono text-sm text-slate-300">GET {API_PREFIX}{consoleResult.endpoint}</div>
            <ToneBadge value={consoleResult.status} />
          </div>
          <pre className="max-h-[390px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-emerald-100">
{consoleResult.body || "Select an endpoint to inspect live control data."}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureMatrix() {
  const features = [
    "Route overlay detection",
    "Terraform tfvars evidence",
    "Tunnel ingress evidence",
    "Go-live gate visibility",
    "Full repo audit tail",
    "API health monitor",
    "Server command runbook",
    "Read-only safety lock",
  ];
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-300" /> Feature Matrix</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            {feature}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReleaseChecklist({ releaseBlocked }: { releaseBlocked: boolean }) {
  const items = [
    { label: "Generate route assets", done: true },
    { label: "Start Platform UI + API origins", done: true },
    { label: "Verify Cloudflare tunnel routes", done: false },
    { label: "Run final go-live verifier", done: !releaseBlocked },
    { label: "Review warnings and blockers", done: !releaseBlocked },
  ];
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader><CardTitle className="flex items-center gap-2"><TimerReset className="h-5 w-5 text-cyan-300" /> Final Release Checklist</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
            <span>{item.label}</span>
            {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <XCircle className="h-4 w-4 text-amber-300" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SourceMap() {
  const sources = [
    ["UI", "apps/web/src/app/dashboard/page.tsx"],
    ["API", "apps/api/routers/cloudflare_control.py"],
    ["Routes", "configs/platform/apps-port-plan.json"],
    ["Generator", "scripts/platform/generate-port-refactor-assets.py"],
    ["Runtime", "scripts/platform/apps-server-control.sh"],
  ];
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-purple-300" /> Source Map</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {sources.map(([label, path]) => (
          <div key={path} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-1 break-words font-mono text-xs text-slate-200">{path}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MetricCard({ title, value, subtitle, icon, tone }: { title: string; value: string; subtitle: string; icon: React.ReactNode; tone: "success" | "danger" | "neutral" }) {
  const toneClass = tone === "success" ? "text-emerald-200 bg-emerald-400/10 border-emerald-400/20" : tone === "danger" ? "text-red-200 bg-red-400/10 border-red-400/20" : "text-slate-200 bg-white/[0.04] border-white/10";
  return (
    <Card className={`backdrop-blur ${toneClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <span>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="break-words text-2xl font-black capitalize">{value}</div>
        <p className="mt-1 break-words font-mono text-xs text-slate-400">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function Badge({ icon, text, tone }: { icon: React.ReactNode; text: string; tone: "blue" | "emerald" | "neutral" }) {
  const cls = tone === "blue" ? "border-blue-400/30 bg-blue-400/10 text-blue-100" : tone === "emerald" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/10 text-slate-200";
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${cls}`}>{icon}{text}</span>;
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-mono text-sm text-slate-200">{value}</p>
    </div>
  );
}

function ToneBadge({ value }: { value: string }) {
  const tone = statusTone(value);
  const cls = tone === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : tone === "danger" ? "border-red-400/30 bg-red-400/10 text-red-100" : "border-white/10 bg-white/10 text-slate-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${cls}`}>{value}</span>;
}

function ToneIcon({ tone }: { tone: "success" | "danger" | "neutral" }) {
  if (tone === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-300" />;
  if (tone === "danger") return <AlertTriangle className="h-5 w-5 text-amber-300" />;
  return <ChevronRight className="h-5 w-5 text-slate-400" />;
}

function Node({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center backdrop-blur">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}
