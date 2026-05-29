#!/usr/bin/env bash

###############################################################################
# ZEAZ META OS
# GOOGLE VERTEX AI + GEMINI + NO-COST SAFE INSTALLER
#
# PURPOSE
# - Works WITHOUT billing-enabled GCP services
# - Enables ONLY free-compatible APIs
# - Repairs ADC
# - Repairs IAM
# - Enables Vertex AI safely
# - Avoids Compute Engine dependency
# - Avoids accidental paid infra activation
#
# SAFE FOR:
# - Free Tier
# - Single VPS
# - Docker Compose
# - Cloudflare Tunnel
# - Local AI Runtime
###############################################################################

set -Eeuo pipefail

###############################################################################
# CONFIG
###############################################################################

readonly PROJECT_ID="zeaz-meta-os"
readonly REGION="us-central1"

readonly ACCOUNT="$(
  gcloud config get-value account 2>/dev/null || true
)"

###############################################################################
# COLORS
###############################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

###############################################################################
# LOGGING
###############################################################################

log() {
  echo -e "${GREEN}[INFO]${NC} $*"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

fatal() {
  echo -e "${RED}[FATAL]${NC} $*"
  exit 1
}

###############################################################################
# VALIDATION
###############################################################################

require_binary() {
  command -v "$1" >/dev/null 2>&1 \
    || fatal "Missing dependency: $1"
}

preflight() {
  log "Running preflight checks"

  local deps=(
    gcloud
    python3
    pip3
    jq
    curl
  )

  for dep in "${deps[@]}"; do
    require_binary "${dep}"
  done

  [[ -n "${ACCOUNT}" ]] \
    || fatal "No authenticated gcloud account"

  log "Authenticated account: ${ACCOUNT}"
}

###############################################################################
# PROJECT VALIDATION
###############################################################################

validate_project() {
  log "Validating project access"

  gcloud projects describe "${PROJECT_ID}" \
    >/dev/null 2>&1 \
    || fatal "Cannot access project: ${PROJECT_ID}"

  log "Project accessible"
}

###############################################################################
# CONFIGURE GCLOUD
###############################################################################

configure_gcloud() {
  log "Configuring gcloud"

  gcloud config set project "${PROJECT_ID}"

  gcloud config set ai/region "${REGION}"

  export CLOUDSDK_CORE_DISABLE_PROMPTS=1
}

###############################################################################
# ENABLE FREE SAFE SERVICES
###############################################################################

enable_services() {
  log "Enabling free-compatible APIs"

  local services=(
    aiplatform.googleapis.com
    iam.googleapis.com
    serviceusage.googleapis.com
    cloudresourcemanager.googleapis.com
    logging.googleapis.com
    monitoring.googleapis.com
  )

  for service in "${services[@]}"; do
    log "Enabling ${service}"

    gcloud services enable "${service}" \
      --project="${PROJECT_ID}"
  done
}

###############################################################################
# BILLING CHECK
###############################################################################

check_billing() {
  log "Checking billing state"

  local billing_state

  billing_state="$(
    gcloud beta billing projects describe "${PROJECT_ID}" \
      --format="value(billingEnabled)" \
      2>/dev/null || echo "False"
  )"

  if [[ "${billing_state}" != "True" ]]; then
    warn "Billing NOT enabled"
    warn "Compute/GKE/Cloud Run will NOT be available"
    warn "Vertex AI Gemini API can still work"
  else
    log "Billing enabled"
  fi
}

###############################################################################
# IAM REPAIR
###############################################################################

repair_iam() {
  log "Repairing IAM"

  local roles=(
    roles/serviceusage.serviceUsageConsumer
    roles/aiplatform.user
    roles/ml.developer
    roles/viewer
  )

  for role in "${roles[@]}"; do
    log "Granting ${role}"

    gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
      --member="user:${ACCOUNT}" \
      --role="${role}" \
      --quiet >/dev/null
  done
}

###############################################################################
# ADC REPAIR
###############################################################################

repair_adc() {
  log "Repairing ADC"

  gcloud auth application-default login \
    --quiet || true

  gcloud auth application-default set-quota-project \
    "${PROJECT_ID}" || warn "ADC quota project warning ignored"
}

###############################################################################
# PYTHON AI SDKS
###############################################################################

install_sdks() {
  log "Installing AI SDKs"

  pip3 install --upgrade \
    pip \
    google-cloud-aiplatform \
    google-generativeai \
    langchain-google-vertexai \
    langgraph \
    redis \
    psycopg[binary]
}

###############################################################################
# ENV EXPORTS
###############################################################################

write_env() {
  log "Writing runtime environment"

  mkdir -p .runtime

  cat > .runtime/google.env <<EOF
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"
export GOOGLE_CLOUD_REGION="${REGION}"
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_APPLICATION_CREDENTIALS="${HOME}/.config/gcloud/application_default_credentials.json"
EOF

  log "Environment file created"
}

###############################################################################
# VERTEX TEST
###############################################################################

verify_vertex() {
  log "Testing Gemini Vertex runtime"

  python3 <<'PY'
import sys

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel

    PROJECT_ID = "zeaz-meta-os"
    REGION = "us-central1"

    vertexai.init(
        project=PROJECT_ID,
        location=REGION,
    )

    model = GenerativeModel("gemini-2.0-flash")

    response = model.generate_content(
        "ZEAZ META OS verification"
    )

    print("\n================================================")
    print("VERTEX AI RESPONSE")
    print("================================================")
    print(response.text)
    print("================================================")

except Exception as exc:
    print(f"\n[ERROR] {exc}")
    sys.exit(1)
PY
}

###############################################################################
# MAKEFILE PATCH
###############################################################################

patch_makefile() {
  log "Patching Makefile"

  if [[ ! -f Makefile ]]; then
    warn "Makefile not found"
    return
  fi

  if grep -q "zaiz-vertex-test" Makefile; then
    log "Makefile already patched"
    return
  fi

  cat >> Makefile <<'EOF'

###############################################################################
# GOOGLE VERTEX AI
###############################################################################

zaiz-vertex-test:
	python3 scripts/test_vertex.py

zaiz-gcloud-env:
	bash scripts/google_vertex_runtime.sh
EOF

  log "Makefile patched"
}

###############################################################################
# TEST SCRIPT
###############################################################################

write_test_script() {
  log "Generating Vertex test script"

  mkdir -p scripts

  cat > scripts/test_vertex.py <<'PY'
import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(
    project="zeaz-meta-os",
    location="us-central1",
)

model = GenerativeModel("gemini-2.0-flash")

response = model.generate_content(
    "ZEAZ META OS online"
)

print(response.text)
PY
}

###############################################################################
# FINAL REPORT
###############################################################################

final_report() {
  echo
  echo "=============================================================================="
  echo "ZEAZ META OS :: GEMINI RUNTIME READY"
  echo "=============================================================================="
  echo
  echo "PROJECT:"
  echo "  ${PROJECT_ID}"
  echo
  echo "ACCOUNT:"
  echo "  ${ACCOUNT}"
  echo
  echo "REGION:"
  echo "  ${REGION}"
  echo
  echo "SAFE MODE:"
  echo "  NO-COST"
  echo
  echo "SUPPORTED:"
  echo "  ✓ Gemini"
  echo "  ✓ Vertex AI"
  echo "  ✓ LangGraph"
  echo "  ✓ Docker Compose"
  echo "  ✓ Cloudflare Tunnel"
  echo
  echo "NOT REQUIRED:"
  echo "  ✗ Compute Engine"
  echo "  ✗ GKE"
  echo "  ✗ Cloud Run"
  echo
  echo "TEST:"
  echo "  make zaiz-vertex-test"
  echo
  echo "ENV:"
  echo "  source .runtime/google.env"
  echo
  echo "=============================================================================="
}

###############################################################################
# FIX PEP668 / EXTERNALLY-MANAGED-ENVIRONMENT
#
# Ubuntu 24.04 / Debian 12+ blocks system pip installs.
# ZEAZ META OS should NEVER install AI SDKs globally.
#
# FIX:
# - create isolated runtime venv
# - install SDKs inside .venv
# - patch Makefile
# - patch runtime scripts
###############################################################################

install_sdks() {
  log "Preparing isolated Python runtime"

  local VENV_DIR=".venv"

  if [[ ! -d "${VENV_DIR}" ]]; then
    log "Creating virtual environment"

    python3 -m venv "${VENV_DIR}"
  fi

  # shellcheck disable=SC1091
  source "${VENV_DIR}/bin/activate"

  log "Upgrading pip/setuptools/wheel"

  python -m pip install \
    --upgrade \
    pip \
    setuptools \
    wheel

  log "Installing ZEAZ META OS AI SDKs"

  python -m pip install \
    --upgrade \
    google-cloud-aiplatform \
    google-generativeai \
    langchain-google-vertexai \
    langchain \
    langgraph \
    fastapi \
    uvicorn \
    redis \
    psycopg[binary] \
    websockets \
    httpx \
    numpy \
    pandas \
    pydantic \
    docker

  deactivate

  log "Virtual environment ready"
}

###############################################################################
# MAIN
###############################################################################

main() {
  preflight
  validate_project
  configure_gcloud
  check_billing
  enable_services
  repair_iam
  repair_adc
  install_sdks
  write_env
  write_test_script
  patch_makefile
  verify_vertex
  final_report
}

main "$@"
