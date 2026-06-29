#!/usr/bin/env bash
set -Eeuo pipefail
cat >/etc/sysctl.d/99-zeaz-ai.conf <<'EOF'
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.dirty_ratio=15
vm.dirty_background_ratio=5
fs.file-max=2097152
EOF
sysctl --system
