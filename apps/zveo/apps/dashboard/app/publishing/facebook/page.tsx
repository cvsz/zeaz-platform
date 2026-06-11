import { ErrorState } from '../../../components/states';
import { getFacebookPublishJob } from '../../../lib/api';

export default async function FacebookPublishingPage() {
  const sampleId = process.env.ZVEO_FACEBOOK_PUBLISH_JOB_ID;
  if (!sampleId) return <main className="p-8"><ErrorState title="No job selected" message="Set ZVEO_FACEBOOK_PUBLISH_JOB_ID to view a publish job." /></main>;
  try {
    const job = await getFacebookPublishJob(sampleId);
    return <main className="p-8 space-y-4"><h1 className="text-2xl">Facebook Publishing</h1><pre className="rounded bg-black/80 text-white p-4 overflow-auto">{JSON.stringify(job, null, 2)}</pre></main>;
  } catch (error) {
    return <main className="p-8"><ErrorState title="Publish status unavailable" message={error instanceof Error ? error.message : 'Unknown error'} /></main>;
  }
}
