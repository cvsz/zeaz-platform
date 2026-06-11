import { AssetPreviewList, JobTimeline, WorkflowStatusBadge } from "../../../components/dashboard";
import { EmptyState, ErrorState } from "../../../components/states";
import { getWorkflowDetail } from "../../../lib/api";

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const detail = await getWorkflowDetail(id);
    return <main className="p-8 space-y-4"><h1 className="text-2xl">Workflow {detail.workflow.id}</h1><WorkflowStatusBadge status={detail.workflow.state} /><section><h2>Jobs</h2>{detail.jobs.length === 0 ? <EmptyState title="No jobs" message="No jobs found for this workflow." /> : <JobTimeline detail={detail} />}</section><section><h2>Rendered Scene Assets</h2>{detail.assets.length === 0 ? <EmptyState title="No assets" message="No assets found for this workflow." /> : <AssetPreviewList detail={detail} />}</section><section><h2>Export Manifests</h2>{detail.exportManifests.length === 0 ? <EmptyState title="No exports" message="No export manifests have been created yet." /> : <ul className="space-y-2">{detail.exportManifests.map((manifest) => <li key={manifest.id} className="rounded border border-slate-700 p-3">{manifest.platform} • {manifest.objectKey}</li>)}</ul>}</section><section><h2>Publish-ready Videos</h2>{detail.publishReadyVideos.length === 0 ? <EmptyState title="No publish-ready videos" message="No videos are marked publish-ready yet." /> : <ul className="space-y-2">{detail.publishReadyVideos.map((asset) => <li key={asset.id} className="rounded border border-slate-700 p-3">{asset.kind} • {asset.id}</li>)}</ul>}</section></main>;
  } catch (error) {
    return <main className="p-8"><ErrorState title="Failed to load workflow" message={error instanceof Error ? error.message : "Unknown error"} /></main>;
  }
}
