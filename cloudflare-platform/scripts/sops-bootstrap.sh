#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

: "${SOPS_AGE_KEY:?required}"
mkdir -p .secrets
umask 077
printf '%s\n' "$SOPS_AGE_KEY" > .secrets/age.key
cat > .sops.yaml <<EOT
creation_rules:
  - path_regex: secrets/.*\.enc\.(yaml|json|env)$
    encrypted_regex: '^(data|stringData|token|password|secret|key)$'
    age: ["${SOPS_AGE_KEY}"]
EOT

echo "SOPS bootstrap complete"
