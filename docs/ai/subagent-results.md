# Sub-Agent Results Mailbox

This repository includes a local mailbox tool for receiving sub-agent results when the runtime can spawn an agent but does not automatically stream the final answer back into the current chat session.

## CLI

Use:

```bash
python3 scripts/ai/subagent_results.py --help
```

Results are stored under:

```text
artifacts/subagents/results/
```

## Save a result

```bash
python3 scripts/ai/subagent_results.py submit \
  --agent-id 019ec6ac-a368-7b91-a6c4-41aeaee6452e \
  --nickname Cicero \
  --role code-architect \
  --status completed \
  --summary "Analyzed apps/ztrader and proposed folder consolidation."
```

Or submit a larger payload from files/stdin:

```bash
python3 scripts/ai/subagent_results.py submit \
  --agent-id 019ec6ac-a368-7b91-a6c4-41aeaee6452e \
  --nickname Cicero \
  --role code-architect \
  --summary-file /tmp/cicero-summary.md \
  --details-file /tmp/cicero-details.md
```

## Read the latest result

```bash
python3 scripts/ai/subagent_results.py get --agent-id 019ec6ac-a368-7b91-a6c4-41aeaee6452e
```

## List stored results

```bash
python3 scripts/ai/subagent_results.py list
python3 scripts/ai/subagent_results.py list --nickname Cicero
python3 scripts/ai/subagent_results.py list --json
```

## zaictl shortcuts

```bash
./scripts/zaictl.sh agent result-list
./scripts/zaictl.sh agent result-get 019ec6ac-a368-7b91-a6c4-41aeaee6452e
```

## Intended workflow

1. Spawn or invoke a sub-agent from the active runtime.
2. Capture the sub-agent's final answer from the agent UI, log, or external orchestrator.
3. Store the result with `subagent_results.py submit`.
4. Retrieve or summarize it later with `get` or `list`.

This tool is intentionally simple and local-first. It does not replace runtime-native sub-agent transport; it provides a reliable repository mailbox when that transport is unavailable.
