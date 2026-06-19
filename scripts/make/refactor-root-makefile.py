#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
makefile = root / "Makefile"
backup_dir = root / ".backups" / "makefile"
backup_dir.mkdir(parents=True, exist_ok=True)

stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
backup = backup_dir / f"Makefile.{stamp}.bak"
shutil.copy2(makefile, backup)

text = makefile.read_text()

# Remove duplicate token rotate env sync call.
duplicate_sync = (
    '\t@bash scripts/cloudflare/sync-cloudflare-env-files.sh "$${TOKEN_ROTATE_OUT:-$(TOKEN_ROTATE_OUT)}" "$${TOKEN_ROTATE_SYNC_ENV:-$(TOKEN_ROTATE_SYNC_ENV)}"\n'
    '\t@bash scripts/cloudflare/sync-cloudflare-env-files.sh "$${TOKEN_ROTATE_OUT:-$(TOKEN_ROTATE_OUT)}" "$${TOKEN_ROTATE_SYNC_ENV:-$(TOKEN_ROTATE_SYNC_ENV)}"\n'
)
single_sync = (
    '\t@bash scripts/cloudflare/sync-cloudflare-env-files.sh "$${TOKEN_ROTATE_OUT:-$(TOKEN_ROTATE_OUT)}" "$${TOKEN_ROTATE_SYNC_ENV:-$(TOKEN_ROTATE_SYNC_ENV)}"\n'
)
text = text.replace(duplicate_sync, single_sync)

# Remove duplicate adjacent zDash Terraform section header.
text = re.sub(
    r"(# =============================================================================\n# zDash Cloudflare Terraform Integration\n# =============================================================================\n\n)"
    r"# =============================================================================\n# zDash Cloudflare Terraform Integration\n# =============================================================================\n\n",
    r"\1",
    text,
    count=1,
)

# Normalize excessive blank lines around late Cloudflare targets.
text = re.sub(r"\n{3,}(\.PHONY: cf-zdash-token-diagnose)", r"\n\n\1", text)
text = re.sub(r"\n{3,}(\.PHONY: cf-zdash-sync-env)", r"\n\n\1", text)

block = r'''

# =============================================================================
# Phase 55 — Repository deep-dive and Makefile hygiene
# =============================================================================

.PHONY: repo-deep-dive makefile-audit makefile-refactor
repo-deep-dive: ## Generate full repository deep-dive report
	@bash scripts/repo/deep-dive-report.sh

makefile-audit: ## Audit root Makefile for duplicate targets and risky patterns
	@$(PYTHON) scripts/make/audit-makefile.py Makefile

makefile-refactor: ## Re-run safe root Makefile cleanup
	@$(PYTHON) scripts/make/refactor-root-makefile.py
	@$(PYTHON) scripts/make/audit-makefile.py Makefile
'''

if "repo-deep-dive:" not in text:
    text = text.rstrip() + block + "\n"

makefile.write_text(text)
print(f"PASS: refactored Makefile")
print(f"Backup: {backup}")
