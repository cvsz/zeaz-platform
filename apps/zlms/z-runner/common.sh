#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

umask 077

log() {
  local level="$1"; shift
  printf '{"ts":"%s","level":"%s","component":"z-runner","msg":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$level" "$(printf '%s' "$*" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')"
}

fatal() { log error "$*"; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || fatal "required command missing: $1"; }

load_env() {
  local env_file="${ZR_ENV_FILE:-/etc/z-runner/runner.env}"
  if [[ -f "$env_file" ]]; then
    # shellcheck disable=SC1090
    set -a; source "$env_file"; set +a
  fi
}

require_nonempty() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fatal "required environment variable is empty: $name"
}

json_escape() { python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'; }

labels_csv() {
  local labels_file="${RUNNER_LABELS_FILE:-/etc/z-runner/labels.json}"
  require_cmd python3
  [[ -f "$labels_file" ]] || fatal "labels file not found: $labels_file"
  python3 - "$labels_file" <<'PY'
import json, re, sys
path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    data = json.load(fh)
labels = data.get("labels", [])
if not isinstance(labels, list) or not labels:
    raise SystemExit("labels must be a non-empty list")
for label in labels:
    if not isinstance(label, str) or not re.fullmatch(r"[A-Za-z0-9_.:-]{1,64}", label):
        raise SystemExit(f"invalid label: {label!r}")
print(",".join(dict.fromkeys(labels)))
PY
}

runner_url() {
  require_nonempty RUNNER_SCOPE
  require_nonempty GITHUB_OWNER
  case "$RUNNER_SCOPE" in
    org) printf '%s/%s\n' "${GITHUB_URL:-https://github.com}" "$GITHUB_OWNER" ;;
    repo)
      require_nonempty GITHUB_REPOSITORY
      printf '%s/%s/%s\n' "${GITHUB_URL:-https://github.com}" "$GITHUB_OWNER" "$GITHUB_REPOSITORY"
      ;;
    *) fatal "RUNNER_SCOPE must be org or repo" ;;
  esac
}

api_path_prefix() {
  require_nonempty RUNNER_SCOPE
  require_nonempty GITHUB_OWNER
  case "$RUNNER_SCOPE" in
    org) printf 'orgs/%s/actions/runners' "$GITHUB_OWNER" ;;
    repo)
      require_nonempty GITHUB_REPOSITORY
      printf 'repos/%s/%s/actions/runners' "$GITHUB_OWNER" "$GITHUB_REPOSITORY"
      ;;
    *) fatal "RUNNER_SCOPE must be org or repo" ;;
  esac
}

github_app_jwt() {
  require_cmd openssl
  require_cmd python3
  require_nonempty GITHUB_APP_ID
  require_nonempty GITHUB_APP_PRIVATE_KEY_FILE
  [[ -r "$GITHUB_APP_PRIVATE_KEY_FILE" ]] || fatal "GitHub App private key is not readable"
  python3 - "$GITHUB_APP_ID" "$GITHUB_APP_PRIVATE_KEY_FILE" <<'PY'
import base64, json, subprocess, sys, time
app_id, key_file = sys.argv[1], sys.argv[2]
def b64url(raw: bytes) -> bytes:
    return base64.urlsafe_b64encode(raw).rstrip(b"=")
header = b64url(json.dumps({"alg":"RS256","typ":"JWT"}, separators=(",", ":")).encode())
now = int(time.time())
payload = b64url(json.dumps({"iat": now - 60, "exp": now + 540, "iss": app_id}, separators=(",", ":")).encode())
signing_input = header + b"." + payload
sig = subprocess.check_output(["openssl", "dgst", "-sha256", "-sign", key_file], input=signing_input)
print((signing_input + b"." + b64url(sig)).decode())
PY
}

github_installation_token() {
  require_cmd curl
  require_cmd python3
  require_nonempty GITHUB_APP_INSTALLATION_ID
  local jwt token_file body
  jwt="$(github_app_jwt)"
  body="$(curl -fsS -X POST \
    -H 'Accept: application/vnd.github+json' \
    -H 'X-GitHub-Api-Version: 2022-11-28' \
    -H "Authorization: Bearer $jwt" \
    "${GITHUB_API_URL:-https://api.github.com}/app/installations/${GITHUB_APP_INSTALLATION_ID}/access_tokens")"
  token_file="${RUNNER_TOKEN_FILE:-/run/z-runner/github-token}"
  install -d -m 0700 "$(dirname "$token_file")"
  tmp_body="$(mktemp)"
  printf '%s' "$body" > "$tmp_body"
  python3 - "$token_file" "$tmp_body" <<'PY'
import json, os, sys
path, body_path = sys.argv[1], sys.argv[2]
with open(body_path, encoding="utf-8") as fh:
    data = json.load(fh)
token = data.get("token")
if not token:
    raise SystemExit("GitHub installation token missing in API response")
with open(path, "w", encoding="utf-8") as fh:
    fh.write(token)
os.chmod(path, 0o600)
PY
  cat "$token_file"
  rm -f "$token_file" "$tmp_body"

}

github_api() {
  local method="$1" path="$2" token
  token="$(github_installation_token)"
  curl -fsS -X "$method" \
    -H 'Accept: application/vnd.github+json' \
    -H 'X-GitHub-Api-Version: 2022-11-28' \
    -H "Authorization: Bearer $token" \
    "${GITHUB_API_URL:-https://api.github.com}/${path}"
}

registration_token() {
  github_api POST "$(api_path_prefix)/registration-token" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])'
}

removal_token() {
  github_api POST "$(api_path_prefix)/remove-token" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])'
}

safe_runner_name() {
  local suffix
  suffix="$(hostname)-$(date -u +%Y%m%d%H%M%S)-$"
  printf '%s-%s' "${RUNNER_NAME_PREFIX:-zrunner}" "$suffix" | tr -cd 'A-Za-z0-9_.:-' | cut -c1-64
}
