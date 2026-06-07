# ZEAZ Governance Framework v1.0.0

## Proposal lifecycle

1. Author prepares a proposal with ID, title, kind, target version, rationale, and change list.
2. Node validates the proposal and stores it as `open`.
3. Eligible voters submit weighted votes before `closes_at`.
4. Anyone may request tally after close.
5. Accepted proposals are implementation requirements for the next target release.

## Proposal kinds

- `spec`: protocol IDL, canonicalization, compatibility, or security rules.
- `economics`: staking, fees, settlement, or reputation policy.
- `runtime`: node operation, bootstrap, peer discovery, or deployment defaults.

## Voting defaults

- Default quorum: `1` vote weight.
- Approval threshold: strict majority by weight among cast votes plus quorum.
- Vote replacement: latest vote from a node wins before close.

## Reference APIs

```bash
curl -X POST :8090/governance/proposals -d '{
  "id":"zip-1",
  "title":"Enable verifier quorum",
  "kind":"runtime",
  "target_version":"1.0.1",
  "created_by":"org-bootstrap",
  "changes":["set verification_quorum=2"]
}'
```

```bash
curl -X POST :8090/governance/proposals/zip-1/votes -d '{
  "node":"node-0",
  "weight":1,
  "value":true
}'
```
