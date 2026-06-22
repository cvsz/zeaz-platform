import { ErrorState } from "../../components/states";
import { VideoStudio } from "../../components/video-studio";
import { getCampaigns, getOpsSummary, getProvidersHealth, getWorkflows } from "../../lib/api";
import { getDashboardRuntimeOptions } from "../../lib/service-auth";

export default async function StudioPage() {
  try {
    const [campaigns, workflows, queue, providers] = await Promise.all([
      getCampaigns(),
      getWorkflows(),
      getOpsSummary(),
      getProvidersHealth(),
    ]);
    const runtime = getDashboardRuntimeOptions();

    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
        <VideoStudio
          initialSnapshot={{ campaigns, workflows, queue, providers }}
          tenantId={runtime.tenantId}
          projectId={runtime.projectId}
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-8">
        <ErrorState
          title="Failed to load zVEO Studio"
          message={error instanceof Error ? error.message : "Unknown error"}
        />
      </main>
    );
  }
}

