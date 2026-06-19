import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { proposals } from "@/lib/dashboard-data";

export function GovernancePanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Governance</CardTitle>
          <CardDescription>Proposal lifecycle, quorum, and voting power distribution.</CardDescription>
        </div>
        <Badge tone="amber">DAO</Badge>
      </CardHeader>
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <article key={proposal.id} className="rounded-2xl bg-muted/45 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{proposal.id}</p>
                <h3 className="mt-1 font-black">{proposal.title}</h3>
              </div>
              <Badge tone={proposal.state === "active" ? "green" : proposal.state === "passed" ? "cyan" : "amber"}>{proposal.state}</Badge>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${proposal.votesFor}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted">{proposal.votesFor}% for · {proposal.votesAgainst}% against · {proposal.turnout}% turnout</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
