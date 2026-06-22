import { MediaPipelineSubmit } from "../../../components/media-pipeline-submit";
import { AssetPreviewList, JobTimeline, WorkflowStatusBadge } from "../../../components/dashboard";
import { EmptyState, ErrorState } from "../../../components/states";
import { getDashboardRuntimeOptions } from "../../../lib/service-auth";
import { getWorkflowDetail } from "../../../lib/api";

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [detail, runtime] = await Promise.all([getWorkflowDetail(id), getDashboardRuntimeOptions()]);

    return (
      <main className="min-h-screen space-y-8 bg-slate-950 p-6 text-slate-100 md:p-8">
        <header className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Workflow detail</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Workflow {detail.workflow.id}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Review the generated assets, validate the render order, and submit an artifact-backed media pipeline plan
                from the same page.
              </p>
            </div>
            <WorkflowStatusBadge status={detail.workflow.state} />
          </div>
        </header>

        <MediaPipelineSubmit
          detail={detail}
          tenantId={runtime.tenantId}
          projectId={runtime.projectId}
          requestedBy={runtime.subject}
        />

        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-xl font-semibold text-white">Jobs</h2>
          <div className="mt-4">
            {detail.jobs.length === 0 ? (
              <EmptyState title="No jobs" message="No jobs found for this workflow." />
            ) : (
              <JobTimeline detail={detail} />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-xl font-semibold text-white">Rendered scene assets</h2>
          <div className="mt-4">
            {detail.assets.length === 0 ? (
              <EmptyState title="No assets" message="No assets found for this workflow." />
            ) : (
              <AssetPreviewList detail={detail} />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-xl font-semibold text-white">Export manifests</h2>
          <div className="mt-4">
            {detail.exportManifests.length === 0 ? (
              <EmptyState title="No exports" message="No export manifests have been created yet." />
            ) : (
              <ul className="space-y-2">
                {detail.exportManifests.map((manifest) => (
                  <li key={manifest.id} className="rounded border border-slate-700 p-3">
                    {manifest.platform} · {manifest.objectKey}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <h2 className="text-xl font-semibold text-white">Publish-ready videos</h2>
          <div className="mt-4">
            {detail.publishReadyVideos.length === 0 ? (
              <EmptyState title="No publish-ready videos" message="No videos are marked publish-ready yet." />
            ) : (
              <ul className="space-y-2">
                {detail.publishReadyVideos.map((asset) => (
                  <li key={asset.id} className="rounded border border-slate-700 p-3">
                    {asset.kind} · {asset.objectKey}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
        <ErrorState title="Failed to load workflow" message={error instanceof Error ? error.message : "Unknown error"} />
      </main>
    );
  }
}
