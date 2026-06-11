# Cloudflare Runtime Governance Plan (Phase 7)

## Scope
Implement comprehensive runtime governance checks across the Zeaz platform monorepo. This involves offline-first auditing of Worker bindings, safe inspection of live Cloudflare tunnel environments (`cloudflared` configs), and detection of unsafe mutation practices in code.

## Non-Goals
- We do **not** automatically fix identified conflicts between DNS and live Worker routes.
- We do **not** automatically deploy configuration.
- We do **not** run any mutating Terraform or Wrangler commands.

## Hard Safety Rules
- Do not deploy.
- Do not run `wrangler deploy`.
- Do not run `terraform apply` or `tofu apply`.
- Do not mutate Cloudflare live resources.
- Do not call Cloudflare POST/PUT/PATCH/DELETE APIs.
- Do not print secrets, tunnel tokens, or credentials JSON.
- Do not exact-copy live config into repo examples.
- Keep all examples sanitized and placeholder-based.

## Runtime Evidence Model
We gather evidence using passive local checks against current live state files and declarative configuration, flagging risks for manual evaluation.
- Repo configurations must match the operational reality.
- `etc/cloudflared/config.yml` provides local truth for tunnels.
- Any conflict between documentation, Repo configuration, and actual runtime configuration mandates a manual review.

## Known Tunnel Context
- Live Tunnel ID: `ef0355dd-8e90-45ed-a222-b5053794ed20`
- Config File: `/etc/cloudflared/config.yml`
- Service Unit: `/etc/systemd/system/cloudflared.service`
- Tunnel uses token-based auth rather than `credentials-file` mapping.

## Why Repo Tunnel Config May Be Stale
Tunnel configs pushed to this repository represent "Infrastructure as Code" snapshots, which might drift if operators perform manual edits via the Cloudflare dashboard or directly within `/etc/cloudflared/config.yml` on the host system without committing the equivalent IaC updates back to the repo. Consequently, `/etc/cloudflared/config.yml` serves as the prevailing authority until proven otherwise.

## Redaction Policy
Scanners will identify sensitive targets and securely redact them from report outputs. This includes namespace IDs, secret values, and token artifacts.
- We do **not** print tokens or systemd `ExecStart` tokens.
- We do **not** print credential-file contents.
- We do **not** output exact replicas of live configuration.

## No-Mutation Gate
Implemented via `check-cloudflare-no-mutation.sh`. Detects accidental or malicious inclusion of unapproved deploy routines inside local CI workflows, shell scripts, and package manifests. Finding any forbidden execution triggers a strict blocker.

## DNS/Tunnel/Worker/Access Ownership Gate
Reconciles conflicts across overlapping layers. A single hostname cannot be claimed independently by both a Worker Route and a primary Tunnel routing definition without raising a formal ownership conflict that needs explicit resolution.

## Worker Binding Governance
Monitored via `scan-worker-bindings.sh`. Tracks all integration points across the serverless stack (KV, D1, Queues, Services). Protects against misconfiguration where `wrangler.toml` files inject literal production IDs without appropriately utilizing `.example` placeholders for version control parity. 

## Terraform Ownership Review Gate
Validates that Terraform modules claiming oversight of specific DNS or Access layers remain aligned with actual route authority, surfacing orphaned legacy modules or duplicate state definitions.

## AI Gateway / Edge Gateway Review Model
Verifies AI gateway bindings properly define expected governance documents. Any active AI endpoint requires confirmed authorization logging frameworks and explicit cost governance.

## Validation Command List
\`\`\`bash
# Run scanners
infra/cloudflare/scripts/check-cloudflare-no-mutation.sh --strict
infra/cloudflare/scripts/scan-runtime-governance.sh --markdown
infra/cloudflare/scripts/scan-worker-bindings.sh --markdown
infra/cloudflare/scripts/generate-runtime-governance-report.sh
\`\`\`

## Manual Approval Checklist
- [ ] No strict scanner failed.
- [ ] Binding inventories do not expose literal IDs.
- [ ] Placeholder IDs remain successfully removed from live configs.
- [ ] Conflicting DNS/Worker ownership routes are accounted for and prioritized.
- [ ] Runtime tunnel state accurately matches IaC repositories.

## Next Phases
- Phase 8: Reconciliation and formal mapping of exact Terraform ownership against Live Cloudflare tunnel data.
- Phase 9: Secure Drift Remediation — Importing stray records and executing state removal for legacy overlapping modules.
