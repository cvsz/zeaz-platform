import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GovernancePanel } from "@/components/dashboard/governance-panel";

export default function GovernancePage() {
  return (
    <DashboardShell>
      <main>
        <GovernancePanel />
      </main>
    </DashboardShell>
  );
}
