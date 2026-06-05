# OpenWork — master control surface
#
# Usage:
#   make help           list available targets
#   make install        install deps + systemd user unit
#   make dev            run in the foreground (no systemd)
#   make start          start the systemd user service
#   make stop           stop the service
#   make restart        restart the service
#   make status         show service status
#   make logs           recent journal entries
#   make follow         tail journal live
#   make enable         start on user login
#   make disable        stop starting on user login
#   make uninstall      remove service unit + env
#   make bootstrap      one-shot installer (opencode CLI + harness + MCPs)
#   make bootstrap-verify  show what bootstrap would do / did
#   make stage-harness  copy current ~/.config/opencode harness into repo
#
# Modes (override with `make mode=<m> <target>`):
#   electron  pnpm dev                  (Vite + Electron desktop)   [default]
#   ui        pnpm dev:ui               (Vite UI only)
#   web       pnpm dev:headless-web     (Vite UI in a browser)
#   den       pnpm dev:den-docker       (Den API + web + inference)
#
# Overrides (case-sensitive — match the variable name exactly):
#   make mode=ui        dev
#   make node=/opt/n/bin/node          restart
#   make pnpm=corepack                 start
#   make service_name=openwork-web     start
#   make env_file=$PWD/.env.local      start
#   make log_dir=/var/log/openwork     install
#
# Bootstrap overrides (passed straight to scripts/install-openwork.sh):
#   make bootstrap-minimal             # skip desktop app + project deps
#   make bootstrap-dry                 # show what would change
#   OPENWORK_NONINTERACTIVE=1 make bootstrap   # no prompts

SHELL := /bin/bash

mode            ?= electron
service_name    ?= openwork
node_bin        ?= node
pnpm_bin        ?= pnpm
env_file        ?= $(HOME)/.config/openwork/openwork.env
log_dir         ?= $(HOME)/.local/share/openwork/log

root_dir        := $(shell pwd)
xdg_config_home := $(HOME)/.config
unit_dir        := $(xdg_config_home)/systemd/user
unit_file       := $(unit_dir)/$(service_name).service
repo_unit_file  := $(root_dir)/packaging/systemd/$(service_name).service
example_env     := $(root_dir)/packaging/systemd/openwork.env.example

# pnpm script names per mode. Dispatch is in the recipe (GNU make `ifeq`
# runs at parse time, before CLI variable overrides apply).
script_dev  := dev
script_ui   := dev:ui
script_web  := dev:headless-web
script_den  := dev:den-docker

.PHONY: help
help: ## list available targets
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: doctor
doctor: ## sanity check the toolchain and env
	@echo "→ toolchain"
	@command -v $(node_bin) >/dev/null 2>&1 || { echo "  ✗ node not found"; exit 1; }; echo "  ✓ node: $$($(node_bin) --version)"
	@command -v $(pnpm_bin)  >/dev/null 2>&1 || { echo "  ✗ pnpm not found"; exit 1; }; echo "  ✓ pnpm: $$($(pnpm_bin) --version)"
	@echo "→ mode"
	@case "$(mode)" in electron) s="$(script_dev)";; ui) s="$(script_ui)";; web) s="$(script_web)";; den) s="$(script_den)";; *) echo "  ✗ invalid mode=$(mode)"; exit 1;; esac; echo "  ✓ mode=$(mode) → pnpm $$s"
	@echo "→ paths"
	@echo "  • repo:        $(root_dir)"
	@echo "  • env file:    $(env_file)"
	@echo "  • unit file:   $(unit_file)"
	@echo "  • log dir:     $(log_dir)"

.PHONY: install
install: install-deps install-service ## install deps + systemd user unit
	@echo "✓ installed. Next: edit $(env_file), then 'make start'"

.PHONY: install-deps
install-deps: ## run pnpm install
	$(pnpm_bin) install --frozen-lockfile

.PHONY: install-service
install-service: ## install + enable the systemd user unit
	@mkdir -p "$(unit_dir)" "$(dir $(env_file))" "$(log_dir)"
	@install -m 0644 "$(repo_unit_file)" "$(unit_file)"
	@if [ ! -f "$(env_file)" ]; then install -m 0600 "$(example_env)" "$(env_file)"; echo "  • wrote env template: $(env_file)"; fi
	-systemctl --user daemon-reload
	@echo "  ✓ installed $(unit_file)"

.PHONY: start
start: ## start the service
	systemctl --user start $(service_name).service

.PHONY: stop
stop: ## stop the service
	systemctl --user stop $(service_name).service

.PHONY: restart
restart: ## restart the service
	systemctl --user restart $(service_name).service

.PHONY: reload
reload: ## daemon-reload + restart
	systemctl --user daemon-reload
	systemctl --user restart $(service_name).service

.PHONY: status
status: ## show service status
	-systemctl --user status $(service_name).service --no-pager

.PHONY: logs
logs: ## show last 200 log lines
	journalctl --user -u $(service_name).service -n 200 --no-pager

.PHONY: follow
follow: ## tail the journal live
	journalctl --user -u $(service_name).service -f

.PHONY: enable
enable: ## start on user login
	systemctl --user enable $(service_name).service
	@systemctl --user is-enabled $(service_name).service

.PHONY: disable
disable: ## stop starting on user login
	systemctl --user disable $(service_name).service
	-@systemctl --user is-enabled $(service_name).service

.PHONY: dev
dev: ## run pnpm in the foreground (bypasses systemd)
	@case "$(mode)" in electron) s="$(script_dev)";; ui) s="$(script_ui)";; web) s="$(script_web)";; den) s="$(script_den)";; *) echo "✗ invalid mode=$(mode). Use one of: electron, ui, web, den" >&2; exit 1;; esac; echo "→ pnpm $$s"; OPENWORK_DEV_MODE=1 exec $(pnpm_bin) "$$s"

.PHONY: uninstall
uninstall: ## remove the systemd unit (env file is kept)
	-systemctl --user disable --now $(service_name).service
	-@rm -f "$(unit_file)"
	-systemctl --user daemon-reload
	@echo "  ✓ removed $(unit_file)"
	@echo "  • env file left in place: $(env_file) (rm manually if desired)"

.PHONY: clean
clean: stop ## stop service + clear local caches
	-$(pnpm_bin) store prune
	@rm -rf "$(root_dir)/.turbo" "$(root_dir)/node_modules/.cache"
	@echo "  ✓ cleaned"

.PHONY: purge
purge: uninstall clean ## uninstall + clean
	@echo "✓ purged"

# ---- one-shot bootstrap installer -------------------------------------------
# Self-contained: installs opencode CLI, pnpm, uv, the chrome-devtools plugin,
# the user-level harness (60+ agents, 75+ commands, 4 skill paths, 46 MCPs),
# and the project deps. Idempotent. Cross-platform via scripts/install-openwork.{sh,ps1}.
BS_SCRIPT := $(root_dir)/scripts/install-openwork.sh

.PHONY: bootstrap
bootstrap: ## run one-shot installer (opencode CLI + harness + MCPs)
	@if command -v pwsh >/dev/null 2>&1 && [[ "$$(uname -s 2>/dev/null)" == "Windows*"||
	                                            "$$OSTYPE" == "msys" || "$$OSTYPE" == "cygwin" ]]; then \
	  echo "→ pwsh detected, forwarding to install-openwork.ps1"; \
	  pwsh -NoProfile -ExecutionPolicy Bypass -File "$$(cygpath -w '$(BS_SCRIPT:.sh=.ps1)')"; \
	else \
	  OPENWORK_NONINTERACTIVE=$${OPENWORK_NONINTERACTIVE:-0} bash '$(BS_SCRIPT)'; \
	fi

.PHONY: bootstrap-minimal
bootstrap-minimal: ## bootstrap --minimal (skip desktop app + project deps)
	OPENWORK_NONINTERACTIVE=$${OPENWORK_NONINTERACTIVE:-0} bash '$(BS_SCRIPT)' --minimal

.PHONY: bootstrap-dry
bootstrap-dry: ## show what bootstrap would do
	bash '$(BS_SCRIPT)' --dry-run

.PHONY: bootstrap-verify
bootstrap-verify: ## report current install state (no changes)
	bash '$(BS_SCRIPT)' --verify

.PHONY: bootstrap-uninstall
bootstrap-uninstall: ## remove the user-level harness (keeps opencode CLI)
	bash '$(BS_SCRIPT)' --uninstall

.PHONY: stage-harness
stage-harness: ## copy current ~/.config/opencode harness into scripts/harness/
	bash '$(root_dir)/scripts/stage-harness.sh'

.PHONY: bootstrap-windows
bootstrap-windows: ## print the Windows PowerShell command (run on the Windows host)
	@echo 'On Windows (PowerShell 5+ as Administrator):'
	@echo '  powershell -ExecutionPolicy Bypass -File scripts\install-openwork.ps1'
	@echo 'or just double-click:'
	@echo '  scripts\install-openwork.cmd'
