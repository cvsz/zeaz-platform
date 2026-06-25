# v40 Team Collaboration and Workspaces Manifest

Package: `zai-coder-control-plane-v40-team-collaboration-and-workspaces.zip`

## Purpose

Add collaboration primitives for enterprise teams and workspaces.

## Planned systems

- organization/team workspace registry
- workspace member roles
- shared review queues
- team activity feed
- collaboration comment threads
- workspace invitation plans
- team-level audit log
- team dashboard routes
- collaboration export bundle
- tests and docs

## Planned commands

```bash
make team-collaboration-workspaces
make team-status
make workspace-directory
make team-members
make review-queue
make collaboration-activity
make workspace-invite-plan
make team-export APPLY=1
make team-audit
make team-dashboard-export
```

## Planned routes

```text
/api/team/status
/team
/team/workspaces
/team/members
/team/review-queue
/team/activity
```

## Safety posture

- local-first
- role-gated
- audit logged
- invitation flows are plan-only
- no external email sending
- demo writes require APPLY=1
