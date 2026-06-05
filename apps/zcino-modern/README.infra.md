# Zeaz Network Infrastructure Blueprint

This blueprint defines the Phase 1 production baseline for Zeaz Network: a high-availability k3s control plane, Cloudflare Zero Trust ingress, and persistent state services for PostgreSQL, Redis, ClickHouse, and NATS.

## Reference topology

| Layer | Minimum production shape | Purpose |
| --- | --- | --- |
| Control plane | 3 k3s server nodes with embedded etcd | Highly available Kubernetes API and scheduler quorum. |
| Workers | 3+ k3s agent nodes across Spaceship/GCP hosts | Stateless API, analytics, frontend, and protocol workloads. |
| Ingress | Cloudflare Tunnel pods plus Traefik internal ingress | No public node ports; all HTTP/S traffic enters through Cloudflare Zero Trust. |
| State | PostgreSQL, Redis, ClickHouse, NATS with durable volumes | Relational state, cache/rate limits, analytics, and event messaging. |
| Security | UFW host firewall, k3s NetworkPolicy, Cloudflare Access | Default-deny network posture and identity-aware ingress. |

## Host provisioning assumptions

* Operators have SSH access to every bare-metal or VM host on port `22022`.
* Nodes run Ubuntu 22.04 LTS or newer with static private IPs.
* Public inbound access is limited to SSH `22022`; Kubernetes APIs and application traffic are private or Cloudflare-routed.
* Cloudflare owns the production DNS zone and Zero Trust account.

## Bare-metal provisioning steps

Run these commands on every node as a privileged user after replacing hostnames and IPs.

```bash
ssh -p 22022 root@<node-public-ip>
hostnamectl set-hostname <node-name>
apt-get update
apt-get install -y curl jq ufw open-iscsi nfs-common ca-certificates
modprobe br_netfilter overlay
cat >/etc/modules-load.d/k3s.conf <<'SYSCTL'
br_netfilter
overlay
SYSCTL
cat >/etc/sysctl.d/99-k3s.conf <<'SYSCTL'
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.ipv4.ip_forward=1
SYSCTL
sysctl --system
ufw default deny incoming
ufw default allow outgoing
ufw allow 22022/tcp
ufw allow from <private-cidr> to any port 6443 proto tcp
ufw allow from <private-cidr> to any port 2379:2380 proto tcp
ufw allow from <private-cidr> to any port 8472 proto udp
ufw allow from <private-cidr> to any port 10250 proto tcp
ufw --force enable
```

Install the first server node:

```bash
export K3S_TOKEN='<generate-32-byte-token>'
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='server --cluster-init --disable servicelb --write-kubeconfig-mode 600 --node-taint CriticalAddonsOnly=true:NoExecute' sh -
```

Join the second and third server nodes:

```bash
export K3S_TOKEN='<same-token>'
export K3S_URL='https://<first-server-private-ip>:6443'
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='server --disable servicelb --write-kubeconfig-mode 600 --node-taint CriticalAddonsOnly=true:NoExecute' sh -
```

Join worker nodes:

```bash
export K3S_TOKEN='<same-token>'
export K3S_URL='https://<server-lb-or-private-ip>:6443'
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='agent' sh -
```

Validate quorum and node readiness:

```bash
kubectl get nodes -o wide
kubectl -n kube-system get pods
kubectl get --raw='/readyz?verbose'
```

## Cloudflare Zero Trust integration

1. Create a Cloudflare Tunnel named `zeaz-prod`.
2. Store the tunnel token as a Kubernetes secret in the `cloudflare` namespace with `kubectl -n cloudflare create secret generic cloudflare-tunnel-token --from-env-file=cloudflared-token.env # env file contains CLOUDFLARE_TUNNEL_TOKEN"$CLOUDFLARE_TUNNEL_TOKEN"`.
3. Apply `k8s/baseline/cloudflare-tunnel.yaml`.
4. Configure Cloudflare Access policies for the admin surfaces, requiring SSO and device posture.
5. Route public hostnames to internal services through the tunnel:

| Hostname | Internal service | Access policy |
| --- | --- | --- |
| `app.example.com` | `http://frontend.frontend.svc.cluster.local:3000` | Public read-only lobby. |
| `api.example.com` | `http://api-gateway.zeaz.svc.cluster.local:8080` | JWT clients plus WAF. |
| `admin.example.com` | `http://api-gateway.zeaz.svc.cluster.local:8080` | SSO, MFA, device posture. |
| `compliance.example.com` | `http://compliance.zeaz.svc.cluster.local:8082` | Internal service-token only. |

## Cluster baseline deployment

Apply manifests in order:

```bash
kubectl apply -f k8s/baseline/namespaces.yaml
kubectl apply -f k8s/baseline/network-policies.yaml
kubectl apply -f k8s/baseline/cloudflare-tunnel.yaml
kubectl apply -f k8s/baseline/ingress.yaml
```

## Persistent state baseline

For single-host production rehearsals, use `infra/docker-compose.yml`. For Kubernetes production, map the same settings into StatefulSets or an operator-backed database service. Required services:

* PostgreSQL for catalog, tenant, session, governance, and transactional state.
* Redis for cache, distributed rate limiting, and short-lived idempotency keys.
* ClickHouse for immutable high-throughput analytics tables initialized by `infra/clickhouse.sql`.
* NATS with JetStream for durable event subjects such as tracking clicks, ledger envelopes, and metrics streams.

## Security requirements

* Do not expose PostgreSQL, Redis, ClickHouse native TCP, NATS client ports, or k3s API publicly.
* Keep Cloudflare tunnel credentials in Kubernetes secrets only.
* Enforce `CF-IPCountry` and compliance checks before any real-money route is served.
* Require per-tenant JWTs on privileged APIs and validate `X-Tenant-ID` against token claims.
* Rotate k3s tokens, Cloudflare tunnel tokens, database passwords, NATS credentials, and JWT secrets through the deployment secret manager.
