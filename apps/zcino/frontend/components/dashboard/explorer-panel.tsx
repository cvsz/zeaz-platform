import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { blocks, seedTasks, transactions } from "@/lib/dashboard-data";

export function ExplorerPanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Explorer</CardTitle>
          <CardDescription>Recent blocks, transactions, and task receipts.</CardDescription>
        </div>
        <Badge tone="cyan">indexed</Badge>
      </CardHeader>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3">
          <h3 className="font-black">Blocks</h3>
          {blocks.slice(0, 5).map((block) => (
            <div key={block.hash} className="rounded-2xl bg-muted/45 p-3 text-sm">
              <p className="font-bold">#{block.height}</p>
              <p className="truncate text-muted">{block.hash}</p>
              <p className="text-muted">{block.txCount} tx · {block.taskCount} tasks</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-black">Transactions</h3>
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.hash} className="rounded-2xl bg-muted/45 p-3 text-sm">
              <p className="truncate font-bold">{tx.hash}</p>
              <p className="text-muted">{tx.value}</p>
              <Badge tone={tx.status === "finalized" ? "green" : tx.status === "failed" ? "red" : "amber"}>{tx.status}</Badge>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-black">Tasks</h3>
          {seedTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="rounded-2xl bg-muted/45 p-3 text-sm">
              <p className="font-bold">{task.id}</p>
              <p className="text-muted">{task.agent} · {task.latencyMs}ms</p>
              <Badge tone={task.status === "complete" ? "green" : task.status === "failed" ? "red" : "amber"}>{task.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
