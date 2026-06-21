"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Campaign, OpsSummary, ProviderHealth, Workflow } from "@/lib/api";

export interface StudioSnapshot {
  campaigns: Campaign[];
  workflows: Workflow[];
  queue: OpsSummary;
  providers: ProviderHealth[];
}

interface VideoStudioProps {
  readonly initialSnapshot: StudioSnapshot;
  readonly tenantId: string;
  readonly projectId: string;
}

interface CampaignFormState {
  niche: string;
  audience: string;
  topic: string;
  language: string;
  tone: string;
  durationSeconds: string;
}

interface ActionState {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
}

const REFRESH_INTERVAL_MS = 10_000;

const DEFAULT_FORM_STATE: CampaignFormState = {
  niche: "AI tools",
  audience: "founders",
  topic: "A fast Veo-powered product teaser",
  language: "en",
  tone: "cinematic",
  durationSeconds: "30",
};

const DEFAULT_PRESETS = [
  { platform: "youtube", container: "mp4", width: 1920, height: 1080, videoBitrateKbps: 12_000 },
  { platform: "tiktok", container: "mp4", width: 1080, height: 1920, videoBitrateKbps: 9_000 },
  { platform: "instagram_reels", container: "mp4", width: 1080, height: 1920, videoBitrateKbps: 8_000 },
] as const;

function toJsonError(message: string): Error {
  return new Error(message);
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers,
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw toJsonError(bodyText || `Request failed with HTTP ${response.status}`);
  }

  return bodyText ? (JSON.parse(bodyText) as T) : (undefined as T);
}

function formatQueueSummary(queue: OpsSummary["queue"]): string {
  return `waiting ${queue.waiting} · active ${queue.active} · delayed ${queue.delayed} · failed ${queue.failed}`;
}

function buildExportPreview(durationSeconds: number) {
  const minDuration = Math.max(5, durationSeconds);
  return DEFAULT_PRESETS.map((preset) => ({
    ...preset,
    maxDurationSeconds: minDuration,
  }));
}

export function VideoStudio({ initialSnapshot, tenantId, projectId }: VideoStudioProps) {
  const [snapshot, setSnapshot] = useState<StudioSnapshot>(initialSnapshot);
  const [form, setForm] = useState<CampaignFormState>(DEFAULT_FORM_STATE);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(initialSnapshot.campaigns[0]?.id ?? "");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(initialSnapshot.workflows[0]?.id ?? "");
  const [status, setStatus] = useState<ActionState>({ kind: "idle", message: "Ready to build a video flow." });
  const [autoRefresh, setAutoRefresh] = useState(true);

  const selectedCampaign = useMemo(
    () => snapshot.campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null,
    [selectedCampaignId, snapshot.campaigns]
  );
  const selectedWorkflow = useMemo(
    () => snapshot.workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? null,
    [selectedWorkflowId, snapshot.workflows]
  );

  const exportPreview = useMemo(() => buildExportPreview(Number.parseInt(form.durationSeconds, 10) || 30), [form.durationSeconds]);

  useEffect(() => {
    if (selectedCampaignId || snapshot.campaigns.length === 0) {
      return;
    }
    setSelectedCampaignId(snapshot.campaigns[0]!.id);
  }, [selectedCampaignId, snapshot.campaigns]);

  useEffect(() => {
    if (selectedWorkflowId || snapshot.workflows.length === 0) {
      return;
    }
    setSelectedWorkflowId(snapshot.workflows[0]!.id);
  }, [selectedWorkflowId, snapshot.workflows]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadSnapshot(true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
    // loadSnapshot is intentionally excluded: it is stable across renders in this component.
  }, [autoRefresh]);

  async function loadSnapshot(silent = false) {
    if (!silent) {
      setStatus({ kind: "loading", message: "Refreshing live studio snapshot..." });
    }

    try {
      const [campaigns, workflows, queue, providers] = await Promise.all([
        fetchJson<Campaign[]>("/api/zveo/v1/campaigns"),
        fetchJson<Workflow[]>("/api/zveo/v1/workflows"),
        fetchJson<OpsSummary>("/api/zveo/v1/ops/summary"),
        fetchJson<ProviderHealth[]>("/api/zveo/v1/providers/health").catch(() => snapshot.providers),
      ]);
      setSnapshot({ campaigns, workflows, queue, providers });
      if (!silent) {
        setStatus({ kind: "success", message: "Studio snapshot refreshed." });
      }
    } catch (error) {
      if (!silent) {
        setStatus({
          kind: "error",
          message: error instanceof Error ? error.message : "Unable to refresh studio snapshot.",
        });
      }
    }
  }

  async function submitCampaign() {
    setStatus({ kind: "loading", message: "Submitting campaign..." });
    try {
      const result = await fetchJson<{ campaign: Campaign }>("/api/zveo/v1/campaigns", {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          projectId,
          niche: form.niche,
          audience: form.audience,
          topic: form.topic,
          language: form.language,
          tone: form.tone,
          durationSeconds: Number.parseInt(form.durationSeconds, 10) || 30,
        }),
      });

      setSelectedCampaignId(result.campaign.id);
      setStatus({ kind: "success", message: `Campaign ${result.campaign.id} created.` });
      await loadSnapshot(true);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to create campaign." });
    }
  }

  async function generateScript() {
    if (!selectedCampaignId) {
      setStatus({ kind: "error", message: "Select a campaign first." });
      return;
    }

    setStatus({ kind: "loading", message: "Generating Veo script..." });
    try {
      const result = await fetchJson<{ campaign: Campaign }>(`/api/zveo/v1/campaigns/${selectedCampaignId}/generate-script`, {
        method: "POST",
      });

      setSelectedCampaignId(result.campaign.id);
      setStatus({ kind: "success", message: "Script compiled for the selected campaign." });
      await loadSnapshot(true);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to generate script." });
    }
  }

  async function createWorkflow() {
    if (!selectedCampaignId) {
      setStatus({ kind: "error", message: "Select a campaign first." });
      return;
    }

    setStatus({ kind: "loading", message: "Creating workflow..." });
    try {
      const result = await fetchJson<{ workflowId: string; sceneCount: number; campaign: Campaign }>(
        `/api/zveo/v1/campaigns/${selectedCampaignId}/create-workflow`,
        { method: "POST" }
      );

      setSelectedCampaignId(result.campaign.id);
      setSelectedWorkflowId(result.workflowId);
      setStatus({ kind: "success", message: `Workflow ${result.workflowId} created with ${result.sceneCount} scenes.` });
      await loadSnapshot(true);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Failed to create workflow." });
    }
  }

  async function runFullFlow() {
    setStatus({ kind: "loading", message: "Running the full campaign → script → workflow flow..." });
    try {
      const createResult = await fetchJson<{ campaign: Campaign }>("/api/zveo/v1/campaigns", {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          projectId,
          niche: form.niche,
          audience: form.audience,
          topic: form.topic,
          language: form.language,
          tone: form.tone,
          durationSeconds: Number.parseInt(form.durationSeconds, 10) || 30,
        }),
      });

      const scriptResult = await fetchJson<{ campaign: Campaign }>(`/api/zveo/v1/campaigns/${createResult.campaign.id}/generate-script`, {
        method: "POST",
      });
      const workflowResult = await fetchJson<{ workflowId: string; sceneCount: number; campaign: Campaign }>(
        `/api/zveo/v1/campaigns/${scriptResult.campaign.id}/create-workflow`,
        { method: "POST" }
      );

      setSelectedCampaignId(workflowResult.campaign.id);
      setSelectedWorkflowId(workflowResult.workflowId);
      setStatus({
        kind: "success",
        message: `Full flow completed. Workflow ${workflowResult.workflowId} is queued.`,
      });
      await loadSnapshot(true);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Full flow failed." });
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-6 shadow-2xl shadow-cyan-950/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
              zVEO Video Studio
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Build Veo campaigns, compile scripts, and launch workflows from one dashboard.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              This studio keeps the flow queue-first: generate a campaign, compile the script, create the workflow,
              and watch queue health update in real time without exposing service secrets in the browser.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px] lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Queue</div>
              <div className="mt-2 text-2xl font-semibold text-white">{formatQueueSummary(snapshot.queue.queue)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Workers</div>
              <div className="mt-2 text-2xl font-semibold text-white">{snapshot.queue.workers.onlineEstimate} online</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Campaigns</div>
              <div className="mt-2 text-2xl font-semibold text-white">{snapshot.campaigns.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Workflows</div>
              <div className="mt-2 text-2xl font-semibold text-white">{snapshot.workflows.length}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Campaign builder</h2>
              <p className="text-sm text-slate-400">
                Create the campaign record that feeds script generation and workflow creation.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(event) => setAutoRefresh(event.target.checked)}
                  className="rounded border-slate-600 bg-slate-900"
                />
                Auto refresh
              </label>
              <button
                type="button"
                onClick={() => void loadSnapshot()}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Refresh now
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Tenant ID</span>
              <input value={tenantId} readOnly className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Project ID</span>
              <input value={projectId} readOnly className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300" />
            </label>
            {(
              [
                ["niche", "Niche"],
                ["audience", "Audience"],
                ["topic", "Topic"],
                ["language", "Language"],
                ["tone", "Tone"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-2 text-sm">
                <span className="text-slate-300">{label}</span>
                <input
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40 focus:bg-cyan-400/5"
                />
              </label>
            ))}
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Duration seconds</span>
              <input
                type="number"
                min={5}
                max={600}
                value={form.durationSeconds}
                onChange={(event) => setForm((current) => ({ ...current, durationSeconds: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40 focus:bg-cyan-400/5"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitCampaign}
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Create campaign
            </button>
            <button
              type="button"
              onClick={generateScript}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Generate script
            </button>
            <button
              type="button"
              onClick={createWorkflow}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create workflow
            </button>
            <button
              type="button"
              onClick={runFullFlow}
              className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-5 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20"
            >
              Run full flow
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">Status</div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  status.kind === "success"
                    ? "bg-emerald-400/15 text-emerald-200"
                    : status.kind === "error"
                      ? "bg-rose-400/15 text-rose-200"
                      : status.kind === "loading"
                        ? "bg-cyan-400/15 text-cyan-100"
                        : "bg-white/10 text-slate-300"
                }`}
              >
                {status.kind}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{status.message}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">VDO delivery preview</h2>
              <p className="text-sm text-slate-400">
                Export presets for the final delivery stage. Attach verified render artifacts before submitting the real pipeline plan.
              </p>
            </div>
            <div className="text-xs text-slate-500">Preview only</div>
          </div>

          <div className="mt-6 space-y-3">
            {exportPreview.map((preset) => (
              <div key={preset.platform} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{preset.platform}</div>
                    <div className="text-sm text-slate-400">
                      {preset.width} x {preset.height} · {preset.container.toUpperCase()} · {preset.videoBitrateKbps} kbps
                    </div>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                    Max {preset.maxDurationSeconds}s
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Selected workflow</p>
            <p className="mt-2 break-all">{selectedWorkflow?.id ?? "No workflow selected yet."}</p>
            <p className="mt-4 font-medium text-white">Selected campaign</p>
            <p className="mt-2 break-words">
              {selectedCampaign
                ? `${selectedCampaign.title ?? selectedCampaign.topic} · ${selectedCampaign.status}`
                : "No campaign selected yet."}
            </p>
          </div>

          {selectedWorkflow && (
            <div className="mt-4">
              <Link
                href={`/workflows/${selectedWorkflow.id}`}
                className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Open workflow detail
              </Link>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-xl font-semibold text-white">Campaigns</h2>
          <div className="mt-4 space-y-3">
            {snapshot.campaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                No campaigns yet. Create a campaign above to start the Veo flow.
              </div>
            ) : (
              snapshot.campaigns.map((campaign) => (
                <button
                  type="button"
                  key={campaign.id}
                  onClick={() => {
                    setSelectedCampaignId(campaign.id);
                    setStatus({ kind: "idle", message: "Campaign selected." });
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedCampaignId === campaign.id
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{campaign.title ?? campaign.topic}</div>
                      <div className="text-sm text-slate-400">
                        {campaign.niche ?? "niche unknown"} · {campaign.audience ?? "audience unknown"} · {campaign.status}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{campaign.workflowId ? "workflow linked" : "draft"}</div>
                  </div>
                  {campaign.script ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{campaign.script}</p> : null}
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-xl font-semibold text-white">Workflows</h2>
          <div className="mt-4 space-y-3">
            {snapshot.workflows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                No workflows yet. Generate a script and create a workflow to see it here.
              </div>
            ) : (
              snapshot.workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedWorkflowId === workflow.id
                      ? "border-fuchsia-400/40 bg-fuchsia-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{workflow.id}</div>
                      <div className="text-sm text-slate-400">
                        {workflow.state} · {workflow.createdAt ?? "created recently"}
                      </div>
                    </div>
                    <Link href={`/workflows/${workflow.id}`} className="text-sm text-cyan-200 underline-offset-4 hover:underline">
                      Open
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkflowId(workflow.id);
                      setStatus({ kind: "idle", message: "Workflow selected." });
                    }}
                    className="mt-3 text-sm text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    Select this workflow
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
