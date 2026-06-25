# v39 Notification and Communication Center Manifest

Package: `zai-coder-control-plane-v39-notification-and-communication-center.zip`

## Local build status

- Base package: `zai-coder-control-plane-v38-template-and-content-studio.zip`
- Test result: `286 passed`
- Generated fixed copy: `zai-coder-control-plane-v39-notification-and-communication-center-fixed.zip`

## Added systems

- notification channel policy registry
- notification template registry
- customer preference center
- safe local draft renderer
- delivery gate
- portal inbox draft store
- digest/schedule planner
- communication thread builder
- notification export/report bundle
- notification dashboard
- notification audit log
- notification-center scripts
- notification-center docs
- notification-center assets
- tests

## New routes

```text
/api/notifications/status
/notifications
/notifications/channels
/notifications/templates
/notifications/preferences
/notifications/drafts
```

## New commands

```bash
make notification-communication-center
make notification-status
make notification-channels
make notification-templates
make notification-preferences
make notification-render-demo
make notification-delivery
make notification-demo
make notification-demo APPLY=1
make notification-export
make notification-export APPLY=1
make notification-audit
make notification-dashboard-export
make notification-communication-center-requirements
```

## Safety posture

- local-first and draft-only
- no real email, SMS, Slack, webhook, or external send
- external channels are disabled and draft-only
- portal and in-app channels are local only
- demo writes require `APPLY=1`
- sensitive terms are blocked in templates and drafts

## Push limitation note

The GitHub connector used here writes UTF-8 repository content. It does not safely upload the binary ZIP package as a release artifact. This manifest records the package build and keeps the GitHub scope reviewable under `apps/zai/`.
