export type ChainBlock = {
  hash: string;
  height: number;
  proposer: string;
  txCount: number;
  taskCount: number;
  timestamp: string;
};

export type ChainTransaction = {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: "finalized" | "pending" | "failed";
  timestamp: string;
};

export type TaskEvent = {
  id: string;
  agent: string;
  lane: "matching" | "settlement" | "governance" | "interop";
  status: "queued" | "running" | "complete" | "failed";
  latencyMs: number;
  payload: string;
  timestamp: string;
};

export type GovernanceProposal = {
  id: string;
  title: string;
  state: "active" | "queued" | "passed";
  turnout: number;
  votesFor: number;
  votesAgainst: number;
  closesAt: string;
};

export type NetworkNode = {
  id: string;
  label: string;
  role: "validator" | "agent" | "gateway" | "oracle";
  stake: number;
  region: string;
  health: number;
};

export type NetworkEdge = {
  source: string;
  target: string;
  weight: number;
  lane: "consensus" | "task" | "interop";
};

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

export const blocks: ChainBlock[] = Array.from({ length: 10 }, (_, index) => ({
  hash: `0x${(882343 - index).toString(16)}${"a9f3".repeat(8)}`.slice(0, 42),
  height: 884_210 - index,
  proposer: ["zeaz-val-nyc-01", "zeaz-val-fra-03", "zeaz-val-sfo-02", "zeaz-val-sin-01"][index % 4],
  txCount: 142 - index * 7,
  taskCount: 58 - index * 3,
  timestamp: iso(index * 2 + 1),
}));

export const transactions: ChainTransaction[] = Array.from({ length: 12 }, (_, index) => ({
  hash: `0x${(734020 + index).toString(16)}${"cf07".repeat(8)}`.slice(0, 42),
  from: `zcino1${["agent", "vault", "user", "gov"][index % 4]}${index.toString().padStart(2, "0")}`,
  to: `zcino1${["settle", "route", "task", "escrow"][index % 4]}${(index + 4).toString().padStart(2, "0")}`,
  value: `${(18.42 + index * 2.7).toFixed(2)} ZAZ`,
  status: index % 7 === 0 ? "pending" : index % 11 === 0 ? "failed" : "finalized",
  timestamp: iso(index * 3 + 2),
}));

export const seedTasks: TaskEvent[] = Array.from({ length: 14 }, (_, index) => ({
  id: `task-${884210 - index}`,
  agent: ["risk-agent", "odds-agent", "settlement-agent", "compliance-agent"][index % 4],
  lane: ["matching", "settlement", "governance", "interop"][index % 4] as TaskEvent["lane"],
  status: ["complete", "running", "queued", "complete"][index % 4] as TaskEvent["status"],
  latencyMs: 48 + index * 11,
  payload: ["provider quote normalized", "ledger settlement posted", "policy vote checkpoint", "partner route reconciled"][index % 4],
  timestamp: iso(index + 1),
}));

export const proposals: GovernanceProposal[] = [
  { id: "ZIP-42", title: "Raise validator service-level objective to 99.95%", state: "active", turnout: 67, votesFor: 82, votesAgainst: 18, closesAt: iso(-720) },
  { id: "ZIP-43", title: "Approve interop gateway allowlist for EU providers", state: "queued", turnout: 41, votesFor: 74, votesAgainst: 26, closesAt: iso(-1560) },
  { id: "ZIP-39", title: "Treasury grant for agent simulation audits", state: "passed", turnout: 78, votesFor: 91, votesAgainst: 9, closesAt: iso(1440) },
];

export const networkNodes: NetworkNode[] = [
  { id: "val-nyc", label: "NYC Validator", role: "validator", stake: 420000, region: "us-east", health: 99.98 },
  { id: "val-sfo", label: "SFO Validator", role: "validator", stake: 385000, region: "us-west", health: 99.91 },
  { id: "val-fra", label: "FRA Validator", role: "validator", stake: 401000, region: "eu-central", health: 99.95 },
  { id: "agent-risk", label: "Risk Agent", role: "agent", stake: 92000, region: "us-east", health: 99.73 },
  { id: "agent-odds", label: "Odds Agent", role: "agent", stake: 87000, region: "eu-west", health: 99.64 },
  { id: "gateway-nats", label: "NATS Gateway", role: "gateway", stake: 126000, region: "global", health: 99.89 },
  { id: "gateway-kafka", label: "Kafka Gateway", role: "gateway", stake: 118000, region: "global", health: 99.87 },
  { id: "oracle-rng", label: "RNG Oracle", role: "oracle", stake: 76000, region: "us-east", health: 99.99 },
];

export const networkEdges: NetworkEdge[] = [
  { source: "val-nyc", target: "val-sfo", weight: 8, lane: "consensus" },
  { source: "val-nyc", target: "val-fra", weight: 9, lane: "consensus" },
  { source: "val-sfo", target: "val-fra", weight: 7, lane: "consensus" },
  { source: "gateway-nats", target: "agent-risk", weight: 6, lane: "task" },
  { source: "gateway-nats", target: "agent-odds", weight: 5, lane: "task" },
  { source: "gateway-kafka", target: "agent-risk", weight: 4, lane: "task" },
  { source: "gateway-kafka", target: "val-fra", weight: 5, lane: "interop" },
  { source: "oracle-rng", target: "val-nyc", weight: 3, lane: "interop" },
  { source: "oracle-rng", target: "agent-odds", weight: 3, lane: "task" },
];

export function createMetricSnapshot(sequence = 0) {
  const phase = sequence % 36;
  return {
    sequence,
    tps: 1820 + Math.round(Math.sin(phase / 4) * 210) + phase * 3,
    finalityMs: 812 + Math.round(Math.cos(phase / 3) * 46),
    activeValidators: 128,
    tasksPerMinute: 2860 + Math.round(Math.sin(phase / 5) * 240),
    wsPeers: 42 + (phase % 6),
    timestamp: new Date().toISOString(),
  };
}

export function createTaskEvent(sequence = 0): TaskEvent {
  const agents = ["risk-agent", "odds-agent", "settlement-agent", "compliance-agent", "route-agent"];
  const lanes: TaskEvent["lane"][] = ["matching", "settlement", "governance", "interop"];
  const statuses: TaskEvent["status"][] = ["queued", "running", "complete", "complete"];

  return {
    id: `stream-task-${Date.now()}-${sequence}`,
    agent: agents[sequence % agents.length],
    lane: lanes[sequence % lanes.length],
    status: statuses[sequence % statuses.length],
    latencyMs: 37 + ((sequence * 19) % 180),
    payload: ["Kafka partition committed", "NATS subject delivered", "validator quorum observed", "wallet policy attested"][sequence % 4],
    timestamp: new Date().toISOString(),
  };
}
