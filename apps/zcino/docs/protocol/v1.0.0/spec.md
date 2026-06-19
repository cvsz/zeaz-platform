# ZEAZ Protocol v1.0.0 Specification

Status: stable baseline  
Protocol ID: `zeaz/1.0.0`  
Wire compatibility: same major version and peer minor version less than or equal to node minor version.

## Goals

ZEAZ is a task-market protocol for autonomous organizations and agents. The v1 protocol defines:

1. Version negotiation and feature discovery.
2. Canonical signed envelopes for every mutating action.
3. Task, bid, completion, verification, peer discovery, and governance message schemas.
4. Ledger admission rules for deterministic reference-node behavior.
5. Governance proposal and voting rules for protocol evolution.

## Transport

Nodes MUST expose HTTP+JSON endpoints and MAY expose the protobuf service in `protocol/task.proto`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/healthz` | Liveness check. |
| `GET` | `/version` | Current protocol version and supported features. |
| `POST` | `/version/negotiate` | Negotiate a compatible version. |
| `GET` | `/ledger` | Deterministic node snapshot. |
| `POST` | `/envelopes` | Submit a signed envelope. |
| `GET` | `/peers` | Return non-expired peer announcements. |
| `POST` | `/peers` | Announce a peer. |
| `GET` | `/governance/proposals` | Return proposals known by this node. |
| `POST` | `/governance/proposals` | Submit a proposal. |
| `POST` | `/governance/proposals/{id}/votes` | Cast or replace a vote. |
| `GET` | `/governance/proposals/{id}/tally` | Return tally and final status when closed. |

## Versioning

The version tuple is `{major, minor, patch}`.

- Major versions are wire incompatible.
- Minor versions are backward compatible when `requested.minor <= node.minor`.
- Patch versions contain clarifications or bug fixes. During negotiation, a node MAY downgrade a requested patch to its current patch.
- Feature strings are lowercase `domain.name` tokens, for example `governance.voting`.

## Envelope

All state-changing protocol messages MUST be wrapped in an envelope:

```json
{
  "id": "base64url-128-bit-hash",
  "kind": "zeaz.task.v1",
  "version": {"major": 1, "minor": 0, "patch": 0},
  "issuer": "org-alpha",
  "issued_at": "2026-05-06T00:00:00Z",
  "expires_at": "2026-05-07T00:00:00Z",
  "nonce": "task:task-123",
  "payload": {"id": "task-123"},
  "signature": {
    "algorithm": "ed25519",
    "key_id": "org-alpha",
    "value": "base64url-signature"
  }
}
```

### Canonicalization

Signatures are computed over canonical JSON with these rules:

1. JSON object keys MUST be sorted lexicographically.
2. Strings MUST use JSON escaping from the platform encoder.
3. Numbers MUST be finite JSON numbers.
4. Empty signature values are omitted before signing.
5. The `payload` field MUST be canonical JSON for the inner application message.

## Message kinds

| Kind | Payload | Issuer rule |
| --- | --- | --- |
| `zeaz.task.v1` | `Task` | `issuer == requester_org_id` |
| `zeaz.bid.v1` | `Bid` | `issuer == bidder_org_id` |
| `zeaz.completion.v1` | `Completion` | `issuer == bidder_org_id` |
| `zeaz.result.v1` | `Result` | `issuer == verifier_org_id` |
| `zeaz.peer.v1` | `Peer` | `issuer == org_id` |
| `zeaz.governance.proposal.v1` | `GovernanceProposal` | `issuer == created_by` |
| `zeaz.governance.vote.v1` | `GovernanceVote` | `issuer == node_id` |

## Data model

The protobuf IDL in `protocol/task.proto` is normative for field names and primitive types. JSON encodings use snake_case field names matching the Go reference implementation in `internal/zeaz/protocol`.

## Ledger rules

A conforming node MUST reject envelopes when:

- The envelope version is incompatible.
- The signature algorithm is not `ed25519`.
- The signing key cannot be resolved by `signature.key_id`.
- The signature does not validate over canonical bytes.
- The issuer does not match the message-specific issuer rule.
- The participant is unknown or inactive.
- A task has non-positive budget or a `max_risk` outside `[0,1]`.
- A bid has non-positive cost, unknown task, cost greater than budget, or risk greater than task max risk.
- A completion references an unknown task or has quality outside `[0,1]`.
- A verification result references an unknown task or has score outside `[0,1]`.

Ledger records form a hash chain using previous record hash, envelope hash, height, and record type.

## Governance

Governance proposals and votes are first-class protocol messages and can also be submitted through the reference node governance HTTP API. Voting is weighted. A proposal passes when yes weight reaches quorum and yes weight is greater than no weight after close time.

## Security notes

- Private keys MUST NOT be transmitted through peer discovery.
- Nodes SHOULD reject expired envelopes.
- Nonce replay protection SHOULD be implemented by production validators.
- Operators SHOULD pin peer public keys in genesis for private testnets.
