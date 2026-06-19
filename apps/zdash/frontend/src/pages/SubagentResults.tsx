import SectionCard from "../components/common/SectionCard";

export default function SubagentResults() {
  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-cyan">
          Agent Execution
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
          Subagent Results
        </h2>
        <p className="mt-2 text-sm text-text-dim">
          Review results and outputs from subagents executing workflows.
        </p>
      </div>

      <SectionCard title="Mailbox Records">
        <p className="text-slate-400">
          This page displays results and outputs from various subagents executing workflows.
        </p>
      </SectionCard>

      <SectionCard title="Selected Result">
        <p className="text-slate-400">
          Select a mailbox record to inspect execution details, status, and output payloads.
        </p>
      </SectionCard>
    </div>
  );
}
