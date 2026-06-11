# Cloudflare No-Mutation Policy

## Forbidden Commands
The following automated configuration routines are strictly blocked from implicit execution within standard CI actions and background validation scripts:
- `wrangler deploy`
- `wrangler publish`
- `terraform apply`
- `tofu apply`
- `cloudflared tunnel delete`
- `cloudflared tunnel create`
- `cloudflared tunnel route dns`

## Forbidden API Methods
Scripts and automated pipelines are forbidden from making HTTP requests that perform state mutation:
- `POST api.cloudflare.com/*`
- `PUT api.cloudflare.com/*`
- `PATCH api.cloudflare.com/*`
- `DELETE api.cloudflare.com/*`

## Forbidden Secret Handling Patterns
Under no circumstances may a script or developer print sensitive contexts:
- Printing `$CLOUDFLARE_API_TOKEN` or `$CF_API_TOKEN`
- Using `cat` to output raw `/etc/cloudflared/*.json` or `/etc/cloudflared/config.yml`
- Displaying `/infra/cloudflare/creds.json`
- Indiscriminate dumping of environments using `env | grep TOKEN` or `set | grep SECRET`

## Allowed Read-Only Commands
- `terraform plan`
- `tofu plan`
- `wrangler whoami`
- `cloudflared tunnel info`
- `curl -X GET https://api.cloudflare.com/*` (provided headers do not echo tokens into standard output streams)

## Allowed Local/Offline Scans
- All scripts under `infra/cloudflare/scripts/` prefixed with `scan-` or `check-`
- `validate-cloudflare-config.sh`
- Local `grep` validations for ownership parsing

## Allowed Generated Docs
- Governance markdown outputs (e.g. `docs/infra/cloudflare-runtime-governance-report.md`)
- Tabular validation logs
- Anonymized binding and routing definitions where IDs and sensitive URLs are redacted

## CI/Local Enforcement Model
The file `infra/cloudflare/scripts/check-cloudflare-no-mutation.sh` operates as an aggressive static inspection tool. In strict mode (`--strict`), it evaluates all shell scripts, executable configurations, Node.js files, and `package.json` configurations. Any matched forbidden command triggers a terminal blocker (`exit 1`), deliberately breaking the workflow. 

## Exception Process
Exceptions are exclusively granted when manual intent is required for controlled environment rollout. This must involve:
1. Validating that the PR is explicitly categorized as an infrastructure apply PR.
2. Confirming explicit human sign-off via a GitHub environment approval step.
3. Overriding the `--strict` behavior on a tightly scoped deployment runner, fully decoupled from the standard validation matrix.
