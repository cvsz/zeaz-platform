# Omega Safe Installer

This document describes the safe Omega Master Advanced Professional addon installer.

## Files

- `scripts/omega/install-omega-addons.sh` — repo-local installer.
- `scripts/omega/omegactl` — repo-local status/list/doctor helper.
- `.omega/templates/GEMINI_OMEGA_APPEND.md` — append-only Gemini instruction template.

## Default Behavior

The installer is conservative by default:

- Installs repo-local assets only.
- Does not use sudo by default.
- Does not install global binaries by default.
- Does not install global Gemini/Hermes assets unless `--global-install` is passed.
- Skips missing optional source directories with warnings.
- Does not write secrets or deployment credentials.

## Usage

```bash
cd /home/zeazdev/zeaz-platform

# Preview actions.
bash scripts/omega/install-omega-addons.sh --dry-run

# Install repo-local Omega assets.
bash scripts/omega/install-omega-addons.sh

# Optional: install user-level Gemini commands and Hermes skills.
bash scripts/omega/install-omega-addons.sh --global-install

# Optional: install omegactl into /usr/local/bin using sudo when needed.
bash scripts/omega/install-omega-addons.sh --global-bin --yes
```

## Validation

```bash
bash -n scripts/omega/install-omega-addons.sh
bash -n scripts/omega/omegactl
scripts/omega/omegactl status
scripts/omega/omegactl list
scripts/omega/omegactl doctor
```

## Headless Gemini Note

On SSH/headless servers where `DISPLAY` is not set, Gemini interactive paste may fail even when `xsel` and `xclip` are installed. Use prompt files with `gemini -p "$(cat prompt.md)"` instead of interactive paste.
