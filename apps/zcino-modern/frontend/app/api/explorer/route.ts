import { blocks, seedTasks, transactions } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ blocks, tasks: seedTasks, transactions });
}
