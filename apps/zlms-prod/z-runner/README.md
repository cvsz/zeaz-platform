# z-runner: Zero-Trust GitHub Actions Runner Fabric

`z-runner` is an autonomous GitHub Actions self-hosted runner platform for organization or repository scoped ephemeral runners. It uses runtime-generated GitHub App installation tokens, hardened systemd units, rootless/containerized execution, gVisor-ready Kubernetes manifests, runtime detection, and cleanup/rotation automation.

## Architecture

```text
GitHub Actions -> GitHub App token minting -> Ephemeral runner -> gVisor/rootless runtime -> Watchdog -> SIEM/Telemetry
```

## Authentication model

The platform does not store PATs. `common.sh` signs a short-lived GitHub App JWT locally, exchanges it for an installation token, then requests short-lived runner registration/removal tokens. Keep `/etc/z-runner/github-app.pem` mode `0400` or `0600` and scope the GitHub App to the minimum organizations/repositories.

Required GitHub App permissions:

- Repository scope: `Actions: read/write`, `Metadata: read`.
- Organization runner scope: organization self-hosted runner administration permission.

## Ubuntu 24.04 deployment

```bash
curl -fsSL https://raw.githubusercontent.com/cvsz/zlms-prod/main/z-runner/install.sh | sudo bash
sudo install -m 0600 github-app.pem /etc/z-runner/github-app.pem
sudoedit /etc/z-runner/runner.env
sudo systemctl start zrunner.service zrunner-watchdog.service
sudo systemctl status zrunner.service zrunner-watchdog.service
```

Set these fields in `/etc/z-runner/runner.env`:

- `GITHUB_APP_ID`
- `GITHUB_APP_INSTALLATION_ID`
- `GITHUB_APP_PRIVATE_KEY_FILE`
- `RUNNER_SCOPE=org` with `GITHUB_OWNER`, or `RUNNER_SCOPE=repo` with `GITHUB_OWNER` and `GITHUB_REPOSITORY`
- `RUNNER_GROUP` and `RUNNER_LABELS_FILE`

## Kubernetes deployment

1. Build and sign the runner image from `docker/Dockerfile.runner`.
2. Replace the digest in `kubernetes/runner-deployment.yaml` with the signed image digest from your registry.
3. Create `z-runner-github-app` with the GitHub App fields and private key.
4. Apply manifests:

```bash
kubectl apply -f kubernetes/runner-namespace.yaml
kubectl -n z-runner create secret generic z-runner-github-app \
  --from-literal=GITHUB_APP_ID="$GITHUB_APP_ID" \
  --from-literal=GITHUB_APP_INSTALLATION_ID="$GITHUB_APP_INSTALLATION_ID" \
  --from-file=github-app.pem=github-app.pem
kubectl -n z-runner create configmap z-runner-config --from-env-file=config/runner.env --from-file=labels.json=config/labels.json
kubectl apply -f kubernetes/
kubectl apply -f security/kyverno-policy.yaml
```

## Hardening guide

- Run ephemeral runners (`RUNNER_EPHEMERAL=true`) and disable persistent workspaces.
- Prefer gVisor (`RuntimeClass: gvisor`) or Kata/Firecracker nodes for untrusted workflows.
- Enforce `NetworkPolicy` egress to GitHub CIDRs, DNS, artifact stores, and explicitly approved package mirrors only.
- Enable Falco rules in `security/falco-rules.yaml` and forward alerts to SIEM via `SIEM_WEBHOOK_URL`.
- Use immutable images pinned by digest and verify signatures before deployment.
- Keep runner labels segmented by trust tier, runtime, data sensitivity, and hardware class.
- Keep GitHub App permissions least-privileged and rotate the private key through your secret manager.

## Scaling guide

- For Kubernetes-native production fleets, prefer ARC + KEDA with isolated runner scale sets per trust tier.
- Use `autoscaler.sh` only as a conservative bridge scaler for installations that expose queued workflow counts to the GitHub App.
- Cap maximum replicas per namespace and use taints/tolerations so runner jobs do not land on general-purpose nodes.
- Use separate labels for `secure`, `ephemeral`, `gpu`, `ai`, `production`, and sensitive runtimes.

## Rollback strategy

1. Stop admission changes first: revert Kyverno/Gatekeeper policy updates if they block emergency runner scheduling.
2. Scale runners to zero: `kubectl -n z-runner scale deployment/z-runner --replicas=0` or `systemctl stop zrunner.service`.
3. Restore the previous signed image digest or package version.
4. Start one canary runner and verify a benign workflow.
5. Gradually restore HPA/ARC limits.

## Incident response guide

1. Quarantine evidence in `/var/lib/z-runner/quarantine`.
2. Rotate the runner with `rotate.sh compromised-runner`.
3. Revoke GitHub App installation tokens by rotating the app private key if token exposure is suspected.
4. Review Falco, OpenTelemetry, runner, and GitHub audit logs.
5. Rebuild runner images from clean provenance, re-sign, and redeploy.
6. Add suspicious workflow indicators to branch protection, rulesets, Semgrep, and Falco/OPA controls.

## SBOM and provenance

Generate SBOM and provenance for container releases with your CI:

```bash
syft packages dir:. -o spdx-json > sbom.spdx.json
cosign attest --predicate sbom.spdx.json --type spdxjson "$IMAGE_DIGEST"
cosign sign "$IMAGE_DIGEST"
```
