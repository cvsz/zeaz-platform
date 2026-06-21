import Link from "next/link";
import { EmptyState, ErrorState } from "../../components/states";
import { getCampaigns } from "../../lib/api";

export default async function CampaignsPage() {
  try {
    const campaigns = await getCampaigns();

    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Campaigns</h1>
            <p className="mt-2 text-sm text-slate-400">Drafts that feed the Veo script and workflow creation flow.</p>
          </div>
          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              message="Open the studio to create the first campaign and generate a workflow."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href="/studio"
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                >
                  <div className="text-lg font-semibold text-white">{campaign.title ?? campaign.topic}</div>
                  <div className="mt-2 text-sm text-slate-400">{campaign.status}</div>
                  {campaign.script ? <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-300">{campaign.script}</p> : null}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <ErrorState
          title="Failed to load campaigns"
          message={error instanceof Error ? error.message : "Unknown error"}
        />
      </main>
    );
  }
}
