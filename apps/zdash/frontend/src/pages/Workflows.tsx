import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/common/Button";
import { useT } from "../hooks/useT";
import { listWorkflows, runWorkflow, type Workflow } from "../api/endpoints";
import { Play, Activity, Clock } from "lucide-react";

export default function Workflows() {
  const { t } = useT();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error("Failed to load workflows", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (name: string) => {
    try {
      setRunningWorkflow(name);
      setMessage(null);
      const result = await runWorkflow(name);
      setMessage(result.message || `Workflow ${name} run triggered.`);
    } catch (error) {
      console.error(`Failed to run workflow ${name}`, error);
      setMessage(`Failed to run workflow ${name}.`);
    } finally {
      setRunningWorkflow(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automation"
        title="Workflows"
        subtitle="Manage and execute automated AI workflows."
      />

      <GlassCard className="p-4 md:p-5" glow="cyan">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">Workflow runway</p>
            <p className="mt-1 text-sm text-text-secondary">
              Runbook-driven automation with dry-run safe defaults and an operator-first execution surface.
            </p>
          </div>
          <StatusBadge status={`${workflows.length} WORKFLOWS`} variant="info" />
        </div>
      </GlassCard>

      {message ? (
        <GlassCard className="border border-accent-cyan/20 p-4">
          <p className="text-sm text-accent-cyan">{message}</p>
        </GlassCard>
      ) : null}

      {loading ? (
        <div className="text-text-dim">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="text-text-dim">No workflows found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <GlassCard key={wf.name} hover className="flex flex-col p-5">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-text-primary">
                  <Activity className="h-5 w-5 text-accent-cyan" />
                  {wf.name}
                </h3>
                <StatusBadge
                  status={wf.status || "unknown"}
                  variant={wf.status === "active" ? "success" : "muted"}
                />
              </div>

              <p className="mb-6 flex-grow text-sm text-text-secondary">
                {wf.description || "No description provided."}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-1 text-xs text-text-dim">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{wf.last_run_at ? new Date(wf.last_run_at).toLocaleString() : "Never run"}</span>
                </div>
                <Button
                  onClick={() => handleRun(wf.name)}
                  disabled={runningWorkflow === wf.name}
                  variant="primary"
                  className="px-3 py-1.5"
                >
                  <Play className="h-4 w-4" />
                  {runningWorkflow === wf.name ? "Running..." : "Run"}
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
