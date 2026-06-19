import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, CheckCircle2 } from "lucide-react";

export function ReadinessScorecard({ score }: { score: number }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gauge className="h-6 w-6 text-emerald-300" />
          Readiness Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Overall Readiness</span>
          <span className="text-2xl font-black text-white">{score}%</span>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DeploymentStatusWidget({ statusData }: { statusData: any }) {
  const status = statusData?.status || "Unknown";
  return (
    <Card className="border-white/10 bg-white/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <CheckCircle2 className="h-6 w-6 text-cyan-300" />
          Deployment Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Current Status</span>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 uppercase tracking-widest">
            {status}
          </span>
        </div>
        <pre className="mt-4 max-h-[120px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/50 p-4 text-xs leading-5 text-slate-300">
          {JSON.stringify(statusData, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
