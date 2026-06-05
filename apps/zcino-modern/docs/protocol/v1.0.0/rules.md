# ZEAZ v1.0.0 Reference Rules

## Admission

1. Decode the envelope JSON.
2. Check version compatibility against local current version.
3. Resolve `signature.key_id` to an Ed25519 public key.
4. Canonicalize the envelope with `signature.value` blank.
5. Verify the signature.
6. Decode payload according to `kind`.
7. Run message validation and ledger/economic checks.
8. Append a hash-chained ledger record.

## Economic policy

The reference node supports an operator-configured policy:

- `min_stake`: minimum stake if reputation is below `min_reputation`.
- `min_reputation`: minimum reputation when stake is insufficient.
- `task_submission_fee`: fee debited with task escrow reservation.
- `verification_quorum`: count of distinct valid verifier results required before settlement.

## Settlement

When a completion is accepted and verification quorum is satisfied, the task budget is released from requester escrow to bidder balance exactly once.

## Governance

- Proposals start as `open`.
- Votes can be replaced by the same node before close.
- Votes require positive weight.
- Tallies close proposals when `now >= closes_at`.
- Status becomes `accepted` if `yes >= quorum` and `yes > no`; otherwise `rejected`.
