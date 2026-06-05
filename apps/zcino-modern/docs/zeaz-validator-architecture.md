# ZEAZ full validator architecture upgrade report

## Repository review summary

The repository already contained a ZEAZ protocol reference path under `internal/zeaz` with signed envelopes, an in-memory hash-chain ledger, bootstrap peer discovery, a runtime wallet/agent, governance endpoints, Docker/Kubernetes testnet manifests, and protocol documentation. The missing production-validator pieces were the transport, BFT consensus, validator economics, cryptographic settlement receipts, a WASM execution boundary, and a single node manifest that advertises those capabilities.

This upgrade adds concrete foundations for each requested layer while preserving the existing catalog/tracking application and ZEAZ task-market APIs.

## 1. libp2p networking

Added `internal/zeaz/p2p`, a real libp2p host wrapper with GossipSub topics for validator traffic:

- protocol id: `/zeaz/validator/1.0.0`
- consensus topic: `zeaz.consensus.v1`
- mempool topic: `zeaz.mempool.v1`
- configurable listen multiaddrs and bootstrap peer multiaddrs
- managed topic subscription lifecycle tied to context cancellation

Recommended next integration step: start this node in `cmd/zeaznode` behind a `ZEAZ_P2P_ENABLED=true` flag, then route accepted `/envelopes` into the mempool topic and consensus votes/proposals into the consensus topic.

## 2. Real consensus: HotStuff / Tendermint foundation

Added `internal/zeaz/consensus`, a BFT consensus core that supports both `hotstuff` and `tendermint` algorithm labels, validator power, Ed25519 signed votes, equivocation detection, quorum certificates, and commit verification.

The core enforces the BFT safety threshold as signed voting power greater than two thirds of total validator power. A commit is only accepted when a commit-phase QC matches the proposal height, round, block hash, and algorithm.

Recommended next integration step: map ledger batches to proposal payload hashes, have the proposer gossip proposals through libp2p, and append ledger records only after a commit QC rather than immediately on HTTP submission.

## 3. Staking and slashing

Added `internal/zeaz/staking`, a validator stake pool with:

- minimum stake enforcement
- bond and unbond transitions
- active validator selection sorted by voting power
- fractional slashing
- jail timers
- structured staking/slashing events

Recommended next integration step: connect slashing evidence from consensus equivocation to `Pool.Slash`, then persist staking events in the ledger state root.

## 4. Cryptographic settlement

Added `internal/zeaz/settlement`, a cryptographic settlement-receipt package with:

- transfer validation
- deterministic Merkle root over transfers
- state-root binding
- receipt hashing
- Ed25519 signing and verification
- tamper detection for transfer amount/root/hash changes

Recommended next integration step: have ledger escrow release produce signed receipts and publish them as a settlement event stream. For external-chain settlement, the receipt hash can be anchored to a bridge or rollup contract.

## 5. WASM execution layer

Added `internal/zeaz/wasm`, a deterministic execution boundary with:

- module registration by code hash and ABI
- max fuel policy
- invocation fuel enforcement
- runner abstraction for replacing the current deterministic test runner with wazero/Wasmtime
- state-root output for consensus and settlement linkage

Recommended next integration step: replace `DeterministicEchoRunner` with a sandboxed WASM runtime adapter, allow modules to implement task validation/scoring, and include module state roots in consensus proposals.

## 6. Full validator node architecture

Added `internal/zeaz/node`, a manifest model for full validator nodes. `cmd/zeaznode` now advertises all validator capabilities through version negotiation and exposes `GET /node/manifest`.

The full validator capability set is:

- `libp2p.gossipsub`
- `consensus.hotstuff`
- `consensus.tendermint`
- `staking.slashing`
- `settlement.receipts`
- `wasm.execution`
- `ledger.hash_chain`
- `governance.voting`
- `discovery.bootstrap`

## Target full-validator data path

1. HTTP/RPC receives signed task, bid, completion, result, governance, staking, or WASM transaction envelope.
2. Node verifies envelope signature, account/stake eligibility, nonce, fee, and WASM admission rules.
3. Valid transaction enters the libp2p GossipSub mempool.
4. Current proposer builds a deterministic block: transactions, previous state root, app hash, WASM result roots, and settlement roots.
5. Validators exchange signed HotStuff/Tendermint votes over the consensus topic.
6. A QC with more than two-thirds validator power commits the block.
7. Ledger applies state transitions, staking/slashing updates, escrow movement, settlement receipts, and reputation updates.
8. Node emits signed receipts and updates `/ledger`, `/node/manifest`, peer, and governance APIs.

## Remaining production hardening checklist

- Persist ledger, validator set, mempool, consensus WAL, and WASM module registry to durable storage.
- Add peer scoring, connection limits, topic validation, private key loading, and DHT discovery to the libp2p layer.
- Add Tendermint round timeout handling and HotStuff pacemaker/view-change logic around the consensus core.
- Add evidence transactions for double-signing, invalid proposals, unavailable data, and long-range validator key compromise.
- Add deterministic state-machine snapshots and restore tests.
- Replace floating-point balances in legacy ledger APIs with integer asset amounts before mainnet use.
- Add bridge/rollup adapters for external cryptographic settlement anchoring.
- Replace the echo WASM runner with a sandbox implementation and deterministic host functions.
