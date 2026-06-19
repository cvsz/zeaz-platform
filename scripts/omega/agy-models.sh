#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${REPO:-/home/zeazdev/zeaz-platform}"
CONFIG="${CONFIG:-$REPO/.agy/models.json}"
CMD="${1:-list}"

cd "$REPO"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

need_config() {
  [[ -f "$CONFIG" ]] || die "missing config: $CONFIG"
}

validate() {
  need_config
  node - "$CONFIG" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const errors = [];
const warnings = [];

if (data.version !== 1) errors.push("version must be 1");
if (!Array.isArray(data.profiles)) errors.push("profiles must be an array");

const ids = new Set();

for (const [index, profile] of (data.profiles || []).entries()) {
  const prefix = `profiles[${index}]`;

  for (const key of ["id", "provider", "model", "base_url", "api_key_env"]) {
    if (!profile[key] || typeof profile[key] !== "string") {
      errors.push(`${prefix}.${key} must be a non-empty string`);
    }
  }

  if (profile.id) {
    if (ids.has(profile.id)) errors.push(`duplicate profile id: ${profile.id}`);
    ids.add(profile.id);
  }

  if (profile.api_key || profile.apiKey || profile.key) {
    errors.push(`${prefix} must not contain inline API keys`);
  }

  if (typeof profile.context_window !== "number") {
    errors.push(`${prefix}.context_window must be a number`);
  } else if (profile.context_window < 64000) {
    warnings.push(`${profile.id}: context_window below 64k; not suitable for large-context agents`);
  }
}

for (const [route, profileId] of Object.entries(data.routes || {})) {
  if (!ids.has(profileId)) {
    errors.push(`route ${route} points to missing profile: ${profileId}`);
  }
}

console.log(JSON.stringify({ ok: errors.length === 0, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
NODE
}

list() {
  need_config
  node - "$CONFIG" <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

for (const profile of data.profiles || []) {
  console.log(`${profile.id}\t${profile.provider}\t${profile.model}\t${profile.context_window}`);
}
NODE
}

show_routes() {
  need_config
  node - "$CONFIG" <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

for (const [route, profile] of Object.entries(data.routes || {})) {
  console.log(`${route} -> ${profile}`);
}
NODE
}

case "$CMD" in
  validate) validate ;;
  list) list ;;
  routes) show_routes ;;
  *)
    echo "Usage: $0 {list|routes|validate}"
    exit 2
    ;;
esac
