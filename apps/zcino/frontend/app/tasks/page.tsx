import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TaskStreamPanel } from "@/components/dashboard/task-stream-panel";

export default function TasksPage() {
  return (
    <DashboardShell>
      <main>
        <TaskStreamPanel />
      </main>
    </DashboardShell>
  );
}
