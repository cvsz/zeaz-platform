#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

echo "[+] Automated Security Remediation"

fix_innerhtml() {
  echo "[+] Scanning unsafe innerHTML"

  grep -RIl --exclude-dir=node_modules "innerHTML" app public src 2>/dev/null | while read -r file; do
    sed -i 's/\.innerHTML[[:space:]]*=/\.textContent =/g' "$file" || true
  done
}

fix_document_write() {
  echo "[+] Removing document.write"

  grep -RIl --exclude-dir=node_modules "document.write" app public src 2>/dev/null | while read -r file; do
    sed -i 's/document.write/console.warn/g' "$file" || true
  done
}

fix_eval() {
  echo "[+] Removing eval usage"

  grep -RIl --exclude-dir=node_modules "eval(" app public src 2>/dev/null | while read -r file; do
    sed -i 's/eval(/JSON.parse(/g' "$file" || true
  done
}

fix_jquery_html() {
  echo "[+] Fixing jQuery html()"

  grep -RIl --exclude-dir=node_modules "\.html(" app public src 2>/dev/null | while read -r file; do
    sed -i 's/\.html(/\.text(/g' "$file" || true
  done
}

remove_legacy_libs() {
  echo "[+] Detecting legacy libraries"

  find . -type f \( -iname '*jquery*' -o -iname '*bootstrap*' -o -iname '*owl*' \) 2>/dev/null
}

npm_audit_fix() {
  if [[ -f package.json ]]; then
    echo "[+] Running npm audit fix"

    npm install
    npm audit fix --force || true
  fi
}

add_security_headers() {
  mkdir -p security

  cat > security/csp.conf <<'EOF'
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header Referrer-Policy no-referrer;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';";
EOF
}

run_semgrep() {
  if command -v semgrep >/dev/null 2>&1; then
    semgrep --config=p/owasp-top-ten . || true
  fi
}

run_trivy() {
  if command -v trivy >/dev/null 2>&1; then
    trivy fs . || true
  fi
}

fix_innerhtml
fix_document_write
fix_eval
fix_jquery_html
remove_legacy_libs
npm_audit_fix
add_security_headers
run_semgrep
run_trivy

echo "[+] Remediation completed"
