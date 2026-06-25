# v40 Team Collaboration and Workspaces Manifest

Package: `zai-coder-control-plane-v40-team-collaboration-and-workspaces.zip`

## Build status

- Status: built
- Base package: `zai-coder-control-plane-v39-notification-and-communication-center-fixed.zip`
- Local test result: `291 passed`
- GitHub push scope: text-only source snapshot and manifests under `apps/zai/`
- Binary ZIP artifacts are not committed through this connector.

## Added systems

- organization/team workspace registry
- workspace member roles
- shared review queues
- team activity feed
- workspace invitation plans
- collaboration export bundle
- team dashboard routes
- scripts
- docs
- assets
- tests

## Commands

```bash
make team-collaboration-workspaces
make team-status
make workspace-directory
make team-members
make review-queue
make collaboration-activity
make workspace-invite-plan
make team-demo APPLY=1
make team-export APPLY=1
make team-dashboard-export
make team-collaboration-workspaces-requirements
```

## Routes

```text
/api/team/status
/team
/team/workspaces
/team/members
/team/review-queue
/team/activity
```

## Safety posture

- local-first collaboration state
- role-gated decisions
- invitation flows are plan-only
- no external email sending
- exports are local and review-first
- demo writes require `APPLY=1`

## Source snapshot

A text-only source snapshot for this build is stored under:

```text
apps/zai/releases/v40-team-collaboration-and-workspaces/source/
```
