export type Version = { major: number; minor: number; patch: number };
export type Signature = { algorithm: "ed25519"; key_id: string; value: string };
export type Envelope<T = unknown> = {
  id: string;
  kind: string;
  version: Version;
  issuer: string;
  issued_at: string;
  expires_at?: string;
  nonce: string;
  payload: T;
  signature: Signature;
};
export type Task = { id: string; requester_org_id: string; type: string; budget: number; max_risk: number; metadata?: Record<string, string> };
export type Bid = { id: string; task_id: string; bidder_org_id: string; cost: number; score: number; risk: number; metadata?: Record<string, string> };
export type Completion = { task_id: string; bidder_org_id: string; success: boolean; quality_score: number; result_ref: string };
export type Result = { task_id: string; verifier_org_id: string; score: number; valid: boolean };
export type Peer = { node_id: string; org_id: string; address: string; public_key: string; seen_at: string };
export type LedgerRecord = { height: number; type: string; envelope_id: string; envelope_hash: string; previous_hash: string; hash: string; at: string; metadata?: Record<string, string> };
export type NegotiationResult = { accepted: boolean; version: Version; reason?: string; features?: string[] };

export const currentVersion: Version = { major: 1, minor: 0, patch: 0 };
export const kinds = {
  task: "zeaz.task.v1",
  bid: "zeaz.bid.v1",
  completion: "zeaz.completion.v1",
  result: "zeaz.result.v1",
  peer: "zeaz.peer.v1",
  proposal: "zeaz.governance.proposal.v1",
  vote: "zeaz.governance.vote.v1",
} as const;

export class ZeazClient {
  constructor(private readonly baseUrl: string, private readonly fetchImpl: typeof fetch = fetch) {}

  version(): Promise<Version> {
    return this.request("/version");
  }

  negotiate(requested: Version = currentVersion, features: string[] = []): Promise<NegotiationResult> {
    return this.request("/version/negotiate", { method: "POST", body: { version: requested, features } });
  }

  submitEnvelope<T>(envelope: Envelope<T>): Promise<LedgerRecord> {
    return this.request("/envelopes", { method: "POST", body: envelope });
  }

  ledger<T = unknown>(): Promise<T> {
    return this.request("/ledger");
  }

  peers(): Promise<Peer[]> {
    return this.request("/peers");
  }

  announcePeer(peer: Peer): Promise<Peer[]> {
    return this.request("/peers", { method: "POST", body: peer });
  }

  proposals<T = unknown>(): Promise<T> {
    return this.request("/governance/proposals");
  }

  async request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!response.ok) {
      throw new Error(`ZEAZ node returned ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }
}
