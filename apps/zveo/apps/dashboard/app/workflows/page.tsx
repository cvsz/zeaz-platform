import Link from "next/link";
import { EmptyState, ErrorState } from "../../components/states";
import { WorkflowTable } from "../../components/dashboard";
import { getWorkflows } from "../../lib/api";

export default async function WorkflowsPage() {
  try {
    const workflows = await getWorkflows();
    if (workflows.length === 0) return <main className="p-8"><EmptyState title="No workflows" message="No workflow records were returned by the API." /></main>;
    return <main className="p-8 space-y-4"><h1 className="text-2xl font-bold">Workflows</h1><WorkflowTable workflows={workflows} /><div>{workflows.map((w) => <Link key={w.id} href={`/workflows/${w.id}`} className="mr-4 underline">{w.id}</Link>)}</div></main>;
  } catch (error) {
    return <main className="p-8"><ErrorState title="Failed to load workflows" message={error instanceof Error ? error.message : "Unknown error"} /></main>;
  }
}
