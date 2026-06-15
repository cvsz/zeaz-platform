import React, { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
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
    <div className="flex flex-col space-y-6">
      <PageHeader 
        title="Workflows" 
        subtitle="Manage and execute automated AI workflows." 
      />

      {message && (
        <div className="p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-text-dim">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="text-text-dim">No workflows found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((wf) => (
            <div 
              key={wf.name} 
              className="flex flex-col p-5 rounded-xl border border-border bg-panel"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-cyan" />
                  {wf.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${wf.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {wf.status || 'unknown'}
                </span>
              </div>
              
              <p className="text-sm text-text-secondary mb-6 flex-grow">
                {wf.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                <div className="flex items-center text-xs text-text-dim gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{wf.last_run_at ? new Date(wf.last_run_at).toLocaleString() : 'Never run'}</span>
                </div>
                <button
                  onClick={() => handleRun(wf.name)}
                  disabled={runningWorkflow === wf.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {runningWorkflow === wf.name ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
