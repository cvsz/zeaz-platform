import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ExplorerPanel } from "@/components/dashboard/explorer-panel";
import { MetricsRibbon } from "@/components/dashboard/metrics-ribbon";

export default function ExplorerPage() {
  return (
    <DashboardShell>
      <main className="space-y-6">
        <MetricsRibbon />
        <ExplorerPanel />
      </main>
    </DashboardShell>
  );
}
