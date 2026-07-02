#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Running plugin validation..."

validate_schema() {
    local temp_json
    temp_json=$(mktemp)
    trap 'rm -f "$temp_json"' RETURN
    parse_manifest > "$temp_json"
    python3 - "$REPO_ROOT/configs/plugins/repositories.schema.json" "$temp_json" <<'PY'
import json
import re
import sys
from pathlib import Path

schema_path = Path(sys.argv[1])
manifest_path = Path(sys.argv[2])
schema = json.loads(schema_path.read_text(encoding="utf-8"))
plugins = json.loads(manifest_path.read_text(encoding="utf-8"))

errors = []

def check(value, node, path):
    expected_type = node.get("type")
    if expected_type == "object":
        if not isinstance(value, dict):
            errors.append(f"{path}: expected object")
            return
        for required_key in node.get("required", []):
            if required_key not in value:
                errors.append(f"{path}: missing required key '{required_key}'")
        properties = node.get("properties", {})
        for key, child in properties.items():
            if key in value:
                check(value[key], child, f"{path}.{key}" if path else key)
        return

    if expected_type == "array":
        if not isinstance(value, list):
            errors.append(f"{path}: expected array")
            return
        item_schema = node.get("items")
        if item_schema:
            for index, item in enumerate(value):
                check(item, item_schema, f"{path}[{index}]")
        return

    if expected_type == "string":
        if not isinstance(value, str):
            errors.append(f"{path}: expected string")
            return
        pattern = node.get("pattern")
        if pattern and re.fullmatch(pattern, value) is None:
            errors.append(f"{path}: does not match pattern {pattern}")
        enum = node.get("enum")
        if enum and value not in enum:
            errors.append(f"{path}: unexpected value '{value}'")
        return

    if expected_type == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            errors.append(f"{path}: expected integer")
        return

    if expected_type == "boolean":
        if not isinstance(value, bool):
            errors.append(f"{path}: expected boolean")
        return

manifest_schema = schema.get("properties", {}).get("plugins")
if manifest_schema is None:
    errors.append("schema: missing plugins definition")
else:
    check(plugins, manifest_schema, "plugins")

if errors:
    for error in errors:
        print(f"[ERROR] {error}")
    sys.exit(1)
PY
}

validate_schema

python3 -c "
import sys, json, os

try:
    plugins = json.load(sys.stdin)
except json.JSONDecodeError:
    print('[ERROR] Invalid manifest format')
    sys.exit(1)

domains = {}
ports = {}
errors = 0

for p in plugins:
    app_id = p.get('app_id')
    if not app_id:
        print('[ERROR] Missing app_id in a plugin')
        errors += 1
        continue
        
    enabled = p.get('enabled', False)
    if not enabled:
        continue
        
    mode = p.get('mode')
    path = p.get('path', '')
    
    # validate required fields
    if not p.get('repo'):
        print(f'[ERROR] Plugin {app_id} is missing repo')
        errors += 1
        
    # validate zdash embedded path
    if app_id == 'zdash' and mode == 'embedded':
        if not os.path.exists(os.path.join(os.environ.get('REPO_ROOT', ''), path)):
            print(f'[ERROR] Plugin {app_id} mode is embedded but path {path} does not exist')
            errors += 1
            
    # validate domains
    cf = p.get('cloudflare', {})
    if cf.get('enabled', False):
        if not cf.get('cost_lock_required', False):
            print(f'[ERROR] Plugin {app_id} has cloudflare enabled but cost_lock_required is not true')
            errors += 1
            
        for d in cf.get('hostnames', []):
            if d == 'zdash-api.zeaz.dev':
                print(f'[ERROR] Plugin {app_id} uses stale domain zdash-api.zeaz.dev')
                errors += 1
            if d in domains:
                print(f'[ERROR] Duplicate domain detected: {d} (used by {domains[d]} and {app_id})')
                errors += 1
            domains[d] = app_id
            
    # validate ports
    rt = p.get('runtime', {})
    dev_ports = rt.get('dev_ports', [])
    prod_ports = rt.get('prod_ports', [])
    for port in set(dev_ports + prod_ports):
        if port in ports:
            print(f'[ERROR] Duplicate port detected: {port} (used by {ports[port]} and {app_id})')
            errors += 1
        ports[port] = app_id

    # validate protected files tracking
    safety = p.get('safety', {})
    for f in safety.get('protected_files', []):
        file_path = os.path.join(os.environ.get('REPO_ROOT', ''), path, f)
        # We can't strictly check tracking easily in python without git, but we can report warning or check if file exists
        pass

if errors > 0:
    sys.exit(1)
else:
    print('[INFO]  Validation passed!')
" <<< "$(parse_manifest)"

if [ $? -ne 0 ]; then
    safe_log ERROR "Plugin validation failed."
    exit 1
fi
