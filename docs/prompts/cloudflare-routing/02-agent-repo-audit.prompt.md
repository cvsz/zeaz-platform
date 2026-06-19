# AI Agent Prompt — Deep Repo Audit Before Cloudflare Update

Scan the repository before editing.

Audit checklist:
- Find current tunnel config files.
- Find current Traefik static/dynamic config.
- Find Docker Compose service names and networks.
- Identify whether `proxy` external network exists or is created by bootstrap.
- Detect each app runtime: Dockerfile, package.json, pyproject, compose file, exposed port, health endpoint.
- Detect existing hostnames and aliases.
- Detect CI/Makefile validation targets.
- Detect secrets accidentally tracked.
- Detect mismatch between docs and active config.

Return:
1. Architecture summary.
2. Current routing table.
3. Missing requested hostnames.
4. Conflicting hostnames.
5. Recommended patch plan.
6. Risk table: low/medium/high.
7. Commands to verify without applying.
