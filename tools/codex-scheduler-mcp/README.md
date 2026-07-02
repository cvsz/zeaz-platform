# Codex Scheduler MCP

Local stdio MCP server that schedules bounded Codex repository iterations with user-level systemd timers.

## Tools

- `schedule_wakeup`: schedule `codex exec` after 1-86,400 seconds
- `list_wakeups`: list active or historical wakeups
- `wakeup_status`: inspect one timer and result availability
- `cancel_wakeup`: stop one timer and its service

Scheduled executions use `workspace-write` sandboxing and `approval_policy=never`. The tool never invokes a shell and does not expose an arbitrary command parameter. Metadata and final messages are stored under `${XDG_STATE_HOME:-~/.local/state}/codex-scheduler/`; prompt text is represented only by its SHA-256 digest in metadata. While pending, the same-user systemd transient unit still exposes its `ExecStart` arguments, including the prompt.

## Development

```bash
pnpm --dir tools/codex-scheduler-mcp --ignore-workspace install
pnpm --dir tools/codex-scheduler-mcp --ignore-workspace test
pnpm --dir tools/codex-scheduler-mcp --ignore-workspace build
```

Restart Codex after changing `.codex/config.toml` so the project MCP server is loaded.
