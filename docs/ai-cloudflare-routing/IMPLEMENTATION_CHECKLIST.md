# Implementation Checklist

## Pre-flight

- [ ] Confirm branch is clean: `git status --short`
- [ ] Confirm current branch: `git branch --show-current`
- [ ] Backup current config: `cp infra/cloudflare/config.yml infra/cloudflare/config.yml.bak.$(date +%Y%m%d%H%M%S)`
- [ ] Confirm no secrets in working tree.
- [ ] Confirm `.env*` is ignored.
- [ ] Confirm Cloudflare zone ID and tunnel ID are known locally.

## Implementation

- [ ] Add domain map.
- [ ] Generate cloudflared ingress config.
- [ ] Compare generated config to existing `infra/cloudflare/config.yml`.
- [ ] Add missing hostnames only.
- [ ] Add Traefik routers or labels per app.
- [ ] Add Access policy docs for admin/team/API surfaces.
- [ ] Add Makefile helper targets.

## Validation

- [ ] Domain map validator passes.
- [ ] YAML validator passes.
- [ ] cloudflared ingress validator passes.
- [ ] DNS plan is dry-run first.
- [ ] Docker compose config validates.
- [ ] Traefik dashboard is not exposed without Access.
- [ ] API CORS is restricted.
- [ ] Security headers middleware is attached.
- [ ] Existing production hostnames remain functional.

## Apply

- [ ] Review diff.
- [ ] Commit with clear message.
- [ ] Apply DNS only with `APPLY=true CONFIRM_DNS_APPLY=yes`.
- [ ] Restart cloudflared gracefully.
- [ ] Verify hostnames with curl and dig.
- [ ] Write release evidence report.
