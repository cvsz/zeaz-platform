#!/usr/bin/env bash

# ==============================================================================
# ZEAZ PROTOCOL — ENTERPRISE RELEASE INSTALLER v2
# PURPOSE:
#   Minimal deterministic bootstrap → GitOps takeover
#
# FEATURES:
#   - Idempotent
#   - Zero-Trust baseline
#   - GitOps-native
#   - Vault + ArgoCD + Cilium
#   - Drift-safe
#   - Rollback-ready
#   - No Docker Compose
# ==============================================================================

set -Eeuo pipefail
IFS=$'\n\t'

# ==============================================================================
# CONFIG
# ==============================================================================

readonly K3S_VERSION="${K3S_VERSION:-v1.30.1+k3s1}"
readonly ARGOCD_VERSION="${ARGOCD_VERSION:-v2.11.3}"
readonly CILIUM_VERSION="${CILIUM_VERSION:-1.16.0}"
readonly VAULT_VERSION="${VAULT_VERSION:-0.28.1}"

readonly INSTALL_ROOT="${INSTALL_ROOT:-/opt/zeaz}"
readonly LOG_FILE="${LOG_FILE:-/var/log/zeaz-release.log}"

readonly GITOPS_REPO="${GITOPS_REPO:-https://github.com/cvsz/zeaz-platform.git}"
readonly GITOPS_BRANCH="${GITOPS_BRANCH:-main}"

readonly KUBECONFIG_PATH="${KUBECONFIG_PATH:-/etc/rancher/k3s/k3s.yaml}"
readonly VAULT_DEV_MODE="${VAULT_DEV_MODE:-false}"

# ==============================================================================
# LOGGING
# ==============================================================================

ensure_log_path() {
  mkdir -p "$(dirname "$LOG_FILE")"
}

log() {
  ensure_log_path
  echo -e "\033[32m[$(date -Iseconds)] [INFO] $1\033[0m" | tee -a "$LOG_FILE"
}

warn() {
  ensure_log_path
  echo -e "\033[33m[$(date -Iseconds)] [WARN] $1\033[0m" | tee -a "$LOG_FILE"
}

fatal() {
  ensure_log_path
  echo -e "\033[31m[$(date -Iseconds)] [FATAL] $1\033[0m" | tee -a "$LOG_FILE"
  exit 1
}

# ==============================================================================
# CLEANUP / ROLLBACK
# ==============================================================================

rollback() {
  warn "Rollback triggered"

  if command -v kubectl >/dev/null 2>&1; then
    kubectl delete ns argocd --ignore-not-found=true || true
    kubectl delete ns vault --ignore-not-found=true || true
    kubectl delete ns cilium-system --ignore-not-found=true || true
  else
    warn "kubectl unavailable; skipping Kubernetes rollback"
  fi

  warn "Rollback completed"
}

trap rollback ERR

# ==============================================================================
# PRECHECKS
# ==============================================================================

require_root() {
  [[ "$EUID" -eq 0 ]] || fatal "Run as root"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fatal "Missing dependency: $1"
}

precheck() {
  log "Running prechecks"

  require_root

  for cmd in curl jq git systemctl apt-get; do
    require_cmd "$cmd"
  done

  mkdir -p "$INSTALL_ROOT" "$(dirname "$LOG_FILE")"

  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    source /etc/os-release

    case "${ID:-}" in
      ubuntu|debian)
        ;;
      *)
        fatal "Unsupported OS: ${ID:-unknown}"
        ;;
    esac
  else
    fatal "Cannot determine OS: /etc/os-release not found"
  fi
}

# ==============================================================================
# HARDEN OS
# ==============================================================================

harden_os() {
  log "Applying OS hardening"

  swapoff -a || true
  sed -i.bak '/ swap / s/^/#/' /etc/fstab

  cat <<EOF_SYSCTL >/etc/sysctl.d/99-zeaz.conf
vm.swappiness=1
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-iptables=1
fs.inotify.max_user_watches=1048576
EOF_SYSCTL

  modprobe br_netfilter || true
  sysctl --system

  apt-get update -y
  apt-get install -y \
    curl \
    jq \
    git \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release
}

# ==============================================================================
# INSTALL K3S
# ==============================================================================

install_k3s() {
  if command -v k3s >/dev/null 2>&1; then
    warn "k3s already installed"
    export KUBECONFIG="$KUBECONFIG_PATH"
    return
  fi

  log "Installing k3s"

  curl -sfL https://get.k3s.io | \
    INSTALL_K3S_VERSION="$K3S_VERSION" \
    INSTALL_K3S_EXEC="server \
      --disable traefik \
      --disable servicelb \
      --disable-kube-proxy \
      --flannel-backend=none \
      --write-kubeconfig-mode 644" \
    sh -

  export KUBECONFIG="$KUBECONFIG_PATH"

  until kubectl get nodes >/dev/null 2>&1; do
    log "Waiting for Kubernetes API"
    sleep 5
  done
}

# ==============================================================================
# INSTALL HELM
# ==============================================================================

install_helm() {
  if command -v helm >/dev/null 2>&1; then
    warn "Helm already installed"
    return
  fi

  log "Installing Helm"

  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
}

# ==============================================================================
# INSTALL CILIUM
# ==============================================================================

install_cilium() {
  log "Installing Cilium"

  helm repo add cilium https://helm.cilium.io
  helm repo update

  kubectl create namespace cilium-system \
    --dry-run=client -o yaml | kubectl apply -f -

  helm upgrade --install cilium cilium/cilium \
    --namespace cilium-system \
    --version "$CILIUM_VERSION" \
    --set kubeProxyReplacement=true \
    --set k8sServiceHost=127.0.0.1 \
    --set k8sServicePort=6443

  kubectl rollout status ds/cilium \
    -n cilium-system \
    --timeout=300s

  kubectl wait node --all \
    --for=condition=Ready \
    --timeout=300s
}

# ==============================================================================
# INSTALL VAULT
# ==============================================================================

install_vault() {
  log "Installing Vault"

  helm repo add hashicorp https://helm.releases.hashicorp.com
  helm repo update

  kubectl create namespace vault \
    --dry-run=client -o yaml | kubectl apply -f -

  if [[ "$VAULT_DEV_MODE" == "true" ]]; then
    warn "Installing Vault in dev mode; do not use this mode for production secrets"
    helm upgrade --install vault hashicorp/vault \
      --namespace vault \
      --version "$VAULT_VERSION" \
      --set "server.dev.enabled=true"

    kubectl rollout status sts/vault \
      -n vault \
      --timeout=300s
    return
  fi

  helm upgrade --install vault hashicorp/vault \
    --namespace vault \
    --version "$VAULT_VERSION" \
    --set "server.ha.enabled=true" \
    --set "server.ha.raft.enabled=true" \
    --set "server.dataStorage.enabled=true"

  kubectl wait pod \
    -n vault \
    -l app.kubernetes.io/name=vault \
    --for=condition=PodScheduled \
    --timeout=300s

  warn "Vault is installed in HA Raft mode; initialize and unseal Vault before storing production secrets"
}

# ==============================================================================
# INSTALL ARGOCD
# ==============================================================================

install_argocd() {
  log "Installing ArgoCD"

  kubectl create namespace argocd \
    --dry-run=client -o yaml | kubectl apply -f -

  kubectl apply -n argocd \
    -f "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"

  kubectl rollout status deployment/argocd-server \
    -n argocd \
    --timeout=300s
}

# ==============================================================================
# INSTALL OBSERVABILITY
# ==============================================================================

install_observability() {
  log "Installing observability stack"

  helm repo add prometheus-community \
    https://prometheus-community.github.io/helm-charts

  helm repo update

  kubectl create namespace observability \
    --dry-run=client -o yaml | kubectl apply -f -

  helm upgrade --install kube-prometheus-stack \
    prometheus-community/kube-prometheus-stack \
    --namespace observability
}

# ==============================================================================
# GITOPS BOOTSTRAP
# ==============================================================================

bootstrap_gitops() {
  log "Bootstrapping GitOps"

  kubectl apply -n argocd -f - <<EOF_ARGOCD
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: zeaz-platform
spec:
  project: default

  source:
    repoURL: ${GITOPS_REPO}
    targetRevision: ${GITOPS_BRANCH}
    path: k8s

  destination:
    server: https://kubernetes.default.svc
    namespace: zeaz

  syncPolicy:
    automated:
      prune: true
      selfHeal: true

    syncOptions:
      - CreateNamespace=true
EOF_ARGOCD
}

# ==============================================================================
# SECURITY POLICIES
# ==============================================================================

apply_policies() {
  log "Applying security policies"

  kubectl apply -f - <<EOF_POLICY
apiVersion: v1
kind: Namespace
metadata:
  name: zeaz
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: zeaz
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
EOF_POLICY
}

# ==============================================================================
# HEALTH CHECKS
# ==============================================================================

healthcheck() {
  log "Running health checks"

  kubectl get nodes
  kubectl get pods -A

  kubectl wait deployment \
    --all \
    --all-namespaces \
    --for=condition=Available \
    --timeout=600s
}

# ==============================================================================
# SUMMARY
# ==============================================================================

summary() {
  log "======================================================"
  log "ZEAZ RELEASE INSTALL COMPLETED"
  log "======================================================"

  echo
  echo "KUBECONFIG:"
  echo "export KUBECONFIG=${KUBECONFIG_PATH}"
  echo

  echo "ArgoCD:"
  echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
  echo

  echo "Vault:"
  echo "kubectl get pods -n vault"
  echo

  echo "Observability:"
  echo "kubectl get pods -n observability"
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
  precheck
  harden_os
  install_k3s
  install_helm
  install_cilium
  install_vault
  install_argocd
  install_observability
  apply_policies
  bootstrap_gitops
  healthcheck
  summary
}

main "$@"
