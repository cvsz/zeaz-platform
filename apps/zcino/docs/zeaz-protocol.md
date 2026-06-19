# ZEAZ v9 open autonomous network protocol, runtime, ledger, reputation, and testnet specification

## Scope

ZEAZ v1 defines a signed autonomous task market for organizations, agents, wallets, verifiers, a hash-chained ledger, reputation updates, bootstrap discovery, and a runnable testnet profile. The normative IDL lives in `protocol/task.proto`; the in-process reference implementation lives under `internal/zeaz`.

## Versioning

- Current protocol version: `1.0.0`.
- Nodes accept envelopes with the same major version and a minor version less than or equal to the node minor version.
- Major versions may break wire compatibility; minor versions may add optional fields; patch versions are bug-fix compatible.
- Application message kinds are namespaced as `zeaz.task.v1`, `zeaz.bid.v1`, `zeaz.completion.v1`, `zeaz.result.v1`, and `zeaz.peer.v1`.

## Signing

- v1 signatures use Ed25519.
- `key_id` is the organization id registered in the ledger verifier keyring.
- The signature covers canonical JSON of the envelope with `signature.value` empty, including `id`, `kind`, `version`, `issuer`, `issued_at`, optional expiry, nonce, and payload.
- Verifiers reject unknown keys, incompatible versions, expired envelopes, unsupported algorithms, invalid signatures, and issuer/payload mismatches.

## Runtime

A node contains:

1. an agent identity (`node_id`, role, organization id),
2. a wallet with Ed25519 signing keys,
3. a verifier backed by the registered organization public keys,
4. a ledger client/service,
5. a discovery client for bootstrap peer announcements.

The reference node exposes:

- `GET /healthz`
- `GET /version`
- `POST /envelopes`
- `GET /ledger`
- `POST /peers`
- `GET /peers`

## Ledger service

The v9 ledger starts as a centralized append-only hash chain that can be replaced by distributed consensus later. Every accepted envelope produces a record containing height, envelope id, envelope hash, previous hash, record hash, type, timestamp, and optional settlement metadata. The service validates task constraints before accepting dependent bids, completions, and verifier results.

## Open-network economics

Open access is constrained by `OpenNetworkPolicy`: participants must carry minimum reputation or stake, task requesters must fund the task budget plus a submission fee, and task budgets are escrowed before work enters the market. This gives the permissionless network an economic spam/Sybil boundary without hard-coding trusted partners.

## Verification quorum

`zeaz.result.v1` messages are signed by verifier DIDs. In open-network mode a completion is recorded but not settled until at least two distinct verifiers submit valid results for the task. When the quorum is reached, escrow releases to the bidder exactly once and the reputation engine applies the completion feedback.

## Reputation engine

Reputation starts at `1.0`, is clamped to `[0,2]`, increases by `quality_score * 0.05` for successful completions, decreases by `0.15` for failures, and tracks completed tasks, failed tasks, revenue credits, and update time.

## Bootstrap network and discovery

Peers announce signed `Peer` payloads containing node id, org id, public address, public key, and seen time. Bootstrap registries retain peers until a TTL expires and return deterministic node-id sorted peer lists.

## Testnet deployment

Docker Compose runs three ZEAZ nodes and a NATS bootstrap bus. Kubernetes manifests run a three-replica node deployment with service discovery through `zeaz-node.default.svc.cluster.local`.

## v10 protocol-as-standard governance

ZEAZ v10 treats the network as a protocol standard instead of a single controlled deployment. The protocol steward owns the normative spec, the reference implementation, compatibility guidance, and governance coordination; independent implementations own their own runtimes as long as they remain wire-compatible and compliance-testable.

### Normative artifacts

- `protocol/task.proto` is the immutable, versioned IDL for v1 wire contracts.
- Protocol messages reserve explicit governance proposal, governance vote, economic rule, and version-negotiation payloads so independent implementations can coordinate upgrades without private side channels.
- Application kinds remain namespaced by stable major version. Governance payloads use `zeaz.governance.proposal.v1` and `zeaz.governance.vote.v1`.

### Compatibility rules

- Nodes negotiate the highest mutually compatible protocol version before exchanging envelopes.
- A node accepts the same major version and any peer minor version less than or equal to the node minor version.
- Optional features must be advertised during negotiation and safely ignored by nodes that do not opt in.
- Breaking changes require a new major version, a migration guide, and a governance proposal that defines the deprecation window for the previous major version.

### Economic standardization

`EconomicRule` defines the minimum shared economics across implementations:

- `unit_of_account`: canonical accounting unit for budgets, stake, fees, and settlement.
- `min_stake`: minimum economic weight needed to participate in open-network settlement.
- `fee_rate`: protocol-level submission or settlement fee expressed as a decimal rate.
- `settlement`: deterministic settlement mode, such as `escrow-quorum-release`.

Implementations may add local pricing policy, but they must not reinterpret these protocol fields or settlement semantics for the same major version.

### Governance process

1. A maintainer or eligible contributor submits a proposal with a target version, kind, close time, and explicit change list.
2. Reputation-weighted voters cast one active vote per node; later votes from the same node replace earlier votes before close.
3. A proposal passes only when yes-weight reaches quorum and exceeds no-weight.
4. Accepted proposals become part of the next spec release; rejected proposals may be resubmitted only with a new proposal id and changelog.

This model is intentionally balanced: core maintainers coordinate release safety, while external operators retain enough voting power to prevent unilateral changes that would fragment the ecosystem.

## v11 full validator architecture

ZEAZ now includes implementation foundations for a full validator node: libp2p/GossipSub transport, HotStuff/Tendermint-style BFT quorum certificates, staking and slashing, signed cryptographic settlement receipts, a deterministic WASM execution boundary, and a node manifest. See `docs/zeaz-validator-architecture.md` for the full repository review and upgrade report.
