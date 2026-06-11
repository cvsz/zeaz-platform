import { QueueHealthCards } from "../../components/dashboard";
import { ErrorState } from "../../components/states";
import { getOpsSummary } from "../../lib/api";

export default async function QueuePage() { try { const summary = await getOpsSummary(); return <main className="p-8 space-y-4"><h1 className="text-2xl">Queue</h1><QueueHealthCards summary={summary} /></main>; } catch (error) { return <main className="p-8"><ErrorState title="Queue unavailable" message={error instanceof Error ? error.message : "Unknown error"} /></main>; } }
