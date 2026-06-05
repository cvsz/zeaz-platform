import { AuthPanel } from "@/components/auth/auth-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ExplorerPanel } from "@/components/dashboard/explorer-panel";
import { GovernancePanel } from "@/components/dashboard/governance-panel";
import { MetricsRibbon } from "@/components/dashboard/metrics-ribbon";
import { TaskStreamPanel } from "@/components/dashboard/task-stream-panel";
import { ForceNetworkGraph } from "@/components/network/force-network-graph";
import { networkEdges, networkNodes } from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <main className="space-y-6">
        <section className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl lg:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Operations dashboard</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight lg:text-6xl">
            Real-time observability and governance for the Zcino meta network.
          </h1>
        </section>
        <MetricsRibbon />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <ForceNetworkGraph edges={networkEdges} nodes={networkNodes} />
          <AuthPanel />
        </div>
        <div className="grid gap-6 2xl:grid-cols-2">
          <ExplorerPanel />
          <GovernancePanel />
        </div>
        <TaskStreamPanel />
      </main>
    </DashboardShell>
  );
}
