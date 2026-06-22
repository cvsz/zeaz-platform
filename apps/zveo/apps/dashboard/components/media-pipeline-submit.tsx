"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_EXPORT_PROFILES,
  buildArtifactBackedPipelineCommand,
  deriveRenderArtifactsFromWorkflowDetail,
  submitMediaPipeline,
  type ExportProfile,
  type PipelineSubmitResponse,
  type WorkflowDetail,
} from "../lib/api";

type SubmitState =
  | { kind: "idle"; message: string }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

interface MediaPipelineSubmitProps {
  readonly detail: WorkflowDetail;
  readonly tenantId: string;
  readonly requestedBy: string;
  readonly projectId: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function profileLabel(profile: ExportProfile): string {
  return `${profile.platform} ${profile.width}x${profile.height} ${profile.container.toUpperCase()}`;
}

export function MediaPipelineSubmit({ detail, tenantId, requestedBy, projectId }: MediaPipelineSubmitProps) {
  const renderArtifacts = useMemo(() => deriveRenderArtifactsFromWorkflowDetail(detail), [detail]);
  const totalDurationSeconds = useMemo(
    () => renderArtifacts.reduce((total, artifact) => Math.max(total, artifact.startSeconds + artifact.durationSeconds), 0),
    [renderArtifacts]
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<readonly ExportProfile["platform"][]>(
    DEFAULT_EXPORT_PROFILES.map((profile) => profile.platform)
  );
  const [state, setState] = useState<SubmitState>({
    kind: "idle",
    message: "Artifact-backed submit is ready.",
  });
  const [result, setResult] = useState<PipelineSubmitResponse | null>(null);

  const selectedProfiles = useMemo(
    () => DEFAULT_EXPORT_PROFILES.filter((profile) => selectedPlatforms.includes(profile.platform)),
    [selectedPlatforms]
  );

  async function handleSubmit() {
    try {
      if (selectedProfiles.length === 0) {
        setState({ kind: "error", message: "Select at least one export profile." });
        return;
      }

      setState({ kind: "loading", message: "Submitting artifact-backed pipeline plan..." });
      const command = buildArtifactBackedPipelineCommand(detail, {
        tenantId,
        requestedBy,
        exportProfiles: selectedProfiles,
      });
      const response = await submitMediaPipeline(detail.workflow.id, command);
      setResult(response);
      setState({
        kind: "success",
        message: `Pipeline plan accepted with ${response.exportManifests.length} export manifests.`,
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Failed to submit the media pipeline.",
      });
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-slate-950/90 p-6 shadow-2xl shadow-cyan-950/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Artifact-backed submit</p>
          <h2 className="text-2xl font-semibold text-white">Plan the media pipeline from workflow assets</h2>
          <p className="text-sm leading-6 text-slate-300">
            This submitter uses the workflow&apos;s rendered assets, derived scene timings, and export presets to call
            the backend planner end-to-end.
          </p>
        </div>
        <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="uppercase tracking-[0.16em]">Workflow</div>
            <div className="mt-1 break-all text-slate-200">{detail.workflow.id}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="uppercase tracking-[0.16em]">Artifacts</div>
            <div className="mt-1 text-slate-200">{renderArtifacts.length} verified clips</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="uppercase tracking-[0.16em]">Project</div>
            <div className="mt-1 break-all text-slate-200">{projectId}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-200">Export profiles</h3>
              <div className="text-xs text-slate-500">Choose one or more</div>
            </div>
            <div className="mt-4 grid gap-3">
              {DEFAULT_EXPORT_PROFILES.map((profile) => {
                const active = selectedPlatforms.includes(profile.platform);
                return (
                  <label
                    key={profile.platform}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      active ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-slate-950/60 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(event) => {
                        setSelectedPlatforms((current) =>
                          event.target.checked
                            ? [...current, profile.platform]
                            : current.filter((platform) => platform !== profile.platform)
                        );
                      }}
                      className="mt-1 rounded border-slate-600 bg-slate-900"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{profileLabel(profile)}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {profile.videoBitrateKbps} kbps video · {profile.audioBitrateKbps} kbps audio · max duration{" "}
                        {profile.maxDurationSeconds ?? totalDurationSeconds}s
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-200">Render artifacts</h3>
              <div className="text-xs text-slate-500">{formatDuration(totalDurationSeconds)} total</div>
            </div>
            <div className="mt-4 space-y-3">
              {renderArtifacts.map((artifact) => (
                <div key={artifact.sceneId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{artifact.sceneId}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {artifact.asset.bucket}/{artifact.asset.objectKey}
                      </div>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      Verified
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                    <div>Start {artifact.startSeconds}s</div>
                    <div>Duration {artifact.durationSeconds}s</div>
                    <div>Checksum {artifact.asset.sha256.slice(0, 12)}...</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Request context</div>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Tenant</span>
                <span className="break-all">{tenantId}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Requested by</span>
                <span className="break-all">{requestedBy}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Selected exports</span>
                <span>{selectedProfiles.length}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            disabled={selectedProfiles.length === 0 || renderArtifacts.length === 0 || state.kind === "loading"}
          >
            {state.kind === "loading" ? "Submitting..." : "Submit media pipeline"}
          </button>

          <div
            className={`rounded-2xl border p-4 ${
              state.kind === "success"
                ? "border-emerald-400/20 bg-emerald-400/10"
                : state.kind === "error"
                  ? "border-rose-400/20 bg-rose-400/10"
                  : state.kind === "loading"
                    ? "border-cyan-400/20 bg-cyan-400/10"
                    : "border-white/10 bg-black/20"
            }`}
          >
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</div>
            <p className="mt-2 text-sm leading-6 text-slate-200">{state.message}</p>
          </div>

          {result && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold text-white">Planner response</div>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div>Command: {result.commandId}</div>
                <div>Workflow: {result.workflowId}</div>
                <div>Tenant: {result.tenantId}</div>
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/80 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">FFmpeg graph</div>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-300">
                  {result.ffmpegFilterGraph}
                </pre>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Export manifests</div>
                {result.exportManifests.map((manifest) => (
                  <div key={`${manifest.platform}-${manifest.objectKey}`} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                    <div className="font-medium text-white">{manifest.platform}</div>
                    <div className="mt-1 break-all">{manifest.objectKey}</div>
                  </div>
                ))}
              </div>
              {result.subtitleAsset && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                  <div className="font-medium text-white">Subtitle asset</div>
                  <div className="mt-1 break-all">{result.subtitleAsset.bucket}/{result.subtitleAsset.objectKey}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
